const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const {
  getBudgetsController,
  createBudgetController,
  updateBudgetController,
  deleteBudgetController,
} = require("./budgets.controller");
const {
  listBudgetsValidation,
  createBudgetValidation,
  budgetIdValidation,
  validateRequest,
} = require("./budgets.validation");

const router = express.Router();

router.get("/", requireAuth, listBudgetsValidation, validateRequest, getBudgetsController);
router.post("/", requireAuth, createBudgetValidation, validateRequest, createBudgetController);
router.put(
  "/:id",
  requireAuth,
  budgetIdValidation,
  createBudgetValidation,
  validateRequest,
  updateBudgetController
);
router.delete("/:id", requireAuth, budgetIdValidation, validateRequest, deleteBudgetController);

module.exports = router;
