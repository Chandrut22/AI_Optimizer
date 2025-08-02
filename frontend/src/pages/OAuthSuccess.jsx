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
        // ✅ Fetch user from backend using secure cookie
        const res = await getCurrentUser();
        setUser(res.data); // { username, email, etc. }
        navigate("/dashboard");
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
