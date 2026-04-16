import { request } from "./apiClient";

function buildReportQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === false) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getReportsSummary(params = {}) {
  return request(`/reports/summary${buildReportQuery(params)}`);
}

export function getSpendingByCategory(params = {}) {
  return request(`/reports/spending-by-category${buildReportQuery(params)}`);
}

export function getMonthlyComparisonReport(params = {}) {
  return request(`/reports/monthly-comparison${buildReportQuery(params)}`);
}

export function getTopSpendingReport(params = {}) {
  return request(`/reports/top-spending${buildReportQuery(params)}`);
}
