import { Icon } from "../dashboard/DashboardIcons";
import NotificationMenu from "../common/NotificationMenu";
import UserMenu from "../dashboard/UserMenu";

const defaultNotifications = [
  {
    id: "new-transaction-review",
    title: "Review recent transactions",
    description: "Open your history if you want to compare before adding a new record.",
    to: "/transactions",
    icon: "history",
    tone: "neutral",
  },
  {
    id: "new-transaction-budget",
    title: "Check budget impact",
    description: "Large expenses may affect your monthly budget progress.",
    to: "/budgets",
    icon: "wallet",
    tone: "warning",
  },
];

export default function NewTransactionTopNav({
  user,
  notifications = defaultNotifications,
  unreadCount = 0,
  onOpenNotifications,
  onDismissNotification,
}) {
  return (
    <header className="flex flex-col gap-4 rounded-lg bg-white/72 px-5 py-4 shadow-[0_18px_42px_rgba(35,66,85,0.045)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-6">
        <div className="text-2xl font-black tracking-[-0.08em]">
          <span className="text-[#0aa7a4]">S</span>
          <span className="text-[#2c8dec]">Y</span>
          <span className="text-[#15c38f]">M</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <NotificationMenu
          items={notifications}
          unreadCount={unreadCount}
          onOpen={onOpenNotifications}
          onDismiss={onDismissNotification}
          buttonClassName="grid h-11 w-11 place-items-center rounded-lg bg-[#f7fafb] text-[#667684] transition hover:-translate-y-0.5 hover:text-[#0d9488]"
        />
        <UserMenu user={user} size="sm" />
      </div>
    </header>
  );
}
