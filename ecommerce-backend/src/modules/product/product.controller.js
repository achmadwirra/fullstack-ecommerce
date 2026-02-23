const productService = require("./product.service");
const { createProductSchema } = require("./product.validation");

const create = async (req, res, next) => {
  try {
    const validated = createProductSchema.parse(req.body);
    const product = await productService.createProduct(validated, req.tenantId);
    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const products = await productService.getProducts(req.tenantId);
    res.json({ success: true, message: "Products retrieved", data: products });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id, req.tenantId);
    res.json({ success: true, message: "Product retrieved", data: product });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.tenantId);
    res.json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id, req.tenantId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, list, getById, update, remove };
