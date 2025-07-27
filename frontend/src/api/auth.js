// Mock authentication functions for demo purposes
// All functions simulate API responses without real backend calls

export const loginUser = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Demo credentials
  if (email === "demo@example.com" && password === "password123") {
    return {
      accessToken: "demo_access_token_12345",
      refreshToken: "demo_refresh_token_67890",
      user: {
        id: 1,
        name: "Demo User",
        email: "demo@example.com"
      }
    };
  }
  
  // Simulate different error scenarios for demo
  if (email === "unverified@example.com") {
    const error = new Error("Email verification required");
    error.response = { status: 403, data: { message: "Please verify your email before logging in." } };
    throw error;
  }
  
  if (email === "notfound@example.com") {
    const error = new Error("User not found");
    error.response = { status: 404, data: { message: "User not found." } };
    throw error;
  }
  
  // Invalid credentials
  const error = new Error("Invalid credentials");
  error.response = { status: 401, data: { message: "Incorrect email or password." } };
  throw error;
};

export const registerUser = async ({ name, email, password }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Demo validation
  if (email === "existing@example.com") {
    const error = new Error("Email already exists");
    error.response = { status: 400, data: { message: "Email already exists" } };
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("Password too short");
    error.response = { status: 400, data: { message: "Password must be at least 8 characters" } };
    throw error;
  }

  return {
    status: 200,
    message: "Registration successful. Please check your email for verification code.",
    user: {
      name,
      email
    }
  };
};

export const verifyEmailCode = async ({ email, code, type }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Demo verification - accept "123456" as valid code
  if (code === "123456") {
    return {
      status: 200,
      message: type === "reset" ? "Reset code verified successfully" : "Email verified successfully"
    };
  }

  // Simulate expired code
  if (code === "000000") {
    const error = new Error("Code expired");
    error.response = { 
      status: 400, 
      data: { message: type === "reset" ? "Reset code expired" : "Verification code expired" } 
    };
    throw error;
  }

  // Invalid code
  const error = new Error("Invalid code");
  error.response = { 
    status: 400, 
    data: { message: type === "reset" ? "Invalid reset code" : "Invalid verification code" } 
  };
  throw error;
};

export const resendVerificationCode = async (email) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  if (email === "notfound@example.com") {
    const error = new Error("User not found");
    error.response = { status: 404, data: { message: "User not found" } };
    throw error;
  }

  if (email === "verified@example.com") {
    const error = new Error("Already verified");
    error.response = { status: 400, data: { message: "User already verified" } };
    throw error;
  }

  return {
    status: 200,
    message: "Verification code sent successfully"
  };
};

export const forgotPassword = async (email) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (email === "notfound@example.com") {
    const error = new Error("User not found");
    error.response = { status: 404, data: { message: "This email is not registered." } };
    throw error;
  }

  return {
    status: 200,
    message: "Reset code sent to your email"
  };
};

export const setNewPassword = async ({ email, newPassword }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  if (!email || !newPassword) {
    const error = new Error("Missing fields");
    error.response = { status: 400, data: { message: "Email and password are required" } };
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error("Password too short");
    error.response = { status: 400, data: { message: "Password must be at least 8 characters" } };
    throw error;
  }

  return {
    status: 200,
    message: "Password updated successfully"
  };
};
