const { Router } = require("express");
const exportController = require("./export.controller");
const { authenticate } = require("../auth/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const router = Router();

router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

router.get("/products", exportController.exportProducts);
router.get("/orders", exportController.exportOrders);
router.get("/inventory", exportController.exportInventory);

module.exports = router;
