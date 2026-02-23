const { Router } = require("express");
const adminController = require("./admin.controller");
const { authenticate } = require("../auth/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const router = Router();

router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

router.get("/dashboard", adminController.getDashboard);

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

router.get("/tenants", authorize("SUPER_ADMIN"), adminController.getTenants);
router.post("/tenants", authorize("SUPER_ADMIN"), adminController.createTenant);

module.exports = router;
