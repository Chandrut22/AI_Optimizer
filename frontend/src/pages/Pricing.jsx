/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Check,
  X,
  Zap,
  Crown,
  Rocket,
  Star,
  Users,
  BarChart3,
  Shield,
  Clock,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { selectTier } from "@/api/auth"; // ✅ Import API function
import { useAuth } from "@/context/AuthContext"; // ✅ Import Auth Context

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isSelecting, setIsSelecting] = useState(false);
  
  // Check if user is logged in via context
  const { user, setUser } = useAuth();
  const isLoggedIn = !!user;

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small websites and beginners",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      popular: false,
      isFree: true,
      pricing: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { name: "5 Website Analyses per month", included: true },
        { name: "Basic SEO Recommendations", included: true },
        { name: "Performance Monitoring", included: true },
        { name: "Email Support", included: true },
        { name: "Keyword Research (50/month)", included: true },
        { name: "Site Speed Analysis", included: true },
        { name: "Advanced Analytics", included: false },
        { name: "White-label Reports", included: false },
        { name: "API Access", included: false },
        { name: "Priority Support", included: false },
      ],
      cta: "Get Started",
      highlight: false,
    },
    {
      name: "Professional",
      description: "Best for growing businesses and agencies",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      popular: false,
      isComingSoon: true,
      pricing: {
        monthly: 49,
        yearly: 490,
      },
      features: [
        { name: "25 Website Analyses per month", included: true },
        { name: "Advanced SEO Recommendations", included: true },
        { name: "Performance Monitoring", included: true },
        { name: "Priority Email Support", included: true },
        { name: "Keyword Research (200/month)", included: true },
        { name: "Site Speed Analysis", included: true },
        { name: "Advanced Analytics Dashboard", included: true },
        { name: "Competitor Analysis", included: true },
        { name: "White-label Reports", included: true },
        { name: "API Access (Limited)", included: true },
        { name: "Priority Support", included: false },
        { name: "Custom Integrations", included: false },
      ],
      cta: "Coming Soon",
      highlight: false,
    },
    {
      name: "Enterprise",
      description: "For large organizations with custom needs",
      icon: Rocket,
      color: "from-orange-500 to-red-500",
      popular: false,
      isComingSoon: true,
      pricing: {
        monthly: 99,
        yearly: 990,
      },
      features: [
        { name: "Unlimited Website Analyses", included: true },
        { name: "AI-Powered SEO Strategies", included: true },
        { name: "Advanced Performance Suite", included: true },
        { name: "24/7 Phone & Email Support", included: true },
        { name: "Unlimited Keyword Research", included: true },
        { name: "Complete Site Audit Tools", included: true },
        { name: "Advanced Analytics & Reports", included: true },
        { name: "Comprehensive Competitor Intel", included: true },
        { name: "Fully White-labeled Platform", included: true },
        { name: "Full API Access", included: true },
        { name: "Priority Support & Training", included: true },
        { name: "Custom Integrations & Webhooks", included: true },
      ],
      cta: "Coming Soon",
      highlight: false,
    },
  ];

  const features = [
    {
      icon: Globe,
      title: "Global SEO Analysis",
      description: "Analyze websites from anywhere in the world with our global infrastructure.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into your website performance with actionable recommendations.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance and data encryption.",
    },
    {
      icon: Clock,
      title: "Real-time Monitoring",
      description: "Get instant alerts when SEO issues are detected on your website.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Digital Marketing Pro",
      image: "SJ",
      text: "AI Optimizer helped us increase our organic traffic by 150% in just 3 months. The insights are incredible!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      company: "E-commerce Solutions",
      image: "MC",
      text: "The best SEO tool we've ever used. The AI recommendations are spot-on and easy to implement.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      company: "Tech Startup",
      image: "ER",
      text: "Finally, an SEO tool that actually understands our business. ROI was immediate and substantial.",
      rating: 5,
    },
  ];

  const handleGetStarted = async (planName) => {
    // If not logged in, send to register
    if (!isLoggedIn) {
        const encodedPlan = encodeURIComponent(planName || "");
        navigate(`/register${encodedPlan ? `?plan=${encodedPlan}` : ""}`);
        return;
    }

    // If logged in and selecting the Starter/Free plan
    if (planName === "Starter" || planName === "trial") {
        setIsSelecting(true);
        try {
            // Call backend to set tier to FREE
            await selectTier("FREE");
            
            // Update local user context to reflect change
            // Assuming setUser merges or we re-fetch user
            // For now, let's assuming we manually update the flag locally or force a refresh logic
            // But simpler is to just navigate to dashboard
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to select tier:", error);
            alert("Failed to select plan. Please try again.");
        } finally {
            setIsSelecting(false);
        }
    } else {
        // Handle payment plans (Pro/Enterprise) here later
        console.log("Payment required for", planName);
    }
  };

  const getSavings = (plan) => {
    const monthlyTotal = plan.pricing.monthly * 12;
    const savings = monthlyTotal - plan.pricing.yearly;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 bg-gradient-to-br from-background via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold font-inter text-foreground mb-6 leading-tight">
              Simple, Transparent{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Choose the perfect plan for your SEO optimization needs. Start with a free trial,
              no credit card required.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn("text-sm font-medium", billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground")}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  billingCycle === "yearly" ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <span className={cn("text-sm font-medium", billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground")}>
                Yearly
                <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Save up to 20%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const savings = getSavings(plan);
              const price = plan.pricing[billingCycle];
              const monthlyPrice = billingCycle === "yearly" ? price / 12 : price;

              return (
                <Card
                  key={index}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105",
                    plan.highlight ? "border-primary shadow-xl ring-2 ring-primary/20" : "hover:border-primary/50"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1 rounded-b-lg text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <CardHeader className={cn("text-center pb-8", plan.popular && "pt-8")}>
                    <div className={cn("w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-r", plan.color)}>
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                    
                    <div className="mt-6">
                      {plan.isFree ? (
                        <div className="text-4xl font-bold text-foreground">Free</div>
                      ) : plan.isComingSoon ? (
                        <div className="text-2xl font-semibold text-muted-foreground">Coming Soon</div>
                      ) : (
                        <>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold text-foreground">
                              ${Math.round(monthlyPrice)}
                            </span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                          {billingCycle === "yearly" && (
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground line-through">
                                ${plan.pricing.monthly}/month
                              </span>
                              <span className="ml-2 text-sm text-green-600 font-medium">
                                Save ${savings.amount}/year ({savings.percentage}% off)
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <Button
                      onClick={() => !plan.isComingSoon && handleGetStarted(plan.name)}
                      disabled={plan.isComingSoon || isSelecting}
                      className={cn(
                        "w-full h-12 text-lg font-semibold transition-all",
                        plan.isComingSoon
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                          : plan.highlight
                          ? "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl"
                          : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                      )}
                      variant={plan.isComingSoon ? "outline" : (plan.highlight ? "default" : "outline")}
                    >
                      {isSelecting && !plan.isComingSoon ? "Processing..." : plan.cta}
                      {!plan.isComingSoon && !isSelecting && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">What's included:</h4>
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          {feature.included ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-sm",
                            feature.included ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Choose AI Optimizer?
            </h2>
            <p className="text-xl text-muted-foreground">
              Our platform combines cutting-edge AI technology with proven SEO strategies
              to deliver exceptional results for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Trusted by 10,000+ Businesses
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers are saying about their SEO success stories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.image}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing and features.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Can I change my plan at any time?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
              },
              {
                question: "Is there a free trial available?",
                answer: "Yes! We offer a 14-day free trial for all plans. No credit card required to start your trial."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, we'll provide a full refund."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use bank-level encryption and are SOC 2 compliant. Your data is never shared with third parties without your consent."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Boost Your SEO?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of businesses already using AI Optimizer to improve their search rankings.
              Start your free trial today!
            </p>
            <Button
              onClick={() => handleGetStarted("trial")}
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 h-auto"
            >
              Start Free Trial
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm mt-4 opacity-75">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;