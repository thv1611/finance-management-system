export function Icon({ name, className = "", ...props }) {
  const paths = {
    dashboard: (
      <>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h3A1.5 1.5 0 0 1 10 5.5v3A1.5 1.5 0 0 1 8.5 10h-3A1.5 1.5 0 0 1 4 8.5v-3Z" />
        <path d="M14 5.5A1.5 1.5 0 0 1 15.5 4h3A1.5 1.5 0 0 1 20 5.5v3A1.5 1.5 0 0 1 18.5 10h-3A1.5 1.5 0 0 1 14 8.5v-3Z" />
        <path d="M4 15.5A1.5 1.5 0 0 1 5.5 14h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3Z" />
        <path d="M14 15.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3Z" />
      </>
    ),
    wallet: <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Zm12 4h4v5h-4a2.5 2.5 0 0 1 0-5Zm1 2.5h.01" />,
    card: <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 3h16M7 15h4" />,
    report: <path d="M6 20V5a1 1 0 0 1 1-1h8l3 3v13H6Zm8-16v4h4M9 14h1.5l1.5-3 2 5 1.5-2H17" />,
    ai: <path d="M12 3l1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3ZM5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14Zm14 0 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />,
    settings: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.5 4a7.9 7.9 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-1.2L15.7 3h-4l-.4 2.6a8 8 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2 1.2l.4 2.6h4l.4-2.6a8 8 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2Z" />,
    search: <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />,
    bell: <path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Zm-8.2 10a2.4 2.4 0 0 0 4.4 0" />,
    income: <path d="M12 19V5m0 0-5 5m5-5 5 5" />,
    expense: <path d="M12 5v14m0 0 5-5m-5 5-5-5" />,
    savings: <path d="M6 11a6 6 0 0 1 12 0v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6Zm3-1h6m-3-3v6" />,
    send: <path d="m21 3-6.5 18-3.7-7.8L3 9.5 21 3Z" />,
    file: <path d="M7 3h7l4 4v14H7V3Zm7 0v5h4M9 16h6M9 12h6" />,
    history: <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6M12 8v5l3 1.5" />,
    support: <path d="M5 12a7 7 0 1 1 14 0v4a2 2 0 0 1-2 2h-2v-6h4M5 12h4v6H7a2 2 0 0 1-2-2v-4Z" />,
    restaurant: <path d="M7 3v8m3-8v8M5 3v8a2.5 2.5 0 0 0 5 0m5-8v18m0-18c3 1 4.5 3.5 4.5 7H15" />,
    briefcase: <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1m-9 0h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm7 0h-2" />,
    home: <path d="m4 11 8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" />,
    car: <path d="M5 14h14l-1.5-5A2 2 0 0 0 15.6 7H8.4a2 2 0 0 0-1.9 2L5 14Zm0 0v4m14-4v4M7 18h.01M17 18h.01M8 11h8" />,
    alert: <path d="M12 9v4m0 4h.01M10.3 4.5 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.5a2 2 0 0 0-3.4 0Z" />,
    info: <path d="M12 17v-6m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    upload: <path d="M12 16V4m0 0-4 4m4-4 4 4M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" />,
    microphone: <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Zm-6 8a6 6 0 0 0 12 0m-6 6v4m-4 0h8" />,
    trash: <path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />,
    receipt: <path d="M7 3h10v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3Zm3 5h4m-4 4h5m-5 4h3" />,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
