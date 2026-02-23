const { Router } = require("express");
const productController = require("./product.controller");
const { authenticate } = require("../auth/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const router = Router();

router.get("/", productController.list);
router.get("/:id", productController.getById);
router.post("/", authenticate, authorize("ADMIN", "SUPER_ADMIN"), productController.create);
router.put("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), productController.update);
router.delete("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), productController.remove);

module.exports = router;
