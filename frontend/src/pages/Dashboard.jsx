import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Settings, BarChart3, FileText, LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  // Safely parse user object from localStorage
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
  }

  const accessToken = localStorage.getItem("accessToken");

  // Redirect to login if user or token is missing
  useEffect(() => {
    if (!accessToken || !user?.email) {
      console.log("No access token or user email found, redirecting to login.");
      navigate("/login");
    }
  }, [accessToken, user?.email, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const role = user?.role || "USER";
  const roleLower = role.toLowerCase();
  const email = user?.email || "demo@example.com";
  const name = user?.name || "Demo User";

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] flex flex-col">
      <Header isLoggedIn={true} />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#111827] dark:text-[#F8FAFC]">
                    Welcome back, {name}!
                  </h1>
                  {role === "ADMIN" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                      <User className="h-4 w-4" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[#6B7280] dark:text-[#94A3B8]">
                  {role === "ADMIN"
                    ? "Manage users, analytics, and system settings"
                    : "Access your AI optimization tools and manage your account"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">Logged in as</p>
                  <p className="font-medium text-[#111827] dark:text-[#F8FAFC]">{email}</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Analytics */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#111827] dark:text-[#F8FAFC]">Analytics</h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">View your metrics</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">View Analytics</Button>
            </div>

            {/* Reports */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#111827] dark:text-[#F8FAFC]">Reports</h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">Generate reports</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">View Reports</Button>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#111827] dark:text-[#F8FAFC]">Settings</h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">Manage account</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">Open Settings</Button>
            </div>
          </div>

          {/* Admin Panel Card */}
          {role === "ADMIN" && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Admin Panel</h3>
                    <p className="text-sm text-white/80">Manage users and system settings</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/admin")}
                  variant="secondary"
                  className="w-full bg-white text-purple-600 hover:bg-white/90"
                >
                  Open Admin Panel
                </Button>
              </div>
            </div>
          )}

          {/* Demo Notice */}
          <div
            className={`p-6 rounded-lg border ${
              role === "ADMIN"
                ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <User
                className={`h-5 w-5 ${
                  role === "ADMIN"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              />
              <div>
                <h4
                  className={`font-medium ${
                    role === "ADMIN"
                      ? "text-purple-900 dark:text-purple-300"
                      : "text-blue-900 dark:text-blue-300"
                  }`}
                >
                  {role === "ADMIN" ? "👑 Admin Account Active" : "👤 Demo User Account"}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    role === "ADMIN"
                      ? "text-purple-700 dark:text-purple-400"
                      : "text-blue-700 dark:text-blue-400"
                  }`}
                >
                  You're logged in as <strong>{email}</strong> with{" "}
                  <strong>{roleLower}</strong> privileges.
                  {role === "ADMIN"
                    ? " You have access to the admin panel for user management and system settings."
                    : " Use admin@example.com to access admin features."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
