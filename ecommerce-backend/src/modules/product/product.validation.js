const { z } = require('zod');

const createProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative'),
    stock: z.number().min(0, 'Stock must be non-negative'),
    imageUrl: z.string().optional(),
});

module.exports = { createProductSchema };