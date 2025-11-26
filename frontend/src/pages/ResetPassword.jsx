/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { setNewPassword } from "@/api/auth";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[@$!%*?&]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email and verified code from the previous step
  const { email, verifiedCode } = location.state || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    if (!email || !verifiedCode) {
        setErrorMessage("Missing verification details. Please try the process again.");
        return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // ✅ Call the updated API function
      await setNewPassword({
        email: email,
        code: verifiedCode,
        newPassword: data.password,
      });

      setSuccess(true);
      
      // Redirect to login after delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (error) {
      const msg = typeof error === 'string' 
        ? error 
        : (error.message || "Password reset failed. Please try again.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A] flex flex-col">
        <Header isLoggedIn={false} />
        <main className="flex-1 flex items-center justify-center p-4 py-24">
          <div className="w-full max-w-md text-center bg-card border rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
               <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Password Reset Complete</h1>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login Now
            </Button>
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
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold font-inter text-[#111827] dark:text-[#F8FAFC] mb-2">
                Set New Password
              </h1>
              <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm">
                Create a new strong password for your account.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pr-10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11">
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;