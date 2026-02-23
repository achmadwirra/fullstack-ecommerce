const prisma = require("../config/prisma");
const AppError = require("../common/errors/AppError");

const resolveTenant = async (req, res, next) => {
  try {
    const bypassPaths = ['/auth/login', '/admin/tenants'];
    if (bypassPaths.some(p => req.path.startsWith(p)) && !req.headers["x-tenant-id"]) {
      return next();
    }

    const tenantSlug = req.headers["x-tenant-id"];

    if (!tenantSlug) {
      throw new AppError("Tenant identifier is required", 400, "TENANT_REQUIRED");
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new AppError("Tenant not found", 404, "TENANT_NOT_FOUND");
    }

    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { resolveTenant };
