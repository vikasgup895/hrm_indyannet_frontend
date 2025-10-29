/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { Eye, EyeOff, Shield, User, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { set, token, load } = useAuth();
  const router = useRouter();

  // Restore session on refresh
  useEffect(() => {
    load();
    if (token) router.push("/dashboard");
  }, [token]);

  // Demo users (for local testing)
  const demoUsers = [
    { role: "ADMIN", email: "admin@hrm.local", password: "Admin@123" },
    { role: "EMPLOYEE", email: "shiva@hrm.local", password: "password123" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      set(data.access_token, data.role);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(
        error?.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoUser: any) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[var(--text-muted)]">
            Sign in to your Telecom HRM account
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl shadow-xl p-8 space-y-6 border border-[var(--border-color)] bg-[var(--card-bg)] transition-colors"
        >
          {/* Email Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="w-4 h-4 text-[var(--text-muted)]" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[var(--text-muted)]">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-[var(--card-bg)] border-[var(--border-color)] rounded focus:ring-blue-500 focus:ring-2"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 ${
              loading
                ? "bg-blue-800 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Accounts Section 
        <div className="mt-8 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 transition-colors">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">Demo Accounts</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Click to auto-fill credentials
            </p>
          </div>

          <div className="space-y-3">
            {demoUsers.map((user) => (
              <button
                key={user.role}
                type="button"
                onClick={() => handleDemoLogin(user)}
                className="w-full p-4 bg-[var(--background)] hover:bg-[var(--hover-bg)] border border-[var(--border-color)] rounded-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      user.role === "ADMIN"
                        ? "bg-red-900/30 text-red-400"
                        : "bg-blue-900/30 text-blue-400"
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">
                          {user.role === "ADMIN" ? "Administrator" : "Employee"}
                        </p>
                        <p className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] border border-[var(--border-color)] px-2 py-1 rounded">
                        {user.role}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        */}

        {/* Footer */}
        <div className="text-center mt-8 text-[var(--text-muted)]">
          <p className="text-sm">Protected by enterprise-grade security</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-xs">SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
