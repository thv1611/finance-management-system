const aiService = require("./ai.service");
const aiSqlService = require("./ai-sql.service");
const { successResponse } = require("../../utils/response");

async function chatController(req, res, next) {
  try {
    const data = await aiService.chat(req.user.id, req.body);
    return successResponse(res, "AI response generated successfully", data, 200);
  } catch (error) {
    next(error);
  }
}

async function askController(req, res, next) {
  try {
    const data = await aiSqlService.askSqlAgent({
      userId: req.user.id,
      question: req.body.question,
    });

    return res.status(200).json({
      success: true,
      question: data.question,
      answer: data.answer,
      sql: data.sql,
      data: data.data,
      meta: data.meta,
    });
  } catch (error) {
    const statusCode = error.statusCode || 503;

    return res.status(statusCode).json({
      success: false,
      question: req.body.question,
      answer:
        "I could not analyze your finance data safely right now. Please try again in a moment or rephrase the question more specifically.",
      sql: null,
      data: [],
      message: error.message || "AI SQL agent request failed",
    });
  }
}

module.exports = {
  askController,
  chatController,
};
