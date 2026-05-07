import prisma from '../lib/prisma.js';

export const addProduct = async (req, res) => {
  const userId = req.user.id;
  const dto = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        productName: dto.productName,
        cropType: dto.cropType,
        quantity: dto.quantity,
        unit: dto.unit,
        harvestDate: new Date(dto.harvestDate),
        farmingMethod: dto.farmingMethod,
        fertilizerUsed: dto.fertilizerUsed,
        notes: dto.notes,
        locationLat: dto.locationLat,
        locationLong: dto.locationLong,
        address: dto.address,
        batchId: dto.batchId,
        imageUrl: dto.imageUrl,
        blockchainTxHash: dto.blockchainTxHash,
        farmerId: userId,
        status: "Created",
      },
    });

    // Logging
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Harvest Logged',
        details: `Farmer created new harvest: ${product.productName} (${product.batchId})`,
        ipAddress: req.ip || 'Unknown',
      },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Database Save Failed: ${error.message}` });
  }
};

export const getFarmerProducts = async (req, res) => {
  const userId = req.user.id;
  try {
    const products = await prisma.product.findMany({
      where: { farmerId: userId },
      orderBy: { timestamp: 'desc' },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  const dto = req.body;

  try {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct || existingProduct.farmerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        productName: dto.productName,
        cropType: dto.cropType,
        quantity: dto.quantity,
        unit: dto.unit,
        harvestDate: new Date(dto.harvestDate),
        farmingMethod: dto.farmingMethod,
        fertilizerUsed: dto.fertilizerUsed,
        notes: dto.notes,
        locationLat: dto.locationLat,
        locationLong: dto.locationLong,
        address: dto.address,
        blockchainTxHash: dto.blockchainTxHash,
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlockchainHash = async (req, res) => {
  const { batchId, txHash } = req.body;
  const userId = req.user.id;

  try {
    const product = await prisma.product.update({
      where: { batchId },
      data: { blockchainTxHash: txHash },
    });

    await prisma.blockchainTransaction.create({
      data: {
        batchId,
        txHash,
        action: 'Harvest',
        role: 'Farmer',
        status: 'Success',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Blockchain Verification',
        details: `Farmer verified batch ${batchId} on-chain. Tx: ${txHash}`,
        ipAddress: req.ip || 'Unknown',
      },
    });

    res.status(200).json({ message: 'Blockchain hash updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
