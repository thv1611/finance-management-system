const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { chatController } = require("./ai.controller");
const { chatValidation, validateRequest } = require("./ai.validation");

const router = express.Router();

router.post("/chat", requireAuth, chatValidation, validateRequest, chatController);

module.exports = router;
