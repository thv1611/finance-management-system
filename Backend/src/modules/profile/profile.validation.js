const { body, validationResult } = require("express-validator");

const updateProfileValidation = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 100 })
    .withMessage("Full name must be at most 100 characters"),
  body("avatar_url")
    .optional({ values: "falsy" })
    .trim()
    .isURL()
    .withMessage("Avatar URL must be a valid URL"),
];

const changePasswordValidation = [
  body("current_password")
    .isLength({ min: 6 })
    .withMessage("Current password is required"),
  body("new_password")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirm_password")
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage("Password confirmation does not match"),
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
  updateProfileValidation,
  changePasswordValidation,
  validateRequest,
};
