export default function AuthMessage({ tone = "neutral", message }) {
  if (!message) {
    return null;
  }

  const toneClass =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-[#d1d5db] bg-[#f9fafb] text-[#374151]";

  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      {message}
    </div>
  );
}
