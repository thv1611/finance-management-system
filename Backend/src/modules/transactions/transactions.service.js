const categoriesRepository = require("../categories/categories.repository");
const transactionsRepository = require("./transactions.repository");
const {
  deleteStoredReceipt,
  storeReceiptFromDataUrl,
  parseReceiptDataUrl,
} = require("../../utils/receipt");
const env = require("../../config/env");

const RECEIPT_CATEGORY_SYNONYMS = {
  expense: {
    food: ["food", "restaurant", "cafe", "coffee", "drink", "beverage", "meal", "dining", "grocery"],
    transport: ["transport", "taxi", "grab", "fuel", "gas", "petrol", "bus", "train", "parking"],
    shopping: ["shopping", "store", "mart", "retail", "market", "mall"],
    bills: ["bill", "utility", "electric", "water", "internet", "phone", "rent"],
    entertainment: ["entertainment", "movie", "cinema", "game", "music", "streaming"],
  },
  income: {
    salary: ["salary", "payroll", "wage", "monthly pay"],
    bonus: ["bonus", "reward", "incentive"],
    freelance: ["freelance", "project", "contract", "client payment"],
  },
};

function formatReceiptUrl(receiptUrl) {
  if (!receiptUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(receiptUrl)) {
    return receiptUrl;
  }

  return `${env.app.baseUrl.replace(/\/$/, "")}${receiptUrl}`;
}

function mapTransactionResponse(transaction) {
  if (!transaction) {
    return transaction;
  }

  return {
    ...transaction,
    receipt_url: formatReceiptUrl(transaction.receipt_url),
  };
}

function normalizeTransactionDate(value) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error("Transaction date must be a valid date");
    error.statusCode = 400;
    throw error;
  }

  return value;
}

function parseCategoryIds(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function normalizeListOptions(query = {}) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const pageSize = Number(query.pageSize) > 0 ? Number(query.pageSize) : 15;
  const validType = ["income", "expense"].includes(query.type) ? query.type : null;
  const validDatePreset = [
    "today",
    "thisWeek",
    "last30Days",
    "thisMonth",
    "lastMonth",
    "customRange",
  ].includes(query.datePreset)
    ? query.datePreset
    : null;

  return {
    page,
    pageSize,
    search: query.search ? String(query.search).trim() : "",
    type: validType,
    datePreset: validDatePreset,
    startDate:
      (validDatePreset === "customRange" || query.startDate) && query.startDate
        ? normalizeTransactionDate(query.startDate)
        : null,
    endDate:
      (validDatePreset === "customRange" || query.endDate) && query.endDate
        ? normalizeTransactionDate(query.endDate)
        : null,
    categoryIds: parseCategoryIds(query.categories),
  };
}

