import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/api/auth";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleOAuthLogin = async () => {
      try {
        // ✅ Fetch user from backend (cookies are already set by OAuth2LoginSuccessHandler)
        // getCurrentUser() returns the data object directly based on your api/auth.js
        const userData = await getCurrentUser();
        
        if (userData) {
          setUser(userData);
          
          // ✅ Check tier selection logic
          if (userData.has_selected_tier) {
            navigate("/dashboard");
          } else {
            navigate("/pricing");
          }
        } else {
          console.error("User data not found");
          navigate("/login");
        }
      } catch (err) {
        console.error("OAuth login failed:", err);
        navigate("/login");
      }
    };

    handleOAuthLogin();
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-bold">Logging you in with Google...</h1>
    </div>
  );
};

export default OAuthSuccess;
