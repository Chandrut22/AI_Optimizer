import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Settings, BarChart3, FileText, LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const accessToken = localStorage.getItem("accessToken");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken || !user.email) {
      navigate("/login");
    }
  }, [accessToken, user.email, navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] flex flex-col">
      <Header isLoggedIn={true} />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#111827] dark:text-[#F8FAFC] mb-2">
                  Welcome back, {user.name || "Demo User"}!
                </h1>
                <p className="text-[#6B7280] dark:text-[#94A3B8]">
                  Access your AI optimization tools and manage your account
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">Logged in as</p>
                  <p className="font-medium text-[#111827] dark:text-[#F8FAFC]">{user.email}</p>
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

          {/* Demo Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-300">Demo Mode Active</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  You're using the demo version. All data and functionality are simulated for demonstration purposes.
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
