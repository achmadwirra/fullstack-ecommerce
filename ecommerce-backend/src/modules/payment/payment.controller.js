const Stripe = require("stripe");
const paymentService = require("./payment.service");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckout = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const session = await paymentService.createCheckoutSession(orderId);
    res.json({ success: true, message: "Checkout session created", data: session });
  } catch (error) {
    next(error);
  }
};

const webhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await paymentService.handleStripeWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    res.status(400).json({ error: "Webhook error" });
  }
};

module.exports = { createCheckout, webhook };
