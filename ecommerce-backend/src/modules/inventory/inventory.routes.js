const { Router } = require("express");
const inventoryController = require("./inventory.controller");
const { authenticate } = require("../auth/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const router = Router();

router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

router.get("/", inventoryController.getInventory);
router.get("/alerts", inventoryController.getLowStockAlerts);
router.post("/restock", inventoryController.restock);
router.post("/adjust", inventoryController.adjustStock);
router.get("/history/:productId", inventoryController.getStockHistory);

module.exports = router;
