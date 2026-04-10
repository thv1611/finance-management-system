import { useId } from "react";
import AuthInput from "./AuthInput";

export default function PasswordField({
  label,
  show,
  onToggle,
  error,
  inputClassName = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  return (
    <div>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b7280]"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        <AuthInput
          {...props}
          id={inputId}
          type={show ? "text" : "password"}
          error=""
          className=""
          inputClassName={`pr-14 ${inputClassName}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3 text-sm font-medium text-[#6b7280] transition hover:text-[#374151]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