async function validateTransactionPayload(userId, payload) {
  const {
    category_id: categoryId,
    type,
    amount,
    title,
    description,
    receipt_data: receiptData,
    remove_receipt: removeReceipt,
    transaction_date: transactionDate,
  } = payload;

  const category = await categoriesRepository.findCategoryForUser(categoryId, userId);

  if (!category) {
    const error = new Error("Selected category does not exist");
    error.statusCode = 404;
    throw error;
  }

  if (category.type !== type) {
    const error = new Error("Selected category does not match the transaction type");
    error.statusCode = 400;
    throw error;
  }

  return {
    categoryId,
    type,
    amount,
    title: title.trim(),
    description: description?.trim() || null,
    receiptData: receiptData || null,
    removeReceipt: Boolean(removeReceipt),
    transactionDate: normalizeTransactionDate(transactionDate),
  };
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getReceiptScanProvider() {
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
  if (provider === "openai") {
    return "OpenAI";
  }

  if (provider === "gemini") {
    return "Gemini";
  }

  return "AI";
}

function extractJsonObject(text) {
  const rawText = String(text || "").trim();
  if (!rawText) {
    return null;
  }

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]+?)```/i);
  const candidate = fencedMatch?.[1] || rawText;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

function normalizeAmount(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const digits = String(value || "")
    .replace(/[^\d.,-]/g, "")
    .replace(/,(?=\d{3}\b)/g, "")
    .replace(/[.](?=\d{3}\b)/g, "")
    .replace(/,/g, ".");
  const parsedValue = Number(digits);
  return Number.isFinite(parsedValue) ? Math.max(parsedValue, 0) : 0;
}

function formatDateOnly(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function inferDateFromText(referenceText) {
  const normalizedText = normalizeText(referenceText);
  const now = new Date();

  if (!normalizedText) {
    return null;
  }

  if (
    normalizedText.includes("hom nay") ||
    normalizedText.includes("today") ||
    normalizedText.includes("thang nay") ||
    normalizedText.includes("this month") ||
    normalizedText.includes("tuan nay") ||
    normalizedText.includes("this week")
  ) {
    return formatDateOnly(now);
  }

  if (normalizedText.includes("hom qua") || normalizedText.includes("yesterday")) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateOnly(yesterday);
  }

  if (normalizedText.includes("ngay mai") || normalizedText.includes("tomorrow")) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateOnly(tomorrow);
  }

  if (normalizedText.includes("tuan truoc") || normalizedText.includes("last week")) {
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    return formatDateOnly(lastWeek);
  }

  if (normalizedText.includes("thang truoc") || normalizedText.includes("last month")) {
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return formatDateOnly(lastMonth);
  }

  const absoluteDateMatch = normalizedText.match(/\b(\d{1,2})[\/ -](\d{1,2})(?:[\/ -](\d{2,4}))?\b/);
  if (absoluteDateMatch) {
    const [, day, month, year] = absoluteDateMatch;
    const normalizedYear = year ? (year.length === 2 ? `20${year}` : year) : String(now.getFullYear());
    return `${normalizedYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

function normalizeReceiptDate(value, referenceText = "") {
  const rawValue = String(value || "").trim();
  const inferredDate = inferDateFromText(referenceText);

  if (!rawValue) {
    return inferredDate || formatDateOnly(new Date());
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    const year = Number(rawValue.slice(0, 4));
    const currentYear = new Date().getFullYear();

    if (Math.abs(year - currentYear) > 1 && inferredDate) {
      return inferredDate;
    }

    return rawValue;
  }

  const slashMatch = rawValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    const paddedYear = year.length === 2 ? `20${year}` : year;
    const normalizedDate = `${paddedYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const normalizedYear = Number(paddedYear);
    const currentYear = new Date().getFullYear();

    if (Math.abs(normalizedYear - currentYear) > 1 && inferredDate) {
      return inferredDate;
    }

    return normalizedDate;
  }

  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return inferredDate || formatDateOnly(new Date());
  }

  const currentYear = new Date().getFullYear();
  if (Math.abs(parsedDate.getFullYear() - currentYear) > 1 && inferredDate) {
    return inferredDate;
  }

  return formatDateOnly(parsedDate);
}

function normalizeReceiptType(value) {
  return String(value || "").toLowerCase() === "income" ? "income" : "expense";
}

function buildReceiptPrompt(categories) {
  const categoryNames = categories.map((category) => `${category.name} (${category.type})`).join(", ");

  return [
    "You are analyzing a receipt image for a personal finance app.",
    "Extract the transaction into a strict JSON object only. Do not include markdown or explanation.",
    "Use the grand total or final payable amount as `amount`.",
    "If the image looks like a purchase receipt, set `type` to `expense`.",
    "Only choose `suggested_category` from this list when possible:",
    categoryNames,
    "If no category is a good fit, leave `suggested_category` empty.",
    "Return exactly this JSON shape:",
    "{",
    '  "merchant": "string",',
    '  "title": "string",',
    '  "description": "string",',
    '  "amount": 0,',
    '  "transaction_date": "YYYY-MM-DD",',
    '  "type": "expense",',
    '  "suggested_category": "string",',
    '  "confidence": 0,',
    '  "notes": "string"',
    "}",
    "Rules:",
    "- `title` should be short and user-friendly.",
    "- `description` can mention notable receipt details or line items.",
    "- `confidence` must be between 0 and 1.",
    "- If the date is unclear, use an empty string.",
    "- If the amount is unclear, use 0.",
  ].join("\n");
}

function buildQuickEntryPrompt(categories, entryText) {
  const categoryNames = categories.map((category) => `${category.name} (${category.type})`).join(", ");

  return [
    "You are converting a natural language finance note into a transaction draft.",
    "Return strict JSON only, with no markdown or explanation.",
    `User note: ${entryText}`,
    "Available categories:",
    categoryNames,
    "Infer the most likely amount, title, transaction type, date, and category.",
    "If the note sounds like spending, use `expense`. If it sounds like money received, use `income`.",
    "If the date is not explicit, use today's date.",
    "Return exactly this JSON shape:",
    "{",
    '  "merchant": "string",',
    '  "title": "string",',
    '  "description": "string",',
    '  "amount": 0,',
    '  "transaction_date": "YYYY-MM-DD",',
    '  "type": "expense",',
    '  "suggested_category": "string",',
    '  "confidence": 0,',
    '  "notes": "string"',
    "}",
  ].join("\n");
}

async function scanReceiptWithGemini(dataUrl, prompt) {
  const { mimeType, base64Data } = parseReceiptDataUrl(dataUrl);
  const apiUrl = `${env.gemini.baseUrl.replace(/\/$/, "")}/models/${env.gemini.model}:generateContent`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.gemini.apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.error?.message || "Gemini receipt scan failed");
    error.statusCode = response.status;
    throw error;
  }

  return result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
}

async function scanReceiptWithOpenAi(dataUrl, prompt) {
  const apiUrl = `${env.openai.baseUrl.replace(/\/$/, "")}/responses`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: env.openai.model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "high",
            },
          ],
        },
      ],
      temperature: 0.1,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.error?.message || "OpenAI receipt scan failed");
    error.statusCode = response.status;
    throw error;
  }

  return result.output_text?.trim() || "";
}

async function generateReceiptDraft(provider, dataUrl, prompt) {
  if (provider === "openai") {
    return scanReceiptWithOpenAi(dataUrl, prompt);
  }

  return scanReceiptWithGemini(dataUrl, prompt);
}

async function generateQuickEntryDraft(provider, prompt) {
  if (provider === "openai") {
    const apiUrl = `${env.openai.baseUrl.replace(/\/$/, "")}/responses`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: env.openai.model,
        input: prompt,
        temperature: 0.1,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      const error = new Error(result.error?.message || "OpenAI quick entry parse failed");
      error.statusCode = response.status;
      throw error;
    }

    return result.output_text?.trim() || "";
  }

  const apiUrl = `${env.gemini.baseUrl.replace(/\/$/, "")}/models/${env.gemini.model}:generateContent`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.gemini.apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.error?.message || "Gemini quick entry parse failed");
    error.statusCode = response.status;
    throw error;
  }

  return result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
}

function findBestCategoryMatch(categories, draft) {
  const normalizedSuggestedCategory = normalizeText(draft.suggested_category);
  const normalizedTitle = normalizeText(draft.title);
  const normalizedMerchant = normalizeText(draft.merchant);
  const normalizedDescription = normalizeText(draft.description);
  const targetType = normalizeReceiptType(draft.type);

  let bestMatch = null;

  for (const category of categories) {
    if (category.type !== targetType) {
      continue;
    }

    const normalizedCategoryName = normalizeText(category.name);
    let score = 0;

    if (normalizedSuggestedCategory && normalizedCategoryName === normalizedSuggestedCategory) {
      score += 120;
    } else if (
      normalizedSuggestedCategory &&
      (normalizedSuggestedCategory.includes(normalizedCategoryName) ||
        normalizedCategoryName.includes(normalizedSuggestedCategory))
    ) {
      score += 80;
    }

    const haystack = `${normalizedTitle} ${normalizedMerchant} ${normalizedDescription}`.trim();
    if (haystack && normalizedCategoryName && haystack.includes(normalizedCategoryName)) {
      score += 40;
    }

    const synonymKey = normalizedCategoryName;
    const synonyms = RECEIPT_CATEGORY_SYNONYMS[targetType]?.[synonymKey] || [];
    for (const synonym of synonyms) {
      if (haystack.includes(synonym) || normalizedSuggestedCategory.includes(synonym)) {
        score += 18;
      }
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { category, score };
    }
  }

  return bestMatch?.score > 0 ? bestMatch.category : null;
}

function findHistoryBasedCategoryMatch(historyItems, draft) {
  const targetType = normalizeReceiptType(draft.type);
  const haystack = normalizeText(
    `${draft.title || ""} ${draft.merchant || ""} ${draft.description || ""}`
  );

  if (!haystack) {
    return null;
  }

  let bestMatch = null;

  for (const item of historyItems) {
    if (item.type !== targetType || !item.category_id) {
      continue;
    }

    const title = normalizeText(item.title);
    const description = normalizeText(item.description);
    let score = 0;

    if (title && haystack.includes(title)) {
      score += 100;
    } else if (title) {
      const titleTokens = title.split(" ").filter((token) => token.length >= 3);
      score += titleTokens.filter((token) => haystack.includes(token)).length * 14;
    }

    if (description) {
      const descriptionTokens = description.split(" ").filter((token) => token.length >= 4);
      score += descriptionTokens.filter((token) => haystack.includes(token)).length * 8;
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        categoryId: item.category_id,
        categoryName: item.category_name,
        score,
      };
    }
  }

  return bestMatch?.score > 0 ? bestMatch : null;
}

function buildReceiptDraftResponse(parsedDraft, matchedCategory, provider, referenceText = "") {
  const amount = normalizeAmount(parsedDraft.amount);
  const type = normalizeReceiptType(parsedDraft.type);
  const merchant = String(parsedDraft.merchant || "").trim();
  const title = String(parsedDraft.title || "").trim() || merchant || (type === "income" ? "Income entry" : "Receipt purchase");
  const description = String(parsedDraft.description || "").trim();

  return {
    draft: {
      type,
      amount,
      title,
      description,
      transaction_date: normalizeReceiptDate(parsedDraft.transaction_date, referenceText),
      category_id: matchedCategory?.id || null,
      category_name: matchedCategory?.name || "",
      merchant,
      suggested_category: String(parsedDraft.suggested_category || "").trim(),
      confidence: Number(parsedDraft.confidence || 0),
      notes: String(parsedDraft.notes || "").trim(),
    },
    meta: {
      provider,
      providerLabel: getProviderLabel(provider),
      matchedCategory: matchedCategory
        ? {
            id: matchedCategory.id,
            name: matchedCategory.name,
            type: matchedCategory.type,
          }
        : null,
    },
  };
}

async function parseReceiptDraft(userId, payload) {
  const receiptData = String(payload?.receipt_data || "").trim();

  if (!receiptData) {
    const error = new Error("Receipt image is required");
    error.statusCode = 400;
    throw error;
  }

  // Validate receipt format and size before sending it to a provider.
  parseReceiptDataUrl(receiptData);

  const provider = getReceiptScanProvider();

  if (!provider) {
    const error = new Error("Receipt scanning requires a configured AI provider.");
    error.statusCode = 503;
    throw error;
  }

  const categories = await categoriesRepository.getCategoriesByUser(userId);
  const prompt = buildReceiptPrompt(categories);
  const rawAnswer = await generateReceiptDraft(provider, receiptData, prompt);
  const parsedDraft = extractJsonObject(rawAnswer);

  if (!parsedDraft) {
    const error = new Error("The receipt was scanned, but the AI response could not be parsed.");
    error.statusCode = 502;
    throw error;
  }

  const historyItems = await transactionsRepository.getRecentTransactionsForSuggestions(
    userId,
    normalizeReceiptType(parsedDraft.type)
  );
  const historyMatch = findHistoryBasedCategoryMatch(historyItems, parsedDraft);
  const aiMatchedCategory = findBestCategoryMatch(categories, parsedDraft);
  const matchedCategory =
    historyMatch
      ? categories.find((category) => category.id === historyMatch.categoryId) || aiMatchedCategory
      : aiMatchedCategory;

  const response = buildReceiptDraftResponse(
    parsedDraft,
    matchedCategory,
    provider,
    `${parsedDraft.merchant || ""} ${parsedDraft.title || ""} ${parsedDraft.description || ""}`
  );
  response.meta = {
    ...response.meta,
    usedHistoryMatch: Boolean(historyMatch),
  };

  return response;
}

async function parseQuickEntryDraft(userId, payload) {
  const entryText = String(payload?.entry_text || "").trim();

  if (!entryText) {
    const error = new Error("Entry text is required");
    error.statusCode = 400;
    throw error;
  }

  const provider = getReceiptScanProvider();
  if (!provider) {
    const error = new Error("Quick entry parsing requires a configured AI provider.");
    error.statusCode = 503;
    throw error;
  }

  const categories = await categoriesRepository.getCategoriesByUser(userId);
  const prompt = buildQuickEntryPrompt(categories, entryText);
  const rawAnswer = await generateQuickEntryDraft(provider, prompt);
  const parsedDraft = extractJsonObject(rawAnswer);

  if (!parsedDraft) {
    const error = new Error("The AI response for this quick entry could not be parsed.");
    error.statusCode = 502;
    throw error;
  }

  const historyItems = await transactionsRepository.getRecentTransactionsForSuggestions(
    userId,
    normalizeReceiptType(parsedDraft.type)
  );
  const historyMatch = findHistoryBasedCategoryMatch(historyItems, parsedDraft);
  const aiMatchedCategory = findBestCategoryMatch(categories, parsedDraft);
  const matchedCategory =
    historyMatch
      ? categories.find((category) => category.id === historyMatch.categoryId) || aiMatchedCategory
      : aiMatchedCategory;
  const response = buildReceiptDraftResponse(
    parsedDraft,
    matchedCategory,
    provider,
    entryText
  );

  response.meta = {
    ...response.meta,
    entryText,
    usedHistoryMatch: Boolean(historyMatch),
  };

  return response;
}

async function createTransaction(userId, payload) {
  const normalizedPayload = await validateTransactionPayload(userId, payload);
  const receiptUrl = normalizedPayload.receiptData
    ? await storeReceiptFromDataUrl(normalizedPayload.receiptData)
    : null;

  const transaction = await transactionsRepository.createTransaction({
    userId,
    ...normalizedPayload,
    receiptUrl,
  });

  return mapTransactionResponse(transaction);
}

async function listTransactions(userId, query) {
  const options = normalizeListOptions(query);

  if (options.datePreset === "customRange" && (!options.startDate || !options.endDate)) {
    options.startDate = null;
    options.endDate = null;
  }

  if (options.startDate && options.endDate && options.startDate > options.endDate) {
    const error = new Error("Start date must be before or equal to end date");
    error.statusCode = 400;
    throw error;
  }

  const [{ rows, totalCount }, summaryRow] = await Promise.all([
    transactionsRepository.getTransactionsByUser(userId, options),
    transactionsRepository.getCurrentMonthSummary(userId),
  ]);

  const summary = {
    income: Number(summaryRow?.income || 0),
    expenses: Number(summaryRow?.expenses || 0),
    net: Number(summaryRow?.income || 0) - Number(summaryRow?.expenses || 0),
  };

  return {
    items: rows.map(mapTransactionResponse),
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      totalCount,
      totalPages: Math.max(Math.ceil(totalCount / options.pageSize), 1),
    },
    summary,
  };
}

async function getTransaction(userId, transactionId) {
  const transaction = await transactionsRepository.findTransactionById(userId, transactionId);

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return mapTransactionResponse(transaction);
}

async function updateTransaction(userId, transactionId, payload) {
  const currentTransaction = await getTransaction(userId, transactionId);
  const normalizedPayload = await validateTransactionPayload(userId, payload);
  let receiptUrl = currentTransaction.receipt_url || null;

  if (normalizedPayload.receiptData) {
    const nextReceiptUrl = await storeReceiptFromDataUrl(normalizedPayload.receiptData);
    await deleteStoredReceipt(currentTransaction.receipt_url);
    receiptUrl = nextReceiptUrl;
  } else if (normalizedPayload.removeReceipt && currentTransaction.receipt_url) {
    await deleteStoredReceipt(currentTransaction.receipt_url);
    receiptUrl = null;
  }

  const updatedTransaction = await transactionsRepository.updateTransaction({
    userId,
    transactionId,
    ...normalizedPayload,
    receiptUrl,
  });

  if (!updatedTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return mapTransactionResponse(updatedTransaction);
}

async function deleteTransaction(userId, transactionId) {
  const deletedTransaction = await transactionsRepository.deleteTransaction(userId, transactionId);

  if (!deletedTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  await deleteStoredReceipt(deletedTransaction.receipt_url);

  return deletedTransaction;
}

module.exports = {
  parseReceiptDraft,
  parseQuickEntryDraft,
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
