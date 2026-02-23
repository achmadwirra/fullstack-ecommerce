const authService = require("./auth.service");

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body, req.tenantId);
    res.status(201).json({ success: true, message: "Registration successful", data: user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, message: "Login successful", data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
