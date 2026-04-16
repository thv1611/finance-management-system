const categoriesRepository = require("../categories/categories.repository");
const budgetsRepository = require("./budgets.repository");

function normalizeListOptions(query = {}) {
  return {
    month:
      Number.isInteger(Number(query.month)) && Number(query.month) >= 1 && Number(query.month) <= 12
        ? Number(query.month)
        : null,
    year:
      Number.isInteger(Number(query.year)) && Number(query.year) >= 2000
        ? Number(query.year)
        : null,
  };
}

async function validateBudgetPayload(userId, payload, excludeBudgetId = null) {
  const categoryId = Number(payload.category_id);
  const month = Number(payload.month);
  const year = Number(payload.year);
  const amountLimit = Number(payload.amount_limit);

  const category = await categoriesRepository.findCategoryForUser(categoryId, userId);

  if (!category) {
    const error = new Error("Selected category does not exist");
    error.statusCode = 404;
    throw error;
  }

  if (category.type !== "expense") {
    const error = new Error("Budget category must be an expense category");
    error.statusCode = 400;
    throw error;
  }

  const duplicateBudget = await budgetsRepository.findDuplicateBudget(
    userId,
    categoryId,
    month,
    year,
    excludeBudgetId
  );

  if (duplicateBudget) {
    const error = new Error("A budget already exists for this category, month, and year");
    error.statusCode = 409;
    throw error;
  }

  return {
    categoryId,
    month,
    year,
    amountLimit,
  };
}

async function listBudgets(userId, query) {
  const options = normalizeListOptions(query);
  return budgetsRepository.getBudgetsByUser(userId, options);
}

async function getBudget(userId, budgetId) {
  const budget = await budgetsRepository.findBudgetById(userId, budgetId);

  if (!budget) {
    const error = new Error("Budget not found");
    error.statusCode = 404;
    throw error;
  }

  return budget;
}

async function createBudget(userId, payload) {
  const normalizedPayload = await validateBudgetPayload(userId, payload);

  try {
    return await budgetsRepository.createBudget({
      userId,
      ...normalizedPayload,
    });
  } catch (error) {
    if (error.code === "23505") {
      const duplicateError = new Error("A budget already exists for this category, month, and year");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function updateBudget(userId, budgetId, payload) {
  await getBudget(userId, budgetId);
  const normalizedPayload = await validateBudgetPayload(userId, payload, budgetId);

  try {
    const updatedBudget = await budgetsRepository.updateBudget({
      userId,
      budgetId,
      ...normalizedPayload,
    });

    if (!updatedBudget) {
      const error = new Error("Budget not found");
      error.statusCode = 404;
      throw error;
    }

    return updatedBudget;
  } catch (error) {
    if (error.code === "23505") {
      const duplicateError = new Error("A budget already exists for this category, month, and year");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function deleteBudget(userId, budgetId) {
  const deletedBudget = await budgetsRepository.deleteBudget(userId, budgetId);

  if (!deletedBudget) {
    const error = new Error("Budget not found");
    error.statusCode = 404;
    throw error;
  }

  return deletedBudget;
}

module.exports = {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
