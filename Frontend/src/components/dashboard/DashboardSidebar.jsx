import { Link } from "react-router-dom";
import { Icon } from "./DashboardIcons";
import UserAvatar from "./UserAvatar";

const navItems = [
  ["dashboard", "Dashboard", "/dashboard"],
  ["card", "Transactions", "/transactions"],
  ["wallet", "Budgets", "/budgets"],
  ["report", "Reports", "/reports"],
  ["ai", "AI Insights", "/ai-insights"],
  ["settings", "Settings", "/profile"],
];

export default function DashboardSidebar({ user, activeItem = "Dashboard" }) {
  const displayName = user?.name || "User";

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] p-5 lg:block">
      <div className="flex h-full flex-col rounded-[28px] border border-white/70 bg-white/74 px-5 py-7 shadow-[0_28px_80px_rgba(39,71,91,0.09)] ring-1 ring-white/60 backdrop-blur-xl">
        <Link to="/dashboard" className="mb-12 block text-[36px] font-black tracking-[-0.08em] transition-transform hover:scale-105">
          <span className="text-[#0aa7a4]">S</span>
          <span className="text-[#2c8dec]">Y</span>
          <span className="text-[#15c38f]">M</span>
        </Link>

        <nav className="space-y-2">
          {navItems.map(([icon, label, path]) => {
            const isActive = label === activeItem;

            return (
              <Link
                key={label}
                to={path}
                className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-[linear-gradient(135deg,_#e6f8f2,_#f4fbfa)] text-[#087e6f] shadow-[inset_0_0_0_1px_rgba(19,151,127,0.08)]"
                    : "text-[#748391] hover:bg-[#f2f6f8] hover:text-[#22313f]"
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

        <div className="mt-auto rounded-2xl bg-[linear-gradient(180deg,_#f9fbfc,_#f4f8fa)] p-3 shadow-[inset_0_0_0_1px_rgba(21,42,55,0.05)]">
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
