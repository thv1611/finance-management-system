const { query, validationResult } = require("express-validator");

const getCategoriesValidation = [
  query("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Category type must be income or expense"),
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
  getCategoriesValidation,
  validateRequest,
};
