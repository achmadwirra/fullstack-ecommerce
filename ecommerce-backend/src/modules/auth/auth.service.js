const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const AppError = require("../../common/errors/AppError");

const register = async (data, tenantId) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError("Email already registered", 400, "EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || "CUSTOMER",
      tenantId,
    },
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantSlug: user.tenant.slug } };
};

const getUsers = async (tenantId) => {
  return prisma.user.findMany({
    where: { tenantId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
};

const getUserById = async (userId, tenantId) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return user;
};

const updateUser = async (userId, data, tenantId) => {
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.role) updateData.role = data.role;
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.update({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    data: updateData,
  });
};

const deleteUser = async (userId, tenantId) => {
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  await prisma.user.delete({ where: { id: userId } });
  return { message: "User deleted" };
};

module.exports = { register, login, getUsers, getUserById, updateUser, deleteUser };
