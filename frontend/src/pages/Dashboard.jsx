import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Settings, BarChart3, FileText, LogOut } from "lucide-react";
import { getCurrentUser } from "@/api/auth"; // Adjust path if needed

const DashBoard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("User fetch failed:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    // Optional: call logout endpoint if you have one
    localStorage.clear(); // only if you're storing non-sensitive data
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  const role = user.role || "USER";
  const roleLower = role.toLowerCase();
  const email = user.email;
  const name = user.name;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] flex flex-col">
      <Header 
        isLoggedIn={true} 
        userName={user.name}
        userEmail={user.email}/>
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
            <DashboardCard
              icon={<BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              title="Analytics"
              subtitle="View your metrics"
              onClick={() => {}}
            />

            {/* Reports */}
            <DashboardCard
              icon={<FileText className="h-6 w-6 text-green-600 dark:text-green-400" />}
              title="Reports"
              subtitle="Generate reports"
              onClick={() => {}}
            />

            {/* Settings */}
            <DashboardCard
              icon={<Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              title="Settings"
              subtitle="Manage account"
              onClick={() => {}}
            />
          </div>

          {/* Admin Panel */}
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

          {/* Info Notice */}
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
                  You're logged in as <strong>{email}</strong> with <strong>{roleLower}</strong> privileges.
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

// Reusable Dashboard Card Component
const DashboardCard = ({ icon, title, subtitle, onClick }) => (
  <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg p-6">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700/20 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#111827] dark:text-[#F8FAFC]">{title}</h3>
        <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">{subtitle}</p>
      </div>
    </div>
    <Button className="w-full" variant="outline" onClick={onClick}>
      {`Open ${title}`}
    </Button>
  </div>
);

export default DashBoard;
