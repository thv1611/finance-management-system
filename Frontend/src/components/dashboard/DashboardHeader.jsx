import { Link } from "react-router-dom";
import { Icon } from "./DashboardIcons";
import NotificationMenu from "../common/NotificationMenu";
import UserMenu from "./UserMenu";

export default function DashboardHeader({
  user,
  notifications = [],
  unreadCount = 0,
  onOpenNotifications,
  onDismissNotification,
}) {
  return (
    <header className="sticky top-0 z-10 flex justify-end bg-[#eef2f5]/72 px-4 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <NotificationMenu
          items={notifications}
          unreadCount={unreadCount}
          onOpen={onOpenNotifications}
          onDismiss={onDismissNotification}
          buttonClassName="grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/82 text-[#667684] shadow-[0_12px_30px_rgba(35,66,85,0.05)] transition hover:-translate-y-0.5 hover:text-[#0d9488]"
        />
        <Link
          to="/transactions/new"
          className="rounded-2xl bg-[linear-gradient(135deg,_#14977f,_#0f7f8d)] px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(20,151,127,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(20,151,127,0.28)]"
        >
          + Add Transaction
        </Link>
        <UserMenu user={user} size="sm" />
      </div>
    </header>
  );
}
