const prisma = require("../../config/prisma");
const AppError = require("../../common/errors/AppError");

const getInventory = async (tenantId) => {
  return prisma.product.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      stock: true,
      lowStockThreshold: true,
      price: true,
      createdAt: true,
    },
    orderBy: { stock: "asc" },
  });
};

const getLowStockAlerts = async (tenantId) => {
  const products = await prisma.product.findMany({
    where: {
      tenantId,
    },
    select: {
      id: true,
      name: true,
      stock: true,
      lowStockThreshold: true,
    },
    orderBy: { stock: "asc" },
  });

  return products.filter((p) => p.stock <= p.lowStockThreshold);
};

const restock = async (productId, quantity, reason, userId, tenantId) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });

    await tx.stockAdjustment.create({
      data: {
        productId,
        quantity,
        reason: reason || "Restock",
        type: "RESTOCK",
        createdBy: userId,
      },
    });

    return updated;
  });
};

const adjustStock = async (productId, quantity, reason, type, userId, tenantId) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");

  if (product.stock + quantity < 0) {
    throw new AppError("Stock cannot go below 0", 400, "INVALID_ADJUSTMENT");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });

    await tx.stockAdjustment.create({
      data: {
        productId,
        quantity,
        reason: reason || "Manual adjustment",
        type: type || "ADJUSTMENT",
        createdBy: userId,
      },
    });

    return updated;
  });
};

const getStockHistory = async (productId, tenantId) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");

  return prisma.stockAdjustment.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
    },
  });
};

module.exports = { getInventory, getLowStockAlerts, restock, adjustStock, getStockHistory };
