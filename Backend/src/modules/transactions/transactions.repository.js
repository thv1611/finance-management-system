const pool = require("../../db/connection");

function buildTransactionFilters(userId, options = {}) {
  const values = [userId];
  const clauses = ["t.user_id = $1"];

  if (options.type) {
    values.push(options.type);
    clauses.push(`t.type = $${values.length}`);
  }

  if (options.categoryIds?.length) {
    values.push(options.categoryIds);
    clauses.push(`t.category_id = ANY($${values.length}::int[])`);
  }

  if (options.datePreset === "today") {
    clauses.push("t.transaction_date = CURRENT_DATE");
  }

  if (options.datePreset === "thisWeek") {
    clauses.push("t.transaction_date >= date_trunc('week', CURRENT_DATE)::date");
    clauses.push("t.transaction_date < (date_trunc('week', CURRENT_DATE)::date + INTERVAL '7 days')");
  }

  if (options.datePreset === "last30Days") {
    clauses.push("t.transaction_date >= (CURRENT_DATE - INTERVAL '29 days')");
    clauses.push("t.transaction_date <= CURRENT_DATE");
  }

  if (options.datePreset === "thisMonth") {
    clauses.push("t.transaction_date >= date_trunc('month', CURRENT_DATE)::date");
    clauses.push("t.transaction_date < (date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month')");
  }

  if (options.datePreset === "lastMonth") {
    clauses.push("t.transaction_date >= (date_trunc('month', CURRENT_DATE)::date - INTERVAL '1 month')");
    clauses.push("t.transaction_date < date_trunc('month', CURRENT_DATE)::date");
  }

  if (options.startDate) {
    values.push(options.startDate);
    clauses.push(`t.transaction_date >= $${values.length}`);
  }

  if (options.endDate) {
    values.push(options.endDate);
    clauses.push(`t.transaction_date <= $${values.length}`);
  }

  return {
    values,
    whereClause: clauses.join(" AND "),
  };
}

async function getTransactionsByUser(userId, options = {}) {
  const { values, whereClause } = buildTransactionFilters(userId, options);
  const pageSize = options.pageSize || 15;
  const page = options.page || 1;
  const offset = (page - 1) * pageSize;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total_count
     FROM transactions t
     WHERE ${whereClause}`,
    values
  );

  const dataValues = [...values, pageSize, offset];
  const result = await pool.query(
    `SELECT
      t.id,
      t.user_id,
      t.category_id,
      t.type,
      t.amount,
      t.title,
      t.description,
      t.transaction_date,
      t.created_at,
      t.updated_at,
      c.name AS category_name
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE ${whereClause}
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT $${dataValues.length - 1}
    OFFSET $${dataValues.length}`,
    dataValues
  );

  return {
    rows: result.rows,
    totalCount: countResult.rows[0]?.total_count || 0,
  };
}

async function getCurrentMonthSummary(userId) {
  const result = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
     FROM transactions
     WHERE user_id = $1
       AND transaction_date >= date_trunc('month', CURRENT_DATE)::date
       AND transaction_date < (date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month')`,
    [userId]
  );

  return result.rows[0];
}

async function findTransactionById(userId, transactionId) {
  const result = await pool.query(
    `SELECT
      t.id,
      t.user_id,
      t.category_id,
      t.type,
      t.amount,
      t.title,
      t.description,
      t.transaction_date,
      t.created_at,
      t.updated_at,
      c.name AS category_name
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
       AND t.id = $2
     LIMIT 1`,
    [userId, transactionId]
  );

  return result.rows[0] || null;
}

async function createTransaction({
  userId,
  categoryId,
  type,
  amount,
  title,
  description,
  transactionDate,
}) {
  const result = await pool.query(
    `INSERT INTO transactions (
      user_id,
      category_id,
      type,
      amount,
      title,
      description,
      transaction_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, user_id, category_id, type, amount, title, description, transaction_date, created_at, updated_at`,
    [userId, categoryId, type, amount, title, description, transactionDate]
  );

  return result.rows[0];
}

async function updateTransaction({
  userId,
  transactionId,
  categoryId,
  type,
  amount,
  title,
  description,
  transactionDate,
}) {
  const result = await pool.query(
    `UPDATE transactions
     SET category_id = $3,
         type = $4,
         amount = $5,
         title = $6,
         description = $7,
         transaction_date = $8,
         updated_at = NOW()
     WHERE user_id = $1
       AND id = $2
     RETURNING id, user_id, category_id, type, amount, title, description, transaction_date, created_at, updated_at`,
    [userId, transactionId, categoryId, type, amount, title, description, transactionDate]
  );

  return result.rows[0] || null;
}

async function deleteTransaction(userId, transactionId) {
  const result = await pool.query(
    `DELETE FROM transactions
     WHERE user_id = $1
       AND id = $2
     RETURNING id`,
    [userId, transactionId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getTransactionsByUser,
  getCurrentMonthSummary,
  findTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
