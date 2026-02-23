const prisma = require("../../config/prisma");
const AppError = require("../../common/errors/AppError");

const getOrCreateCart = async (userId, tenantId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, tenantId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
};

const addToCart = async (userId, productId, quantity, tenantId) => {
  console.log("---- DEBUG CART ADD ----", { userId, productId, quantity, tenantId });
  try {
  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  if (product.stock < quantity) throw new AppError("Insufficient stock", 400, "INSUFFICIENT_STOCK");

  const cart = await getOrCreateCart(userId, tenantId);

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId }
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity } // Actually add to quantity!
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity }
    });
  }

  return getOrCreateCart(userId, tenantId);
  } catch (err) {
    console.error("CART ADD ERROR:", err);
    throw err;
  }
};

const removeFromCart = async (userId, productId, tenantId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError("Cart not found", 404, "CART_NOT_FOUND");

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  return getOrCreateCart(userId, tenantId);
};

module.exports = { getOrCreateCart, addToCart, removeFromCart };
