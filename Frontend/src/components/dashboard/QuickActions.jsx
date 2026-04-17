import { Link } from "react-router-dom";
import { Icon } from "./DashboardIcons";

const actions = [
  ["send", "Add Transaction", "/transactions/new"],
  ["file", "Reports", "/reports"],
  ["history", "History", "/transactions"],
  ["support", "Profile", "/profile"],
];

export default function QuickActions() {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Quick Actions</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {actions.map(([icon, label, to]) => (
          <Link
            key={label}
            to={to}
            className="flex h-20 flex-col items-center justify-center gap-2 rounded-lg bg-[#f3f7f9] text-sm font-bold text-[#4d5b66] transition hover:-translate-y-0.5 hover:bg-[#e8f4f1] hover:text-[#0f8e7e]"
          >
            <Icon name={icon} className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
