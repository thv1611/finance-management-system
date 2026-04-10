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

async function resendVerificationOtpController(req, res, next) {
  try {
    const result = await authService.resendVerificationOtp(req.body);
    return successResponse(res, result.message, result, 200);
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

async function forgotPasswordController(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    return successResponse(res, result.message, result, 200);
  } catch (error) {
    next(error);
  }
}

async function verifyPasswordResetOtpController(req, res, next) {
  try {
    const result = await authService.verifyPasswordResetOtp(req.body);
    return successResponse(res, "Password reset OTP verified", result, 200);
  } catch (error) {
    next(error);
  }
}

async function resetPasswordController(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    return successResponse(res, result.message, result, 200);
  } catch (error) {
    next(error);
  }
}

async function googleAuthController(req, res, next) {
  try {
    const result = await authService.googleAuth(req.body);
    return successResponse(res, result.message, result, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerController,
  verifyOtpController,
  resendVerificationOtpController,
  loginController,
  forgotPasswordController,
  verifyPasswordResetOtpController,
  resetPasswordController,
  googleAuthController,
};
