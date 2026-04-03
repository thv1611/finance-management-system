const authService = require("./auth.service");
const { successResponse } = require("../../utils/response");

async function registerController(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, "Register successful", result, 201);
  } catch (error) {
    next(error);
  }
}

async function verifyOtpController(req, res, next) {
  try {
    const result = await authService.verifyOtp(req.body);
    return successResponse(res, "OTP verification successful", result, 200);
  } catch (error) {
    next(error);
  }
}

async function loginController(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, "Login successful", result, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerController,
  verifyOtpController,
  loginController,
};