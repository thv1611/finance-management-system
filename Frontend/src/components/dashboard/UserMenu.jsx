import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../../lib/authSession";
import { logout } from "../../lib/authApi";
import UserAvatar from "./UserAvatar";

export default function UserMenu({ user, size = "sm", showUserSummary = false }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const displayName = user?.name || "User";
  const email = user?.email || "No email available";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeAndNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    const { refreshToken } = getAuthSession();

    if (refreshToken) {
      try {
        await logout({ refresh_token: refreshToken });
      } catch {
        // Keep client logout resilient even if the revoke request fails.
      }
    }

    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex items-center gap-3 rounded-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8fd8cd] ${
          showUserSummary ? "bg-[#f7fafb] px-3 py-2" : ""
        }`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {showUserSummary && (
          <span className="hidden text-right sm:block">
            <span className="block text-sm font-black text-[#25313b]">{displayName}</span>
            <span className="block text-xs font-semibold text-[#9aa6b2]">Signed in</span>
          </span>
        )}
        <UserAvatar user={user} size={size} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-72 rounded-lg bg-white p-3 shadow-[0_24px_60px_rgba(35,66,85,0.16)] ring-1 ring-[#edf2f5]"
        >
          <div className="flex items-center gap-3 border-b border-[#edf2f5] px-2 pb-3">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#25313b]">{displayName}</p>
              <p className="truncate text-xs font-semibold text-[#8d99a5]">{email}</p>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => closeAndNavigate("/profile")}
              className="w-full rounded-lg px-3 py-3 text-left text-sm font-black text-[#52616d] transition hover:bg-[#e7f7f0] hover:text-[#087e6f]"
            >
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-3 text-left text-sm font-black text-[#dd4d58] transition hover:bg-[#fff0f1] hover:text-[#b72f3a]"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
