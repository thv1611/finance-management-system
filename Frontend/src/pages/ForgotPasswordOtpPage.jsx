import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthMessage from "../components/auth/AuthMessage";
import OtpInputGroup from "../components/auth/OtpInputGroup";
import { requestPasswordReset, verifyPasswordResetOtp } from "../lib/authApi";

function maskEmail(email) {
  const [name = "", domain = ""] = email.split("@");
  if (!name || !domain) {
    return email;
  }

  const visibleStart = name.slice(0, 2);
  const masked = "*".repeat(Math.max(name.length - 2, 2));
  return `${visibleStart}${masked}@${domain}`;
}

export default function ForgotPasswordOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);
      const result = await verifyPasswordResetOtp({
        email,
        otp_code: otpCode,
      });
      navigate("/forgot-password/reset", {
        state: {
          email,
          resetToken: result.data?.reset_token,
        },
      });
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || "Unable to verify code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setMessage("");

    try {
      setIsResending(true);
      const result = await requestPasswordReset({ email });
      setTone("neutral");
      setMessage(result.message);
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || "Unable to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      heroTitle={
        <>
          Verify your
          <br />
          reset request
        </>
      }
      heroDescription="Enter the code we sent so we can confirm it's really you before allowing a password change."
      cardTitle="Enter Verification Code"
      cardSubtitle={
        <p>
          We sent a 6-digit code to <span className="font-medium text-[#374151]">{maskedEmail || "your email"}</span>.
        </p>
      }
    >
      <AuthMessage tone={tone} message={message} />

      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Verification Code
          </label>
          <OtpInputGroup value={otpCode} onChange={setOtpCode} disabled={isSubmitting} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || otpCode.length !== 6 || !email}
          className="w-full rounded-full bg-gradient-to-r from-[#0f9b8e] to-[#5567ff] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="mt-5 space-y-3 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || !email}
          className="font-medium text-[#0f766e] transition hover:underline disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isResending ? "Sending..." : "Resend Code"}
        </button>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[#6b7280]">
          <Link to="/forgot-password" className="hover:underline">
            Use another email address
          </Link>
          <Link to="/login" className="hover:underline">
            Back to Sign In
          </Link>
        </div>
        <p className="leading-6 text-[#6b7280]">
          The code expires in a few minutes. If you don&apos;t see the message, check your spam folder and request a new code.
        </p>
      </div>
    </AuthLayout>
  );
}
