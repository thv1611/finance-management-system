const transactionsService = require("./transactions.service");
const { successResponse } = require("../../utils/response");

async function getTransactionsController(req, res, next) {
  try {
    const transactions = await transactionsService.listTransactions(req.user.id, req.query);
    return successResponse(res, "Transactions retrieved successfully", transactions, 200);
  } catch (error) {
    next(error);
  }
}

async function getTransactionController(req, res, next) {
  try {
    const transaction = await transactionsService.getTransaction(req.user.id, Number(req.params.id));
    return successResponse(res, "Transaction retrieved successfully", transaction, 200);
  } catch (error) {
    next(error);
  }
}

async function createTransactionController(req, res, next) {
  try {
    const transaction = await transactionsService.createTransaction(req.user.id, req.body);
    return successResponse(res, "Transaction created successfully", transaction, 201);
  } catch (error) {
    next(error);
  }
}

async function parseReceiptController(req, res, next) {
  try {
    const receiptDraft = await transactionsService.parseReceiptDraft(req.user.id, req.body);
    return successResponse(res, "Receipt scanned successfully", receiptDraft, 200);
  } catch (error) {
    next(error);
  }
}

async function parseQuickEntryController(req, res, next) {
  try {
    const draft = await transactionsService.parseQuickEntryDraft(req.user.id, req.body);
    return successResponse(res, "Quick entry parsed successfully", draft, 200);
  } catch (error) {
    next(error);
  }
}

async function updateTransactionController(req, res, next) {
  try {
    const transaction = await transactionsService.updateTransaction(
      req.user.id,
      Number(req.params.id),
      req.body
    );
    return successResponse(res, "Transaction updated successfully", transaction, 200);
  } catch (error) {
    next(error);
  }
}

async function deleteTransactionController(req, res, next) {
  try {
    const transaction = await transactionsService.deleteTransaction(req.user.id, Number(req.params.id));
    return successResponse(res, "Transaction deleted successfully", transaction, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactionsController,
  getTransactionController,
  createTransactionController,
  parseReceiptController,
  parseQuickEntryController,
  updateTransactionController,
  deleteTransactionController,
};
