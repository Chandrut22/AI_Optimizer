/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  BarChart3,
  FileText,
  LogOut,
  Sparkles,
  Globe,
  TrendingUp,
  Zap,
  Calendar,
  Search,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
// Import the new API functions
import { getUsageStatus, getScanHistory } from "@/api/auth";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // State for dynamic data
  const [tierData, setTierData] = useState({
    tier: "FREE",
    dailyCount: 0,
    dailyMax: 5,
    hasSelectedTier: false,
    resetDate: new Date().toISOString()
  });
  
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Fetch Data on Mount
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Usage Status using auth.js
      const usageData = await getUsageStatus();
      setTierData(usageData);
      
      // Persist to local storage as fallback/cache if needed
      localStorage.setItem("tierData", JSON.stringify(usageData));

      // 2. Fetch History using auth.js
      const historyData = await getScanHistory();
      
      // Map backend DTO to frontend structure (handle missing fields)
      // Sort by createdAt in descending order (newest first) and take only last 3
      const mappedHistory = historyData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort descending by date
        .slice(0, 3) // Take only first 3 (most recent)
        .map(item => ({
          id: item.id, // keep id for stable keys
          url: item.url,
          score: item.score ?? 0, // default if not provided
          date: item.createdAt ? new Date(item.createdAt).toLocaleString() : "Unknown",
          status: item.status ?? "completed"
        }));
      setRecentAnalyses(mappedHistory);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast.error("Could not refresh dashboard data. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSEOAnalysis = () => {
    if (!url) return;
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (_e) {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    // Check limits before navigating (optional, but good UX)
    if (tierData.dailyCount >= tierData.dailyMax) {
      toast.error("Daily limit reached! Please upgrade your plan.");
      return;
    }

    navigate(`/seo-results/${encodeURIComponent(url)}`);
  };

  if (!user) return null;

  const { role = "USER", email, name } = user;

  // Calculate percentage for progress bar
  const usagePercentage = Math.min((tierData.dailyCount / tierData.dailyMax) * 100, 100);
  const remainingScans = Math.max(tierData.dailyMax - tierData.dailyCount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#0F172A]">
      <Header />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <section className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg p-8">
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
                <div className="text-right hidden sm:block">
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

          {/* Tier & Usage Status Section */}
          {isLoading ? (
             <div className="flex justify-center p-12">
               <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
             </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Tier Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tier</p>
                    <p className="text-2xl font-bold text-[#111827] dark:text-[#F8FAFC]">
                      {tierData.tier}
                    </p>
                  </div>
                  {tierData.hasSelectedTier && (
                    <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      ✓ Selected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Daily Usage Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Daily Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Analyses Used</span>
                      <span className="text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]">
                        {tierData.dailyCount} / {tierData.dailyMax}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          usagePercentage >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {remainingScans > 0 
                      ? `${remainingScans} analyses remaining today` 
                      : "Daily limit reached"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reset Date Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Reset Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next Reset</p>
                    <p className="text-lg font-bold text-[#111827] dark:text-[#F8FAFC]">
                      {new Date(tierData.resetDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {/* Calculate roughly hours/days until reset */}
                    Resets automatically at midnight
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

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
                    disabled={!url || (tierData.dailyCount >= tierData.dailyMax)}
                    className="min-w-[120px]"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
              </div>
            {/* Recent Analyses */}
              {recentAnalyses.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Analyses</h4>
                  <div className="space-y-2">
                    {recentAnalyses.slice(0, 3).map((analysis) => (
                      <div
                        key={analysis.id ?? analysis.url}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/seo-results/${encodeURIComponent(analysis.url)}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{analysis.url}</div>
                            <div className="text-xs text-muted-foreground">{analysis.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{analysis.score > 0 ? `${analysis.score}/100` : 'View'}</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/20 rounded-lg text-center border border-dashed">
                  <p className="text-sm text-muted-foreground">No recent analyses found. Start your first scan above!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* /* GEO Optimizer Section - Coming Soon */}
          <Card className="mb-8 relative opacity-75">
            <div className="absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
              Coming Soon
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                GEO Optimization & AI Content
              </CardTitle>
              <p className="text-muted-foreground">
                Optimize your content for generative search engines and AI assistants
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="geo-url">Website URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="geo-url"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      disabled
                      className="pl-10"
                    />
                  </div>
                  <Button disabled className="min-w-[120px]">
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-muted-foreground font-medium">
                  This feature will be available soon. Stay tuned!
                </p>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PanelPage;