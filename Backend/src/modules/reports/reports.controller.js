const reportsService = require("./reports.service");
const { successResponse } = require("../../utils/response");

async function getReportsSummaryController(req, res, next) {
  try {
    const summary = await reportsService.getSummary(req.user.id, req.query);
    return successResponse(res, "Report summary retrieved successfully", summary, 200);
  } catch (error) {
    next(error);
  }
}

async function getSpendingByCategoryController(req, res, next) {
  try {
    const data = await reportsService.getSpendingByCategory(req.user.id, req.query);
    return successResponse(res, "Spending by category retrieved successfully", data, 200);
  } catch (error) {
    next(error);
  }
}

async function getMonthlyComparisonController(req, res, next) {
  try {
    const data = await reportsService.getMonthlyComparison(req.user.id, req.query);
    return successResponse(res, "Monthly comparison retrieved successfully", data, 200);
  } catch (error) {
    next(error);
  }
}

async function getTopSpendingController(req, res, next) {
  try {
    const data = await reportsService.getTopSpending(req.user.id, req.query);
    return successResponse(res, "Top spending retrieved successfully", data, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReportsSummaryController,
  getSpendingByCategoryController,
  getMonthlyComparisonController,
  getTopSpendingController,
};
