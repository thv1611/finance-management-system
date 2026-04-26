import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../lib/authApi";
import {
  AUTH_INACTIVITY_TIMEOUT_MS,
  AUTH_LAST_ACTIVITY_KEY,
  clearAuthSession,
  getAuthLastActivity,
  getAuthSession,
  markAuthActivity,
} from "../../lib/authSession";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
const ACTIVITY_WRITE_THROTTLE_MS = 15000;

export default function SessionTimeoutManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);
  const isLoggingOutRef = useRef(false);
  const lastWriteRef = useRef(0);

  useEffect(() => {
    async function logoutForInactivity() {
      if (isLoggingOutRef.current) {
        return;
      }

      isLoggingOutRef.current = true;
      const { refreshToken, isAuthenticated } = getAuthSession();

      if (!isAuthenticated) {
        isLoggingOutRef.current = false;
        return;
      }

      if (refreshToken) {
        try {
          await logout({ refresh_token: refreshToken });
        } catch {
          // Keep auto-logout resilient even if token revocation fails.
        }
      }

      clearAuthSession();
      navigate("/login", {
        replace: true,
        state: {
          sessionExpired: true,
          from: `${location.pathname}${location.search}${location.hash}`,
        },
      });
      isLoggingOutRef.current = false;
    }

    function clearExistingTimeout() {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    function scheduleTimeout() {
      clearExistingTimeout();
      const { isAuthenticated } = getAuthSession();

      if (!isAuthenticated) {
        return;
      }

      const lastActivity = getAuthLastActivity() || Date.now();
      const remainingTime = AUTH_INACTIVITY_TIMEOUT_MS - (Date.now() - lastActivity);

      if (remainingTime <= 0) {
        logoutForInactivity();
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        logoutForInactivity();
      }, remainingTime);
    }

    function handleActivity() {
      const { isAuthenticated } = getAuthSession();

      if (!isAuthenticated) {
        return;
      }

      const now = Date.now();
      if (now - lastWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) {
        return;
      }

      lastWriteRef.current = now;
      markAuthActivity(now);
      scheduleTimeout();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        handleActivity();
        return;
      }

      scheduleTimeout();
    }

    function handleWindowFocus() {
      handleActivity();
    }

    function handleStorage(event) {
      if (event.key === AUTH_LAST_ACTIVITY_KEY) {
        scheduleTimeout();
        return;
      }

      if (event.key === "access_token" && !event.newValue) {
        clearExistingTimeout();
        navigate("/login", { replace: true });
      }
    }

    const { isAuthenticated } = getAuthSession();
    if (isAuthenticated && !getAuthLastActivity()) {
      markAuthActivity();
    }

    scheduleTimeout();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearExistingTimeout();
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
}
