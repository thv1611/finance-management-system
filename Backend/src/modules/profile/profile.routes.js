const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const {
  getProfileController,
  updateProfileController,
  changePasswordController,
} = require("./profile.controller");
const {
  updateProfileValidation,
  changePasswordValidation,
  validateRequest,
} = require("./profile.validation");

const router = express.Router();

router.get("/", requireAuth, getProfileController);
router.put("/", requireAuth, updateProfileValidation, validateRequest, updateProfileController);
router.put(
  "/password",
  requireAuth,
  changePasswordValidation,
  validateRequest,
  changePasswordController
);

module.exports = router;
