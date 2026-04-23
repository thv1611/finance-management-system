const dashboardRepository = require("./dashboard.repository");

function normalizeAnalyticsQuery(query = {}) {
  const range = ["monthly", "weekly", "yearly"].includes(query.range) ? query.range : "monthly";
  const view = ["both", "income", "expense"].includes(query.view) ? query.view : "both";

  return {
    range,
    view,
  };
}

async function getSummary(userId) {
  return dashboardRepository.getDashboardSummary(userId);
}

async function getRecentTransactions(userId, limit) {
  return dashboardRepository.getRecentTransactions(userId, limit || 5);
}

async function getBudgetSnapshot(userId) {
  return dashboardRepository.getBudgetSnapshot(userId);
}

async function getSpendingAnalytics(userId, query) {
  const options = normalizeAnalyticsQuery(query);
  return dashboardRepository.getSpendingAnalytics(userId, options);
}

module.exports = {
  getSummary,
  getRecentTransactions,
  getBudgetSnapshot,
  getSpendingAnalytics,
};
