import prisma from '../lib/prisma.js';

export const getIncomingProducts = async (req, res) => {
  const userId = req.user.id;
  try {
    const products = await prisma.product.findMany({
      include: { farmer: { select: { name: true } } },
      where: {
        isRejected: false,
        OR: [
          { status: 'Created' },
          { processorId: userId, status: { in: ['Processing', 'Passed'] } },
          { processorId: userId, qualityStatus: 'Passed' }
        ]
      },
    });

    const formatted = products.map(p => ({
      id: p.id,
      batchId: p.batchId,
      productName: p.productName,
      cropType: p.cropType,
      quantity: p.quantity,
      unit: p.unit,
      status: p.status,
      qualityStatus: p.qualityStatus,
      timestamp: p.timestamp,
      farmer: { name: p.farmer ? p.farmer.name : 'Unknown' }
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProcessorProducts = async (req, res) => {
  const userId = req.user.id;
  try {
    const products = await prisma.product.findMany({
      include: { farmer: { select: { name: true } } },
      where: {
        OR: [
          { processorId: userId },
          { processorId: null, status: 'Created' }
        ]
      },
      orderBy: { timestamp: 'desc' },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startProcessing = async (req, res) => {
  const userId = req.user.id;
  const { productId, processingType, conditions, notes } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Validate permission (simplified access control)
    if (product.processorId && product.processorId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [details, updatedProduct] = await prisma.$transaction([
      prisma.processingDetails.create({
        data: {
          productId,
          processingType,
          conditions,
          notes,
          processingDate: new Date(),
        }
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          status: 'Processing',
          processorId: userId,
        }
      })
    ]);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Process Started',
        details: `Processor started processing batch ${product.batchId}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Processing started', details });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const performQualityCheck = async (req, res) => {
  const userId = req.user.id;
  const { productId, grade, moistureLevel, passed, remarks } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const [check, updatedProduct] = await prisma.$transaction([
      prisma.qualityCheck.create({
        data: {
          productId,
          grade,
          moistureLevel,
          passed,
          remarks,
        }
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          status: passed ? product.status : 'Rejected',
          isRejected: !passed,
          qualityStatus: passed ? 'Passed' : 'Failed',
        }
      })
    ]);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Quality Check',
        details: `Processor performed quality check on batch ${product.batchId}. Result: ${updatedProduct.qualityStatus}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Quality check recorded', check });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addPackaging = async (req, res) => {
  const userId = req.user.id;
  const { productId, packageType, weight, labelInfo, expiryDate } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.qualityStatus !== 'Passed') {
      return res.status(400).json({ message: 'Quality check must be passed before packaging' });
    }

    const [packaging, updatedProduct] = await prisma.$transaction([
      prisma.packaging.create({
        data: {
          productId,
          packageType,
          weight,
          labelInfo,
          expiryDate: new Date(expiryDate),
        }
      }),
      prisma.product.update({
        where: { id: productId },
        data: { status: 'Packaged' }
      })
    ]);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Packaging Added',
        details: `Processor added packaging details for batch ${product.batchId}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Packaging details added', packaging });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlockchainHash = async (req, res) => {
  const userId = req.user.id;
  const { batchId, txHash } = req.body;

  try {
    const product = await prisma.product.update({
      where: { batchId },
      data: { processingTxHash: txHash },
    });

    await prisma.blockchainTransaction.create({
      data: {
        batchId,
        txHash,
        action: 'Processing',
        role: 'Processor',
        status: 'Success',
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Blockchain Verification',
        details: `Processor verified batch ${batchId} on-chain. Tx: ${txHash}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Blockchain transaction recorded', txHash });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductHistory = async (req, res) => {
  const { batchId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { batchId },
      include: {
        farmer: { select: { name: true } },
        processor: { select: { name: true } },
        processingDetails: true,
        qualityChecks: true,
        packaging: true
      }
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({
      product,
      processing: product.processingDetails[0] || null,
      quality: product.qualityChecks[0] || null,
      packaging: product.packaging[0] || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectProduct = async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id);
  const { reason } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        status: 'Rejected',
        isRejected: true,
        notes: {
          set: `${product.notes || ''}\nRejection Reason: ${reason}`
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Product Rejected',
        details: `Processor rejected batch ${product.batchId}. Reason: ${reason}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'Product rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
