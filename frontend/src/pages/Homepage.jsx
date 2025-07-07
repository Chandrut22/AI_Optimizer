import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import {
  Search,
  Sparkles,
  Upload,
  Settings,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-blue-950">
      <Header isLoggedIn={false} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-accent/20" />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold font-inter text-foreground mb-6 leading-tight">
              Boost Your Online Visibility with{" "}
              <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Optimize your content for traditional and generative search
              engines using intelligent AI-powered tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-semibold rounded-xl border-2 hover:bg-accent transition-all duration-200"
              >
                View Demo
              </Button>
            </div>
          </div>

          {/* Abstract Tech Illustrations */}
          <div className="absolute top-20 left-10 opacity-20 dark:opacity-10">
            <div className="w-32 h-32 rounded-full bg-linear-to-r from-primary/30 to-blue-500/30 blur-xl" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-20 dark:opacity-10">
            <div className="w-24 h-24 rounded-full bg-linear-to-r from-purple-500/30 to-primary/30 blur-xl" />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-inter text-foreground mb-4">
              Powerful AI-Driven Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our specialized optimization tools designed for modern
              search landscapes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* SEO Optimizer Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-border bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-linear-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold font-inter text-card-foreground mb-4">
                  SEO Optimizer
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enhance your search rankings with intelligent keyword and
                  meta-tag optimization. Boost visibility across traditional
                  search engines with proven strategies.
                </p>
              </CardContent>
            </Card>

            {/* GEO Optimizer Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-border bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-linear-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold font-inter text-card-foreground mb-4">
                  GEO Optimizer
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Adapt content for generative engines with AI-driven insights.
                  Optimize for the next generation of search experiences and AI
                  assistants.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-inter text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with our AI optimization platform in just four simple
              steps.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Steps 1–4 */}
              {[1, 2, 3, 4].map((step, idx) => {
                const icons = [Upload, Settings, Sparkles, TrendingUp];
                const gradients = [
                  "from-primary to-blue-600",
                  "from-green-500 to-emerald-600",
                  "from-purple-500 to-violet-600",
                  "from-orange-500 to-red-600",
                ];
                const titles = [
                  "Upload Content",
                  "Choose Optimizer",
                  "Get AI Insights",
                  "Track Performance",
                ];
                const desc = [
                  "Upload or input your content that needs optimization.",
                  "Select SEO or GEO optimization based on your goals.",
                  "Receive AI-powered suggestions and optimization insights.",
                  "Apply suggestions and monitor your content performance.",
                ];
                const Icon = icons[idx];

                return (
                  <div className="text-center group" key={step}>
                    <div className="relative mb-6">
                      <div
                        className={`w-20 h-20 mx-auto bg-linear-to-r ${gradients[idx]} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        {/* {step} */}
                      </div>
                      <Icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold font-inter text-foreground mb-2">
                      {titles[idx]}
                    </h3>
                    <p className="text-muted-foreground">{desc[idx]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-inter text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of content creators who have boosted their online
              visibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Mitchell",
                company: "Content Director, TechCorp",
                initials: "SM",
                text: `"The AI optimization suggestions increased our organic traffic by 300% in just 3 months. The GEO features are game-changing for modern content strategy."`,
                color: "from-blue-500 to-purple-600",
              },
              {
                name: "Marcus Rodriguez",
                company: "Founder, Digital Innovations",
                initials: "MR",
                text: `"Finally, a tool that understands both traditional SEO and the emerging generative search landscape. It's like having an AI marketing team."`,
                color: "from-green-500 to-blue-500",
              },
              {
                name: "Lisa Chen",
                company: "SEO Manager, GrowthLab",
                initials: "LC",
                text: `"The platform's insights are incredibly accurate. We've seen consistent ranking improvements and better engagement across all our content."`,
                color: "from-purple-500 to-pink-500",
              },
            ].map((testimonial, idx) => (
              <Card
                key={idx}
                className="border-border bg-card hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-card-foreground mb-6 leading-relaxed">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 bg-linear-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold mr-4`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-linear-to-r from-primary/10 via-background to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-inter text-foreground mb-4">
              Ready to Transform Your Content Strategy?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join thousands of content creators who are already leveraging AI
              to boost their online visibility. Start your optimization journey
              today.
            </p>
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-muted-foreground">Free 14-day trial</span>
              <CheckCircle className="h-5 w-5 text-green-500 ml-6 mr-2" />
              <span className="text-muted-foreground">
                No credit card required
              </span>
            </div>
            <Link to="/register">
              <Button
                size="lg"
                className="h-16 px-12 text-xl font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Optimizing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
