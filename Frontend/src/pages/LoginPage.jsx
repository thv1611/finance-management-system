import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import AuthMessage from "../components/auth/AuthMessage";
import { login } from "../lib/authApi";
import { persistAuthSession } from "../lib/authSession";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isGoogleSubmitting, signInWithGoogle } = useGoogleAuth({
    mode: "login",
    navigate,
  });

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setTone("error");
      setMessage("You were logged out after 30 minutes of inactivity. Please sign in again.");
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);
      const result = await login({
        email: form.email,
        password: form.password,
      });
      persistAuthSession(result.data);
      setTone("neutral");
      setMessage("Login successful.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heroTitle={
        <>
          Welcome
          <br />
          back to
          <br />
          SYM
        </>
      }
      heroDescription="Sign in to track your spending, manage budgets, and stay in control of your financial goals."
      cardTitle="Sign In"
      cardSubtitle={
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-[#4f46e5] hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <AuthMessage tone={tone} message={message} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="name@example.com"
        />

        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#6b7280]">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            Remember me
          </label>

          <Link to="/forgot-password" className="font-medium text-[#4f46e5] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-[#0f9b8e] to-[#6ee7c8] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#e5e7eb]" />
        <span className="text-xs uppercase tracking-wide text-[#9ca3af]">or</span>
        <div className="h-px flex-1 bg-[#e5e7eb]" />
      </div>

      <GoogleAuthButton
        label="Login with Google"
        onClick={async () => {
          const result = await signInWithGoogle();
          setTone(result.ok ? "neutral" : "error");
          setMessage(result.message);
        }}
        isLoading={isGoogleSubmitting}
        disabled={isSubmitting}
      />
    </AuthLayout>
  );
}
