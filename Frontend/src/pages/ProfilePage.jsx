import { useEffect, useState } from "react";
import AuthMessage from "../components/auth/AuthMessage";
import PasswordField from "../components/auth/PasswordField";
import LoadingState from "../components/common/LoadingState";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import UserAvatar from "../components/dashboard/UserAvatar";
import { getAuthSession, persistNormalizedUser } from "../lib/authSession";
import { changePassword, getProfile, updateProfile } from "../lib/profileApi";

export default function ProfilePage() {
  const { user } = getAuthSession();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    avatar_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setMessage("");
        const result = await getProfile();

        if (!isMounted) {
          return;
        }

        const nextProfile = result.data;
        setProfile(nextProfile);
        setForm({
          full_name: nextProfile.full_name || "",
          avatar_url: nextProfile.avatar_url || "",
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setTone("error");
        setMessage(error.response?.message || error.message || "Unable to load profile.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);
      const result = await updateProfile(form);
      const updatedProfile = result.data;
      setProfile(updatedProfile);
      persistNormalizedUser({
        ...user,
        id: updatedProfile.id,
        full_name: updatedProfile.full_name,
        email: updatedProfile.email,
        avatar_url: updatedProfile.avatar_url,
        auth_provider: updatedProfile.auth_provider,
      });
      setTone("neutral");
      setMessage("Profile updated successfully.");
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || error.message || "Unable to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      setIsPasswordSubmitting(true);
      await changePassword(passwordForm);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTone("neutral");
      setMessage("Password updated successfully.");
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || error.message || "Unable to update password.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  const displayUser = {
    ...user,
    name: profile?.full_name || user?.name,
    email: profile?.email || user?.email,
    avatar: profile?.avatar_url || user?.avatar,
    provider: profile?.auth_provider || user?.provider,
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={displayUser} activeItem="Settings" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[960px] px-4 py-8 md:px-8">
          <header>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">Profile</h1>
            <p className="mt-2 text-base font-semibold text-[#7a8794]">
              Review your account details and authentication provider.
            </p>
          </header>

          <AuthMessage tone={tone} message={message} />

          {isLoading ? (
            <section className="mt-8">
              <LoadingState label="Loading profile..." />
            </section>
          ) : (
            <section className="mt-8 rounded-lg bg-white p-6 shadow-[0_24px_58px_rgba(35,66,85,0.065)] md:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <UserAvatar user={displayUser} size="md" />
                <div className="min-w-0">
                  <p className="text-2xl font-black tracking-[-0.03em] text-[#25313b]">
                    {displayUser?.name || "User"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#7a8794]">
                    {displayUser?.email || "No email available"}
                  </p>
                </div>
              </div>

              <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <label className="block md:col-span-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#8d99a5]">Full Name</span>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        full_name: event.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-lg border border-[#d7e2e6] bg-[#f8fbfc] px-4 text-sm font-semibold text-[#25313b] outline-none transition focus:border-[#13977f] focus:bg-white"
                    placeholder="Enter your full name"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#8d99a5]">Avatar URL</span>
                  <input
                    type="url"
                    value={form.avatar_url}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        avatar_url: event.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-lg border border-[#d7e2e6] bg-[#f8fbfc] px-4 text-sm font-semibold text-[#25313b] outline-none transition focus:border-[#13977f] focus:bg-white"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </label>
                <div className="rounded-lg bg-[#f7fafb] px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8d99a5]">Full Name</p>
                  <p className="mt-2 text-sm font-black text-[#25313b]">{displayUser?.name || "User"}</p>
                </div>
                <div className="rounded-lg bg-[#f7fafb] px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8d99a5]">Email</p>
                  <p className="mt-2 text-sm font-black text-[#25313b]">
                    {displayUser?.email || "No email available"}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f7fafb] px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8d99a5]">Authentication Provider</p>
                  <p className="mt-2 text-sm font-black capitalize text-[#25313b]">
                    {displayUser?.provider || "local"}
                  </p>
                </div>
                <div className="rounded-lg bg-[#e7f7f0] px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#13977f]">Account Status</p>
                  <p className="mt-2 text-sm font-black text-[#25313b]">Authenticated</p>
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0e806f] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>

              <section className="mt-10 border-t border-[#edf2f5] pt-8">
                <div className="mb-5">
                  <h2 className="text-2xl font-black tracking-[-0.03em] text-[#25313b]">Change Password</h2>
                  <p className="mt-2 text-sm font-semibold text-[#7a8794]">
                    {displayUser?.provider === "google"
                      ? "This account uses Google Sign-In. Password changes are not available here."
                      : "Update your password to keep your account secure."}
                  </p>
                </div>

                <form className="grid gap-4 md:grid-cols-2" onSubmit={handlePasswordSubmit}>
                  <div className="md:col-span-2">
                    <PasswordField
                      label="Current Password"
                      value={passwordForm.current_password}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          current_password: event.target.value,
                        }))
                      }
                      show={passwordVisibility.current}
                      onToggle={() =>
                        setPasswordVisibility((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      disabled={displayUser?.provider === "google" || isPasswordSubmitting}
                    />
                  </div>
                  <PasswordField
                    label="New Password"
                    value={passwordForm.new_password}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new_password: event.target.value,
                      }))
                    }
                    show={passwordVisibility.next}
                    onToggle={() =>
                      setPasswordVisibility((prev) => ({
                        ...prev,
                        next: !prev.next,
                      }))
                    }
                    disabled={displayUser?.provider === "google" || isPasswordSubmitting}
                  />
                  <PasswordField
                    label="Confirm Password"
                    value={passwordForm.confirm_password}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirm_password: event.target.value,
                      }))
                    }
                    show={passwordVisibility.confirm}
                    onToggle={() =>
                      setPasswordVisibility((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    disabled={displayUser?.provider === "google" || isPasswordSubmitting}
                  />
                  <div className="md:col-span-2 flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={displayUser?.provider === "google" || isPasswordSubmitting}
                      className="rounded-lg bg-[#202a33] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(32,42,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[#172028] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isPasswordSubmitting ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </section>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
