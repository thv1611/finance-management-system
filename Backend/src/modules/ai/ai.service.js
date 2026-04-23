const env = require("../../config/env");
const dashboardService = require("../dashboard/dashboard.service");
const reportsService = require("../reports/reports.service");

const financialBook = require("../../data/financialBook.json");

function formatBookKnowledge(book) {
  const sections = [];

  for (const [, topic] of Object.entries(book.topics || {})) {
    const topicTitle = topic.title || "Unknown Topic";
    const rulesText = (topic.rules || []).map(
      (rule) =>
        `[${rule.id}] ${rule.name} (Nguồn: ${rule.source})\n${rule.content}`
    ).join("\n\n");

    sections.push(`### ${topicTitle}\n${rulesText}`);
  }

  return [
    `== TÀI LIỆU THAM KHẢO: ${book.bookTitle} ==`,
    `Nguồn sách: ${(book.sources || []).join(", ")}`,
    "",
    ...sections,
  ].join("\n");
}

const BOOK_KNOWLEDGE = formatBookKnowledge(financialBook);

function toCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function summarizeContext(context) {
  const topCategory = context.topSpending[0];
  const yearlyTopCategory = context.yearlyTopSpending?.[0];
  const recentTransactionsText = context.recentTransactions.length
    ? context.recentTransactions
        .map(
          (item) =>
            `${item.transaction_date}: ${item.type} ${toCurrency(item.amount)} for ${item.title || item.description || item.category_name || "transaction"}`
        )
        .join("\n")
    : "No recent transactions recorded.";

  const lines = [
    "Financial context for the current user:",
    "",
    "== Current Month ==",
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
      ? `- Top spending category (this month): ${topCategory.name} with ${toCurrency(topCategory.amount)} across ${topCategory.count} transactions`
      : "- Top spending category (this month): not available",
  ];

  if (context.yearlySummary) {
    lines.push(
      "",
      "== Year-to-Date Overview ==",
      `- Year total income: ${toCurrency(context.yearlySummary.totalIncome)}`,
      `- Year total expense: ${toCurrency(context.yearlySummary.totalExpense)}`,
      `- Year savings: ${toCurrency(context.yearlySummary.savings)}`,
      `- Year saving ratio: ${Number(context.yearlySummary.savingRatio || 0).toFixed(1)}%`
    );

    if (yearlyTopCategory) {
      lines.push(
        `- Top spending category (year): ${yearlyTopCategory.name} with ${toCurrency(yearlyTopCategory.amount)} across ${yearlyTopCategory.count} transactions`
      );
    }
  }

  if (context.monthlyBreakdown?.length) {
    lines.push("", "== Monthly Breakdown (recent months) ==");
    for (const month of context.monthlyBreakdown) {
      const label = month.label || "Unknown";
      const income = toCurrency(month.income);
      const expense = toCurrency(month.expense);
      const savings = toCurrency(Number(month.income || 0) - Number(month.expense || 0));
      lines.push(`- ${label}: income ${income}, expense ${expense}, savings ${savings}`);
    }
  }

  lines.push("", "== Recent Transactions ==", recentTransactionsText);

  return lines.join("\n");
}

function findMonthInBreakdown(question, monthlyBreakdown) {
  if (!monthlyBreakdown?.length) {
    return null;
  }

  const monthKeywords = [
    ["jan", "january", "tháng 1", "thang 1"],
    ["feb", "february", "tháng 2", "thang 2"],
    ["mar", "march", "tháng 3", "thang 3"],
    ["apr", "april", "tháng 4", "thang 4"],
    ["may", "tháng 5", "thang 5"],
    ["jun", "june", "tháng 6", "thang 6"],
    ["jul", "july", "tháng 7", "thang 7"],
    ["aug", "august", "tháng 8", "thang 8"],
    ["sep", "september", "tháng 9", "thang 9"],
    ["oct", "october", "tháng 10", "thang 10"],
    ["nov", "november", "tháng 11", "thang 11"],
    ["dec", "december", "tháng 12", "thang 12"],
  ];

  const normalizedQuestion = question.toLowerCase();

  for (let i = 0; i < monthKeywords.length; i++) {
    const keywords = monthKeywords[i];
    const matched = keywords.some((kw) => normalizedQuestion.includes(kw));
    if (!matched) {
      continue;
    }

    const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const targetAbbrev = monthAbbreviations[i];

    return monthlyBreakdown.find((m) => {
      const label = String(m.label || "").trim();
      return label.toLowerCase().startsWith(targetAbbrev.toLowerCase());
    }) || null;
  }

  return null;
}

