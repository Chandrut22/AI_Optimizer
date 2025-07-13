import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const verificationSchema = z.object({
  code: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits"),
});

const VerificationCodeInput = ({ value, onChange, error }) => {
  const [codes, setCodes] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value.length <= 6) {
      const newCodes = value.split("").concat(Array(6).fill("")).slice(0, 6);
      setCodes(newCodes);
    }
  }, [value]);

  const handleChange = (index, newValue) => {
    if (newValue && !/^\d$/.test(newValue)) return;

    const newCodes = [...codes];
    newCodes[index] = newValue;
    setCodes(newCodes);

    onChange(newCodes.join(""));

    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCodes = digits.split("").concat(Array(6).fill("")).slice(0, 6);
    setCodes(newCodes);
    onChange(digits);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
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
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            code && "border-primary bg-primary/5"
          )}
        />
      ))}
    </div>
  );
};

const EmailVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state || {};
  const isPasswordReset = locationState?.type === "password-reset";
  const userEmail = locationState?.email || "your email";
  const customMessage = locationState?.message;

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verificationSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (verificationCode) clearErrors("code");
  }, [verificationCode, clearErrors]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          data.code === "123456" ? resolve(true) : reject(new Error("Invalid code"));
        }, 2000);
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate(isPasswordReset ? "/reset-password" : "/dashboard", {
          state: isPasswordReset ? { email: userEmail, verifiedCode: data.code } : undefined,
        });
      }, 2000);
    } catch (error) {
      setError("code", { type: "manual", message: "Invalid verification code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResendCooldown(60);
      clearErrors("code");
      setVerificationCode("");
      console.log("Verification code sent to:", userEmail);
    } catch {
      console.error("Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  const isFormValid = verificationCode.length === 6;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={false} />
      <main className="flex-1 flex items-center justify-center p-4 py-24">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl shadow-lg p-8">
            {isSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-semibold mb-4">
                  {isPasswordReset ? "Code Verified Successfully!" : "Email Verified Successfully!"}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {isPasswordReset ? "Reset code verified. Set a new password." : "Redirecting to dashboard..."}
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <Link
                    to={isPasswordReset ? "/forgot-password" : "/register"}
                    className="flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {isPasswordReset ? "Back" : "Back to Register"}
                  </Link>
                  <div className="mt-6">
                    <Mail className="h-6 w-6 mx-auto text-primary" />
                    <h1 className="text-2xl font-semibold mt-4">
                      {isPasswordReset ? "Enter Reset Code" : "Verify Your Email"}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2">
                      {(customMessage || (isPasswordReset ? "We sent a reset code to" : "We sent a verification code to"))}
                    </p>
                    <p className="font-medium text-lg mt-1">{userEmail}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC] block text-center">
                        Verification Code
                    </Label>
                    <VerificationCodeInput
                      value={verificationCode}
                      onChange={setVerificationCode}
                      error={!!errors.code}
                    />
                    <input type="hidden" {...register("code")} value={verificationCode} />
                    {errors.code && (
                      <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-2">
                        <AlertCircle className="h-3 w-3" /> {errors.code.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={!isFormValid || isLoading} className="w-full">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </div>
                    ) : isPasswordReset ? "Verify Reset Code" : "Verify Email"}
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-4">
                  <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
                  <Button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading || resendCooldown > 0}
                    variant="outline"
                    className="w-full"
                  >
                    {resendLoading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Sending Code...
                      </div>
                    ) : resendCooldown > 0 ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Resend Code ({resendCooldown}s)
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Resend Code
                      </div>
                    )}
                  </Button>

                  {resendCooldown > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Please wait {resendCooldown} seconds before requesting a new code
                    </p>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Having trouble? Check your spam folder or {" "}
                    <Link to="/contact" className="text-primary hover:underline">
                      contact support
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border rounded-lg text-center">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
              Demo: Use code "123456" to verify
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Email: {userEmail}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerification;
