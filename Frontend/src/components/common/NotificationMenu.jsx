import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../dashboard/DashboardIcons";

const toneStyles = {
  neutral: "bg-[#eef2f5] text-[#667684]",
  positive: "bg-[#e7f7f0] text-[#129477]",
  warning: "bg-[#fff6e5] text-[#c58116]",
  danger: "bg-[#fdecec] text-[#d05f5f]",
};

export default function NotificationMenu({
  items = [],
  unreadCount: unreadCountProp,
  onOpen,
  onDismiss,
  buttonClassName = "grid h-12 w-12 place-items-center rounded-lg bg-white/88 text-[#667684] shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:text-[#0d9488]",
  panelClassName = "absolute right-0 top-[calc(100%+12px)] z-30 w-[340px] rounded-lg border border-[#e4ecef] bg-white p-3 shadow-[0_22px_48px_rgba(35,66,85,0.12)]",
  emptyTitle = "No notifications",
  emptyMessage = "You're all caught up for now.",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const unreadCount = unreadCountProp ?? items.length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleToggle() {
    setIsOpen((prev) => {
      const nextIsOpen = !prev;

      if (nextIsOpen) {
        onOpen?.();
      }

      return nextIsOpen;
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={buttonClassName}
      >
        <span className="relative">
          <Icon name="bell" className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#d05f5f] px-1 text-[10px] font-black text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </span>
        <span className="sr-only">Notifications</span>
      </button>

      {isOpen ? (
        <section className={panelClassName}>
          <div className="mb-3 flex items-center justify-between border-b border-[#edf2f5] pb-3">
            <div>
              <p className="text-sm font-black text-[#25313b]">Notifications</p>
              <p className="mt-1 text-xs font-semibold text-[#8d99a5]">
                {unreadCount > 0 ? `${unreadCount} actionable updates` : emptyMessage}
              </p>
            </div>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-[#eef7fb] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#2d8ce9]">
                Active
              </span>
            ) : null}
          </div>

          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id || item.title} className="rounded-lg px-3 py-3 transition hover:bg-[#f7fafb]">
                  <div className="flex items-start gap-3">
                    <Link
                      to={item.to || "#"}
                      onClick={() => setIsOpen(false)}
                      className="flex min-w-0 flex-1 items-start gap-3"
                    >
                      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneStyles[item.tone || "neutral"]}`}>
                        <Icon name={item.icon || "alert"} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black text-[#2d3a45]">{item.title}</span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-[#8d99a5]">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                    {onDismiss ? (
                      <button
                        type="button"
                        onClick={() => onDismiss(item.id)}
                        className="shrink-0 text-[11px] font-black uppercase tracking-[0.08em] text-[#8d99a5] transition hover:text-[#d05f5f]"
                      >
                        Hide
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-[#f7fafb] px-4 py-5 text-center">
              <p className="text-sm font-black text-[#34424d]">{emptyTitle}</p>
              <p className="mt-1 text-xs font-semibold text-[#8d99a5]">{emptyMessage}</p>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
