import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import UserAvatar from "../components/dashboard/UserAvatar";
import { getAuthSession } from "../lib/authSession";

export default function ProfilePage() {
  const { user } = getAuthSession();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Settings" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[960px] px-4 py-8 md:px-8">
          <header>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">Profile</h1>
            <p className="mt-2 text-base font-semibold text-[#7a8794]">
              Review your account details and authentication provider.
            </p>
          </header>

          <section className="mt-8 rounded-lg bg-white p-6 shadow-[0_24px_58px_rgba(35,66,85,0.065)] md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <UserAvatar user={user} size="md" />
              <div className="min-w-0">
                <p className="text-2xl font-black tracking-[-0.03em] text-[#25313b]">
                  {user?.name || "User"}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#7a8794]">{user?.email || "No email available"}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[#f7fafb] px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8d99a5]">Full Name</p>
                <p className="mt-2 text-sm font-black text-[#25313b]">{user?.name || "User"}</p>
              </div>
              <div className="rounded-lg bg-[#f7fafb] px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8d99a5]">Email</p>
                <p className="mt-2 text-sm font-black text-[#25313b]">{user?.email || "No email available"}</p>
              </div>
              <div className="rounded-lg bg-[#f7fafb] px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8d99a5]">Authentication Provider</p>
                <p className="mt-2 text-sm font-black capitalize text-[#25313b]">{user?.provider || "local"}</p>
              </div>
              <div className="rounded-lg bg-[#e7f7f0] px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#13977f]">Account Status</p>
                <p className="mt-2 text-sm font-black text-[#25313b]">Authenticated</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
