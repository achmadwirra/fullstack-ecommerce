const { Router } = require("express");
const cartController = require("./cart.controller");
const { authenticate } = require("../auth/auth.middleware");

const router = Router();

router.post("/add", authenticate, cartController.addToCart);
router.get("/", authenticate, cartController.getCart);
router.delete("/:productId", authenticate, cartController.removeFromCart);

module.exports = router;
