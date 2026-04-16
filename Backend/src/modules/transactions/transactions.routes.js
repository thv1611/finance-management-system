const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const {
  getTransactionsController,
  getTransactionController,
  createTransactionController,
  updateTransactionController,
  deleteTransactionController,
} = require("./transactions.controller");
const {
  listTransactionsValidation,
  createTransactionValidation,
  transactionIdValidation,
  validateRequest,
} = require("./transactions.validation");

const router = express.Router();

router.get("/", requireAuth, listTransactionsValidation, validateRequest, getTransactionsController);
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
