const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const {
  getReportsSummaryController,
  getSpendingByCategoryController,
  getMonthlyComparisonController,
  getTopSpendingController,
} = require("./reports.controller");
const { reportsQueryValidation, validateRequest } = require("./reports.validation");

const router = express.Router();

router.get("/summary", requireAuth, reportsQueryValidation, validateRequest, getReportsSummaryController);
router.get(
  "/spending-by-category",
  requireAuth,
  reportsQueryValidation,
  validateRequest,
  getSpendingByCategoryController
);
router.get(
  "/monthly-comparison",
  requireAuth,
  reportsQueryValidation,
  validateRequest,
  getMonthlyComparisonController
);
router.get("/top-spending", requireAuth, reportsQueryValidation, validateRequest, getTopSpendingController);

module.exports = router;
