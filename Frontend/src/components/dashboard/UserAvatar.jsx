export default function UserAvatar({ user, size = "md" }) {
  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizeClass = size === "sm" ? "h-9 w-9" : "h-12 w-12";

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${displayName} avatar`}
        className={`${sizeClass} rounded-lg object-cover shadow-[0_10px_22px_rgba(35,66,85,0.08)]`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} grid place-items-center rounded-lg bg-[#202a33] text-sm font-black text-white shadow-[0_10px_22px_rgba(35,66,85,0.08)]`}
    >
      {initials || "U"}
    </div>
  );
}
