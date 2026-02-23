const prisma = require('../config/prisma');

const AUTO_CANCEL_MINUTES = 15;

setInterval(async () => {
    try {
        const expiredOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    lt: new Date(Date.now() - AUTO_CANCEL_MINUTES * 60 * 1000)
                }
            }
        });

        for (const order of expiredOrders) {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'CANCELLED' }
            });

            console.log(`Order ${order.id} auto-cancelled`);
        }

    } catch (err) {
        console.error(err);
    }
}, 60 * 1000); // cek setiap 1 menit