function buildFallbackAnswer(question, context) {
  const normalizedQuestion = String(question || "").toLowerCase();
  const topCategory = context.topSpending[0];
  const overspentCount = Number(context.budgetSnapshot.overspent_categories_count || 0);
  const monthlyIncome = Number(context.dashboardSummary.monthly_income || 0);
  const monthlyExpenses = Number(context.dashboardSummary.monthly_expenses || 0);
  const monthlySavings = Number(context.dashboardSummary.monthly_savings || 0);

  const matchedMonth = findMonthInBreakdown(normalizedQuestion, context.monthlyBreakdown);
  if (matchedMonth) {
    const mIncome = Number(matchedMonth.income || 0);
    const mExpense = Number(matchedMonth.expense || 0);
    const mSavings = mIncome - mExpense;
    const label = matchedMonth.label || "that month";
    return `In ${label}, your income was ${toCurrency(mIncome)} and expenses were ${toCurrency(mExpense)}, giving you savings of ${toCurrency(mSavings)}. ${
      mSavings < 0
        ? "That was a deficit month — review which categories drove the overspend."
        : mSavings === 0
          ? "You broke even that month."
          : "That was a positive month for your finances."
    }`;
  }

  if (
    normalizedQuestion.includes("last month") ||
    normalizedQuestion.includes("tháng trước") ||
    normalizedQuestion.includes("thang truoc")
  ) {
    if (context.monthlyBreakdown?.length >= 2) {
      const lastMonth = context.monthlyBreakdown[context.monthlyBreakdown.length - 2];
      const mIncome = Number(lastMonth.income || 0);
      const mExpense = Number(lastMonth.expense || 0);
      const mSavings = mIncome - mExpense;
      return `Last month (${lastMonth.label || "previous period"}): income was ${toCurrency(mIncome)}, expenses were ${toCurrency(mExpense)}, savings were ${toCurrency(mSavings)}.`;
    }

    return "I do not have enough historical data to answer about last month yet. Add more transactions across months and try again.";
  }

  if (normalizedQuestion.includes("budget") || normalizedQuestion.includes("ngân sách")) {
    if (overspentCount > 0) {
      return `You currently have ${overspentCount} overspent budget categories. [SAV-01] Theo Quy tắc 50/30/20 (Elizabeth Warren), hãy đảm bảo chi tiêu thiết yếu không vượt 50% thu nhập. Open Budgets to review.`;
    }

    if (topCategory) {
      return `[SPD-01] Theo Rich Dad Poor Dad: hãy tự hỏi "${topCategory.name} đưa tiền vào hay lấy tiền ra khỏi túi mình?". Category này đang dẫn đầu chi tiêu tại ${toCurrency(topCategory.amount)}.`;
    }

    return "Chưa có đủ dữ liệu ngân sách. Hãy thêm giao dịch và ngân sách, sau đó hỏi lại.";
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
    let yearlyContext = "";
    if (context.yearlySummary) {
      const yearSavings = Number(context.yearlySummary.savings || 0);
      yearlyContext = ` Year-to-date savings: ${toCurrency(yearSavings)}.`;
    }
    return `Monthly savings: ${toCurrency(monthlySavings)} (${Math.abs(ratio).toFixed(1)}% of income).${yearlyContext} ${
      ratio < 10
        ? "[SAV-02] Theo The Richest Man in Babylon: hãy trích tối thiểu 10% thu nhập đưa vào tiết kiệm TRƯỚC KHI chi tiêu."
        : "[SAV-01] Theo Quy tắc 50/30/20: tỷ lệ tiết kiệm tốt. Hãy duy trì và tập trung vào hạng mục chi tiêu lớn nhất."
    }`;
  }

  if (
    normalizedQuestion.includes("spend") ||
    normalizedQuestion.includes("expense") ||
    normalizedQuestion.includes("chi tiêu")
  ) {
    if (topCategory) {
      let yearlyContext = "";
      const yearlyTop = context.yearlyTopSpending?.[0];
      if (yearlyTop) {
        yearlyContext = ` Year-to-date, ${yearlyTop.name} leads spending at ${toCurrency(yearlyTop.amount)}.`;
      }
      return `Your spending is currently led by ${topCategory.name} at ${toCurrency(topCategory.amount)}. Monthly expenses are ${toCurrency(monthlyExpenses)} against income of ${toCurrency(monthlyIncome)}.${yearlyContext}`;
    }

    return `Your monthly expenses are ${toCurrency(monthlyExpenses)} and monthly income is ${toCurrency(monthlyIncome)}. I need more category history to say which area is driving most of the spending.`;
  }

  if (monthlySavings < 0) {
    return `Dòng tiền tháng này đang âm: thu nhập ${toCurrency(monthlyIncome)}, chi tiêu ${toCurrency(monthlyExpenses)}. [SAV-03] Theo Rich Dad Poor Dad: bạn cần quỹ khẩn cấp 3-6 tháng chi phí. Hãy cắt giảm chi tiêu không thiết yếu ngay. [SPD-03] Theo The Richest Man in Babylon: ghi chép chi tiêu 30 ngày và cắt khoản lặp lại không cần thiết.`;
  }

  if (topCategory) {
    return `Tài chính đang ổn định. [SPD-02] Theo Quy tắc 24 giờ: trước khi chi tiêu lớn cho ${topCategory.name} (${toCurrency(topCategory.amount)}), hãy đợi 24h suy nghĩ.`;
  }

  return `Thu nhập tháng: ${toCurrency(monthlyIncome)}, chi tiêu: ${toCurrency(monthlyExpenses)}, tiết kiệm: ${toCurrency(monthlySavings)}. [SAV-01] Theo Quy tắc 50/30/20: hãy phân bổ 50% nhu cầu, 30% mong muốn, 20% tiết kiệm. Hỏi cụ thể về ngân sách, tiết kiệm, hoặc chi tiêu để được tư vấn chi tiết hơn.`;
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
  return [
    "BẠN LÀ trợ lý tài chính cá nhân trong ứng dụng quản lý tài chính. Bạn có hai nguồn dữ liệu:",
    "1. DỮ LIỆU TÀI CHÍNH CỦA NGƯỜI DÙNG (số dư, thu nhập, chi tiêu, ngân sách) — dùng để trả lời câu hỏi về số liệu thực tế.",
    "2. KHO DỮ LIỆU SÁCH TÀI CHÍNH (được cung cấp bên dưới) — dùng KHI VÀ CHỈ KHI người dùng xin lời khuyên, hỏi cách quản lý tiền, hoặc hỏi nên làm gì.",
    "",
    "== QUY TẮC BẮT BUỘC ==",
    "- Khi đưa lời khuyên tài chính: TUYỆT ĐỐI CHỈ sử dụng kiến thức có trong Kho Dữ Liệu Sách. KHÔNG được tự bịa thêm hoặc dùng kiến thức bên ngoài.",
    "- Nếu sách không có thông tin liên quan: trả lời 'Tài liệu tham khảo hiện tại chưa có hướng dẫn về vấn đề này.'",
    "- Khi trích dẫn lời khuyên: BẮT BUỘC ghi rõ mã quy tắc và nguồn sách (ví dụ: [SAV-01] theo Quy tắc 50/30/20).",
    "- Khi trả lời câu hỏi về số liệu (số dư, chi tiêu tháng nào, so sánh): dùng dữ liệu tài chính thực tế của người dùng. Không bịa số liệu.",
    "- Nếu dữ liệu tài chính thiếu, nói rõ: 'Chưa có đủ dữ liệu để trả lời.'",
    "",
    "== ĐỊNH DẠNG TRẢ LỜI ==",
    "- Trả lời trực diện, không chào hỏi rườm rà.",
    "- Dùng gạch đầu dòng khi liệt kê.",
    "- Tối đa 100 từ cho mỗi câu trả lời tư vấn.",
    "- Ưu tiên tiếng Việt nếu người dùng hỏi bằng tiếng Việt.",
  ].join("\n");
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
            text: `${createSystemInstruction()}\n\n${BOOK_KNOWLEDGE}\n\n${contextSummary}`,
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
      content: BOOK_KNOWLEDGE,
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
  const [
    dashboardSummary,
    recentTransactions,
    budgetSnapshot,
    reportSummary,
    topSpending,
    yearlySummary,
    yearlyTopSpending,
    monthlyComparison,
  ] = await Promise.all([
    dashboardService.getSummary(userId),
    dashboardService.getRecentTransactions(userId, 15),
    dashboardService.getBudgetSnapshot(userId),
    reportsService.getSummary(userId, { range: "month" }),
    reportsService.getTopSpending(userId, { range: "month" }),
    reportsService.getSummary(userId, { range: "year" }),
    reportsService.getTopSpending(userId, { range: "year" }),
    reportsService.getMonthlyComparison(userId, { range: "year" }),
  ]);

  return {
    dashboardSummary,
    recentTransactions,
    budgetSnapshot,
    reportSummary,
    topSpending,
    yearlySummary,
    yearlyTopSpending,
    monthlyBreakdown: monthlyComparison?.series || [],
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
