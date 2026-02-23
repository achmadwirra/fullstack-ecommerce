const { Router } = require("express");
const paymentController = require("./payment.controller");
const { authenticate } = require("../auth/auth.middleware");

const router = Router();

// Webhook is handled directly in app.js (before express.json)
router.post("/create-checkout", authenticate, paymentController.createCheckout);

module.exports = router;
