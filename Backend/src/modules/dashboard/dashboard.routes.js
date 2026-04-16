const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const {
  getDashboardSummaryController,
  getRecentTransactionsController,
  getBudgetSnapshotController,
  getSpendingAnalyticsController,
} = require("./dashboard.controller");

const router = express.Router();

router.get("/summary", requireAuth, getDashboardSummaryController);
router.get("/recent-transactions", requireAuth, getRecentTransactionsController);
router.get("/budget-snapshot", requireAuth, getBudgetSnapshotController);
router.get("/spending-analytics", requireAuth, getSpendingAnalyticsController);

module.exports = router;
