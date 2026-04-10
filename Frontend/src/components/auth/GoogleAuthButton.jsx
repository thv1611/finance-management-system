export default function GoogleAuthButton({
  label,
  onClick,
  disabled = false,
  isLoading = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.6 14.5 2.8 12 2.8 6.9 2.8 2.8 7 2.8 12s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.5H12Z"
        />
        <path
          fill="#34A853"
          d="M2.8 7.4l3.2 2.3C6.8 7.8 9.2 6 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.6 14.5 2.8 12 2.8 8 2.8 4.5 5.1 2.8 7.4Z"
        />
        <path
          fill="#FBBC05"
          d="M12 21.2c2.4 0 4.5-.8 6-2.3l-2.8-2.3c-.8.6-1.8 1-3.2 1-3.8 0-5.1-2.5-5.4-3.8l-3.2 2.5c1.7 3.4 5.2 4.9 8.6 4.9Z"
        />
        <path
          fill="#4285F4"
          d="M2.8 16.5 6 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L2.8 7.4C2.2 8.7 1.8 10.3 1.8 12s.4 3.3 1 4.5Z"
        />
      </svg>
      <span>{isLoading ? "Connecting..." : label}</span>
    </button>
  );
}
