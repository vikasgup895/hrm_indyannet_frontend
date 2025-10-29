/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Settings,
  ShieldCheck,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Save,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeProvider";
import { useRouter } from "next/navigation";

export default function SettingsEmployeePage() {
  const { token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(
        "/employees/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message || "Password updated successfully ✅");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(
        err.response?.data?.message || "Failed to change password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen py-10 px-6 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="text-blue-500 w-7 h-7" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <p className="text-gray-500 dark:text-gray-400">
          Manage your account preferences, appearance, and security options.
        </p>

        {/* Main Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-md p-8 space-y-8 transition-all duration-300">
          {/* 🌗 Theme Section */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]">
              <ShieldCheck className="text-green-400 w-5 h-5" /> Appearance
            </h2>
            <div className="flex items-center justify-between bg-[var(--background)] border border-[var(--border-color)] rounded-lg p-4">
              <span className="text-[var(--text-primary)] font-medium">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-all"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4" /> Switch to Light
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" /> Switch to Dark
                  </>
                )}
              </button>
            </div>
          </section>

          {/* 🔐 Change Password */}
          <section className="space-y-3">
            <button
              onClick={() => setIsPasswordOpen(!isPasswordOpen)}
              className="w-full flex justify-between items-center px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-primary)] font-semibold transition-all"
            >
              <span className="flex items-center gap-2">
                <Lock className="text-yellow-400 w-5 h-5" />
                Change Password
              </span>
              <ChevronDown
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  isPasswordOpen ? "rotate-180 text-yellow-400" : "rotate-0"
                }`}
              />
            </button>

            <AnimatePresence>
              {isPasswordOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-[var(--background)] border border-[var(--border-color)] rounded-lg p-6 space-y-5"
                >
                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Old Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--card-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter your old password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--card-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--card-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Re-enter new password"
                      />
                    </div>

                    {/* Toggle visibility */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {showPassword ? (
                        <EyeOff className="inline w-4 h-4 mr-1" />
                      ) : (
                        <Eye className="inline w-4 h-4 mr-1" />
                      )}
                      {showPassword ? "Hide Passwords" : "Show Passwords"}
                    </button>

                    {/* Feedback messages */}
                    {error && (
                      <p className="text-red-400 text-sm bg-red-900/30 p-2 rounded-md border border-red-700">
                        {error}
                      </p>
                    )}
                    {message && (
                      <p className="text-green-400 text-sm bg-green-900/30 p-2 rounded-md border border-green-700">
                        {message}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* 🚪 Logout */}
          <section className="space-y-3 pt-3 border-t border-[var(--border-color)]">
            <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <LogOut className="text-red-400 w-5 h-5" /> Account
            </h2>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
