import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import AuthMessage from "../components/auth/AuthMessage";
import { requestPasswordReset } from "../lib/authApi";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);
      const result = await requestPasswordReset({ email });
      setTone("neutral");
      setMessage(result.message);
      navigate("/forgot-password/verify", {
        state: {
          email,
        },
      });
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || "Unable to send reset code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heroTitle={
        <>
          Recover access
          <br />
          to your
          <br />
          sanctuary
        </>
      }
      heroDescription="Request a verification code to securely reset your SYM password and get back to managing your money."
      cardTitle="Forgot Password"
      cardSubtitle="Enter the email associated with your account."
    >
      <AuthMessage tone={tone} message={message} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-[#0f9b8e] to-[#5567ff] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending..." : "Send Reset Code"}
        </button>
      </form>

      <div className="mt-5 space-y-4">
        <Link to="/login" className="block text-sm font-medium text-[#4f46e5] hover:underline">
          Back to Sign In
        </Link>
        <p className="text-sm leading-6 text-[#6b7280]">
          We&apos;ll send password reset instructions and a verification code to your inbox. If it doesn&apos;t appear in a few minutes, check your spam or promotions folder.
        </p>
      </div>
    </AuthLayout>
  );
}
