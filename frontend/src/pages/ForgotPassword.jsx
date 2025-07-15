import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { forgotPassword } from "@/api/auth"; 


const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const email = watch("email", "");


const onSubmit = async (data) => {
  setIsLoading(true);
  setErrorMessage(null);

  try {
    const res = await forgotPassword(data.email);

    if (res.status === 200) {
      navigate("/verify-email", {
        state: {
          email: data.email,
          type: "password-reset",
          message: res.message || "Reset code sent to your email. Please check your inbox.",
        },
      });
    }
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || "Something went wrong. Please try again.";

    if (status === 404) {
      setErrorMessage("This email is not registered.");
    } else if (status === 500) {
      setErrorMessage("Failed to send verification email. Please try again.");
    } else {
      setErrorMessage(message);
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] flex flex-col">
      <Header isLoggedIn={false} />
      <main className="flex-1 flex items-center justify-center p-4 py-24">
        <div className="w-full max-w-md">
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#D1D5DB] dark:border-[#475569] rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-between items-center mb-6">
                <Link
                  to="/login"
                  className="flex items-center text-[#6B7280] dark:text-[#94A3B8] hover:text-[#38BDF8] transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-semibold font-inter text-[#111827] dark:text-[#F8FAFC] mb-2">
                Forgot your password?
              </h1>
              <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm leading-relaxed">
                Enter your email address and we'll send you a reset code.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "rounded-lg bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569]",
                    "text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#94A3B8]",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    (errors.email || errorMessage) &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  )}
                  {...register("email")}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={!email || isLoading}
                className={cn(
                  "w-full h-12 rounded-lg font-semibold text-white transition-all duration-200",
                  "bg-[#38BDF8] hover:bg-[#38BDF8]/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  email && !isLoading && "transform hover:scale-[1.02]"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Reset Code...
                  </div>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-[#38BDF8] font-medium hover:text-[#38BDF8]/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                  Demo Instructions
                </p>
                <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                  <p>• Use any valid email to see success</p>
                  <p>• Use "notfound@example.com" to test error</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
              Having trouble?{" "}
              <Link
                to="/contact"
                className="text-[#38BDF8] hover:underline transition-colors"
              >
                Contact support
              </Link>{" "}
              for assistance
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
