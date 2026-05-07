import prisma from '../lib/prisma.js';

export const getAvailableShipments = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        farmer: { select: { name: true } },
        processor: { select: { name: true } }
      },
      where: { status: 'Packaged', isRejected: false },
    });

    const formatted = products.map(p => ({
      id: p.id,
      batchId: p.batchId,
      productName: p.productName,
      cropType: p.cropType,
      quantity: p.quantity,
      unit: p.unit,
      status: p.status,
      harvestDate: p.harvestDate,
      farmerName: p.farmer ? p.farmer.name : 'N/A',
      processorName: p.processor ? p.processor.name : 'N/A'
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyShipments = async (req, res) => {
  const userId = req.user.id;
  try {
    const shipments = await prisma.shipment.findMany({
      include: { product: true },
      where: { distributorId: userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptShipment = async (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.productId);

  try {
    const existing = await prisma.shipment.findFirst({ where: { productId } });
    if (existing) return res.status(409).json({ message: 'Shipment already accepted', shipmentId: existing.id });

    const [shipment, product] = await prisma.$transaction([
      prisma.shipment.create({
        data: {
          productId,
          distributorId: userId,
          status: 'In Transit',
        }
      }),
      prisma.product.update({
        where: { id: productId },
        data: { status: 'In Transit', distributorId: userId }
      })
    ]);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Shipment Accepted',
        details: `Distributor accepted batch ${product.batchId} for transport.`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Shipment accepted', shipmentId: shipment.id, productId: product.id, batchId: product.batchId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShipmentDetails = async (req, res) => {
  const userId = req.user.id;
  const { shipmentId, vehicleNumber, driverName, driverContact, transportType, dispatchDate } = req.body;

  try {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    if (shipment.distributorId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        vehicleNumber,
        driverName,
        driverContact,
        transportType,
        dispatchDate: dispatchDate ? new Date(dispatchDate) : null,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Shipment Details Updated',
        details: `Distributor updated vehicle/driver info for shipment ${shipmentId}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Shipment details updated', shipment: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addLocationUpdate = async (req, res) => {
  const userId = req.user.id;
  const { shipmentId, latitude, longitude, locationName, source } = req.body;

  try {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    if (shipment.distributorId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const log = await prisma.locationLog.create({
      data: {
        shipmentId,
        latitude,
        longitude,
        locationName,
        source: source || 'Manual',
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Location Updated',
        details: `Distributor updated location for shipment ${shipmentId}: ${locationName}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Location updated', log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addStorageCondition = async (req, res) => {
  const userId = req.user.id;
  const { shipmentId, temperature, humidity, storageType } = req.body;

  try {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    if (shipment.distributorId !== userId) return res.status(403).json({ message: 'Forbidden' });

    let breached = false;
    if (storageType === 'Cold') breached = temperature > 8 || temperature < 0 || humidity > 85;
    else if (storageType === 'Frozen') breached = temperature > -10 || humidity > 90;
    else breached = temperature > 30 || humidity > 70;

    const condition = await prisma.storageCondition.create({
      data: {
        shipmentId,
        temperature,
        humidity,
        storageType,
        thresholdBreached: breached,
      }
    });

    if (breached) {
      await prisma.shipmentIssue.create({
        data: {
          shipmentId,
          issueType: 'Temperature Issue',
          description: `Threshold breach detected: Temp=${temperature}°C, Humidity=${humidity}%. StorageType=${storageType}`,
          severity: 'High',
        }
      });
    }

    res.status(200).json({ message: breached ? '⚠️ Threshold Breached!' : 'Storage condition recorded', condition, thresholdBreached: breached });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  const userId = req.user.id;
  const shipmentId = parseInt(req.params.shipmentId);
  const { status } = req.body;

  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { product: true }
    });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    if (shipment.distributorId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        deliveryDate: status === 'Delivered' ? new Date() : undefined,
      }
    });

    if (status === 'Delivered') {
      await prisma.product.update({
        where: { id: shipment.productId },
        data: { status: 'Delivered' }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Delivery Status Updated',
        details: `Distributor updated status for shipment ${shipmentId} to ${status}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Status updated', newStatus: status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlockchainHash = async (req, res) => {
  const userId = req.user.id;
  const { batchId, txHash } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { batchId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await prisma.shipment.updateMany({
      where: { productId: product.id },
      data: { blockchainTxHash: txHash }
    });

    await prisma.blockchainTransaction.create({
      data: {
        batchId,
        txHash,
        action: 'Shipping',
        role: 'Distributor',
        status: 'Success',
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Blockchain Verification',
        details: `Distributor verified batch ${batchId} on-chain. Tx: ${txHash}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Blockchain transaction recorded', txHash });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
