const pool = require("../../db/connection");

function buildReportFilters(userId, filters = {}, options = {}) {
  const values = [userId];
  const clauses = ["t.user_id = $1"];

  if (options.type) {
    values.push(options.type);
    clauses.push(`t.type = $${values.length}`);
  }

  if (filters.categoryIds?.length) {
    values.push(filters.categoryIds);
    clauses.push(`t.category_id = ANY($${values.length}::int[])`);
  }

  if (filters.startDate) {
    values.push(filters.startDate);
    clauses.push(`t.transaction_date >= $${values.length}`);
  }

  if (filters.endDate) {
    values.push(filters.endDate);
    clauses.push(`t.transaction_date <= $${values.length}`);
  }

  return {
    values,
    whereClause: clauses.join(" AND "),
  };
}

async function getSummary(userId, filters) {
  const { values, whereClause } = buildReportFilters(userId, filters);
  const result = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense
     FROM transactions t
     WHERE ${whereClause}`,
    values
  );

  return result.rows[0] || null;
}

async function getSnapshotMonthlyTotals(userId, filters) {
  const { values, whereClause } = buildReportFilters(userId, filters);
  const result = await pool.query(
    `SELECT
      date_trunc('month', t.transaction_date)::date AS period_start,
      TO_CHAR(date_trunc('month', t.transaction_date), 'Mon YYYY') AS label,
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense
     FROM transactions t
     WHERE ${whereClause}
     GROUP BY date_trunc('month', t.transaction_date)
     ORDER BY period_start ASC`,
    values
  );

  return result.rows;
}

async function getBiggestExpenseCategory(userId, filters) {
  const { values, whereClause } = buildReportFilters(userId, filters, { type: "expense" });
  const result = await pool.query(
    `SELECT
      COALESCE(c.name, 'Uncategorized') AS name,
      COALESCE(SUM(t.amount), 0) AS amount
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE ${whereClause}
     GROUP BY COALESCE(c.name, 'Uncategorized')
     ORDER BY amount DESC, name ASC
     LIMIT 1`,
    values
  );

  return result.rows[0] || null;
}

async function getSpendingByCategory(userId, filters) {
  const { values, whereClause } = buildReportFilters(userId, filters, { type: "expense" });
  const result = await pool.query(
    `SELECT
      COALESCE(c.name, 'Uncategorized') AS name,
      t.category_id,
      COALESCE(SUM(t.amount), 0) AS amount,
      COUNT(*)::int AS transaction_count
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE ${whereClause}
     GROUP BY t.category_id, COALESCE(c.name, 'Uncategorized')
     ORDER BY amount DESC, name ASC`,
    values
  );

  return result.rows;
}

function getSeriesConfig(granularity) {
  if (granularity === "day") {
    return {
      periodExpr: "t.transaction_date",
      intervalExpr: "INTERVAL '1 day'",
      labelExpr: "TO_CHAR(p.period_start, 'Dy')",
    };
  }

  if (granularity === "week") {
    return {
      periodExpr: "date_trunc('week', t.transaction_date)::date",
      intervalExpr: "INTERVAL '1 week'",
      labelExpr: "TO_CHAR(p.period_start, 'DD Mon')",
    };
  }

  return {
    periodExpr: "date_trunc('month', t.transaction_date)::date",
    intervalExpr: "INTERVAL '1 month'",
    labelExpr: "TO_CHAR(p.period_start, 'Mon')",
  };
}

async function getMonthlyComparison(userId, filters, granularity) {
  const config = getSeriesConfig(granularity);
  const { values, whereClause } = buildReportFilters(userId, filters);
  const startParamIndex = values.length + 1;
  const endParamIndex = values.length + 2;
  const result = await pool.query(
    `WITH periods AS (
      SELECT generate_series(
        $${startParamIndex}::date,
        $${endParamIndex}::date,
        ${config.intervalExpr}
      )::date AS period_start
    ),
    period_totals AS (
      SELECT
        ${config.periodExpr} AS period_start,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense
      FROM transactions t
      WHERE ${whereClause}
      GROUP BY ${config.periodExpr}
    )
    SELECT
      p.period_start,
      ${config.labelExpr} AS label,
      COALESCE(pt.income, 0) AS income,
      COALESCE(pt.expense, 0) AS expense
    FROM periods p
    LEFT JOIN period_totals pt ON pt.period_start = p.period_start
    ORDER BY p.period_start ASC`,
    [...values, filters.seriesStartDate, filters.seriesEndDate]
  );

  return result.rows;
}

async function getTopSpending(userId, filters, limit = 5) {
  const { values, whereClause } = buildReportFilters(userId, filters, { type: "expense" });
  const result = await pool.query(
    `SELECT
      COALESCE(c.name, 'Uncategorized') AS name,
      t.category_id,
      COUNT(*)::int AS transaction_count,
      COALESCE(SUM(t.amount), 0) AS amount
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE ${whereClause}
     GROUP BY t.category_id, COALESCE(c.name, 'Uncategorized')
     ORDER BY amount DESC, transaction_count DESC, name ASC
     LIMIT $${values.length + 1}`,
    [...values, limit]
  );

  return result.rows;
}

module.exports = {
  getSummary,
  getSnapshotMonthlyTotals,
  getBiggestExpenseCategory,
  getSpendingByCategory,
  getMonthlyComparison,
  getTopSpending,
};
