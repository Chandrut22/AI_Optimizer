import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  BarChart3,
  FileText,
  LogOut,
  Sparkles,
  Globe,
  Clock,
  Search,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ==========================
// Dashboard Card Component
// ==========================
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

// ==========================
// Main Panel Page
// ==========================
const PanelPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Prevent render if no user (ProtectedRoute should normally handle this)
  if (!user) return null;

  const { role = "USER", email, name } = user;
  const roleLower = role.toLowerCase();

  // SEO Analysis State
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handlers
  const handleLogout = async () => {
    await logout();
    // Redirect handled by ProtectedRoute
  };

  const handleSEOAnalysis = async () => {
    if (!url) return;

    setIsAnalyzing(true);

    // TODO: Replace this with actual SEO API call
    setTimeout(() => {
      setIsAnalyzing(false);
      alert("SEO analysis complete! (Demo)");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#0F172A]">
      <Header />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <section className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between">
              {/* Left Content */}
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

              {/* Right Content */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">Logged in as</p>
                  <p className="font-medium text-[#111827] dark:text-[#F8FAFC]">{email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </section>

          {/* SEO Optimization Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                SEO Analysis & Optimization
              </CardTitle>
              <p className="text-muted-foreground">
                Enter your website URL to get AI-powered SEO recommendations
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={handleSEOAnalysis}
                    disabled={!url || isAnalyzing}
                    className="min-w-[120px]"
                  >
                    {isAnalyzing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              icon={<BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              title="Analytics"
              subtitle="View your metrics"
              onClick={() => navigate("/dashboard/analytics")}
            />
            <DashboardCard
              icon={<FileText className="h-6 w-6 text-green-600 dark:text-green-400" />}
              title="Reports"
              subtitle="Generate reports"
              onClick={() => navigate("/dashboard/reports")}
            />
            <DashboardCard
              icon={<Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              title="Settings"
              subtitle="Manage account"
              onClick={() => navigate("/dashboard/settings")}
            />
          </div>

          {/* Admin Panel */}
          {role === "ADMIN" && (
            <section className="mt-8">
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
            </section>
          )}

          {/* Info Notice */}
          <section
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
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PanelPage;
