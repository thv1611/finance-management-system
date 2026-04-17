import { request } from "./apiClient";

export function register(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyEmailOtp(payload) {
  return request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resendVerificationOtp(payload) {
  return request("/auth/resend-verification-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshAccessToken(payload) {
  return request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout(payload) {
  return request("/auth/logout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function googleAuthenticate(payload) {
  return request("/auth/google", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(payload) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyPasswordResetOtp(payload) {
  return request("/auth/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
