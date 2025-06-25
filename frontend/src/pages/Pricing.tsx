import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={false} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-inter text-foreground mb-4">
              Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your optimization needs. Detailed
              pricing plans and features comparison coming soon.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
