// components/ProtectedRoute.jsx
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;