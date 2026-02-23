const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { authenticate } = require("./modules/auth/auth.middleware");
const { resolveTenant } = require("./middleware/tenant.middleware");
const multer = require("multer");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));

// Stripe webhook needs raw body - MUST be before express.json()
const paymentController = require("./modules/payment/payment.controller");
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), paymentController.webhook);

app.use(express.json());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Tenant middleware on all API routes
app.use("/api", resolveTenant);

// Routes
const orderRoutes = require("./modules/order/order.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const authRoutes = require("./modules/auth/auth.routes");
const productRoutes = require("./modules/product/product.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const inventoryRoutes = require("./modules/inventory/inventory.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const exportRoutes = require("./modules/export/export.routes");

app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/export", exportRoutes);

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/upload", authenticate, upload.single("image"), (req, res) => {
  res.json({
    success: true,
    message: "File uploaded",
    data: { url: "/uploads/" + req.file.filename },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

module.exports = app;
