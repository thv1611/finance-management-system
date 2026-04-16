const { body, param, query, validationResult } = require("express-validator");

const listBudgetsValidation = [
  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12"),
  query("year")
    .optional()
    .isInt({ min: 2000 })
    .withMessage("Year must be 2000 or later"),
];

const createBudgetValidation = [
  body("category_id")
    .notEmpty()
    .withMessage("Category is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Category must be valid"),
  body("month")
    .notEmpty()
    .withMessage("Month is required")
    .bail()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12"),
  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .bail()
    .isInt({ min: 2000 })
    .withMessage("Year must be 2000 or later"),
  body("amount_limit")
    .notEmpty()
    .withMessage("Budget limit is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Budget limit must be greater than 0"),
];

const budgetIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Budget id must be valid"),
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
  listBudgetsValidation,
  createBudgetValidation,
  budgetIdValidation,
  validateRequest,
};
