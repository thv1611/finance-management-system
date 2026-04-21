const { body, validationResult } = require("express-validator");

const chatValidation = [
  body("messages")
    .isArray({ min: 1 })
    .withMessage("messages must be a non-empty array"),
  body("messages.*.role")
    .isIn(["user", "assistant"])
    .withMessage("message role must be user or assistant"),
  body("messages.*.content")
    .isString()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage("message content must be between 1 and 4000 characters"),
];

const askValidation = [
  body("question")
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("question must be between 1 and 1000 characters"),
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
  askValidation,
  chatValidation,
  validateRequest,
};
