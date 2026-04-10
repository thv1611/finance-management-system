import { Navigate, useLocation } from "react-router-dom";
import { getAuthSession } from "../../lib/authSession";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated } = getAuthSession();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
