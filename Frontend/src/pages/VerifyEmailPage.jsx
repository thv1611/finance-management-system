import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "OTP verification failed.");
        return;
      }

      setMessage("Email verified successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center bg-gradient-to-br from-[#c8f3e8] via-[#eef4ff] to-[#d9d8ff] px-16 py-12">
          <div className="absolute left-16 top-10 text-4xl font-extrabold text-[#0aa37f]">
            SYM
          </div>
          <div className="max-w-md">
            <h1 className="text-6xl font-extrabold leading-[0.95] tracking-tight text-[#1d1d1f]">
              Check your
              <br />
              email
            </h1>
            <p className="mt-8 text-lg leading-8 text-[#4b5563]">
              We’ve sent a verification code to your email address. Please enter
              the code below to verify your account.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-[28px] bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#1f2937]">
                Verify Your Email
              </h2>
              <p className="mt-2 text-sm text-[#6b7280]">
                A verification code has been sent to your email address.
              </p>
            </div>

            {message && (
              <div className="mb-4 rounded-xl border border-[#d1d5db] bg-[#f9fafb] px-4 py-3 text-sm text-[#374151]">
                {message}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm outline-none transition focus:border-[#6ee7c8] focus:bg-white"
              />

              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter OTP code"
                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm outline-none transition focus:border-[#6ee7c8] focus:bg-white"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-[#0f9b8e] to-[#6ee7c8] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Verifying..." : "Verify email"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <button className="text-[#0f766e] hover:underline">
                Resend Email
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-[#6b7280] hover:underline"
              >
                Use another email address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}