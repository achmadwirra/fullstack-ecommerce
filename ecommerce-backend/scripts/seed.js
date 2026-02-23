const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "Default Store",
      slug: "default",
    },
  });
  console.log("Tenant created:", tenant.slug);

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: { tenantId: tenant.id },
    create: {
      name: "Administrator",
      email: "admin@admin.com",
      passwordHash,
      role: "ADMIN",
      tenantId: tenant.id,
    },
  });
  console.log("Admin user created:", admin.email);

  // Create super admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@admin.com" },
    update: { tenantId: tenant.id },
    create: {
      name: "Super Administrator",
      email: "superadmin@admin.com",
      passwordHash,
      role: "SUPER_ADMIN",
      tenantId: tenant.id,
    },
  });
  console.log("Super admin created:", superAdmin.email);

  // Create sample products
  const products = [
    { name: "Laptop Gaming", description: "High-performance gaming laptop", price: 15000000, stock: 25, lowStockThreshold: 5 },
    { name: "Wireless Mouse", description: "Ergonomic wireless mouse", price: 350000, stock: 100, lowStockThreshold: 20 },
    { name: "Mechanical Keyboard", description: "RGB mechanical keyboard", price: 1200000, stock: 50, lowStockThreshold: 10 },
    { name: "Monitor 27 inch", description: "4K IPS monitor", price: 5500000, stock: 15, lowStockThreshold: 5 },
    { name: "USB-C Hub", description: "7-in-1 USB-C hub", price: 450000, stock: 3, lowStockThreshold: 10 },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: { ...p, tenantId: tenant.id },
    });
  }
  console.log("Sample products created:", products.length);

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
