const API_BASE_URL = "http://localhost:5000/api/auth";

async function request(path, options) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });

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

    if (!response.ok) {
      const error = new Error(result.message || "Request failed.");
      error.response = result;
      error.status = response.status;
      throw error;
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = new Error(
        "Cannot reach the backend at http://localhost:5000. Make sure the backend server is running and then try again."
      );
      networkError.cause = error;
      throw networkError;
    }

    throw error;
  }
}

export function register(payload) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyEmailOtp(payload) {
  return request("/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resendVerificationOtp(payload) {
  return request("/resend-verification-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function googleAuthenticate(payload) {
  return request("/google", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(payload) {
  return request("/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyPasswordResetOtp(payload) {
  return request("/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload) {
  return request("/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
