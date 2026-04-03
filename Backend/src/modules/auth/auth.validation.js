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

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
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
  loginValidation,
  validateRequest,
};