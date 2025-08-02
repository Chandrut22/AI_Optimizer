// src/pages/OAuthSuccess.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // ✅ Correct import
import { getCurrentUser } from "@/api/auth"; // Optional: you might not need this here

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      // Token is stored in HttpOnly cookie via backend redirect — no need to store in localStorage

      // Fetch the current user and set in context
      const fetchUser = async () => {
        try {
          const res = await getCurrentUser();
          setUser(res.data);
          navigate("/dashboard");
        } catch (err) {
          console.error("OAuth login failed:", err);
          navigate("/login");
        }
      };

      fetchUser();
    } else {
      navigate("/login");
    }
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-bold">Logging you in with Google...</h1>
    </div>
  );
};

export default OAuthSuccess;
