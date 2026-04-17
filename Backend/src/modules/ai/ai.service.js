const env = require("../../config/env");
const dashboardService = require("../dashboard/dashboard.service");
const reportsService = require("../reports/reports.service");

function toCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function summarizeContext(context) {
  const topCategory = context.topSpending[0];
  const recentTransactionsText = context.recentTransactions.length
    ? context.recentTransactions
        .map(
          (item) =>
            `${item.transaction_date}: ${item.type} ${toCurrency(item.amount)} for ${item.title || item.description || item.category_name || "transaction"}`
        )
        .join("\n")
    : "No recent transactions recorded.";

  return [
    "Financial context for the current user:",
    `- Total balance: ${toCurrency(context.dashboardSummary.total_balance)}`,
    `- Monthly income: ${toCurrency(context.dashboardSummary.monthly_income)}`,
    `- Monthly expenses: ${toCurrency(context.dashboardSummary.monthly_expenses)}`,
    `- Monthly savings: ${toCurrency(context.dashboardSummary.monthly_savings)}`,
    `- Current report income: ${toCurrency(context.reportSummary.totalIncome)}`,
    `- Current report expense: ${toCurrency(context.reportSummary.totalExpense)}`,
    `- Current report savings: ${toCurrency(context.reportSummary.savings)}`,
    `- Saving ratio: ${Number(context.reportSummary.savingRatio || 0).toFixed(1)}%`,
    `- Budget categories: ${Number(context.budgetSnapshot.total_budgets || 0)}`,
    `- Overspent categories: ${Number(context.budgetSnapshot.overspent_categories_count || 0)}`,
    topCategory
      ? `- Top spending category: ${topCategory.name} with ${toCurrency(topCategory.amount)} across ${topCategory.count} transactions`
      : "- Top spending category: not available",
    "- Recent transactions:",
    recentTransactionsText,
  ].join("\n");
}

function buildFallbackAnswer(question, context) {
  const normalizedQuestion = String(question || "").toLowerCase();
  const topCategory = context.topSpending[0];
  const overspentCount = Number(context.budgetSnapshot.overspent_categories_count || 0);
  const monthlyIncome = Number(context.dashboardSummary.monthly_income || 0);
  const monthlyExpenses = Number(context.dashboardSummary.monthly_expenses || 0);
  const monthlySavings = Number(context.dashboardSummary.monthly_savings || 0);

  if (normalizedQuestion.includes("budget") || normalizedQuestion.includes("ngân sách")) {
    if (overspentCount > 0) {
      return `You currently have ${overspentCount} overspent budget categories. Open Budgets first and review the categories that exceeded their limit before creating any new spending plan.`;
    }

    if (topCategory) {
      return `Your budget focus should start with ${topCategory.name}. It is currently your largest expense category at ${toCurrency(topCategory.amount)}.`;
    }

    return "You do not have enough budget pressure yet to highlight a risky category. Add more transactions or budgets and ask again.";
  }

  if (
    normalizedQuestion.includes("save") ||
    normalizedQuestion.includes("saving") ||
    normalizedQuestion.includes("tiết kiệm")
  ) {
    if (monthlyIncome <= 0) {
      return "I cannot estimate savings quality yet because there is no monthly income recorded.";
    }

    const ratio = (monthlySavings / monthlyIncome) * 100;
    return `Your current monthly savings are ${toCurrency(monthlySavings)}, which is about ${Math.abs(ratio).toFixed(1)}% of income. ${
      ratio < 10
        ? "That is a thin buffer, so reducing one recurring expense category would help."
        : "That is a solid base you can preserve by watching your highest expense category."
    }`;
  }

  if (
    normalizedQuestion.includes("spend") ||
    normalizedQuestion.includes("expense") ||
    normalizedQuestion.includes("chi tiêu")
  ) {
    if (topCategory) {
      return `Your spending is currently led by ${topCategory.name} at ${toCurrency(topCategory.amount)}. Monthly expenses are ${toCurrency(monthlyExpenses)} against income of ${toCurrency(monthlyIncome)}.`;
    }

    return `Your monthly expenses are ${toCurrency(monthlyExpenses)} and monthly income is ${toCurrency(monthlyIncome)}. I need more category history to say which area is driving most of the spending.`;
  }

  if (monthlySavings < 0) {
    return `Right now your monthly flow is negative: income is ${toCurrency(monthlyIncome)} while expenses are ${toCurrency(monthlyExpenses)}. I would review recent expenses first, then tighten the largest category.`;
  }

  if (topCategory) {
    return `Your finances look relatively stable right now. The next best optimization target is ${topCategory.name}, because it is your heaviest spending category at ${toCurrency(topCategory.amount)}.`;
  }

  return `Your current monthly income is ${toCurrency(monthlyIncome)}, expenses are ${toCurrency(monthlyExpenses)}, and savings are ${toCurrency(monthlySavings)}. Ask me about budgets, savings, or spending categories for a more targeted answer.`;
}

