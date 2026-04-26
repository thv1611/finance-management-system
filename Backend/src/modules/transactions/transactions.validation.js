const { body, param, query, validationResult } = require("express-validator");

const createTransactionValidation = [
  body("category_id")
    .notEmpty()
    .withMessage("Category is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Category must be valid"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Transaction type must be income or expense"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isLength({ max: 150 })
    .withMessage("Title must be at most 150 characters"),
  body("description")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Description must be text"),
  body("receipt_data")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Receipt data must be text"),
  body("remove_receipt")
    .optional()
    .isBoolean()
    .withMessage("remove_receipt must be true or false"),
  body("transaction_date")
    .notEmpty()
    .withMessage("Transaction date is required")
    .bail()
    .isISO8601()
    .withMessage("Transaction date must be a valid date"),
];

const parseReceiptValidation = [
  body("receipt_data")
    .notEmpty()
    .withMessage("Receipt image is required")
    .bail()
    .isString()
    .withMessage("Receipt image must be a valid data URL"),
];

const parseQuickEntryValidation = [
  body("entry_text")
    .notEmpty()
    .withMessage("Entry text is required")
    .bail()
    .isString()
    .isLength({ min: 3, max: 500 })
    .withMessage("Entry text must be between 3 and 500 characters"),
];

const transactionIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Transaction id must be valid"),
];

const listTransactionsValidation = [
  query("search")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Search must be text and at most 100 characters"),
  query("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Transaction type must be income or expense"),
  query("datePreset")
    .optional()
    .isIn(["today", "thisWeek", "last30Days", "thisMonth", "lastMonth", "customRange"])
    .withMessage("Date preset is invalid"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1"),
  query("pageSize")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Page size must be between 1 and 100"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
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
  listTransactionsValidation,
  createTransactionValidation,
  parseReceiptValidation,
  parseQuickEntryValidation,
  transactionIdValidation,
  validateRequest,
};
