import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { registerUser } from "@/api/auth";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol (@$!%*?& only)"
    ),
});

// Added GoogleIcon component
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const checkPasswordStrength = (password) => {
  const allowedSymbols = "@$!%*?&";
  const symbolRegex = new RegExp(`[${allowedSymbols.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
  const allowedCharactersRegex = /^[A-Za-z\d@$!%*?&]+$/;

  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: symbolRegex.test(password),
    isOnlyAllowedCharacters: allowedCharactersRegex.test(password),
  };
};

const getPasswordStrengthScore = (strength) => Object.values(strength).filter(Boolean).length;

const getPasswordStrengthText = (score) => {
  if (score <= 2) return "Weak";
  if (score <= 3) return "Fair";
  if (score <= 4) return "Good";
  return "Strong";
};

const getPasswordStrengthColor = (score) => {
  if (score <= 2) return "bg-red-500";
  if (score <= 3) return "bg-yellow-500";
  if (score <= 4) return "bg-blue-500";
  return "bg-green-500";
};

const PasswordStrengthIndicator = ({ password }) => {
  const strength = checkPasswordStrength(password);
  const score = getPasswordStrengthScore(strength);
  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
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
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300 ease-out", getPasswordStrengthColor(score))}
            style={{ width: `${(score / 6) * 100}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        {[
          { label: "At least 8 characters", check: strength.hasMinLength },
          { label: "Uppercase letter", check: strength.hasUppercase },
          { label: "Lowercase letter", check: strength.hasLowercase },
          { label: "Number", check: strength.hasNumber },
          { label: "Special character (@$!%*?&)", check: strength.hasSymbol },
          { label: "Only allowed characters", check: strength.isOnlyAllowedCharacters },
        ].map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2",
              item.check ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}
          >
            {item.check ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Added isGoogleLoading state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(registrationSchema), mode: "onChange" });

  const password = watch("password", "");

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // ✅ Call the API
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // ✅ Registration success – Navigate to verification page
      navigate("/verify-email", {
        state: {
          email: data.email,
          message: "Registration successful. Please check your email for the verification code.",
        },
      });

    } catch (error) {
      // ✅ Logic updated to match Backend Controller behavior
      const status = error.status || error.response?.status;
      const backendMessage = typeof error.response?.data === 'string' 
        ? error.response?.data 
        : (error.response?.data?.message || "Something went wrong.");

      console.error("Registration failed:", backendMessage);

      // Handle specific status codes from AuthenticationController
      if (status === 409 || backendMessage.includes("Email already in use")) {
        setError("email", {
          type: "manual",
          message: "This email is already registered.",
        });
      } else if (status === 400) {
        // Bad Request - often validation issues
         alert(backendMessage);
      } else {
        // General fallback
        alert(backendMessage || "Registration failed. Please try again.");
      }

    } finally {
      setIsLoading(false);
    }
  };

  // Added Google login handler
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = "https://optimizer.koyeb.app/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={false} />
      <main className="flex-1 flex items-center justify-center p-4 py-24">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold font-inter text-card-foreground mb-2">
                Create Your Account
              </h1>
              <p className="text-muted-foreground text-sm">
                Join our AI Optimization Platform and start transforming your workflow
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                  className={cn(errors.name && "border-red-500 focus:ring-red-500")}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register("email")}
                  className={cn(errors.email && "border-red-500 focus:ring-red-500")}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    {...register("password")}
                    className={cn("pr-10", errors.password && "border-red-500 focus:ring-red-500")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                <PasswordStrengthIndicator password={password} />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Added Divider and Google Button */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="px-4 text-sm text-muted-foreground bg-card">
                or
              </span>
              <div className="flex-1 border-t border-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className={cn(
                "w-full h-12 rounded-lg font-medium transition-all duration-200",
                "bg-card border border-border text-card-foreground hover:bg-muted",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !isGoogleLoading && "transform hover:scale-[1.02]"
              )}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  Signing in with Google...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <GoogleIcon />
                  Continue with Google
                </div>
              )}
            </Button>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">Log in</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;