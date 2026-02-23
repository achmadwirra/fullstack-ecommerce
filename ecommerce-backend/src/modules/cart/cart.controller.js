const cartService = require("./cart.service");

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user.id, productId, quantity, req.tenantId);
    res.json({ success: true, message: "Item added to cart", data: cart });
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user.id, req.tenantId);
    res.json({ success: true, message: "Cart retrieved", data: cart });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cart = await cartService.removeFromCart(req.user.id, req.params.productId, req.tenantId);
    res.json({ success: true, message: "Item removed from cart", data: cart });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToCart, getCart, removeFromCart };
