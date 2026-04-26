import { request } from "./apiClient";

export function getCategories(type) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  return request(`/categories${query}`);
}

export function getTransactions(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === false) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return request(`/transactions${query ? `?${query}` : ""}`);
}

export function getTransactionById(transactionId) {
  return request(`/transactions/${transactionId}`);
}

export function createTransaction(payload) {
  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function parseTransactionReceipt(payload) {
  return request("/transactions/parse-receipt", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function parseTransactionQuickEntry(payload) {
  return request("/transactions/parse-entry", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTransaction(transactionId, payload) {
  return request(`/transactions/${transactionId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTransaction(transactionId) {
  return request(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
}
