import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import NewTransactionForm from "../components/transactions/NewTransactionForm";
import NewTransactionTopNav from "../components/transactions/NewTransactionTopNav";
import { useNotificationFeed } from "../hooks/useNotificationFeed";
import { getAuthSession } from "../lib/authSession";

export default function NewTransactionPage() {
  const { user } = getAuthSession();
  const {
    notifications,
    unreadCount,
    onOpenNotifications,
    onDismissNotification,
  } = useNotificationFeed();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -bottom-28 -left-20 h-[420px] w-[420px] rounded-full bg-[#9eb8ff]/45 blur-3xl" />
      <div className="pointer-events-none fixed right-[-120px] top-[-160px] h-[460px] w-[460px] rounded-full bg-[#b8e9df]/35 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Transactions" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1180px] px-4 py-5 md:px-8">
          <NewTransactionTopNav
            user={user}
            notifications={notifications}
            unreadCount={unreadCount}
            onOpenNotifications={onOpenNotifications}
            onDismissNotification={onDismissNotification}
          />
          <NewTransactionForm />
        </div>
      </main>
    </div>
  );
}
