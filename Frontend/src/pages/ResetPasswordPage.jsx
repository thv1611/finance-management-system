import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthMessage from "../components/auth/AuthMessage";
import PasswordField from "../components/auth/PasswordField";
import { resetPassword } from "../lib/authApi";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";
  const [form, setForm] = useState({
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.password) {
      nextErrors.password = "New password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!form.confirm_password) {
      nextErrors.confirm_password = "Please confirm your password.";
    } else if (form.confirm_password !== form.password) {
      nextErrors.confirm_password = "Passwords do not match.";
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
      const result = await resetPassword({
        email,
        reset_token: resetToken,
        password: form.password,
        confirm_password: form.confirm_password,
      });
      setTone("neutral");
      setMessage(result.message);
      setTimeout(() => navigate("/login"), 1400);
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heroTitle={
        <>
          Set a fresh
          <br />
          password
        </>
      }
      heroDescription="Create a new password for your SYM account to complete the recovery flow and return to your digital sanctuary."
      cardTitle="Reset Password"
      cardSubtitle="Create a new password for your account."
    >
      <AuthMessage tone={tone} message={message} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          label="New Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a new password"
          show={showPassword}
          onToggle={() => setShowPassword((prev) => !prev)}
          error={errors.password}
        />

        <PasswordField
          label="Confirm Password"
          name="confirm_password"
          value={form.confirm_password}
          onChange={handleChange}
          placeholder="Confirm your new password"
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((prev) => !prev)}
          error={errors.confirm_password}
        />

        <button
          type="submit"
          disabled={isSubmitting || !email || !resetToken}
          className="w-full rounded-full bg-gradient-to-r from-[#0f9b8e] to-[#5567ff] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="mt-5 space-y-4">
        <Link to="/login" className="block text-sm font-medium text-[#4f46e5] hover:underline">
          Back to Sign In
        </Link>
        {!email || !resetToken ? (
          <p className="text-sm leading-6 text-[#6b7280]">
            This step requires a verified reset session. Start again from Forgot Password if you landed here directly.
          </p>
        ) : null}
      </div>
    </AuthLayout>
  );
}
