export default function FormField({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-[#8d99a5]">
        {label}
      </span>
      {children}
      {hint && <span className="mt-2 block text-xs font-semibold text-[#9aa6b2]">{hint}</span>}
    </label>
  );
}
