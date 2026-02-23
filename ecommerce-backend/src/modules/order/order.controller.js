const orderService = require("./order.service");

const checkout = async (req, res, next) => {
  try {
    const order = await orderService.checkout(req.user.id, req.tenantId);
    res.status(201).json({ success: true, message: "Order created", data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN";
    const orders = await orderService.getOrders(req.user.id, isAdmin, req.tenantId);
    res.json({ success: true, message: "Orders retrieved", data: orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.tenantId);
    res.json({ success: true, message: "Order retrieved", data: order });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.tenantId);
    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkout, getOrders, getOrderById, updateOrderStatus };
