const pool = require("../../db/connection");

function mapBudgetRow(row) {
  if (!row) {
    return null;
  }

  const amountLimit = Number(row.amount_limit || 0);
  const spent = Number(row.spent || 0);
  const remaining = amountLimit - spent;
  const rawProgress = amountLimit > 0 ? (spent / amountLimit) * 100 : 0;

  return {
    ...row,
    amount_limit: amountLimit,
    spent,
    remaining,
    progress: Number(rawProgress.toFixed(2)),
    overspent: spent > amountLimit,
  };
}

function buildBudgetFilters(userId, options = {}) {
  const values = [userId];
  const clauses = ["b.user_id = $1"];

  if (options.month) {
    values.push(options.month);
    clauses.push(`b.month = $${values.length}`);
  }

  if (options.year) {
    values.push(options.year);
    clauses.push(`b.year = $${values.length}`);
  }

  return {
    values,
    whereClause: clauses.join(" AND "),
  };
}

async function getBudgetsByUser(userId, options = {}) {
  const { values, whereClause } = buildBudgetFilters(userId, options);
  const result = await pool.query(
    `SELECT
      b.id,
      b.user_id,
      b.category_id,
      c.name AS category_name,
      c.type AS category_type,
      b.month,
      b.year,
      b.amount_limit,
      COALESCE(SUM(
        CASE
          WHEN t.type = 'expense' THEN t.amount
          ELSE 0
        END
      ), 0) AS spent,
      b.created_at,
      b.updated_at
    FROM budgets b
    INNER JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t
      ON t.user_id = b.user_id
     AND t.category_id = b.category_id
     AND t.type = 'expense'
     AND EXTRACT(MONTH FROM t.transaction_date) = b.month
     AND EXTRACT(YEAR FROM t.transaction_date) = b.year
    WHERE ${whereClause}
    GROUP BY b.id, c.name, c.type
    ORDER BY b.year DESC, b.month DESC, c.name ASC`,
    values
  );

  return result.rows.map(mapBudgetRow);
}

async function findBudgetById(userId, budgetId) {
  const result = await pool.query(
    `SELECT
      b.id,
      b.user_id,
      b.category_id,
      c.name AS category_name,
      c.type AS category_type,
      b.month,
      b.year,
      b.amount_limit,
      COALESCE(SUM(
        CASE
          WHEN t.type = 'expense' THEN t.amount
          ELSE 0
        END
      ), 0) AS spent,
      b.created_at,
      b.updated_at
    FROM budgets b
    INNER JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t
      ON t.user_id = b.user_id
     AND t.category_id = b.category_id
     AND t.type = 'expense'
     AND EXTRACT(MONTH FROM t.transaction_date) = b.month
     AND EXTRACT(YEAR FROM t.transaction_date) = b.year
    WHERE b.user_id = $1
      AND b.id = $2
    GROUP BY b.id, c.name, c.type
    LIMIT 1`,
    [userId, budgetId]
  );

  return mapBudgetRow(result.rows[0] || null);
}

async function findDuplicateBudget(userId, categoryId, month, year, excludeBudgetId = null) {
  const values = [userId, categoryId, month, year];
  let excludeClause = "";

  if (excludeBudgetId) {
    values.push(excludeBudgetId);
    excludeClause = ` AND id <> $${values.length}`;
  }

  const result = await pool.query(
    `SELECT id
     FROM budgets
     WHERE user_id = $1
       AND category_id = $2
       AND month = $3
       AND year = $4${excludeClause}
     LIMIT 1`,
    values
  );

  return result.rows[0] || null;
}

async function createBudget({ userId, categoryId, month, year, amountLimit }) {
  const result = await pool.query(
    `INSERT INTO budgets (
      user_id,
      category_id,
      month,
      year,
      amount_limit
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id`,
    [userId, categoryId, month, year, amountLimit]
  );

  return findBudgetById(userId, result.rows[0].id);
}

async function updateBudget({ userId, budgetId, categoryId, month, year, amountLimit }) {
  const result = await pool.query(
    `UPDATE budgets
     SET category_id = $3,
         month = $4,
         year = $5,
         amount_limit = $6,
         updated_at = NOW()
     WHERE user_id = $1
       AND id = $2
     RETURNING id`,
    [userId, budgetId, categoryId, month, year, amountLimit]
  );

  if (!result.rows[0]) {
    return null;
  }

  return findBudgetById(userId, result.rows[0].id);
}

async function deleteBudget(userId, budgetId) {
  const result = await pool.query(
    `DELETE FROM budgets
     WHERE user_id = $1
       AND id = $2
     RETURNING id, category_id, month, year`,
    [userId, budgetId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getBudgetsByUser,
  findBudgetById,
  findDuplicateBudget,
  createBudget,
  updateBudget,
  deleteBudget,
};
