import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Still checking authentication (loading state from AuthContext)
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 dark:text-gray-300">
        Checking session...
      </div>
    );
  }

  // No user → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction check
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Authenticated and authorized → render children
  return children;
};

export default ProtectedRoute;
