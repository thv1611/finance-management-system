const categoriesRepository = require("../categories/categories.repository");
const transactionsRepository = require("./transactions.repository");

function normalizeTransactionDate(value) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error("Transaction date must be a valid date");
    error.statusCode = 400;
    throw error;
  }

  return value;
}

function parseCategoryIds(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function normalizeListOptions(query = {}) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const pageSize = Number(query.pageSize) > 0 ? Number(query.pageSize) : 15;
  const validType = ["income", "expense"].includes(query.type) ? query.type : null;
  const validDatePreset = [
    "today",
    "thisWeek",
    "last30Days",
    "thisMonth",
    "lastMonth",
    "customRange",
  ].includes(query.datePreset)
    ? query.datePreset
    : null;

  return {
    page,
    pageSize,
    type: validType,
    datePreset: validDatePreset,
    startDate:
      (validDatePreset === "customRange" || query.startDate) && query.startDate
        ? normalizeTransactionDate(query.startDate)
        : null,
    endDate:
      (validDatePreset === "customRange" || query.endDate) && query.endDate
        ? normalizeTransactionDate(query.endDate)
        : null,
    categoryIds: parseCategoryIds(query.categories),
  };
}

async function validateTransactionPayload(userId, payload) {
  const {
    category_id: categoryId,
    type,
    amount,
    title,
    description,
    transaction_date: transactionDate,
  } = payload;

  const category = await categoriesRepository.findCategoryForUser(categoryId, userId);

  if (!category) {
    const error = new Error("Selected category does not exist");
    error.statusCode = 404;
    throw error;
  }

  if (category.type !== type) {
    const error = new Error("Selected category does not match the transaction type");
    error.statusCode = 400;
    throw error;
  }

  return {
    categoryId,
    type,
    amount,
    title: title.trim(),
    description: description?.trim() || null,
    transactionDate: normalizeTransactionDate(transactionDate),
  };
}

async function createTransaction(userId, payload) {
  const normalizedPayload = await validateTransactionPayload(userId, payload);

  return transactionsRepository.createTransaction({
    userId,
    ...normalizedPayload,
  });
}

async function listTransactions(userId, query) {
  const options = normalizeListOptions(query);

  if (options.datePreset === "customRange" && (!options.startDate || !options.endDate)) {
    options.startDate = null;
    options.endDate = null;
  }

  if (options.startDate && options.endDate && options.startDate > options.endDate) {
    const error = new Error("Start date must be before or equal to end date");
    error.statusCode = 400;
    throw error;
  }

  const [{ rows, totalCount }, summaryRow] = await Promise.all([
    transactionsRepository.getTransactionsByUser(userId, options),
    transactionsRepository.getCurrentMonthSummary(userId),
  ]);

  const summary = {
    income: Number(summaryRow?.income || 0),
    expenses: Number(summaryRow?.expenses || 0),
    net: Number(summaryRow?.income || 0) - Number(summaryRow?.expenses || 0),
  };

  return {
    items: rows,
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      totalCount,
      totalPages: Math.max(Math.ceil(totalCount / options.pageSize), 1),
    },
    summary,
  };
}

async function getTransaction(userId, transactionId) {
  const transaction = await transactionsRepository.findTransactionById(userId, transactionId);

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
}

async function updateTransaction(userId, transactionId, payload) {
  await getTransaction(userId, transactionId);
  const normalizedPayload = await validateTransactionPayload(userId, payload);
  const updatedTransaction = await transactionsRepository.updateTransaction({
    userId,
    transactionId,
    ...normalizedPayload,
  });

  if (!updatedTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return updatedTransaction;
}

async function deleteTransaction(userId, transactionId) {
  const deletedTransaction = await transactionsRepository.deleteTransaction(userId, transactionId);

  if (!deletedTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return deletedTransaction;
}

module.exports = {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
