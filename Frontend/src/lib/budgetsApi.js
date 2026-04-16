import { request } from "./apiClient";

export function getBudgets(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return request(`/budgets${query ? `?${query}` : ""}`);
}

export function createBudget(payload) {
  return request("/budgets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBudget(budgetId, payload) {
  return request(`/budgets/${budgetId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteBudget(budgetId) {
  return request(`/budgets/${budgetId}`, {
    method: "DELETE",
  });
}
