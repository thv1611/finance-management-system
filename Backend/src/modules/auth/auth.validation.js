const { body, validationResult } = require("express-validator");

const registerValidation = [
  body("full_name").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirm_password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Confirm password does not match"),
];

const verifyOtpValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp_code")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits"),
];

const resendVerificationOtpValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
];

const verifyPasswordResetOtpValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp_code")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits"),
];

const resetPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("reset_token").trim().notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirm_password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Confirm password does not match"),
];

const googleAuthValidation = [
  body("code").trim().notEmpty().withMessage("Google authorization code is required"),
  body("mode")
    .isIn(["login", "register"])
    .withMessage("Google authentication mode must be login or register"),
];

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }

  next();
}

module.exports = {
  registerValidation,
  verifyOtpValidation,
  resendVerificationOtpValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyPasswordResetOtpValidation,
  resetPasswordValidation,
  googleAuthValidation,
  validateRequest,
};
