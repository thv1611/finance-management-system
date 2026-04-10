import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { Icon } from "../components/dashboard/DashboardIcons";
import NewTransactionForm from "../components/transactions/NewTransactionForm";
import NewTransactionTopNav from "../components/transactions/NewTransactionTopNav";
import { getAuthSession } from "../lib/authSession";

export default function NewTransactionPage() {
  const { user } = getAuthSession();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -bottom-28 -left-20 h-[420px] w-[420px] rounded-full bg-[#9eb8ff]/45 blur-3xl" />
      <div className="pointer-events-none fixed right-[-120px] top-[-160px] h-[460px] w-[460px] rounded-full bg-[#b8e9df]/35 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Transactions" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1180px] px-4 py-5 md:px-8">
          <NewTransactionTopNav user={user} />
          <NewTransactionForm />
        </div>

        <button className="fixed bottom-7 right-7 grid h-12 w-12 place-items-center rounded-full bg-[#8ea6ff] text-white shadow-[0_18px_38px_rgba(96,122,216,0.28)] transition hover:-translate-y-1 hover:bg-[#6f8df0]">
          <Icon name="settings" className="h-5 w-5" />
          <span className="sr-only">Quick action</span>
        </button>
      </main>
    </div>
  );
}
