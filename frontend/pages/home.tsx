"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "../components/navigation"
import { useAuth } from "../context/auth-context"
import { Search, MapPin, Mic, BarChart3, Zap, Shield } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI-Powered Optimization Suite
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Boost your online presence with our advanced AI tools for SEO, GEO, and VEO optimization. Get data-driven
            insights and actionable recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Optimization Tools</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Search className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>SEO Optimizer</CardTitle>
                <CardDescription>
                  Improve your search engine rankings with AI-driven keyword analysis and content optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Keyword research & analysis</li>
                  <li>• Meta tag optimization</li>
                  <li>• Content scoring</li>
                  <li>• Competitor analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>GEO Optimizer</CardTitle>
                <CardDescription>
                  Dominate local search results with location-based optimization strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Local SEO optimization</li>
                  <li>• Google My Business insights</li>
                  <li>• Location-based keywords</li>
                  <li>• Review management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Mic className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>VEO Optimizer</CardTitle>
                <CardDescription>Optimize for voice search and conversational queries with advanced AI</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Voice search optimization</li>
                  <li>• Natural language processing</li>
                  <li>• Featured snippet targeting</li>
                  <li>• Conversational content</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AI Optimizer?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Data-Driven Insights</h3>
              <p className="text-muted-foreground">
                Get actionable recommendations based on real-time data analysis and AI-powered insights
              </p>
            </div>
            <div className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimize your content in seconds with our high-performance AI algorithms
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Your data is protected with enterprise-grade security and privacy measures
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses already using AI Optimizer to boost their online presence
          </p>
          {!user && (
            <Button size="lg" asChild>
              <Link to="/register">Start Your Free Trial</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 AI Optimizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
