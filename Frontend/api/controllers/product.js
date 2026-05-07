import prisma from '../lib/prisma.js';

export const getAll = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getByBatchId = async (req, res) => {
  const { batchId } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { batchId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
