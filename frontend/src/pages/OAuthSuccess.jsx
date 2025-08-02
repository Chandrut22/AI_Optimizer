// src/pages/OAuthSuccess.jsx

import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { getCurrentUser } from "@/api/auth";  // adjust the path if needed

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();

        if (!res.ok) throw new Error("Authentication failed");

        const userData = await res.json();
        setUser(userData); // store in context
        navigate("/dashboard");
      } catch (err) {
        console.error("OAuth login error:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-bold">Logging you in with Google...</h1>
    </div>
  );
};

export default OAuthSuccess;
