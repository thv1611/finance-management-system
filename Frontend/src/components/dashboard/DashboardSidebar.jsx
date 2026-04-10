import { Link } from "react-router-dom";
import { Icon } from "./DashboardIcons";
import UserAvatar from "./UserAvatar";

const navItems = [
  ["dashboard", "Dashboard", "/dashboard"],
  ["card", "Transactions", "/transactions"],
  ["wallet", "Budgets", "/budgets"],
  ["report", "Reports", "/reports"],
  ["ai", "AI Insights", "/ai-insights"],
  ["settings", "Settings", "/settings"],
];

export default function DashboardSidebar({ user, activeItem = "Dashboard" }) {
  const displayName = user?.name || "User";

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] p-5 lg:block">
      <div className="flex h-full flex-col rounded-lg bg-white/78 px-5 py-7 shadow-[0_24px_70px_rgba(39,71,91,0.08)] ring-1 ring-white/80 backdrop-blur">
        <div className="mb-12 text-[34px] font-black tracking-[-0.08em]">
          <span className="text-[#0aa7a4]">S</span>
          <span className="text-[#2c8dec]">Y</span>
          <span className="text-[#15c38f]">M</span>
        </div>

        <nav className="space-y-2">
          {navItems.map(([icon, label, path]) => {
            const isActive = label === activeItem;

            return (
              <Link
                key={label}
                to={path}
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#e7f7f0] text-[#087e6f]"
                    : "text-[#7a8796] hover:bg-[#f2f6f8] hover:text-[#22313f]"
                }`}
              >
                <Icon
                  name={icon}
                  className={`h-4 w-4 transition ${
                    isActive ? "text-[#11a982]" : "text-[#8a96a4] group-hover:text-[#0f8f83]"
                  }`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg bg-[#f7fafb] p-3 shadow-[inset_0_0_0_1px_rgba(21,42,55,0.04)]">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1e2b35]">{displayName}</p>
              <p className="truncate text-xs text-[#9aa5af]">{user?.email || "Signed in"}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
