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
        className={`w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6ee7c8] focus:bg-white ${inputClassName}`}
      />

      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
