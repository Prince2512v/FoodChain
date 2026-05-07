import prisma from '../lib/prisma.js';

export const getSummary = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let productWhere = {};
    let shipmentWhere = {};

    // Role-based filtering
    if (role === 'Farmer') {
      productWhere = { farmerId: userId };
    } else if (role === 'Processor') {
      productWhere = { processorId: userId };
    } else if (role === 'Distributor') {
      shipmentWhere = { distributorId: userId };
      productWhere = { distributorId: userId };
    } else if (role === 'Retailer') {
      productWhere = { retailerId: userId };
    }

    const [
      totalCount,
      processingCount,
      packagedCount,
      inTransitCount,
      deliveredCount,
      availableCount,
      rejectedCount,
      shipmentTotalCount,
      shipmentInTransitCount,
      shipmentDeliveredCount,
      shipmentRejectedCount,
    ] = await Promise.all([
      prisma.product.count({ where: productWhere }),
      prisma.product.count({ where: { ...productWhere, status: 'Processing' } }),
      prisma.product.count({ where: { ...productWhere, status: 'Packaged' } }),
      prisma.product.count({ where: { ...productWhere, status: 'In Transit' } }),
      prisma.product.count({ where: { ...productWhere, OR: [{ status: 'Completed' }, { status: 'Delivered' }] } }),
      prisma.product.count({ where: { ...productWhere, status: 'Available' } }),
      prisma.product.count({ where: { ...productWhere, OR: [{ isRejected: true }, { status: 'Rejected' }] } }),
      prisma.shipment.count({ where: shipmentWhere }),
      prisma.shipment.count({ where: { ...shipmentWhere, status: 'In Transit' } }),
      prisma.shipment.count({ where: { ...shipmentWhere, status: 'Delivered' } }),
      prisma.shipment.count({ where: { ...shipmentWhere, status: 'Rejected' } }),
    ]);

    const totalStats = {
      total: role === 'Distributor' ? shipmentTotalCount : totalCount,
      processing: processingCount,
      packaged: packagedCount,
      inTransit: role === 'Distributor' ? shipmentInTransitCount : inTransitCount,
      delivered: role === 'Distributor' ? shipmentDeliveredCount : deliveredCount,
      available: availableCount,
      rejected: role === 'Distributor' ? shipmentRejectedCount : rejectedCount,
    };

    res.status(200).json(totalStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getPerformance = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() - i);
      return d;
    }).reverse();

    const startDate = last7Days[0];
    const endDate = new Date(last7Days[6]);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const [products, issues] = await Promise.all([
      prisma.product.findMany({
        where: {
          timestamp: { gte: startDate, lt: endDate },
          ...(role === 'Admin' ? {} : (role === 'Farmer' ? { farmerId: userId } : (role === 'Processor' ? { processorId: userId } : {}))),
        },
        select: { timestamp: true },
      }),
      prisma.shipmentIssue.findMany({
        where: { timestamp: { gte: startDate, lt: endDate } },
        select: { timestamp: true },
      }),
    ]);

    const performanceData = last7Days.map((date) => {
      const nextDate = new Date(date);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        count: products.filter((p) => p.timestamp >= date && p.timestamp < nextDate).length,
        issues: issues.filter((i) => i.timestamp >= date && i.timestamp < nextDate).length,
      };
    });

    res.status(200).json(performanceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecentActivities = async (req, res) => {
  const { role } = req.user;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const activities = await prisma.blockchainTransaction.findMany({
      where: role === 'Admin' ? {} : { role: role },
      orderBy: { timestamp: 'desc' },
      take: limit > 0 ? limit : undefined,
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const issues = await prisma.shipmentIssue.findMany({
      include: { shipment: true },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    res.status(200).json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
