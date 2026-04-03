import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Login failed.");
        return;
      }

      localStorage.setItem("access_token", result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      setMessage("Login successful.");
      navigate("/dashboard");
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-[#c8f3e8] via-[#eef4ff] to-[#d9d8ff] px-16 py-12">
          <div className="text-4xl font-extrabold tracking-tight text-[#0aa37f]">
            SYM
          </div>

          <div className="max-w-md">
            <h1 className="text-6xl font-extrabold leading-[0.95] tracking-tight text-[#1d1d1f]">
              Welcome
              <br />
              back to
              <br />
              SYM
            </h1>
            <p className="mt-8 text-lg leading-8 text-[#4b5563]">
              Sign in to track your spending, manage budgets, and stay in
              control of your financial goals.
            </p>
          </div>

          <div />
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-[28px] bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1f2937]">Sign In</h2>
              <p className="mt-2 text-sm text-[#6b7280]">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-[#4f46e5] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {message && (
              <div className="mb-4 rounded-xl border border-[#d1d5db] bg-[#f9fafb] px-4 py-3 text-sm text-[#374151]">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm outline-none transition focus:border-[#6ee7c8] focus:bg-white"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm outline-none transition focus:border-[#6ee7c8] focus:bg-white"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

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

                <Link
                  to="/forgot-password"
                  className="font-medium text-[#4f46e5] hover:underline"
                >
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
              <span className="text-xs uppercase tracking-wide text-[#9ca3af]">
                or
              </span>
              <div className="h-px flex-1 bg-[#e5e7eb]" />
            </div>

            <button
              type="button"
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb]"
            >
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}