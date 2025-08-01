/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const getMe = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    // 👇 Only call /auth/me if there's no user
    if (!user) getMe();
  }, []);

  const logout = async () => {
    try {
      await axios.post("/auth/logout"); // optional
    } catch {err}
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ export hook separately
export const useAuth = () => useContext(AuthContext);
