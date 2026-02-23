const inventoryService = require("./inventory.service");

const getInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getInventory(req.tenantId);
    res.json({ success: true, message: "Inventory retrieved", data: inventory });
  } catch (error) {
    next(error);
  }
};

const getLowStockAlerts = async (req, res, next) => {
  try {
    const alerts = await inventoryService.getLowStockAlerts(req.tenantId);
    res.json({ success: true, message: "Low stock alerts retrieved", data: alerts });
  } catch (error) {
    next(error);
  }
};

const restock = async (req, res, next) => {
  try {
    const { productId, quantity, reason } = req.body;
    const product = await inventoryService.restock(productId, quantity, reason, req.user.id, req.tenantId);
    res.json({ success: true, message: "Product restocked", data: product });
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const { productId, quantity, reason, type } = req.body;
    const product = await inventoryService.adjustStock(productId, quantity, reason, type, req.user.id, req.tenantId);
    res.json({ success: true, message: "Stock adjusted", data: product });
  } catch (error) {
    next(error);
  }
};

const getStockHistory = async (req, res, next) => {
  try {
    const history = await inventoryService.getStockHistory(req.params.productId, req.tenantId);
    res.json({ success: true, message: "Stock history retrieved", data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventory, getLowStockAlerts, restock, adjustStock, getStockHistory };
