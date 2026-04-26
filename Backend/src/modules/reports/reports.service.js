const reportsRepository = require("./reports.repository");

const CATEGORY_COLORS = ["#13977f", "#2d8ce9", "#88d9cd", "#ff9f43", "#dd4d58", "#7a8cff"];

function parseIsoDate(value, fieldName) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const error = new Error(`${fieldName} must be a valid date`);
    error.statusCode = 400;
    throw error;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || formatDate(date) !== value) {
    const error = new Error(`${fieldName} must be a valid date`);
    error.statusCode = 400;
    throw error;
  }

  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date) {
  const result = new Date(date);
  const dayOffset = (result.getUTCDay() + 6) % 7;
  result.setUTCDate(result.getUTCDate() - dayOffset);
  return result;
}

function endOfWeek(date) {
  const result = startOfWeek(date);
  result.setUTCDate(result.getUTCDate() + 6);
  return result;
}

function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function startOfYear(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

function endOfYear(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), 11, 31));
}

function normalizeCategoryIds(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function getGranularity(range, startDate, endDate) {
  if (range === "week") {
    return "day";
  }

  if (range === "month") {
    return "week";
  }

  if (range === "year") {
    return "month";
  }

  const differenceInDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);

  if (differenceInDays <= 14) {
    return "day";
  }

  if (differenceInDays <= 120) {
    return "week";
  }

  return "month";
}

function normalizeQuery(query = {}) {
  const range = ["week", "month", "year", "custom"].includes(query.range) ? query.range : "week";
  const today = new Date();
  const currentDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  let startDate;
  let endDate;

  if (range === "custom") {
    if (!query.startDate || !query.endDate) {
      const error = new Error("Custom range requires startDate and endDate");
      error.statusCode = 400;
      throw error;
    }

    startDate = parseIsoDate(query.startDate, "Start date");
    endDate = parseIsoDate(query.endDate, "End date");
  } else if (range === "month") {
    startDate = startOfMonth(currentDate);
    endDate = endOfMonth(currentDate);
  } else if (range === "year") {
    startDate = startOfYear(currentDate);
    endDate = endOfYear(currentDate);
  } else {
    startDate = startOfWeek(currentDate);
    endDate = endOfWeek(currentDate);
  }

  if (startDate.getTime() > endDate.getTime()) {
    const error = new Error("Start date must be before or equal to end date");
    error.statusCode = 400;
    throw error;
  }

  const granularity = getGranularity(range, startDate, endDate);
  const seriesStartDate =
    granularity === "week" ? startOfWeek(startDate) : granularity === "month" ? startOfMonth(startDate) : startDate;
  const seriesEndDate =
    granularity === "week" ? endOfWeek(endDate) : granularity === "month" ? endOfMonth(endDate) : endDate;

  return {
    range,
    granularity,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    seriesStartDate: formatDate(seriesStartDate),
    seriesEndDate: formatDate(seriesEndDate),
    categoryIds: normalizeCategoryIds(query.categoryIds),
  };
}

function mapCategoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

function getTopSpendingIcon(name) {
  const value = String(name || "").toLowerCase();

  if (value.includes("food") || value.includes("dining") || value.includes("restaurant")) {
    return "restaurant";
  }

  if (value.includes("salary") || value.includes("job") || value.includes("work")) {
    return "briefcase";
  }

  if (value.includes("home") || value.includes("rent") || value.includes("house")) {
    return "home";
  }

  if (value.includes("car") || value.includes("transport") || value.includes("fuel")) {
    return "car";
  }

  return "card";
}

