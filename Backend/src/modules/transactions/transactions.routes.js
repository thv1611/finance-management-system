const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const {
  getTransactionsController,
  getTransactionController,
  createTransactionController,
  parseReceiptController,
  parseQuickEntryController,
  updateTransactionController,
  deleteTransactionController,
} = require("./transactions.controller");
const {
  listTransactionsValidation,
  createTransactionValidation,
  parseReceiptValidation,
  parseQuickEntryValidation,
  transactionIdValidation,
  validateRequest,
} = require("./transactions.validation");

const router = express.Router();

router.get("/", requireAuth, listTransactionsValidation, validateRequest, getTransactionsController);
router.post("/parse-receipt", requireAuth, parseReceiptValidation, validateRequest, parseReceiptController);
router.post("/parse-entry", requireAuth, parseQuickEntryValidation, validateRequest, parseQuickEntryController);
router.get("/:id", requireAuth, transactionIdValidation, validateRequest, getTransactionController);
router.post("/", requireAuth, createTransactionValidation, validateRequest, createTransactionController);
router.put(
  "/:id",
  requireAuth,
  transactionIdValidation,
  createTransactionValidation,
  validateRequest,
  updateTransactionController
);
router.delete("/:id", requireAuth, transactionIdValidation, validateRequest, deleteTransactionController);

module.exports = router;
