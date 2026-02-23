const prisma = require("../../config/prisma");

const formatCSV = (headers, rows) => {
  const headerLine = headers.join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => {
      const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : "";
      return val.includes(",") || val.includes('"') || val.includes("\n")
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
};

const exportProducts = async (tenantId) => {
  const products = await prisma.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["id", "name", "description", "price", "stock", "lowStockThreshold", "createdAt"];
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.price,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    createdAt: p.createdAt.toISOString(),
  }));

  return formatCSV(headers, rows);
};

const exportOrders = async (tenantId) => {
  const orders = await prisma.order.findMany({
    where: { tenantId },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
      payment: { select: { provider: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["id", "customerName", "customerEmail", "totalAmount", "status", "paymentProvider", "paymentStatus", "itemCount", "createdAt"];
  const rows = orders.map((o) => ({
    id: o.id,
    customerName: o.user.name,
    customerEmail: o.user.email,
    totalAmount: parseFloat(o.totalAmount),
    status: o.status,
    paymentProvider: o.payment?.provider || "",
    paymentStatus: o.payment?.status || "",
    itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    createdAt: o.createdAt.toISOString(),
  }));

  return formatCSV(headers, rows);
};

const exportInventory = async (tenantId) => {
  const adjustments = await prisma.stockAdjustment.findMany({
    where: { product: { tenantId } },
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["id", "productName", "quantity", "type", "reason", "createdBy", "createdAt"];
  const rows = adjustments.map((a) => ({
    id: a.id,
    productName: a.product.name,
    quantity: a.quantity,
    type: a.type,
    reason: a.reason,
    createdBy: a.createdBy,
    createdAt: a.createdAt.toISOString(),
  }));

  return formatCSV(headers, rows);
};

module.exports = { exportProducts, exportOrders, exportInventory };
