const dashboardService = require("./dashboard.service");
const { successResponse } = require("../../utils/response");

async function getDashboardSummaryController(req, res, next) {
  try {
    const summary = await dashboardService.getSummary(req.user.id);
    return successResponse(res, "Dashboard summary retrieved successfully", summary, 200);
  } catch (error) {
    next(error);
  }
}

async function getRecentTransactionsController(req, res, next) {
  try {
    const transactions = await dashboardService.getRecentTransactions(req.user.id);
    return successResponse(res, "Recent transactions retrieved successfully", transactions, 200);
  } catch (error) {
    next(error);
  }
}

async function getBudgetSnapshotController(req, res, next) {
  try {
    const snapshot = await dashboardService.getBudgetSnapshot(req.user.id);
    return successResponse(res, "Budget snapshot retrieved successfully", snapshot, 200);
  } catch (error) {
    next(error);
  }
}

async function getSpendingAnalyticsController(req, res, next) {
  try {
    const analytics = await dashboardService.getSpendingAnalytics(req.user.id, req.query);
    return successResponse(res, "Spending analytics retrieved successfully", analytics, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummaryController,
  getRecentTransactionsController,
  getBudgetSnapshotController,
  getSpendingAnalyticsController,
};
