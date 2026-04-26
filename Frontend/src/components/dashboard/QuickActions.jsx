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
    <section className="rounded-[28px] bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Quick Actions</h2>
      <p className="mt-1 text-sm font-semibold text-[#8e9aa6]">Jump straight into the next thing you want to manage.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {actions.map(([icon, label, to]) => (
          <Link
            key={label}
            to={to}
            className="group flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-[#edf2f5] bg-[linear-gradient(180deg,#f9fbfc_0%,#f2f7f9_100%)] text-sm font-bold text-[#4d5b66] transition hover:-translate-y-1 hover:border-[#cfe8e2] hover:bg-[linear-gradient(180deg,#eefaf6_0%,#e4f5f1_100%)] hover:text-[#0f8e7e] hover:shadow-[0_18px_34px_rgba(20,119,110,0.09)]"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#5f6d79] shadow-[0_10px_24px_rgba(35,66,85,0.06)] transition group-hover:text-[#0f8e7e]">
              <Icon name={icon} className="h-5 w-5" />
            </div>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
