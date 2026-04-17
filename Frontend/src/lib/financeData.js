export function formatCurrency(value = 0, options = {}) {
  const sign = options.sign || "";
  const absoluteValue = Math.abs(Number(value) || 0);
  const formattedValue = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absoluteValue);

  return `${sign}${formattedValue}`;
}

export function getTransactionSummary(transactions = []) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Math.abs(Number(transaction.amount || 0)), 0);
  const net = income - expenses;

  return {
    count: transactions.length,
    income,
    expenses,
    net,
  };
}

export function getBudgetSummary(budgets = []) {
  const totalBudget = budgets.reduce(
    (total, budget) => total + Number(budget.amount_limit ?? budget.limit ?? 0),
    0
  );
  const totalSpent = budgets.reduce((total, budget) => total + Number(budget.spent || 0), 0);
  const overspent = budgets.filter(
    (budget) =>
      Number(budget.spent || 0) > Number(budget.amount_limit ?? budget.limit ?? 0)
  ).length;

  return {
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    overspent,
  };
}
