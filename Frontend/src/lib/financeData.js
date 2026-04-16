const EMPTY_FINANCE_DATA = {
  transactions: [],
  budgets: [],
  reports: {
    categorySpending: [],
    monthlyComparison: [],
    savingRatio: null,
    incomeExpense: [],
    topSpending: [],
    snapshot: null,
    cashFlow: [],
    categoryTrends: [],
  },
  aiInsights: [],
  selectedTransaction: null,
};

function parseStoredFinanceData() {
  const storedValue = localStorage.getItem("finance_data");

  if (!storedValue) {
    return {};
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return {};
  }
}

export function useFinanceData() {
  const storedData = parseStoredFinanceData();

  return {
    isLoading: false,
    transactions: storedData.transactions || EMPTY_FINANCE_DATA.transactions,
    budgets: storedData.budgets || EMPTY_FINANCE_DATA.budgets,
    reports: {
      ...EMPTY_FINANCE_DATA.reports,
      ...(storedData.reports || {}),
    },
    aiInsights: storedData.aiInsights || EMPTY_FINANCE_DATA.aiInsights,
    selectedTransaction: storedData.selectedTransaction || EMPTY_FINANCE_DATA.selectedTransaction,
  };
}

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

export function appendTransactionToFinanceData(transaction) {
  const storedData = parseStoredFinanceData();
  const currentTransactions = storedData.transactions || EMPTY_FINANCE_DATA.transactions;
  const nextTransaction = {
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount),
    title: transaction.title,
    description: transaction.title,
    note: transaction.description || "",
    categoryId: transaction.category_id,
    date: transaction.transaction_date,
    createdAt: transaction.created_at,
  };

  localStorage.setItem(
    "finance_data",
    JSON.stringify({
      ...EMPTY_FINANCE_DATA,
      ...storedData,
      transactions: [nextTransaction, ...currentTransactions],
    })
  );
}
