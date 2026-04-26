import { clearAuthSession, getAuthSession, persistAuthSession } from "./authSession";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
let refreshPromise = null;

async function parseResponse(response) {
  const rawBody = await response.text();
  let result = {};

  if (rawBody) {
    try {
      result = JSON.parse(rawBody);
    } catch {
      result = {
        message: rawBody,
      };
    }
  }

  return result;
}

async function performRequest(path, options = {}, accessTokenOverride) {
  const { accessToken } = getAuthSession();
  const bearerToken = accessTokenOverride ?? accessToken;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const result = await parseResponse(response);

  return { response, result };
}

async function getRefreshedAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = getAuthSession();

      if (!refreshToken) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });
      const result = await parseResponse(response);

      if (!response.ok) {
        const error = new Error(result.message || "Unable to refresh your session.");
        error.response = result;
        error.status = response.status;
        throw error;
      }

      persistAuthSession(result.data);
      return result.data.access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function request(path, options = {}) {
  try {
    let { response, result } = await performRequest(path, options);

    if (
      response.status === 401 &&
      path !== "/auth/refresh" &&
      result.message === "Invalid or expired access token"
    ) {
      try {
        const nextAccessToken = await getRefreshedAccessToken();
        ({ response, result } = await performRequest(path, options, nextAccessToken));
      } catch (refreshError) {
        clearAuthSession();
        throw refreshError;
      }
    }

    if (!response.ok) {
      const message =
        result.message ||
        result.errors?.[0]?.msg ||
        "Request failed.";
      const error = new Error(message);
      error.response = result;
      error.status = response.status;
      throw error;
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = new Error(
        `Cannot reach the backend at ${API_BASE_URL}. Make sure the backend server is running and then try again.`
      );
      networkError.cause = error;
      throw networkError;
    }

    throw error;
  }
}
