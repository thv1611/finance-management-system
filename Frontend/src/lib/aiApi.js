import { request } from "./apiClient";

export function chatWithAi(messages) {
  return request("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}

export function askFinancialQuestion(question) {
  return request("/ai/ask", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}
