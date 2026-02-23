const prisma = require('../config/prisma');

const idempotencyMiddleware = async (req, res, next) => {
    const key = req.headers['idempotency-key'];

    if (!key) {
        return next(); // optional key
    }

    const existing = await prisma.idempotencyKey.findUnique({
        where: { key }
    });

    if (existing) {
        return res.status(200).json(existing.response);
    }

    // attach to request
    req.idempotencyKey = key;

    next();
};

module.exports = idempotencyMiddleware;