const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { getCategoriesController } = require("./categories.controller");
const {
  getCategoriesValidation,
  validateRequest,
} = require("./categories.validation");

const router = express.Router();

router.get("/", requireAuth, getCategoriesValidation, validateRequest, getCategoriesController);

module.exports = router;
