import { useEffect, useMemo, useRef } from "react";

const OTP_LENGTH = 6;

export default function OtpInputGroup({ value, onChange, disabled = false }) {
  const refs = useRef([]);
  const digits = useMemo(() => {
    const padded = value.padEnd(OTP_LENGTH, " ");
    return padded.slice(0, OTP_LENGTH).split("");
  }, [value]);

  useEffect(() => {
    refs.current = refs.current.slice(0, OTP_LENGTH);
  }, []);

  const setDigitAt = (index, nextDigit) => {
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    onChange(nextDigits.join("").replace(/\s/g, ""));
  };

  const focusInput = (index) => {
    const input = refs.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  const handleInputChange = (index, event) => {
    const rawValue = event.target.value.replace(/\D/g, "");

    if (!rawValue) {
      setDigitAt(index, "");
      return;
    }

    if (rawValue.length > 1) {
      const nextDigits = [...digits];
      rawValue.slice(0, OTP_LENGTH - index).split("").forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
      onChange(nextDigits.join("").replace(/\s/g, ""));

      const nextFocusIndex = Math.min(index + rawValue.length, OTP_LENGTH - 1);
      focusInput(nextFocusIndex);
      return;
    }

    setDigitAt(index, rawValue);
    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    onChange(pastedValue);
    focusInput(Math.min(pastedValue.length - 1, OTP_LENGTH - 1));
  };

  return (
    <div>
      <div className="flex gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            pattern="\d{1}"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={OTP_LENGTH}
            value={digit.trim()}
            disabled={disabled}
            onChange={(event) => handleInputChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            aria-label={`OTP digit ${index + 1}`}
            className="h-14 w-12 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] text-center text-lg font-semibold text-[#111827] outline-none transition focus:border-[#6ee7c8] focus:bg-white sm:w-14"
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-[#9ca3af]">
        Enter the 6-digit code. You can paste the full code into any box.
      </p>
    </div>
  );
}
