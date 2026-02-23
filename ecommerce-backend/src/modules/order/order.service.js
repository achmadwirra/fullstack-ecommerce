const { Decimal } = require("@prisma/client");
const prisma = require("../../config/prisma");
const AppError = require("../../common/errors/AppError");

const checkout = async (userId, tenantId) => {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400, "EMPTY_CART");
    }

    let total = new Decimal(0);
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400, "INSUFFICIENT_STOCK");
      }
      total = total.plus(new Decimal(item.product.price).times(item.quantity));
    }

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await tx.stockAdjustment.create({
        data: {
          productId: item.productId,
          quantity: -item.quantity,
          reason: "Sale - order checkout",
          type: "SALE",
          createdBy: userId,
        },
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        tenantId,
        totalAmount: total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: new Decimal(item.product.price),
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
};

const getOrders = async (userId, isAdmin, tenantId) => {
  const where = isAdmin ? { tenantId } : { userId, tenantId };
  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    ...order,
    totalAmount: parseFloat(order.totalAmount),
    items: order.items.map((item) => ({
      ...item,
      price: parseFloat(item.price),
    })),
  }));
};

const getOrderById = async (orderId, tenantId) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      payment: true,
    },
  });
  if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");

  return {
    ...order,
    totalAmount: parseFloat(order.totalAmount),
    items: order.items.map((item) => ({ ...item, price: parseFloat(item.price) })),
  };
};

const updateOrderStatus = async (orderId, status, tenantId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });
    if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");

    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
        await tx.stockAdjustment.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            reason: "Order cancellation - stock restored",
            type: "CANCELLATION",
            createdBy: "system",
          },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: { include: { product: true } }, payment: true },
    });
  });
};

module.exports = { checkout, getOrders, getOrderById, updateOrderStatus };
