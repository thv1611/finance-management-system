const pool = require("../../db/connection");

async function getCategoriesByUser(userId, type) {
  const values = [userId];
  let typeFilter = "";

  if (type) {
    values.push(type);
    typeFilter = " AND c.type = $2";
  }

  const result = await pool.query(
    `SELECT c.id, c.user_id, c.name, c.type, c.is_default, c.created_at, c.updated_at
     FROM categories c
     WHERE (c.is_default = TRUE OR c.user_id = $1)${typeFilter}
     ORDER BY c.is_default DESC, c.name ASC`,
    values
  );

  return result.rows;
}

async function findCategoryForUser(categoryId, userId) {
  const result = await pool.query(
    `SELECT id, user_id, name, type, is_default
     FROM categories
     WHERE id = $1
       AND (is_default = TRUE OR user_id = $2)
     LIMIT 1`,
    [categoryId, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getCategoriesByUser,
  findCategoryForUser,
};
