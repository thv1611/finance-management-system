import { Link } from "react-router-dom";
import { Icon } from "../dashboard/DashboardIcons";
import NotificationMenu from "../common/NotificationMenu";

const defaultNotifications = [
  {
    id: "cashflow-report",
    title: "Export your latest trend report",
    description: "Download a CSV snapshot of your current cash-flow range.",
    to: "/cash-flow-trends",
    icon: "report",
    tone: "positive",
  },
  {
    id: "cashflow-add",
    title: "Add a fresh transaction",
    description: "Recent cash-flow changes show up here after a new income or expense is saved.",
    to: "/transactions/new",
    icon: "receipt",
    tone: "neutral",
  },
];

export default function CashFlowHeader({
  notifications = defaultNotifications,
  unreadCount = 0,
  onOpenNotifications,
  onDismissNotification,
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">
          Cash Flow Trends
        </h1>
        <p className="mt-2 text-base font-semibold text-[#7a8794]">
          Analyze your income, expenses, and balance patterns
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/transactions/new"
          className="rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0e806f]"
        >
          Add Transaction
        </Link>
        <NotificationMenu
          items={notifications}
          unreadCount={unreadCount}
          onOpen={onOpenNotifications}
          onDismiss={onDismissNotification}
        />
      </div>
    </header>
  );
}
