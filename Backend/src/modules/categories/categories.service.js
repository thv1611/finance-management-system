const categoriesRepository = require("./categories.repository");

async function listCategories(userId, type) {
  return categoriesRepository.getCategoriesByUser(userId, type);
}

module.exports = {
  listCategories,
};
