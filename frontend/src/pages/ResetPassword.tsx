import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  X,
  CheckCircle,
  AlertCircle,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    code: z
      .string()
      .min(6, "Reset code must be 6 digits")
      .max(6, "Reset code must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

const getPasswordStrengthScore = (strength: PasswordStrength): number => {
  const criteria = Object.values(strength);
  return criteria.filter(Boolean).length;
};

const getPasswordStrengthColor = (score: number): string => {
  if (score <= 2) return "bg-red-500";
  if (score <= 3) return "bg-yellow-500";
  if (score <= 4) return "bg-blue-500";
  return "bg-green-500";
};

const getPasswordStrengthText = (score: number): string => {
  if (score <= 2) return "Weak";
  if (score <= 3) return "Fair";
  if (score <= 4) return "Good";
  return "Strong";
};

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({
  password,
}) => {
  const strength = checkPasswordStrength(password);
  const score = getPasswordStrengthScore(strength);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#6B7280] dark:text-[#94A3B8]">
            Password strength
          </span>
          <span
            className={cn(
              "font-medium",
              score <= 2 && "text-red-500",
              score === 3 && "text-yellow-500",
              score === 4 && "text-blue-500",
              score === 5 && "text-green-500",
            )}
          >
            {getPasswordStrengthText(score)}
          </span>
        </div>
        <div className="h-2 bg-[#F3F4F6] dark:bg-[#334155] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out",
              getPasswordStrengthColor(score),
            )}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        <div
          className={cn(
            "flex items-center gap-2",
            strength.hasMinLength
              ? "text-green-600 dark:text-green-400"
              : "text-[#6B7280] dark:text-[#94A3B8]",
          )}
        >
          {strength.hasMinLength ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span>At least 8 characters</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-2",
            strength.hasUppercase
              ? "text-green-600 dark:text-green-400"
              : "text-[#6B7280] dark:text-[#94A3B8]",
          )}
        >
          {strength.hasUppercase ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span>Uppercase letter</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-2",
            strength.hasLowercase
              ? "text-green-600 dark:text-green-400"
              : "text-[#6B7280] dark:text-[#94A3B8]",
          )}
        >
          {strength.hasLowercase ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span>Lowercase letter</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-2",
            strength.hasNumber
              ? "text-green-600 dark:text-green-400"
              : "text-[#6B7280] dark:text-[#94A3B8]",
          )}
        >
          {strength.hasNumber ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span>Number</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-2",
            strength.hasSymbol
              ? "text-green-600 dark:text-green-400"
              : "text-[#6B7280] dark:text-[#94A3B8]",
          )}
        >
          {strength.hasSymbol ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
};

const ResetPassword: React.FC = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get state from navigation (from email verification page)
  const locationState = location.state as { email?: string } | null;
  const initialEmail = locationState?.email || "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: initialEmail,
    },
  });

  const newPassword = watch("newPassword", "");

  const onSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Demo: Simulate different responses based on input
          if (data.code !== "123456") {
            reject(new Error("Invalid reset code"));
          } else if (data.email === "notfound@example.com") {
            reject(new Error("Email not found"));
          } else {
            resolve(true);
          }
        }, 2000);
      });

      setIsSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid reset code") {
          setErrorMessage(
            "Invalid reset code. Please check your email and try again.",
          );
        } else if (error.message === "Email not found") {
          setErrorMessage("This email is not registered.");
        } else {
          setErrorMessage("Failed to reset password. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] flex flex-col">
        <Header isLoggedIn={false} />
        <main className="flex-1 flex items-center justify-center p-4 py-24">
          <div className="w-full max-w-md">
            <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#D1D5DB] dark:border-[#475569] rounded-xl shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-semibold font-inter text-[#111827] dark:text-[#F8FAFC] mb-4">
                  Password Reset Successfully!
                </h1>
                <p className="text-[#6B7280] dark:text-[#94A3B8] mb-6 leading-relaxed">
                  Your password has been reset successfully. You can now use
                  your new password to sign in to your account.
                </p>
                <Link to="/login">
                  <Button className="w-full bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white font-medium">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] flex flex-col">
      <Header isLoggedIn={false} />
      <main className="flex-1 flex items-center justify-center p-4 py-24">
        <div className="w-full max-w-md">
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#D1D5DB] dark:border-[#475569] rounded-xl shadow-lg p-8">
            {/* Header */}
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
                  <Key className="h-6 w-6 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-semibold font-inter text-[#111827] dark:text-[#F8FAFC] mb-2">
                Reset your password
              </h1>
              <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm leading-relaxed">
                Enter the code sent to your email along with your new password.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Reset Password Form */}
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
                  placeholder="you@example.com"
                  className={cn(
                    "rounded-lg bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569]",
                    "text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#94A3B8]",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    (errors.email || errorMessage) &&
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

              {/* Reset Code Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="code"
                  className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]"
                >
                  Reset Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  className={cn(
                    "rounded-lg bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569]",
                    "text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#94A3B8]",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    (errors.code || errorMessage) &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  )}
                  {...register("code")}
                />
                {errors.code && (
                  <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.code.message}
                  </div>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={cn(
                      "rounded-lg bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569] pr-10",
                      "text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#94A3B8]",
                      "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      errors.newPassword &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    )}
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.newPassword.message}
                  </div>
                )}

                {/* Password Strength Indicator */}
                <PasswordStrengthIndicator password={newPassword} />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className={cn(
                      "rounded-lg bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569] pr-10",
                      "text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#6B7280] dark:placeholder:text-[#94A3B8]",
                      "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      errors.confirmPassword &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    )}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>

              {/* Submit Button */}
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
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            {/* Additional Help */}
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

            {/* Demo Instructions */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                  Demo Instructions
                </p>
                <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                  <p>• Use reset code "123456" to succeed</p>
                  <p>• Use "notfound@example.com" to test error</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
              Need help?{" "}
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

export default ResetPassword;
