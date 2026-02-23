require('dotenv').config();
const prisma = require('../src/config/prisma');

const AUTO_CANCEL_MINUTES = 15;

async function cancelExpiredOrders() {
    try {
        const expiredOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    lt: new Date(Date.now() - AUTO_CANCEL_MINUTES * 60 * 1000)
                }
            },
            include: {
                items: true
            }
        });

        for (const order of expiredOrders) {

            // restore stock
            for (const item of order.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
            }

            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'CANCELLED' }
            });

            console.log(`Order ${order.id} auto-cancelled`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

cancelExpiredOrders();