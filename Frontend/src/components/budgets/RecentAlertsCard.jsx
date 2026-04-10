import { Icon } from "../dashboard/DashboardIcons";
import EmptyState from "../common/EmptyState";

export default function RecentAlertsCard({ alerts = [] }) {
  return (
    <section className="rounded-lg bg-[#eef2f5] p-6">
      <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[#7f8d99]">Recent Alerts</h2>
      {alerts.length > 0 ? (
        <div className="mt-5 space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id || alert.title} className="flex items-center gap-4 rounded-lg bg-white px-4 py-4 shadow-[0_12px_28px_rgba(35,66,85,0.045)] transition hover:-translate-y-0.5">
              <Icon name={alert.icon || "alert"} className="h-5 w-5 shrink-0" style={{ color: alert.color || "#dd4d58" }} />
              <div>
                <p className="text-sm font-black text-[#34424d]">{alert.title}</p>
                <p className="mt-1 text-xs font-semibold text-[#9aa6b2]">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState className="mt-5" title="No budget alerts" message="Alerts will appear when budgets approach their limits." />
      )}
    </section>
  );
}
