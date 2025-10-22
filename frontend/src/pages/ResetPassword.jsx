/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { setNewPassword } from "@/api/auth"; // adjust path if needed


// Utility Functions
const checkPasswordStrength = (password) => ({
  hasMinLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
});

const getPasswordStrengthScore = (strength) =>
  Object.values(strength).filter(Boolean).length;

const getPasswordStrengthColor = (score) => {
  if (score <= 2) return "bg-red-500";
  if (score <= 3) return "bg-yellow-500";
  if (score <= 4) return "bg-blue-500";
  return "bg-green-500";
};

const getPasswordStrengthText = (score) => {
  if (score <= 2) return "Weak";
  if (score <= 3) return "Fair";
  if (score <= 4) return "Good";
  return "Strong";
};

const PasswordStrengthIndicator = ({ password }) => {
  const strength = checkPasswordStrength(password);
  const score = getPasswordStrengthScore(strength);
  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#6B7280] dark:text-[#94A3B8]">Password strength</span>
          <span
            className={cn(
              "font-medium",
              score <= 2 && "text-red-500",
              score === 3 && "text-yellow-500",
              score === 4 && "text-blue-500",
              score === 5 && "text-green-500"
            )}
          >
            {getPasswordStrengthText(score)}
          </span>
        </div>
        <div className="h-2 bg-[#F3F4F6] dark:bg-[#334155] rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300 ease-out", getPasswordStrengthColor(score))}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        {Object.entries(strength).map(([key, value]) => {
          const labelMap = {
            hasMinLength: "At least 8 characters",
            hasUppercase: "Uppercase letter",
            hasLowercase: "Lowercase letter",
            hasNumber: "Number",
            hasSymbol: "Special character",
          };
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-2",
                value ? "text-green-600 dark:text-green-400" : "text-[#6B7280] dark:text-[#94A3B8]"
              )}
            >
              {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>{labelMap[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResetPassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state || {};
  const initialEmail = locationState.email || "";
  const verifiedCode = locationState.verifiedCode;

  useEffect(() => {
    if (!verifiedCode) {
      navigate("/forgot-password");
    }
  }, [verifiedCode, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { email: initialEmail },
  });

  const newPassword = watch("newPassword", "");


const onSubmit = async (data) => {
  const { email, newPassword, confirmPassword } = data;

  // Email validation
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    setErrorMessage("Please enter a valid email address");
    return;
  }

  // Password validation
  if (newPassword.length < 8) {
    setErrorMessage("Password must be at least 8 characters");
    return;
  }

  if (newPassword !== confirmPassword) {
    setErrorMessage("Passwords do not match");
    return;
  }

  setIsLoading(true);
  setErrorMessage(null);

  try {
  const response = await setNewPassword({ email, newPassword });
  console.log("Password reset response:", response);

  setIsSuccess(true); // Show success message or UI state
} catch (error) {
  const errMsg =
    error?.response?.data?.error || // from backend Map.of("error", ...)
    error?.response?.data?.message || // fallback
    "Something went wrong. Please try again.";

  console.error("Password reset failed:", errMsg);

  if (errMsg.includes("Reset code not verified")) {
    setErrorMessage("Please verify the reset code before setting a new password.");
  } else if (errMsg.includes("User not found")) {
    setErrorMessage("User not found. Please check your email and try again.");
  } else {
    setErrorMessage(errMsg);
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
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-semibold text-[#111827] dark:text-white mb-4">
                Password Reset Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your password has been reset successfully. You can now sign in.
              </p>
              <Link to="/login">
                <Button className="w-full bg-[#38BDF8] text-white">Return to Login</Button>
              </Link>
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
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-between items-center mb-6">
                <Link to="/verify-email" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-[#38BDF8]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Key className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-[#111827] dark:text-white mb-2">
                Set Your New Password
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your code has been verified. Now create a new password.
              </p>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="h-4 w-4 inline-block mr-1" />
                Reset code verified successfully
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 inline-block mr-1" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register("email")} placeholder="Enter email" />
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    {...register("newPassword")}
                    placeholder="Create password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={newPassword} />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Confirm password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{" "}
              <Link to="/login" className="text-[#38BDF8] font-medium">Sign in</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
