// src/pages/OAuthSuccess.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    const username = queryParams.get("username");
    const email = queryParams.get("email");

    if (token && email) {
      // ✅ Store token securely
      localStorage.setItem("accessToken", token);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);

      // ✅ Redirect to homepage or dashboard
      navigate("/dashboard"); // or wherever you want
    } else {
      // ⚠️ Missing info — go back to login
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-bold">Logging you in with Google...</h1>
    </div>
  );
};

export default OAuthSuccess;
