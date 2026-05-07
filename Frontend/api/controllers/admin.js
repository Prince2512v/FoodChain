import prisma from '../lib/prisma.js';

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, role, status } = req.body;
  const adminId = req.user.id;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, role, status }
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'Update User',
        details: `Updated user ${user.email}. Role: ${role}, Status: ${status}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const adminId = req.user.id;

  try {
    const user = await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'Delete User',
        details: `Deleted user ${user.email}`,
        ipAddress: req.ip || 'Unknown',
      }
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      activeShipments,
      completed,
      rejected,
      blockchainTxs,
      harvestTxs,
      processTxs,
      retailTxs
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.shipment.count({ where: { status: 'In Transit' } }),
      prisma.product.count({ where: { status: 'Completed' } }),
      prisma.product.count({ where: { isRejected: true } }),
      prisma.blockchainTransaction.count(),
      prisma.product.count({ where: { blockchainTxHash: { not: null } } }),
      prisma.product.count({ where: { processingTxHash: { not: null } } }),
      prisma.product.count({ where: { retailTxHash: { not: null } } }),
    ]);

    const totalTransactions = blockchainTxs + harvestTxs + processTxs + retailTxs;

    // Last 7 days chart data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() - i);
      return d;
    }).reverse();

    const chartData = await Promise.all(last7Days.map(async (date) => {
      const nextDate = new Date(date);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);

      const products = await prisma.product.count({
        where: { timestamp: { gte: date, lt: nextDate } }
      });

      const txs = await prisma.blockchainTransaction.count({
        where: { timestamp: { gte: date, lt: nextDate } }
      });

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        products,
        transactions: txs
      };
    }));

    res.status(200).json({
      summary: {
        totalProducts,
        totalUsers,
        activeShipments,
        completed,
        rejected,
        totalTransactions
      },
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.blockchainTransaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFraudAlerts = async (req, res) => {
  try {
    const alerts = await prisma.fraudLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
