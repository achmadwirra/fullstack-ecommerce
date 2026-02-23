const { Router } = require("express");
const orderController = require("./order.controller");
const { authenticate } = require("../auth/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const idempotency = require("../../middleware/idempotency.middleware");

const router = Router();

router.post("/checkout", authenticate, idempotency, orderController.checkout);
router.get("/", authenticate, orderController.getOrders);
router.get("/:id", authenticate, orderController.getOrderById);
router.patch("/:id/status", authenticate, authorize("ADMIN", "SUPER_ADMIN"), orderController.updateOrderStatus);

module.exports = router;
