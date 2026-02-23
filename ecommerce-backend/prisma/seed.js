require('dotenv').config();
const prisma = require('../src/config/prisma');
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding database...');
  
  let tenant = await prisma.tenant.findUnique({ where: { slug: 'default' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Default Store',
        slug: 'default'
      }
    });
    console.log('Created Default Tenant');
  }

  const adminEmail = 'admin@example.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        tenantId: tenant.id
      }
    });
    console.log('Created Super Admin User');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
