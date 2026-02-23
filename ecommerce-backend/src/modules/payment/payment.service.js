const Stripe = require("stripe");
const prisma = require("../../config/prisma");
const AppError = require("../../common/errors/AppError");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (orderId) => {
  console.log("Looking up order:", orderId);
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true },
  });

  if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
        ...(item.product.description && { description: item.product.description }),
      },
      unit_amount: Math.round(parseFloat(item.price) * 100),
    },
    quantity: item.quantity,
  }));


  console.log("---- DEBUG STRIPE CALL ----");
  console.log("Order ID:", orderId);
  console.log("Stripe Key Starts With:", process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) : "UNDEFINED");
  console.log("Line Items:", JSON.stringify(lineItems, null, 2));
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${(process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "http://localhost:3000")}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${(process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "http://localhost:3000")}/checkout/cancel?order_id=${orderId}`,
      customer_email: order.user.email,
      metadata: { orderId },
    });
    console.log("Session generated successfully:", session.id);
  } catch (err) {
    console.error("STRIPE CRITICAL ERROR:", err.message, err.type, err.raw);
    throw err;
  }

  await prisma.payment.create({
    data: {
      orderId,
      provider: "stripe",
      status: "PENDING",
      paymentUrl: session.url,
      stripeCheckoutSessionId: session.id,
    },
  });

  return { url: session.url, sessionId: session.id };
};

const handleStripeWebhook = async (event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: { status: "SUCCESS" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
    });
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: { status: "FAILED" },
      });

      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (order && order.status !== "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      }
    });
  }
};

module.exports = { createCheckoutSession, handleStripeWebhook };
