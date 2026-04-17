export default function AuthMessage({ tone = "neutral", message }) {
  if (!message) {
    return null;
  }

  const toneClass =
    tone === "error"
      ? "border-red-200/90 bg-[linear-gradient(180deg,_#fff5f5,_#fff0f0)] text-red-700"
      : "border-[#d9e3e8] bg-[linear-gradient(180deg,_#fbfcfd,_#f5f8fa)] text-[#374151]";

  return (
    <div className={`mb-4 rounded-2xl border px-4 py-3.5 text-sm font-medium shadow-[0_10px_24px_rgba(15,23,42,0.035)] ${toneClass}`}>
      {message}
    </div>
  );
}
