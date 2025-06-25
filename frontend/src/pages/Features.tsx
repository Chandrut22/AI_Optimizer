import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={false} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-inter text-foreground mb-4">
              Features
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the powerful features of our AI Optimization Platform.
              This page is coming soon with detailed feature descriptions and
              demonstrations.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
