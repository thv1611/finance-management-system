const aiService = require("./ai.service");
const { successResponse } = require("../../utils/response");

async function chatController(req, res, next) {
  try {
    const data = await aiService.chat(req.user.id, req.body);
    return successResponse(res, "AI response generated successfully", data, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  chatController,
};
