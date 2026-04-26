function formatRatio(value) {
  return `${Math.abs(Number(value || 0)).toFixed(1)}%`;
}

export function buildDashboardInsight({ summary, recentTransactions = [], budgetSnapshot }) {
  const monthlyIncome = Number(summary?.monthly_income || 0);
  const monthlyExpenses = Number(summary?.monthly_expenses || 0);
  const monthlySavings = Number(summary?.monthly_savings || 0);
  const overspentCount = Number(budgetSnapshot?.overspent_categories_count || 0);
  const warningItem = (budgetSnapshot?.items || []).find(
    (item) => !item.overspent && Number(item.progress || 0) >= 80
  );
  const topBudgetRisk = (budgetSnapshot?.items || []).find((item) => item.overspent) || warningItem;
  const latestExpense = recentTransactions.find((transaction) => transaction.type === "expense");

  if (!recentTransactions.length && !budgetSnapshot?.items?.length) {
    return {
      title: "AI Insight",
      description: "Add transactions and budgets to unlock personalized financial recommendations.",
      actionLabel: "Add Transaction",
      actionTo: "/transactions/new",
    };
  }

  if (overspentCount > 0) {
    return {
      title: "AI Insight",
      description: `${overspentCount} budget category${overspentCount > 1 ? "ies are" : " is"} over limit. Review those categories before adding more expense this month.`,
      actionLabel: "Review Budgets",
      actionTo: "/budgets",
    };
  }

  if (topBudgetRisk) {
    return {
      title: "AI Insight",
      description: topBudgetRisk.overspent
        ? `${topBudgetRisk.category_name} is already over budget. This is the fastest place to intervene before month-end.`
        : `${topBudgetRisk.category_name} has used ${Number(topBudgetRisk.progress || 0).toFixed(0)}% of its budget. One more expense could push it over.`,
      actionLabel: "Review Budgets",
      actionTo: "/budgets",
    };
  }

  if (monthlyIncome > 0) {
    const savingRatio = (monthlySavings / monthlyIncome) * 100;
    if (savingRatio < 10) {
      return {
        title: "AI Insight",
        description: `Your current saving ratio is ${formatRatio(savingRatio)}. Tightening one recurring expense could improve next month's buffer.`,
        actionLabel: "Open Reports",
        actionTo: "/reports",
      };
    }
  }

  if (monthlyExpenses >= monthlyIncome && monthlyIncome > 0) {
    return {
      title: "AI Insight",
      description: "This month your expenses are running above income. Check recent spending and rebalance fast-moving categories.",
      actionLabel: "View History",
      actionTo: "/transactions",
    };
  }

  if (latestExpense) {
    return {
      title: "AI Insight",
      description: `Your latest expense was in ${latestExpense.category}. If that category keeps recurring, it is the best place to tighten next.`,
      actionLabel: "Open AI Chat",
      actionTo: "/ai-insights",
    };
  }

  return {
    title: "AI Insight",
    description: "Your current month looks balanced. Use AI Insights to turn this snapshot into a concrete saving plan.",
    actionLabel: "View Reports",
    actionTo: "/reports",
  };
}

export function buildReportsInsight({ summary, spendingByCategory = [], topSpending = [], rangeLabel }) {
  const totalIncome = Number(summary?.totalIncome || 0);
  const totalExpense = Number(summary?.totalExpense || 0);

  if (!totalIncome && !totalExpense && !spendingByCategory.length && !topSpending.length) {
    return {
      title: "AI Analysis",
      subtitle: "Spending Trends",
      description: "No data available. AI analysis appears after transactions and budgets are available.",
    };
  }

  const leadingCategory = spendingByCategory[0];
  if (leadingCategory && Number(leadingCategory.percent || 0) >= 40) {
    return {
      title: "AI Analysis",
      subtitle: "Spending Trends",
      description: `${leadingCategory.name} accounts for ${Number(leadingCategory.percent || 0).toFixed(1)}% of your ${rangeLabel.toLowerCase()} expenses. This is your strongest optimization lever right now.`,
    };
  }

  if (totalIncome > 0 && totalExpense > 0) {
    const savingsRatio = ((totalIncome - totalExpense) / totalIncome) * 100;
    return {
      title: "AI Analysis",
      subtitle: "Spending Trends",
      description: `Across this ${rangeLabel.toLowerCase()} window, your net saving ratio is ${formatRatio(savingsRatio)}. Use the category and top-spending cards to see what is driving it.`,
    };
  }

  return {
    title: "AI Analysis",
    subtitle: "Spending Trends",
    description: "Your financial trends are ready for analysis.",
  };
}

export function buildCashFlowInsight({ summary, categoryTrends = [], activeRange }) {
  const totalIncome = Number(summary?.totalIncome || 0);
  const totalExpense = Number(summary?.totalExpense || 0);
  const savings = Number(summary?.savings || 0);
  const topCategory = categoryTrends[0];

  if (!totalIncome && !totalExpense && !categoryTrends.length) {
    return {
      title: "AI Smart Insight",
      description: "Add transactions to generate personalized cash-flow insights.",
      recommendation: "",
      actionLabel: "Add Transaction",
      actionTo: "/transactions/new",
    };
  }

  if (savings < 0) {
    return {
      title: "AI Smart Insight",
      description: `Your ${activeRange.toLowerCase()} cash flow is negative right now.`,
      recommendation: "Review your latest expenses and adjust the categories pushing you into a deficit.",
      actionLabel: "Review Transactions",
      actionTo: "/transactions",
    };
  }

  if (topCategory) {
    return {
      title: "AI Smart Insight",
      description: "Cash-flow insights update automatically from your latest records.",
      recommendation: `${topCategory.name} is your heaviest spending category in this ${activeRange.toLowerCase()} view. Set a tighter budget there first.`,
      actionLabel: "Adjust Budget",
      actionTo: "/budgets",
    };
  }

  return {
    title: "AI Smart Insight",
    description: "Cash-flow insights update automatically from your latest records.",
    recommendation: "Your inflow is still ahead of outflow. Keep tracking consistently to preserve that buffer.",
    actionLabel: "View Reports",
    actionTo: "/reports",
  };
}
