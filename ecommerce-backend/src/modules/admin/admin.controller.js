const adminService = require("./admin.service");
const authService = require("../auth/auth.service");
const prisma = require("../../config/prisma");
const AppError = require("../../common/errors/AppError");

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats(req.tenantId);
    res.json({ success: true, message: "Dashboard data retrieved", data: stats });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    // Super admins can see all users, regular admins see only their tenant's users
    let users;
    if (req.user && req.user.role === 'SUPER_ADMIN') {
      users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, tenantId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      users = await authService.getUsers(req.tenantId);
    }
    res.json({ success: true, message: "Users retrieved", data: users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.params.id, req.tenantId);
    res.json({ success: true, message: "User retrieved", data: user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    // Only SUPER_ADMIN can change tenantId
    if (req.body.tenantId && req.user && req.user.role !== 'SUPER_ADMIN') {
        throw new AppError("Only SUPER_ADMIN can change user tenant", 403, "FORBIDDEN");
    }

    let user;
    if (req.user && req.user.role === 'SUPER_ADMIN') {
      user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    } else {
      user = await prisma.user.findFirst({ where: { id: req.params.id, tenantId: req.tenantId } });
      if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.tenantId) updateData.tenantId = req.body.tenantId;

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, tenantId: true, createdAt: true },
      data: updateData,
    });

    res.json({ success: true, message: "User updated", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "User deleted" });
    } else {
        const result = await authService.deleteUser(req.params.id, req.tenantId);
        res.json({ success: true, message: result.message });
    }
  } catch (error) {
    next(error);
  }
};

const getTenants = async (req, res, next) => {
  try {
    const tenants = await adminService.getTenants();
    res.json({ success: true, message: "Tenants retrieved", data: tenants });
  } catch (error) {
    next(error);
  }
};

const createTenant = async (req, res, next) => {
  try {
    const tenant = await adminService.createTenant(req.body);
    res.status(201).json({ success: true, message: "Tenant created", data: tenant });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, getUserById, updateUser, deleteUser, getTenants, createTenant };
