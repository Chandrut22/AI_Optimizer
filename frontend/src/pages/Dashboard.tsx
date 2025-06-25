import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={true} userName="Demo User" />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-inter text-foreground mb-2">
                  Welcome back, Demo User!
                </h1>
                <p className="text-muted-foreground">
                  Here's an overview of your AI optimization progress.
                </p>
              </div>
              <Link to="/admin">
                <Button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Optimizations
                    </p>
                    <p className="text-2xl font-bold text-foreground">1,284</p>
                  </div>
                  <Search className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">SEO Score</p>
                    <p className="text-2xl font-bold text-foreground">87%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      GEO Improvements
                    </p>
                    <p className="text-2xl font-bold text-foreground">342</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Monthly Growth
                    </p>
                    <p className="text-2xl font-bold text-foreground">+23%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Recent Optimizations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-foreground">
                      Homepage SEO Update
                    </span>
                    <span className="text-xs text-muted-foreground">
                      2 hours ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-foreground">
                      Blog Post GEO Enhancement
                    </span>
                    <span className="text-xs text-muted-foreground">
                      5 hours ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">
                      Product Page Keywords
                    </span>
                    <span className="text-xs text-muted-foreground">
                      1 day ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  AI Insights
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-sm text-foreground">
                      Your content visibility increased by 15% this week!
                    </p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-sm text-foreground">
                      Consider optimizing 3 more pages for better GEO
                      performance.
                    </p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-sm text-foreground">
                      New keyword opportunities detected in your niche.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
