import prisma from '../lib/prisma.js';
import QRCode from 'qrcode';

export const generateQrCode = async (req, res) => {
  const productId = parseInt(req.params.productId);
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.qrCodeBase64) {
      return res.status(200).json({ message: 'QR Code already exists', qrCode: product.qrCodeBase64 });
    }

    // Use current host or a configured one for the verification URL
    const host = req.get('host');
    const protocol = req.protocol;
    const verificationUrl = `${protocol}://${host}/verify/${product.batchId}`;
    
    const qrCodeBase64 = await QRCode.toDataURL(verificationUrl);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { qrCodeBase64 }
    });

    res.status(200).json({ qrCode: qrCodeBase64, url: verificationUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQrCodeByBatch = async (req, res) => {
  const { batchId } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { batchId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!product.qrCodeBase64) {
      const host = req.get('host');
      const protocol = req.protocol;
      const verificationUrl = `${protocol}://${host}/verify/${product.batchId}`;
      const qrCodeBase64 = await QRCode.toDataURL(verificationUrl);
      
      await prisma.product.update({
        where: { batchId },
        data: { qrCodeBase64 }
      });
      return res.status(200).json({ qrCode: qrCodeBase64 });
    }

    res.status(200).json({ qrCode: product.qrCodeBase64 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordScan = async (req, res) => {
  // Analytical logging can be added here
  res.status(200).json({ status: 'Logged' });
};
