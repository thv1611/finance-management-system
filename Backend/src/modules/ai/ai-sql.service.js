const env = require("../../config/env");

function buildServiceUnavailableError(message) {
  const error = new Error(message);
  error.statusCode = 503;
  return error;
}

async function askSqlAgent({ userId, question }) {
  if (!env.aiSql.enabled) {
    throw buildServiceUnavailableError(
      "AI SQL agent is disabled. Enable AI_SQL_AGENT_ENABLED and configure the microservice first."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.aiSql.timeoutMs);

  try {
    const response = await fetch(`${env.aiSql.serviceUrl.replace(/\/$/, "")}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ai-sql-secret": env.aiSql.sharedSecret,
      },
      body: JSON.stringify({
        userId,
        question,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        payload?.message || payload?.detail || "AI SQL agent request failed"
      );
      error.statusCode = response.status;
      throw error;
    }

    return {
      question: payload.question || question,
      answer: payload.answer || "",
      sql: payload.sql || null,
      data: Array.isArray(payload.data) ? payload.data : [],
      meta: payload.meta || null,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw buildServiceUnavailableError(
        "AI SQL agent timed out while analyzing your finance data."
      );
    }

    if (error.statusCode) {
      throw error;
    }

    throw buildServiceUnavailableError(
      "AI SQL agent is unavailable right now. Please try again shortly."
    );
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  askSqlAgent,
};
