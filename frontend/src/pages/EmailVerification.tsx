import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const verificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits"),
});

type VerificationData = z.infer<typeof verificationSchema>;

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const [codes, setCodes] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update codes when value changes from external source
  useEffect(() => {
    if (value.length <= 6) {
      const newCodes = value.split("").concat(Array(6).fill("")).slice(0, 6);
      setCodes(newCodes);
    }
  }, [value]);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    if (newValue && !/^\d$/.test(newValue)) return;

    const newCodes = [...codes];
    newCodes[index] = newValue;
    setCodes(newCodes);

    // Update parent component
    const codeString = newCodes.join("");
    onChange(codeString);

    // Auto-focus next input
    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newCodes = digits.split("").concat(Array(6).fill("")).slice(0, 6);
      setCodes(newCodes);
      onChange(digits);

      // Focus the next empty input or the last one
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {codes.map((code, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569]",
            "text-[#111827] dark:text-[#F8FAFC]",
            "hover:border-primary/50 focus:border-primary",
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            code && "border-primary bg-primary/5",
          )}
        />
      ))}
    </div>
  );
};

const EmailVerification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");
  const location = useLocation();

  // Get state from navigation (from forgot password page)
  const locationState = location.state as {
    email?: string;
    type?: string;
    message?: string;
  } | null;

  const isPasswordReset = locationState?.type === "password-reset";
  const initialEmail = locationState?.email || "";
  const customMessage = locationState?.message;

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
    mode: "onChange",
    defaultValues: {
      email: initialEmail,
    },
  });

  const email = watch("email", initialEmail);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Update form value when verification code changes
  useEffect(() => {
    if (verificationCode) {
      clearErrors("code");
    }
  }, [verificationCode, clearErrors]);

  const onSubmit = async (data: VerificationData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success for code "123456"
          if (data.code === "123456") {
            resolve(true);
          } else {
            reject(new Error("Invalid verification code"));
          }
        }, 2000);
      });

      setIsSuccess(true);

      // Redirect after success
      setTimeout(() => {
        if (isPasswordReset) {
          navigate("/reset-password", {
            state: {
              email: data.email,
              verifiedCode: data.code,
            },
          });
        } else {
          console.log("Redirecting to dashboard...");
          // navigate("/dashboard");
        }
      }, 2000);
    } catch (error) {
      setError("code", {
        type: "manual",
        message: "Invalid verification code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;

    setResendLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      console.error("Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  const isFormValid = email && verificationCode.length === 6;

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
                  {isPasswordReset
                    ? "Code Verified Successfully!"
                    : "Email Verified Successfully!"}
                </h1>
                <p className="text-[#6B7280] dark:text-[#94A3B8] mb-6">
                  {isPasswordReset
                    ? "Your reset code has been verified. You can now set a new password."
                    : "Your email has been verified. Redirecting you to your dashboard..."}
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
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
                  to={isPasswordReset ? "/forgot-password" : "/login"}
                  className="flex items-center text-[#6B7280] dark:text-[#94A3B8] hover:text-[#38BDF8] transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isPasswordReset
                    ? "Back to Forgot Password"
                    : "Back to Login"}
                </Link>
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-semibold font-inter text-[#111827] dark:text-[#F8FAFC] mb-2">
                {isPasswordReset ? "Enter Reset Code" : "Verify Your Email"}
              </h1>
              <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm leading-relaxed">
                {customMessage ||
                  (isPasswordReset
                    ? "Enter the reset code sent to your email address to continue."
                    : "Enter the code sent to your email address to complete registration.")}
              </p>
            </div>

            {/* Verification Form */}
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
                    errors.email &&
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

              {/* Verification Code Field */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]">
                  Verification code
                </Label>
                <VerificationCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  error={!!errors.code}
                />
                <input
                  type="hidden"
                  {...register("code")}
                  value={verificationCode}
                />
                {errors.code && (
                  <div className="flex items-center justify-center gap-2 text-xs text-red-500 mt-2">
                    <AlertCircle className="h-3 w-3" />
                    {errors.code.message}
                  </div>
                )}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mb-2">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={!email || resendLoading || resendCooldown > 0}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    !email || resendLoading || resendCooldown > 0
                      ? "text-[#6B7280] dark:text-[#94A3B8] cursor-not-allowed"
                      : "text-[#38BDF8] hover:text-[#38BDF8]/80 cursor-pointer",
                  )}
                >
                  {resendLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                      Sending...
                    </span>
                  ) : resendCooldown > 0 ? (
                    `Resend code (${resendCooldown}s)`
                  ) : (
                    "Resend code"
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={cn(
                  "w-full h-12 rounded-lg font-semibold text-white transition-all duration-200",
                  "bg-[#38BDF8] hover:bg-[#38BDF8]/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isFormValid && !isLoading && "transform hover:scale-[1.02]",
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isPasswordReset ? "Verifying Code..." : "Verifying..."}
                  </div>
                ) : isPasswordReset ? (
                  "Verify Reset Code"
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                Having trouble? Check your spam folder or{" "}
                <Link
                  to="/contact"
                  className="text-[#38BDF8] hover:underline transition-colors"
                >
                  contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerification;
