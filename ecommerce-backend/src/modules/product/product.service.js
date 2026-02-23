const prisma = require("../../config/prisma");
const AppError = require("../../common/errors/AppError");

const createProduct = async (data, tenantId) => {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      stock: Number(data.stock),
      lowStockThreshold: data.lowStockThreshold ? Number(data.lowStockThreshold) : 10,
      imageUrl: data.imageUrl,
      tenantId,
    },
  });
};

const getProducts = async (tenantId) => {
  return prisma.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
};

const getProductById = async (productId, tenantId) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  return product;
};

const updateProduct = async (productId, data, tenantId) => {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = Number(data.price);
  if (data.stock !== undefined) updateData.stock = Number(data.stock);
  if (data.lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(data.lowStockThreshold);
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

  return prisma.product.update({ where: { id: productId }, data: updateData });
};

const deleteProduct = async (productId, tenantId) => {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");

  await prisma.product.delete({ where: { id: productId } });
  return { message: "Product deleted" };
};

const getLowStockProducts = async (tenantId) => {
  return prisma.$queryRaw`
    SELECT id, name, stock, "lowStockThreshold"
    FROM "Product"
    WHERE "tenantId" = ${tenantId}
    AND stock <= "lowStockThreshold"
    ORDER BY stock ASC
  `;
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getLowStockProducts };
