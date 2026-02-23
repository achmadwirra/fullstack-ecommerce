const prisma = require("../../config/prisma");

const getDashboardStats = async (tenantId) => {
  const [totalUsers, totalProducts, totalOrders, revenueResult, recentOrders, lowStockProducts, ordersByStatus] =
    await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.product.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.order.aggregate({
        where: { tenantId, status: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true } },
        },
      }),
      prisma.product.findMany({
        where: { tenantId },
        orderBy: { stock: "asc" },
        take: 5,
        select: { id: true, name: true, stock: true, lowStockThreshold: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { tenantId },
        _count: true,
      }),
    ]);

  const revenue = revenueResult._sum.totalAmount
    ? parseFloat(revenueResult._sum.totalAmount)
    : 0;

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    revenue,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      totalAmount: parseFloat(o.totalAmount),
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    })),
    lowStockProducts: lowStockProducts.filter((p) => p.stock <= p.lowStockThreshold),
    ordersByStatus: ordersByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {}),
  };
};

const getTenants = async () => {
  return prisma.tenant.findMany({
    include: { _count: { select: { users: true, products: true, orders: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const createTenant = async (data) => {
  return prisma.tenant.create({
    data: { name: data.name, slug: data.slug },
  });
};

module.exports = { getDashboardStats, getTenants, createTenant };
