function getStoredName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.full_name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User"
  );
}

function getStoredAvatar(user) {
  return user?.avatar || user?.avatar_url || user?.photoURL || user?.picture || null;
}

function getStoredProvider(user) {
  if (user?.provider) {
    return user.provider;
  }

  if (user?.auth_provider === "google") {
    return "google";
  }

  return "local";
}

export function normalizeAuthUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id ?? null,
    name: getStoredName(user),
    email: user.email || "",
    avatar: getStoredAvatar(user),
    provider: getStoredProvider(user),
  };
}

export function persistAuthSession(authData) {
  if (!authData) {
    return;
  }

  localStorage.setItem("access_token", authData.access_token);
  localStorage.setItem("refresh_token", authData.refresh_token);
  localStorage.setItem("user", JSON.stringify(normalizeAuthUser(authData.user)));
}

export function updateAccessToken(accessToken) {
  if (!accessToken) {
    return;
  }

  localStorage.setItem("access_token", accessToken);
}

export function clearAuthSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("finance_data");
  sessionStorage.clear();
}

export function getAuthSession() {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const userValue = localStorage.getItem("user");

  let user = null;

  if (userValue) {
    try {
      user = normalizeAuthUser(JSON.parse(userValue));
    } catch {
      user = null;
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated: Boolean(accessToken),
  };
}
