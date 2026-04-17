export default function AuthInput({
  label,
  error,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={props.id || props.name}
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b7280]"
        >
          {label}
        </label>
      ) : null}

      <input
        {...props}
        className={`w-full rounded-2xl border border-[#dfe7ec] bg-[linear-gradient(180deg,_rgba(248,251,252,0.96),_rgba(255,255,255,0.98))] px-4 py-3.5 text-sm font-medium text-[#111827] outline-none transition shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] placeholder:text-[#9ca3af] focus:border-[#7fd9cb] focus:bg-white focus:shadow-[0_0_0_4px_rgba(127,217,203,0.14)] ${inputClassName}`}
      />

      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
