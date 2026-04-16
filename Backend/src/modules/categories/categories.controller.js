const categoriesService = require("./categories.service");
const { successResponse } = require("../../utils/response");

async function getCategoriesController(req, res, next) {
  try {
    const categories = await categoriesService.listCategories(
      req.user.id,
      req.query.type
    );

    return successResponse(res, "Categories retrieved successfully", categories);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategoriesController,
};
