import { request } from "./apiClient";

export function chatWithAi(messages) {
  return request("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}
