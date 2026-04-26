import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import BudgetsPage from "./pages/BudgetsPage";
import CashFlowTrendsPage from "./pages/CashFlowTrendsPage";
import EditTransactionPage from "./pages/EditTransactionPage";
import NewTransactionPage from "./pages/NewTransactionPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ForgotPasswordOtpPage from "./pages/ForgotPasswordOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SessionTimeoutManager from "./components/auth/SessionTimeoutManager";
import { getAuthSession } from "./lib/authSession";

export default function App() {
  const { isAuthenticated } = getAuthSession();

  return (
    <BrowserRouter>
      <SessionTimeoutManager />
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/register"} replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/verify" element={<ForgotPasswordOtpPage />} />
        <Route path="/forgot-password/reset" element={<ResetPasswordPage />} />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <AIInsightsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <BudgetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cash-flow-trends"
          element={
            <ProtectedRoute>
              <CashFlowTrendsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/edit"
          element={
            <ProtectedRoute>
              <EditTransactionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <ProtectedRoute>
              <NewTransactionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
