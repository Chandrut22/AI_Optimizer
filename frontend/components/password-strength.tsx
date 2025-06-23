"use client"

import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { label: "One uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "One lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "One number", test: (pwd: string) => /\d/.test(pwd) },
    { label: "One special character", test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ]

  const getStrengthColor = () => {
    const passedCount = requirements.filter((req) => req.test(password)).length
    if (passedCount <= 2) return "text-red-600"
    if (passedCount <= 4) return "text-yellow-600"
    return "text-green-600"
  }

  const getStrengthText = () => {
    const passedCount = requirements.filter((req) => req.test(password)).length
    if (passedCount <= 2) return "Weak"
    if (passedCount <= 4) return "Medium"
    return "Strong"
  }

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className={`text-sm font-medium ${getStrengthColor()}`}>Password Strength: {getStrengthText()}</div>
      <div className="space-y-1">
        {requirements.map((req, index) => {
          const passed = req.test(password)
          return (
            <div key={index} className="flex items-center text-xs">
              {passed ? <Check className="h-3 w-3 text-green-600 mr-2" /> : <X className="h-3 w-3 text-red-600 mr-2" />}
              <span className={passed ? "text-green-600" : "text-red-600"}>{req.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