async function getSummary(userId, query) {
  const filters = normalizeQuery(query);
  const [summaryRow, monthlyRows, biggestCategoryRow] = await Promise.all([
    reportsRepository.getSummary(userId, filters),
    reportsRepository.getSnapshotMonthlyTotals(userId, filters),
    reportsRepository.getBiggestExpenseCategory(userId, filters),
  ]);
  const totalIncome = Number(summaryRow?.total_income || 0);
  const totalExpense = Number(summaryRow?.total_expense || 0);
  const savings = totalIncome - totalExpense;
  const savingRatio = totalIncome > 0 ? Number(((savings / totalIncome) * 100).toFixed(2)) : 0;
  const snapshotItems = monthlyRows.map((row) => ({
    label: row.label,
    savings: Number(row.income || 0) - Number(row.expense || 0),
  }));
  const bestMonth = snapshotItems.length
    ? snapshotItems.reduce((best, item) => (item.savings > best.savings ? item : best))
    : null;
  const worstMonth = snapshotItems.length
    ? snapshotItems.reduce((worst, item) => (item.savings < worst.savings ? item : worst))
    : null;

  return {
    range: filters.range,
    startDate: filters.startDate,
    endDate: filters.endDate,
    totalIncome,
    totalExpense,
    savings,
    savingRatio,
    snapshot:
      bestMonth || worstMonth || biggestCategoryRow
        ? {
            bestMonth: bestMonth?.label || "N/A",
            worstMonth: worstMonth?.label || "N/A",
            biggestCategory: biggestCategoryRow?.name || "N/A",
          }
        : null,
  };
}

async function getSpendingByCategory(userId, query) {
  const filters = normalizeQuery(query);
  const rows = await reportsRepository.getSpendingByCategory(userId, filters);
  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return rows.map((row, index) => {
    const amount = Number(row.amount || 0);
    const percent = totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(1)) : 0;

    return {
      categoryId: row.category_id,
      name: row.name,
      amount,
      transactionCount: Number(row.transaction_count || 0),
      percent,
      color: mapCategoryColor(index),
    };
  });
}

async function getMonthlyComparison(userId, query) {
  const filters = normalizeQuery(query);
  const rows = await reportsRepository.getMonthlyComparison(userId, filters, filters.granularity);
  const series = rows.map((row) => ({
    periodStart: row.period_start,
    label: String(row.label || "").trim(),
    income: Number(row.income || 0),
    expense: Number(row.expense || 0),
  }));
  const maxValue = series.reduce(
    (max, item) => Math.max(max, item.income, item.expense),
    0
  );

  return {
    range: filters.range,
    granularity: filters.granularity,
    startDate: filters.startDate,
    endDate: filters.endDate,
    maxValue,
    series,
  };
}

async function getTopSpending(userId, query) {
  const filters = normalizeQuery(query);
  const rows = await reportsRepository.getTopSpending(userId, filters);

  return rows.map((row) => ({
    categoryId: row.category_id,
    name: row.name,
    count: Number(row.transaction_count || 0),
    amount: Number(row.amount || 0),
    icon: getTopSpendingIcon(row.name),
  }));
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }

  return stringValue;
}

function buildCsv(rows) {
  return rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

async function exportCsv(userId, query) {
  const filters = normalizeQuery(query);
  const [summary, spendingByCategory, topSpending, monthlyComparison] = await Promise.all([
    getSummary(userId, query),
    getSpendingByCategory(userId, query),
    getTopSpending(userId, query),
    getMonthlyComparison(userId, query),
  ]);

  const sections = [
    ["Finance Management Report Export"],
    [`Range`, summary.range],
    ["Start Date", summary.startDate],
    ["End Date", summary.endDate],
    [""],
    ["Summary"],
    ["Metric", "Value"],
    ["Total Income", summary.totalIncome],
    ["Total Expense", summary.totalExpense],
    ["Savings", summary.savings],
    ["Saving Ratio (%)", summary.savingRatio],
    [""],
    ["Spending By Category"],
    ["Category", "Amount", "Transactions", "Percent"],
    ...spendingByCategory.map((item) => [
      item.name,
      item.amount,
      item.transactionCount,
      item.percent,
    ]),
    [""],
    ["Top Spending"],
    ["Category", "Amount", "Transactions"],
    ...topSpending.map((item) => [item.name, item.amount, item.count]),
    [""],
    ["Monthly Comparison"],
    ["Label", "Income", "Expense"],
    ...monthlyComparison.series.map((item) => [item.label, item.income, item.expense]),
  ];

  return {
    filename: `finance-report-${summary.range}-${summary.startDate}-to-${summary.endDate}.csv`,
    content: buildCsv(sections),
  };
}

module.exports = {
  getSummary,
  getSpendingByCategory,
  getMonthlyComparison,
  getTopSpending,
  exportCsv,
};
