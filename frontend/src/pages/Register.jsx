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
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { registerUser } from "@/api/auth"; 

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const checkPasswordStrength = (password) => ({
  hasMinLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  // eslint-disable-next-line no-useless-escape
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
            className={cn(
              "h-full transition-all duration-300 ease-out",
              getPasswordStrengthColor(score)
            )}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        {[
          { label: "At least 8 characters", check: strength.hasMinLength },
          { label: "Uppercase letter", check: strength.hasUppercase },
          { label: "Lowercase letter", check: strength.hasLowercase },
          { label: "Number", check: strength.hasNumber },
          { label: "Special character", check: strength.hasSymbol },
        ].map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2",
              item.check
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
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
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    console.log("Registered successfully:", result);
    navigate("/verify-email");
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
  } finally {
    setIsLoading(false);
  }
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
                Join our AI Optimization Platform and start transforming your
                workflow
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={cn(
                    "rounded-xl border-border",
                    errors.name && "border-red-500 focus-visible:ring-red-500"
                  )}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className={cn(
                    "rounded-xl border-border",
                    errors.email && "border-red-500 focus-visible:ring-red-500"
                  )}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={cn(
                      "rounded-xl border-border pr-10",
                      errors.password &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}

                <PasswordStrengthIndicator password={password} />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button className="text-primary font-medium hover:underline transition-colors">
                  Log in
                </button>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <button className="text-primary hover:underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-primary hover:underline">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
