import { request } from "./apiClient";
import { getAuthSession } from "./authSession";

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

export async function exportReportsCsv(params = {}) {
  const { accessToken } = getAuthSession();
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/reports/export.csv${buildReportQuery(params)}`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!response.ok) {
    let message = "Unable to export report.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition") || "";
  const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  return {
    blob,
    filename: fileNameMatch?.[1] || "finance-report.csv",
  };
}
