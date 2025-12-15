/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import { User, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

type AdminProfile = {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  phone?: string;
  department?: string;
  status: string;
  hireDate: string;
  user?: {
    email: string;
    role: string;
  };
};

export default function ProfilePage() {
  const { token, role } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) {
          setError("Please login to view your profile");
          return;
        }

        const response = await api.get("/employees/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        if (error.response?.status === 404) {
          setError("Admin profile not found. Please contact support");
        } else if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.charAt(0)?.toUpperCase() || ""}${
      lastName?.charAt(0)?.toUpperCase() || ""
    }`;

  // ────────────────
  // Loading State
  // ────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] transition-colors">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-[var(--text-muted)]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // ────────────────
  // Error State
  // ────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] transition-colors">
        <div className="bg-[var(--card-bg)] rounded-xl p-8 shadow-lg border border-red-800 max-w-md mx-auto text-center">
          <div className="p-3 bg-red-500/10 rounded-full w-16 h-16 mx-auto mb-4">
            <User className="w-10 h-10 text-red-400 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Profile Error
          </h2>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ────────────────
  // No Profile Found
  // ────────────────
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] transition-colors">
        <div className="bg-[var(--card-bg)] rounded-xl p-8 shadow-lg border border-[var(--border-color)] max-w-md mx-auto text-center">
          <User className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            No Profile Found
          </h2>
          <p className="text-[var(--text-muted)]">
            Please contact support to set up your admin profile.
          </p>
        </div>
      </div>
    );
  }

  // ────────────────
  // Main Profile Display
  // ────────────────
  return (
    <div className="min-h-screen p-1 bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <User className="text-blue-500" /> My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-md p-6 space-y-4 transition-all duration-300">
          {/* Avatar + Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {getInitials(profile.firstName, profile.lastName)}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {profile.user?.role || role || "Admin"} – Telecom HRM
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    profile.status === "Active" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-[var(--text-muted)]">
                  {profile.status}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Email</p>
              <p className="font-medium text-[var(--text-primary)]">
                {profile.workEmail || profile.user?.email || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--text-muted)]">Role</p>
              <p className="font-medium text-[var(--text-primary)]">
                {profile.user?.role || role || "Administrator"}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--text-muted)]">Department</p>
              <p className="font-medium text-[var(--text-primary)]">
                {profile.department || "HR"}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--text-muted)]">Joined</p>
              <p className="font-medium text-[var(--text-primary)]">
                {formatDate(profile.hireDate)}
              </p>
            </div>

            {profile.phone && (
              <div>
                <p className="text-sm text-[var(--text-muted)]">Phone</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {profile.phone}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
