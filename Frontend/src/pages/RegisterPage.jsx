import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import AuthMessage from "../components/auth/AuthMessage";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import PasswordField from "../components/auth/PasswordField";
import { register } from "../lib/authApi";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

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
  const [tone, setTone] = useState("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isGoogleSubmitting, signInWithGoogle } = useGoogleAuth({
    mode: "register",
    navigate,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

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
    const nextErrors = {};

    if (!form.full_name.trim()) {
      nextErrors.full_name = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!form.confirm_password) {
      nextErrors.confirm_password = "Please confirm your password.";
    } else if (form.confirm_password !== form.password) {
      nextErrors.confirm_password = "Passwords do not match.";
    }

    if (!form.agree) {
      nextErrors.agree = "You must agree to the Terms and Privacy Policy.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await register(form);
      setTone("neutral");
      setMessage("Registration successful. Please verify your email.");
      navigate("/verify-email", { state: { email: form.email } });
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heroTitle={
        <>
          Start your
          <br />
          smarter money
          <br />
          journey
        </>
      }
      heroDescription="Track expenses, manage budgets, and build better financial habits with SYM."
      cardTitle="Create your account"
      cardSubtitle={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#4f46e5] hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <AuthMessage tone={tone} message={message} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Full Name"
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Enter your full name"
          error={errors.full_name}
        />

        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="name@example.com"
          error={errors.email}
        />

        <PasswordField
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          show={showPassword}
          onToggle={() => setShowPassword((prev) => !prev)}
          error={errors.password}
        />

        <PasswordField
          label="Confirm Password"
          name="confirm_password"
          value={form.confirm_password}
          onChange={handleChange}
          placeholder="Confirm your password"
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((prev) => !prev)}
          error={errors.confirm_password}
        />

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
              I agree to the <span className="font-medium text-[#4f46e5]">Terms of Service</span> and{" "}
              <span className="font-medium text-[#4f46e5]">Privacy Policy</span>.
            </span>
          </label>
          {errors.agree ? <p className="mt-1 text-sm text-red-500">{errors.agree}</p> : null}
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
        <span className="text-xs uppercase tracking-wide text-[#9ca3af]">or</span>
        <div className="h-px flex-1 bg-[#e5e7eb]" />
      </div>

      <GoogleAuthButton
        label="Sign up with Google"
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
