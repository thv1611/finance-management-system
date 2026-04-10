import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import AuthMessage from "../components/auth/AuthMessage";
import { resendVerificationOtp, verifyEmailOtp } from "../lib/authApi";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);
      await verifyEmailOtp({
        email,
        otp_code: otpCode,
      });
      setTone("neutral");
      setMessage("Email verified successfully. Redirecting to sign in...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || "OTP verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setTone("error");
      setMessage("Enter your email address before requesting another code.");
      return;
    }

    try {
      setIsResending(true);
      await resendVerificationOtp({ email });
      setTone("neutral");
      setMessage("A new code has been sent if the email exists.");
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
          Check your
          <br />
          email
        </>
      }
      heroDescription="We've sent a verification code to your email address. Enter it below to verify your SYM account."
      cardTitle="Verify Your Email"
      cardSubtitle="A verification code has been sent to your email address."
    >
      <AuthMessage tone={tone} message={message} />

      <form onSubmit={handleVerify} className="space-y-4">
        <AuthInput
          label="Email Address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
        />

        <AuthInput
          label="Verification Code"
          type="text"
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter OTP code"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-[#0f9b8e] to-[#6ee7c8] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-[#0f766e] transition hover:underline disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isResending ? "Sending..." : "Resend Email"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-[#6b7280] transition hover:underline"
        >
          Use another email address
        </button>
      </div>
    </AuthLayout>
  );
}
