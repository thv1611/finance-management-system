const express = require("express");
const {
  registerController,
  verifyOtpController,
  loginController,
} = require("./auth.controller");
const {
  registerValidation,
  verifyOtpValidation,
  loginValidation,
  validateRequest,
} = require("./auth.validation");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, registerController);
router.post("/verify-otp", verifyOtpValidation, validateRequest, verifyOtpController);
router.post("/login", loginValidation, validateRequest, loginController);

module.exports = router;