import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
  agree: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
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

    if (!form.full_name.trim()) {
      newErrors.full_name = "Full name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!form.confirm_password) {
      newErrors.confirm_password = "Please confirm your password.";
    } else if (form.confirm_password !== form.password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    if (!form.agree) {
      newErrors.agree = "You must agree to the Terms and Privacy Policy.";
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

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          confirm_password: form.confirm_password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Registration failed.");
        return;
      }

      setMessage("Registration successful. Please verify your email.");
      navigate("/verify-email", {
        state: { email: form.email },
      });
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
              Start your
              <br />
              smarter money
              <br />
              journey
            </h1>
            <p className="mt-8 text-lg leading-8 text-[#4b5563]">
              Track expenses, manage budgets, and build better financial habits
              with SYM.
            </p>
          </div>

          <div />
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-[28px] bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1f2937]">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-[#6b7280]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[#4f46e5] hover:underline"
                >
                  Log in
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
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm outline-none transition focus:border-[#6ee7c8] focus:bg-white"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
                )}
              </div>

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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#6ee7c8] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 text-sm text-[#6b7280]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#6ee7c8] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute inset-y-0 right-3 text-sm text-[#6b7280]"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirm_password}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm text-[#4b5563]">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981]"
                  />
                  <span>
                    I agree to the{" "}
                    <span className="font-medium text-[#4f46e5]">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-[#4f46e5]">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
                {errors.agree && (
                  <p className="mt-1 text-sm text-red-500">{errors.agree}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-[#0f9b8e] to-[#5567ff] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
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

            <div className="mt-8 text-center text-xs text-[#9ca3af]">
              <div className="space-x-3">
                <span>Terms of Service</span>
                <span>Privacy Policy</span>
                <span>Your Privacy Choices</span>
              </div>
              <p className="mt-3">© 2026 SYM. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}