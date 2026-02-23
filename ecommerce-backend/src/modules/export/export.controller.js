const exportService = require("./export.service");

const exportProducts = async (req, res, next) => {
  try {
    const csv = await exportService.exportProducts(req.tenantId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

const exportOrders = async (req, res, next) => {
  try {
    const csv = await exportService.exportOrders(req.tenantId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

const exportInventory = async (req, res, next) => {
  try {
    const csv = await exportService.exportInventory(req.tenantId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=inventory.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { exportProducts, exportOrders, exportInventory };
