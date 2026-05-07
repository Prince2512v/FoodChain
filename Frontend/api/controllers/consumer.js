import prisma from '../lib/prisma.js';

export const getProduct = async (req, res) => {
  const { batchId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { batchId },
      include: {
        farmer: { select: { name: true } },
        processor: { select: { name: true } },
        retailer: { select: { name: true } }
      }
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req, res) => {
  const { batchId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { batchId },
      include: {
        farmer: { select: { name: true } },
        processingDetails: true,
        qualityChecks: true,
        packaging: true,
        shipments: {
          include: { distributor: { select: { name: true } } },
          orderBy: { createdAt: 'asc' }
        },
        receipts: true,
        feedback: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const shipmentIds = product.shipments.map(s => s.id);

    const [issues, logs, conditions] = await Promise.all([
      prisma.shipmentIssue.findMany({ where: { shipmentId: { in: shipmentIds } } }),
      prisma.locationLog.findMany({ where: { shipmentId: { in: shipmentIds } }, orderBy: { timestamp: 'asc' } }),
      prisma.storageCondition.findMany({ where: { shipmentId: { in: shipmentIds } }, orderBy: { timestamp: 'asc' } }),
    ]);

    res.status(200).json({
      product,
      processing: product.processingDetails[0] || null,
      qualityCheck: product.qualityChecks[0] || null,
      packaging: product.packaging[0] || null,
      shipments: product.shipments,
      shipmentIssues: issues,
      locationLogs: logs,
      storageConditions: conditions,
      receipt: product.receipts[0] || null,
      feedbacks: product.feedback
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVerificationData = async (req, res) => {
  const { batchId } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { batchId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({
      batchId: product.batchId,
      originTxHash: product.blockchainTxHash,
      processingTxHash: product.processingTxHash,
      retailTxHash: product.retailTxHash,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitFeedback = async (req, res) => {
  const { batchId, rating, comment, userId } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { batchId } });
    if (!product) return res.status(404).json({ message: 'Invalid Batch ID' });

    const feedback = await prisma.feedback.create({
      data: {
        productId: product.id,
        userId: userId || 0,
        rating,
        comment,
      }
    });

    // Update aggregate rating
    const allFeedbacks = await prisma.feedback.findMany({ where: { productId: product.id } });
    const avgRating = allFeedbacks.reduce((acc, f) => acc + f.rating, 0) / allFeedbacks.length;

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        reviewCount: allFeedbacks.length,
        rating: avgRating
      }
    });

    res.status(200).json({ message: 'Feedback submitted successfully!', feedback, newRating: updatedProduct.rating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
