import { request } from "./apiClient";

export function getProfile() {
  return request("/profile");
}

export function updateProfile(payload) {
  return request("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload) {
  return request("/profile/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
