const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { askController, chatController } = require("./ai.controller");
const { askValidation, chatValidation, validateRequest } = require("./ai.validation");

const router = express.Router();

router.post("/ask", requireAuth, askValidation, validateRequest, askController);
router.post("/chat", requireAuth, chatValidation, validateRequest, chatController);

module.exports = router;
