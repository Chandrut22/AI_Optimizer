import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Demo: Accept specific credentials for testing
          if (
            data.email === "demo@example.com" &&
            data.password === "password123"
          ) {
            resolve(true);
          } else {
            reject(new Error("Invalid credentials"));
          }
        }, 1500);
      });

      // Success - redirect to dashboard
      console.log("Login successful:", data);
      navigate("/dashboard");
    } catch (error) {
      setLoginError("Incorrect email or password. Please try again.");
      setError("email", { type: "manual", message: "" });
      setError("password", { type: "manual", message: "" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setLoginError(null);

    try {
      // Simulate Google OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Google login successful");
      navigate("/dashboard");
    } catch (error) {
      setLoginError("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] flex flex-col">
      <Header isLoggedIn={false} />
      <main className="flex-1 flex items-center justify-center p-4 py-24">
        <div className="w-full max-w-md">
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#D1D5DB] dark:border-[#475569] rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-semibold font-inter text-[#111827] dark:text-[#F8FAFC] mb-2">
                Sign in to your account
              </h1>
              <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm leading-relaxed">
                Access the AI tools for SEO and GEO optimization
              </p>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {loginError}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
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
                  placeholder="Enter your email address"
                  className={cn(
                    "rounded-lg bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569]",
                    "text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#94A3B8]",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    (errors.email || loginError) &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500/20",
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

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={cn(
                      "rounded-lg bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569] pr-10",
                      "text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#94A3B8]",
                      "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      (errors.password || loginError) &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    )}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </div>
                )}

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#38BDF8] hover:text-[#38BDF8]/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 rounded-lg font-semibold text-white transition-all duration-200",
                  "bg-[#38BDF8] hover:bg-[#38BDF8]/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  !isLoading && "transform hover:scale-[1.02]",
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-[#D1D5DB] dark:border-[#475569]" />
              <span className="px-4 text-sm text-[#6B7280] dark:text-[#94A3B8] bg-[#FFFFFF] dark:bg-[#1E293B]">
                or
              </span>
              <div className="flex-1 border-t border-[#D1D5DB] dark:border-[#475569]" />
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className={cn(
                "w-full h-12 rounded-lg font-medium transition-all duration-200",
                "bg-[#FFFFFF] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569]",
                "text-[#111827] dark:text-[#F8FAFC] hover:bg-[#F3F4F6] dark:hover:bg-[#475569]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !isGoogleLoading && "transform hover:scale-[1.02]",
              )}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-[#6B7280]/30 border-t-[#6B7280] rounded-full animate-spin" />
                  Signing in with Google...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <GoogleIcon />
                  Continue with Google
                </div>
              )}
            </Button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#38BDF8] font-medium hover:text-[#38BDF8]/80 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                  Demo Credentials
                </p>
                <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                  <p>Email: demo@example.com</p>
                  <p>Password: password123</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
              Need help?{" "}
              <Link
                to="/contact"
                className="text-[#38BDF8] hover:underline transition-colors"
              >
                Contact support
              </Link>{" "}
              or{" "}
              <Link
                to="/verify-email"
                className="text-[#38BDF8] hover:underline transition-colors"
              >
                verify your email
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
