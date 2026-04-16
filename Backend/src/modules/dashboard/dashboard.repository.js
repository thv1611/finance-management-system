const pool = require("../../db/connection");

function mapRecentTransactionRow(row) {
  return {
    ...row,
    amount: Number(row.amount || 0),
  };
}

function mapBudgetSnapshotRow(row) {
  const amountLimit = Number(row.amount_limit || 0);
  const spent = Number(row.spent || 0);
  const progress = amountLimit > 0 ? Math.min((spent / amountLimit) * 100, 100) : 0;

  return {
    ...row,
    amount_limit: amountLimit,
    spent,
    remaining: amountLimit - spent,
    progress: Number(progress.toFixed(2)),
    overspent: spent > amountLimit,
  };
}

async function getDashboardSummary(userId) {
  const result = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(
        CASE
          WHEN type = 'income' THEN amount
          WHEN type = 'expense' THEN -amount
          ELSE 0
        END
      ), 0) AS total_balance,
      COALESCE(SUM(
        CASE
          WHEN type = 'income'
           AND transaction_date >= date_trunc('month', CURRENT_DATE)::date
           AND transaction_date < (date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month')
          THEN amount
          ELSE 0
        END
      ), 0) AS monthly_income,
      COALESCE(SUM(
        CASE
          WHEN type = 'expense'
           AND transaction_date >= date_trunc('month', CURRENT_DATE)::date
           AND transaction_date < (date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month')
          THEN amount
          ELSE 0
        END
      ), 0) AS monthly_expenses
     FROM transactions
     WHERE user_id = $1`,
    [userId]
  );

  const row = result.rows[0] || {};
  const monthlyIncome = Number(row.monthly_income || 0);
  const monthlyExpenses = Number(row.monthly_expenses || 0);

  return {
    total_balance: Number(row.total_balance || 0),
    monthly_income: monthlyIncome,
    monthly_expenses: monthlyExpenses,
    monthly_savings: monthlyIncome - monthlyExpenses,
  };
}

async function getRecentTransactions(userId, limit = 5) {
  const result = await pool.query(
    `SELECT
      t.id,
      t.category_id,
      t.type,
      t.amount,
      t.title,
      t.description,
      t.transaction_date,
      t.created_at,
      c.name AS category_name
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map(mapRecentTransactionRow);
}

async function getBudgetSnapshot(userId) {
  const result = await pool.query(
    `SELECT
      b.id,
      b.category_id,
      c.name AS category_name,
      b.month,
      b.year,
      b.amount_limit,
      COALESCE(SUM(
        CASE
          WHEN t.type = 'expense' THEN t.amount
          ELSE 0
        END
      ), 0) AS spent
     FROM budgets b
     INNER JOIN categories c ON c.id = b.category_id
     LEFT JOIN transactions t
       ON t.user_id = b.user_id
      AND t.category_id = b.category_id
      AND t.type = 'expense'
      AND t.transaction_date >= date_trunc('month', CURRENT_DATE)::date
      AND t.transaction_date < (date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month')
     WHERE b.user_id = $1
       AND b.month = EXTRACT(MONTH FROM CURRENT_DATE)::int
       AND b.year = EXTRACT(YEAR FROM CURRENT_DATE)::int
     GROUP BY b.id, b.category_id, c.name, b.month, b.year, b.amount_limit
     ORDER BY c.name ASC`,
    [userId]
  );

  const items = result.rows.map(mapBudgetSnapshotRow);

  return {
    total_budgets: items.length,
    total_budget_amount: items.reduce((total, item) => total + item.amount_limit, 0),
    total_spent_amount: items.reduce((total, item) => total + item.spent, 0),
    overspent_categories_count: items.filter((item) => item.overspent).length,
    items,
  };
}

function getAnalyticsConfig(range) {
  if (range === "weekly") {
    return {
      seriesCte: `SELECT generate_series(
        date_trunc('week', CURRENT_DATE)::date - INTERVAL '7 weeks',
        date_trunc('week', CURRENT_DATE)::date,
        INTERVAL '1 week'
      )::date AS period_start`,
      transactionPeriodExpr: "date_trunc('week', transaction_date)::date",
      startBoundaryExpr: "date_trunc('week', CURRENT_DATE)::date - INTERVAL '7 weeks'",
      endBoundaryExpr: "date_trunc('week', CURRENT_DATE)::date + INTERVAL '1 week'",
      labelExpr: `'Week ' || ROW_NUMBER() OVER (ORDER BY p.period_start)`,
    };
  }

  if (range === "yearly") {
    return {
      seriesCte: `SELECT generate_series(
        date_trunc('year', CURRENT_DATE)::date - INTERVAL '4 years',
        date_trunc('year', CURRENT_DATE)::date,
        INTERVAL '1 year'
      )::date AS period_start`,
      transactionPeriodExpr: "date_trunc('year', transaction_date)::date",
      startBoundaryExpr: "date_trunc('year', CURRENT_DATE)::date - INTERVAL '4 years'",
      endBoundaryExpr: "date_trunc('year', CURRENT_DATE)::date + INTERVAL '1 year'",
      labelExpr: "TO_CHAR(p.period_start, 'YYYY')",
    };
  }

  return {
    seriesCte: `SELECT generate_series(
      date_trunc('month', CURRENT_DATE)::date - INTERVAL '7 months',
      date_trunc('month', CURRENT_DATE)::date,
      INTERVAL '1 month'
    )::date AS period_start`,
    transactionPeriodExpr: "date_trunc('month', transaction_date)::date",
    startBoundaryExpr: "date_trunc('month', CURRENT_DATE)::date - INTERVAL '7 months'",
    endBoundaryExpr: "date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month'",
    labelExpr: "TO_CHAR(p.period_start, 'FMMon')",
  };
}

async function getSpendingAnalytics(userId, options = {}) {
  const { range = "monthly", view = "both" } = options;
  const config = getAnalyticsConfig(range);
  const result = await pool.query(
    `WITH periods AS (
      ${config.seriesCte}
    ),
    period_totals AS (
      SELECT
        ${config.transactionPeriodExpr} AS period_start,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
      FROM transactions
      WHERE user_id = $1
        AND transaction_date >= ${config.startBoundaryExpr}
        AND transaction_date < ${config.endBoundaryExpr}
      GROUP BY ${config.transactionPeriodExpr}
    )
    SELECT
      p.period_start,
      ${config.labelExpr} AS label,
      COALESCE(pt.income, 0) AS income,
      COALESCE(pt.expenses, 0) AS expenses
    FROM periods p
    LEFT JOIN period_totals pt ON pt.period_start = p.period_start
    ORDER BY p.period_start ASC`,
    [userId]
  );

  const items = result.rows.map((row) => ({
    period_start: row.period_start,
    label: row.label,
    income: Number(row.income || 0),
    expense: Number(row.expenses || 0),
  }));
  const normalizedItems = items.map((item) => ({
    ...item,
    income: view === "expense" ? 0 : item.income,
    expense: view === "income" ? 0 : item.expense,
  }));
  const maxValue = normalizedItems.reduce(
    (max, item) => Math.max(max, item.income, item.expense),
    0
  );

  return {
    range,
    view,
    series: normalizedItems,
    max_value: maxValue,
  };
}

module.exports = {
  getDashboardSummary,
  getRecentTransactions,
  getBudgetSnapshot,
  getSpendingAnalytics,
};
