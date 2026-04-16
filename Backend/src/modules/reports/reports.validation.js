const { query, validationResult } = require("express-validator");

const reportsQueryValidation = [
  query("range")
    .optional()
    .isIn(["week", "month", "year", "custom"])
    .withMessage("Range must be week, month, year, or custom"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
  query("categoryIds")
    .optional()
    .matches(/^\d+(,\d+)*$/)
    .withMessage("Category ids must be a comma-separated list of numbers"),
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
  reportsQueryValidation,
  validateRequest,
};