function getActiveProvider() {
  const preferredProvider = String(env.ai.provider || "gemini").toLowerCase();

  if (preferredProvider === "openai" && env.openai.apiKey) {
    return "openai";
  }

  if (preferredProvider === "gemini" && env.gemini.apiKey) {
    return "gemini";
  }

  if (env.gemini.apiKey) {
    return "gemini";
  }

  if (env.openai.apiKey) {
    return "openai";
  }

  return null;
}

function getProviderLabel(provider) {
  if (provider === "gemini") {
    return "Gemini";
  }

  if (provider === "openai") {
    return "OpenAI";
  }

  return "AI";
}

function formatProviderFallbackReason(provider, error) {
  const rawMessage = String(
    error?.message || `${getProviderLabel(provider)} request failed`
  );
  const normalizedMessage = rawMessage.toLowerCase();

  if (
    normalizedMessage.includes("insufficient_quota") ||
    normalizedMessage.includes("exceeded your current quota")
  ) {
    return "Your OpenAI API account has no available quota or billing credit right now.";
  }

  if (normalizedMessage.includes("api key not valid")) {
    return "The GEMINI_API_KEY is invalid.";
  }

  if (normalizedMessage.includes("invalid api key")) {
    return "The OPENAI_API_KEY is invalid.";
  }

  if (normalizedMessage.includes("permission_denied")) {
    return `${getProviderLabel(provider)} rejected this request. Check API key permissions and project setup.`;
  }

  if (normalizedMessage.includes("resource_exhausted")) {
    return `${getProviderLabel(provider)} free-tier quota is exhausted right now.`;
  }

  if (normalizedMessage.includes("model") && normalizedMessage.includes("not found")) {
    const modelName = provider === "gemini" ? env.gemini.model : env.openai.model;
    return `The configured model "${modelName}" is not available for this ${getProviderLabel(provider)} account.`;
  }

  return rawMessage;
}

function createSystemInstruction() {
  return "You are a strong consumer finance assistant inside a personal finance app. Answer like a helpful ChatGPT-style assistant: natural, specific, practical, and easy to act on. Use only the user's financial context. Never invent transactions, balances, or categories. If data is missing, say so clearly. Prefer short paragraphs plus 2-4 action bullets when useful. Give prioritized recommendations, not generic advice.";
}

async function generateGeminiAnswer(messages, contextSummary) {
  const apiUrl = `${env.gemini.baseUrl.replace(/\/$/, "")}/models/${env.gemini.model}:generateContent`;
  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.gemini.apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: `${createSystemInstruction()}\n\n${contextSummary}`,
          },
        ],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(
      result.error?.message || "Gemini request failed"
    );
    error.statusCode = response.status;
    throw error;
  }

  const text = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return text || "";
}

async function generateOpenAiAnswer(messages, contextSummary) {
  const apiUrl = `${env.openai.baseUrl.replace(/\/$/, "")}/responses`;
  const input = [
    {
      role: "system",
      content: createSystemInstruction(),
    },
    {
      role: "system",
      content: contextSummary,
    },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: env.openai.model,
      input,
      temperature: 0.7,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.error?.message || "OpenAI request failed");
    error.statusCode = response.status;
    throw error;
  }

  return result.output_text?.trim() || "";
}

async function generateProviderAnswer(provider, messages, contextSummary) {
  if (provider === "gemini") {
    return generateGeminiAnswer(messages, contextSummary);
  }

  return generateOpenAiAnswer(messages, contextSummary);
}

async function getAiContext(userId) {
  const [dashboardSummary, recentTransactions, budgetSnapshot, reportSummary, topSpending] =
    await Promise.all([
      dashboardService.getSummary(userId),
      dashboardService.getRecentTransactions(userId),
      dashboardService.getBudgetSnapshot(userId),
      reportsService.getSummary(userId, { range: "month" }),
      reportsService.getTopSpending(userId, { range: "month" }),
    ]);

  return {
    dashboardSummary,
    recentTransactions,
    budgetSnapshot,
    reportSummary,
    topSpending,
  };
}

async function chat(userId, payload) {
  const messages = Array.isArray(payload?.messages) ? payload.messages.slice(-10) : [];
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!latestUserMessage) {
    const error = new Error("A user message is required");
    error.statusCode = 400;
    throw error;
  }

  const context = await getAiContext(userId);
  const contextSummary = summarizeContext(context);
  const provider = getActiveProvider();

  let answer = "";
  let source = "fallback";
  let configured = Boolean(provider);
  let fallbackReason = "";

  if (provider) {
    try {
      answer = await generateProviderAnswer(provider, messages, contextSummary);
      source = provider;
    } catch (error) {
      answer = buildFallbackAnswer(latestUserMessage.content, context);
      source = "fallback";
      fallbackReason = formatProviderFallbackReason(provider, error);
    }
  } else {
    answer = buildFallbackAnswer(latestUserMessage.content, context);
    fallbackReason = "No AI provider key is configured.";
  }

  return {
    message: answer,
    source,
    configured,
    fallbackReason,
    provider: provider || env.ai.provider || "gemini",
    providerLabel: getProviderLabel(provider || env.ai.provider || "gemini"),
  };
}

module.exports = {
  chat,
};
