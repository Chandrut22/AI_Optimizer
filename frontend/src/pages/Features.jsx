import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Sparkles,
  FileText,
  TrendingUp,
  CheckCircle,
  Gauge,
  Eye,
  Lightbulb,
  Search,
  Users,
  RefreshCw,
  Feather,
  Archive,
  ClipboardList,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const Features = () => {
  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!(accessToken && user.email);

  const features = [
    {
      name: "Technical Audit",
      description: "Check PageSpeed, Core Web Vitals, and mobile-friendliness instantly.",
      icon: Gauge,
    },
    {
      name: "On-Page Analysis",
      description: "Complete breakdown of titles, meta descriptions, headings, and alt-text.",
      icon: Eye,
    },
    {
      name: "Keyword Discovery",
      description: "AI finds your primary keyword and related secondary keywords.",
      icon: Lightbulb,
    },
    {
      name: "Competitor Analysis",
      description: "Identify your top 3 competitors and their strategies.",
      icon: Users,
    },
    {
      name: "Content Gap Analysis",
      description: "Discover missing topics and themes in your content.",
      icon: RefreshCw,
    },
    {
      name: "AI Strategy Checklist",
      description: "Prioritized, actionable to-do list powered by AI.",
      icon: ClipboardList,
    },
    {
      name: "Content Rewrites",
      description: "AI-generated titles and meta descriptions optimized for SEO.",
      icon: Feather,
    },
    {
      name: "Content Generation",
      description: "AI writes new paragraphs with suggested headings to fill gaps.",
      icon: Archive,
    },
    {
      name: "SEO Score",
      description: "Overall score to track your page's health and performance.",
      icon: TrendingUp,
    },
    {
      name: "Comprehensive Report",
      description: "Detailed report showing before & after with all recommendations.",
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              One-Click AI SEO Audit & Optimizer
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Everything you need to analyze, optimize, and improve your SEO performance.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="border-border bg-card hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="w-10 h-10 mb-4 bg-accent rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to optimize your SEO?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start your AI-powered SEO audit today and get actionable insights in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-primary hover:bg-primary/90"
                  >
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-primary hover:bg-primary/90"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
