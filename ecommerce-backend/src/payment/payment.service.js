const prisma = require('../../config/prisma');

const createPaymentSession = async (orderId) => {

    const paymentUrl = `http://fake-payment-gateway.com/pay/${orderId}`;

    const payment = await prisma.payment.create({
        data: {
            orderId,
            provider: 'FAKE_GATEWAY',
            paymentUrl,
        },
    });

    return payment;
};

const handleWebhook = async (orderId, status) => {

    return prisma.$transaction(async (tx) => {

        const payment = await tx.payment.update({
            where: { orderId },
            data: {
                status: status === 'success' ? 'SUCCESS' : 'FAILED',
            },
        });

        if (status === 'success') {
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'PAID' },
            });
        }

        return payment;
    });
};

module.exports = { createPaymentSession, handleWebhook };