const budgetsService = require("./budgets.service");
const { successResponse } = require("../../utils/response");

async function getBudgetsController(req, res, next) {
  try {
    const budgets = await budgetsService.listBudgets(req.user.id, req.query);
    return successResponse(res, "Budgets retrieved successfully", budgets, 200);
  } catch (error) {
    next(error);
  }
}

async function createBudgetController(req, res, next) {
  try {
    const budget = await budgetsService.createBudget(req.user.id, req.body);
    return successResponse(res, "Budget created successfully", budget, 201);
  } catch (error) {
    next(error);
  }
}

async function updateBudgetController(req, res, next) {
  try {
    const budget = await budgetsService.updateBudget(req.user.id, Number(req.params.id), req.body);
    return successResponse(res, "Budget updated successfully", budget, 200);
  } catch (error) {
    next(error);
  }
}

async function deleteBudgetController(req, res, next) {
  try {
    const budget = await budgetsService.deleteBudget(req.user.id, Number(req.params.id));
    return successResponse(res, "Budget deleted successfully", budget, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBudgetsController,
  createBudgetController,
  updateBudgetController,
  deleteBudgetController,
};
