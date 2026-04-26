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

function stripFormattingArtifacts(text) {
  return String(text || "")
    .replace(/^\s*[*-]\s+/gm, "")
    .replace(/\[(?:[A-Z]{3}|[A-Z]{2,4})-\d+\]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatAdvice(rule, message) {
  if (!rule) {
    return stripFormattingArtifacts(message);
  }

  return stripFormattingArtifacts(`${message} Theo ${rule.name} trong ${rule.source}.`);
}

function toCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function toPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDelta(value) {
  const amount = Number(value || 0);
  if (amount === 0) {
    return "không đổi";
  }

  return `${amount > 0 ? "tăng" : "giảm"} ${toCurrency(Math.abs(amount))}`;
}

function parseTargetAmount(question) {
  const normalizedQuestion = String(question || "")
    .toLowerCase()
    .replace(/[,]/g, ".")
    .replace(/\s+/g, " ");

  const millionMatch = normalizedQuestion.match(/(\d+(?:\.\d+)?)\s*(triệu|trieu)\b/);
  if (millionMatch) {
    return Number(millionMatch[1]) * 1000000;
  }

  const thousandMatch = normalizedQuestion.match(/(\d+(?:\.\d+)?)\s*(nghìn|nghin|k)\b/);
  if (thousandMatch) {
    return Number(thousandMatch[1]) * 1000;
  }

  const plainCurrencyMatch = normalizedQuestion.match(/(\d[\d.]*)\s*(đ|vnd|dong)\b/);
  if (plainCurrencyMatch) {
    return Number(String(plainCurrencyMatch[1]).replace(/[.]/g, ""));
  }

  return null;
}

function computeContextInsights(context) {
  const monthlyBreakdown = context.monthlyBreakdown || [];
  const currentMonth = monthlyBreakdown[monthlyBreakdown.length - 1] || null;
  const previousMonth = monthlyBreakdown[monthlyBreakdown.length - 2] || null;
  const overspentItems = (context.budgetSnapshot?.items || []).filter((item) => item.overspent);
  const warningItems = (context.budgetSnapshot?.items || []).filter(
    (item) => !item.overspent && Number(item.progress || 0) >= 80
  );
  const topCategory = context.topSpending?.[0] || null;
  const topShare = context.spendingByCategory?.[0] || null;

  return {
    currentMonth,
    previousMonth,
    overspentItems,
    warningItems,
    topCategory,
    topShare,
    expenseDelta:
      currentMonth && previousMonth
        ? Number(currentMonth.expense || 0) - Number(previousMonth.expense || 0)
        : null,
    incomeDelta:
      currentMonth && previousMonth
        ? Number(currentMonth.income || 0) - Number(previousMonth.income || 0)
        : null,
  };
}

function summarizeContext(context) {
  const insights = computeContextInsights(context);
  const topCategory = insights.topCategory;
  const yearlyTopCategory = context.yearlyTopSpending?.[0];
  const topShare = insights.topShare;
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
    topShare
      ? `- Largest expense share: ${topShare.name} accounts for ${toPercent(topShare.percent)} of this month's expense`
      : "- Largest expense share: not available",
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

  if (insights.currentMonth && insights.previousMonth) {
    lines.push(
      "",
      "== Trend ==",
      `- Expense vs previous month: ${formatDelta(insights.expenseDelta)}`,
      `- Income vs previous month: ${formatDelta(insights.incomeDelta)}`
    );
  }

  if (insights.overspentItems.length) {
    lines.push("", "== Budget Risks ==");
    for (const item of insights.overspentItems.slice(0, 3)) {
      lines.push(
        `- Overspent: ${item.category_name} spent ${toCurrency(item.spent)} on a budget of ${toCurrency(item.amount_limit)}`
      );
    }
  } else if (insights.warningItems.length) {
    lines.push("", "== Budget Warnings ==");
    for (const item of insights.warningItems.slice(0, 3)) {
      lines.push(
        `- Near limit: ${item.category_name} used ${toPercent(item.progress)} of budget (${toCurrency(item.spent)} / ${toCurrency(item.amount_limit)})`
      );
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
  const insights = computeContextInsights(context);
  const topCategory = insights.topCategory;
  const topShare = insights.topShare;
  const overspentCount = Number(context.budgetSnapshot.overspent_categories_count || 0);
  const monthlyIncome = Number(context.dashboardSummary.monthly_income || 0);
  const monthlyExpenses = Number(context.dashboardSummary.monthly_expenses || 0);
  const monthlySavings = Number(context.dashboardSummary.monthly_savings || 0);
  const targetAmount = parseTargetAmount(normalizedQuestion);
  const savingRules = financialBook.topics?.saving?.rules || [];
  const spendingRules = financialBook.topics?.spending?.rules || [];
  const saving503020Rule = savingRules.find((rule) => rule.id === "SAV-01");
  const payYourselfFirstRule = savingRules.find((rule) => rule.id === "SAV-02");
  const emergencyFundRule = savingRules.find((rule) => rule.id === "SAV-03");
  const assetVsExpenseRule = spendingRules.find((rule) => rule.id === "SPD-01");
  const wait24hRule = spendingRules.find((rule) => rule.id === "SPD-02");
  const smallExpenseRule = spendingRules.find((rule) => rule.id === "SPD-03");

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
    if (insights.overspentItems.length) {
      const firstOverspent = insights.overspentItems[0];
      return formatAdvice(
        saving503020Rule,
        `Hiện bạn có ${overspentCount} danh mục vượt ngân sách. Nặng nhất là ${firstOverspent.category_name}: đã chi ${toCurrency(firstOverspent.spent)} trên mức ${toCurrency(firstOverspent.amount_limit)}.`
      );
    }

    if (insights.warningItems.length) {
      const firstWarning = insights.warningItems[0];
      return formatAdvice(
        wait24hRule,
        `${firstWarning.category_name} đang dùng ${toPercent(firstWarning.progress)} ngân sách. Nếu còn tiếp tục chi ở nhóm này, bạn rất dễ vượt mức trong tháng.`
      );
    }

    if (overspentCount > 0) {
      return formatAdvice(
        saving503020Rule,
        `Hiện bạn có ${overspentCount} danh mục đang vượt ngân sách. Bạn nên kiểm tra lại phần chi tiêu thiết yếu và ưu tiên kéo nhóm này về mức an toàn trước.`
      );
    }

    if (topCategory) {
      return formatAdvice(
        assetVsExpenseRule,
        `${topCategory.name} đang là khoản chi lớn nhất ở mức ${toCurrency(topCategory.amount)}. Trước khi tăng thêm khoản này, hãy tự hỏi nó thực sự giúp ích lâu dài hay chỉ làm tiền đi ra thêm.`
      );
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
    if (targetAmount) {
      const gap = targetAmount - monthlySavings;
      if (gap <= 0) {
        return `Mục tiêu ${toCurrency(targetAmount)} đang trong tầm tay vì tháng này bạn còn lại ${toCurrency(monthlySavings)}. Bạn chỉ cần giữ nhịp chi tiêu hiện tại và tránh tăng thêm ở nhóm ${topCategory?.name || "chi tiêu lớn nhất"}.`;
      }

      const topCategoryHint = topShare
        ? `Nhóm chi lớn nhất hiện là ${topShare.name}, chiếm ${toPercent(topShare.percent)} tổng chi.`
        : "";
      return formatAdvice(
        payYourselfFirstRule,
        `Để chạm mục tiêu ${toCurrency(targetAmount)}, bạn còn thiếu khoảng ${toCurrency(gap)} so với phần còn lại tháng này là ${toCurrency(monthlySavings)}. ${topCategoryHint} Bạn nên chốt trước khoản tiết kiệm mục tiêu rồi siết nhóm chi lớn nhất.`
      );
    }

    let yearlyContext = "";
    if (context.yearlySummary) {
      const yearSavings = Number(context.yearlySummary.savings || 0);
      yearlyContext = ` Year-to-date savings: ${toCurrency(yearSavings)}.`;
    }
    return ratio < 10
      ? formatAdvice(
          payYourselfFirstRule,
          `Tiết kiệm tháng này là ${toCurrency(monthlySavings)}, tương đương ${Math.abs(ratio).toFixed(1)}% thu nhập.${yearlyContext} Bạn nên tách riêng một khoản tiết kiệm ngay khi vừa có thu nhập thay vì chờ cuối tháng còn bao nhiêu mới để dành.`
        )
      : formatAdvice(
          saving503020Rule,
          `Tiết kiệm tháng này là ${toCurrency(monthlySavings)}, tương đương ${Math.abs(ratio).toFixed(1)}% thu nhập.${yearlyContext} Tỷ lệ này đang khá ổn, bạn nên giữ nhịp hiện tại và tiếp tục theo dõi nhóm chi lớn nhất.`
        );
  }

  if (
    normalizedQuestion.includes("spend") ||
    normalizedQuestion.includes("expense") ||
    normalizedQuestion.includes("chi tiêu")
  ) {
    if (insights.currentMonth && insights.previousMonth) {
      return `Chi tiêu tháng này là ${toCurrency(monthlyExpenses)}, ${formatDelta(insights.expenseDelta)} so với ${insights.previousMonth.label}. ${
        topShare
          ? `${topShare.name} đang chiếm tỷ trọng lớn nhất ở mức ${toPercent(topShare.percent)}.`
          : ""
      }`.trim();
    }

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

  if (
    normalizedQuestion.includes("phân tích") ||
    normalizedQuestion.includes("analyze") ||
    normalizedQuestion.includes("nhận xét") ||
    normalizedQuestion.includes("đánh giá")
  ) {
    const trendText = insights.currentMonth && insights.previousMonth
      ? ` So với ${insights.previousMonth.label}, chi tiêu đang ${formatDelta(insights.expenseDelta)} và thu nhập đang ${formatDelta(insights.incomeDelta)}.`
      : "";
    const budgetText = insights.overspentItems.length
      ? ` Bạn đang có ${insights.overspentItems.length} danh mục vượt ngân sách.`
      : insights.warningItems.length
        ? ` Có ${insights.warningItems.length} danh mục đã chạm ngưỡng cảnh báo ngân sách.`
        : "";
    const categoryText = topShare
      ? ` Danh mục kéo chi tiêu mạnh nhất là ${topShare.name}, chiếm ${toPercent(topShare.percent)} tổng chi tháng này.`
      : "";

    return `Tháng này bạn thu ${toCurrency(monthlyIncome)}, chi ${toCurrency(monthlyExpenses)} và còn lại ${toCurrency(monthlySavings)}.${trendText}${budgetText}${categoryText}`.trim();
  }

  if (monthlySavings < 0) {
    return stripFormattingArtifacts(
      `${formatAdvice(
        emergencyFundRule,
        `Dòng tiền tháng này đang âm: thu nhập ${toCurrency(monthlyIncome)}, chi tiêu ${toCurrency(monthlyExpenses)}. Bạn nên ưu tiên kéo chi tiêu xuống và xây lại vùng an toàn tài chính.`
      )} ${formatAdvice(
        smallExpenseRule,
        "Một cách dễ bắt đầu là ghi lại chi tiêu trong 30 ngày và cắt bớt các khoản nhỏ lặp lại nhưng không thực sự cần thiết."
      )}`
    );
  }

  if (topCategory) {
    return formatAdvice(
      wait24hRule,
      `Tài chính hiện tại khá ổn. Với các khoản chi lớn liên quan đến ${topCategory.name} (${toCurrency(topCategory.amount)}), bạn nên tự cho mình một khoảng dừng trước khi quyết định.`
    );
  }

  return formatAdvice(
    saving503020Rule,
    `Thu nhập tháng là ${toCurrency(monthlyIncome)}, chi tiêu là ${toCurrency(monthlyExpenses)}, và phần còn lại là ${toCurrency(monthlySavings)}. Nếu muốn quản lý tiền rõ hơn, bạn có thể chia ngân sách thành nhóm nhu cầu, mong muốn và tiết kiệm để dễ kiểm soát hơn.`
  );
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
    "- Khi nhắc đến lời khuyên từ sách, hãy diễn đạt tự nhiên như một cuộc trò chuyện. Có thể nhắc tên nguyên tắc hoặc nguồn sách, nhưng KHÔNG được lộ mã nội bộ như SAV-01 hay SPD-03.",
    "- Khi trả lời câu hỏi về số liệu (số dư, chi tiêu tháng nào, so sánh): dùng dữ liệu tài chính thực tế của người dùng. Không bịa số liệu.",
    "- Khi có thể, hãy chỉ ra danh mục chi lớn nhất, trạng thái ngân sách, hoặc xu hướng so với tháng trước để câu trả lời có tính cá nhân hóa.",
    "- Nếu người dùng hỏi mục tiêu tiết kiệm cụ thể, hãy so mục tiêu đó với phần tiền còn lại trong tháng và nêu đang thiếu hay dư bao nhiêu.",
    "- Nếu dữ liệu tài chính thiếu, nói rõ: 'Chưa có đủ dữ liệu để trả lời.'",
    "",
    "== ĐỊNH DẠNG TRẢ LỜI ==",
    "- Trả lời trực diện, không chào hỏi rườm rà.",
    "- Ưu tiên 1 đoạn ngắn hoặc 2-3 câu tự nhiên, dễ đọc.",
    "- Không dùng markdown bullet bằng dấu * nếu không thật sự cần.",
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
    spendingByCategory,
    topSpending,
    yearlySummary,
    yearlyTopSpending,
    monthlyComparison,
  ] = await Promise.all([
    dashboardService.getSummary(userId),
    dashboardService.getRecentTransactions(userId, 15),
    dashboardService.getBudgetSnapshot(userId),
    reportsService.getSummary(userId, { range: "month" }),
    reportsService.getSpendingByCategory(userId, { range: "month" }),
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
    spendingByCategory,
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
    message: stripFormattingArtifacts(answer),
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
