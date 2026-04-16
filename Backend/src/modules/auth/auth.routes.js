const express = require("express");
const {
  registerController,
  verifyOtpController,
  resendVerificationOtpController,
  loginController,
  refreshAccessTokenController,
  forgotPasswordController,
  verifyPasswordResetOtpController,
  resetPasswordController,
  googleAuthController,
} = require("./auth.controller");
const {
  registerValidation,
  verifyOtpValidation,
  resendVerificationOtpValidation,
  loginValidation,
  refreshAccessTokenValidation,
  forgotPasswordValidation,
  verifyPasswordResetOtpValidation,
  resetPasswordValidation,
  googleAuthValidation,
  validateRequest,
} = require("./auth.validation");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, registerController);
router.post("/verify-otp", verifyOtpValidation, validateRequest, verifyOtpController);
router.post(
  "/resend-verification-otp",
  resendVerificationOtpValidation,
  validateRequest,
  resendVerificationOtpController
);
router.post("/login", loginValidation, validateRequest, loginController);
router.post("/refresh", refreshAccessTokenValidation, validateRequest, refreshAccessTokenController);
router.post("/google", googleAuthValidation, validateRequest, googleAuthController);
router.post("/forgot-password", forgotPasswordValidation, validateRequest, forgotPasswordController);
router.post(
  "/verify-reset-otp",
  verifyPasswordResetOtpValidation,
  validateRequest,
  verifyPasswordResetOtpController
);
router.post("/reset-password", resetPasswordValidation, validateRequest, resetPasswordController);

module.exports = router;
