import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/login" replace />;

  // Admin-only route check
  if (requiredRole === "ADMIN" && auth.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
