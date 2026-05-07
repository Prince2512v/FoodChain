import prisma from '../lib/prisma.js';

export const getPendingShipments = async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        product: true,
        distributor: { select: { name: true } }
      },
      where: {
        status: 'Delivered',
        product: { retailerId: null }
      },
    });

    const formatted = shipments.map(s => ({
      id: s.id,
      productId: s.productId,
      status: s.status,
      deliveryDate: s.deliveryDate,
      distributorName: s.distributor ? s.distributor.name : 'N/A',
      product: s.product ? {
        batchId: s.product.batchId,
        productName: s.product.productName,
        cropType: s.product.cropType,
        quantity: s.product.quantity,
        unit: s.product.unit
      } : null
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const receiveProduct = async (req, res) => {
  const retailerId = req.user.id;
  const { productId, conditionStatus, remarks, blockchainTxHash } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.status !== 'Delivered') {
      return res.status(400).json({ message: "Product status must be 'Delivered' to be received." });
    }

    const [receipt, updatedProduct, inventory] = await prisma.$transaction([
      prisma.retailerReceipt.create({
        data: {
          productId,
          retailerId,
          conditionStatus,
          remarks,
          blockchainTxHash,
        }
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          status: conditionStatus === 'Rejected' ? 'Rejected' : 'Received',
          retailerId,
          retailTxHash: blockchainTxHash,
        }
      }),
      conditionStatus !== 'Rejected' ? prisma.retailInventory.create({
        data: {
          productId,
          retailerId,
          totalQuantity: product.quantity,
          remainingQuantity: product.quantity,
          status: 'In Stock',
        }
      }) : Promise.resolve(null)
    ]);

    await prisma.blockchainTransaction.create({
      data: {
        batchId: product.batchId,
        txHash: blockchainTxHash,
        action: 'Retail Receipt',
        role: 'Retailer',
        status: 'Success',
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: retailerId,
        action: 'Product Received',
        details: `Retailer received batch ${product.batchId}. Status: ${updatedProduct.status}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Product received and processed.', productStatus: updatedProduct.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventory = async (req, res) => {
  const retailerId = req.user.id;
  try {
    const inventory = await prisma.retailInventory.findMany({
      include: { product: true },
      where: { retailerId },
    });

    const formatted = inventory.map(i => ({
      id: i.id,
      price: i.price,
      totalQuantity: i.totalQuantity,
      soldQuantity: i.soldQuantity,
      remainingQuantity: i.remainingQuantity,
      status: i.status,
      productName: i.product ? i.product.productName : 'Unknown',
      batchId: i.product ? i.product.batchId : 'N/A'
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRetailerProducts = async (req, res) => {
  const userId = req.user.id;
  try {
    const products = await prisma.product.findMany({
      include: { farmer: { select: { name: true } }, processor: { select: { name: true } } },
      where: {
        OR: [
          { retailerId: userId },
          { status: 'Delivered', retailerId: null }
        ]
      },
      orderBy: { timestamp: 'desc' },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInventory = async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id);
  const { price, soldQuantity } = req.body;

  try {
    const item = await prisma.retailInventory.findUnique({
      where: { id },
      include: { product: true }
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.retailerId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const remaining = Number(item.totalQuantity) - Number(soldQuantity);
    const status = remaining <= 0 ? 'Out of Stock' : (remaining < 5 ? 'Low Stock' : 'In Stock');

    const updated = await prisma.retailInventory.update({
      where: { id },
      data: {
        price,
        soldQuantity,
        remainingQuantity: remaining,
        status,
        lastUpdated: new Date(),
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Inventory Updated',
        details: `Retailer updated inventory for batch ${item.product?.batchId}. Stock: ${remaining}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Inventory updated.', item: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAvailable = async (req, res) => {
  const id = parseInt(req.params.productId);
  const userId = req.user.id;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.status !== 'Received') {
      return res.status(400).json({ message: "Product must be in 'Received' status to be marked available." });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status: 'Available for Sale' }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Product Available',
        details: `Retailer marked batch ${product.batchId} as available for sale.`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Product is now available for sale.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
