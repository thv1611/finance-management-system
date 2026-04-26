import { Link } from "react-router-dom";
import { Icon } from "../dashboard/DashboardIcons";
import NotificationMenu from "../common/NotificationMenu";
import UserMenu from "../dashboard/UserMenu";

const defaultNotifications = [
  {
    id: "reports-review",
    title: "Review updated spending insights",
    description: "Your latest transactions are ready to be explored in reports.",
    to: "/reports",
    icon: "report",
    tone: "positive",
  },
  {
    id: "reports-profile",
    title: "Keep your profile current",
    description: "Update your avatar and account details from settings.",
    to: "/profile",
    icon: "settings",
    tone: "neutral",
  },
];

export default function ReportsHeader({
  user,
  notifications = defaultNotifications,
  unreadCount = 0,
  onOpenNotifications,
  onDismissNotification,
  onExportCsv,
  isExporting = false,
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-base font-semibold text-[#7a8794]">
          Explore your spending habits and financial trends
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExportCsv}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1f2d38] px-4 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(26,45,56,0.18)] transition hover:-translate-y-0.5 hover:bg-[#16222b] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Icon name="file" className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
        <NotificationMenu
          items={notifications}
          unreadCount={unreadCount}
          onOpen={onOpenNotifications}
          onDismiss={onDismissNotification}
        />
        <Link
          to="/profile"
          className="grid h-12 w-12 place-items-center rounded-lg bg-white/88 text-[#667684] shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:text-[#0d9488]"
        >
          <Icon name="settings" className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Link>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
