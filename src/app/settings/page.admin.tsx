/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  CirclePlus,
  LoaderCircle,
  Settings,
  ShieldCheck,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Save,
  ChevronDown,
  Pencil,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeProvider";
import { useRouter } from "next/navigation";

type Holiday = {
  id: string;
  name: string;
  date: string;
  description?: string | null;
  isRecurring: boolean;
};

type HolidayForm = {
  name: string;
  date: string;
  description: string;
  isRecurring: boolean;
};

const emptyHolidayForm: HolidayForm = {
  name: "",
  date: "",
  description: "",
  isRecurring: false,
};

const formatDateForInput = (rawDate: string) => {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateForDisplay = (rawDate: string) => {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getErrorText = (err: any, fallback: string) => {
  const message = err?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || fallback;
};

export default function SettingsAdminPage() {
  const { token, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const canManageHolidays = role === "ADMIN" || role === "HR";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);
  const [holidayForm, setHolidayForm] = useState<HolidayForm>(emptyHolidayForm);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<HolidayForm>(emptyHolidayForm);
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [holidaySaving, setHolidaySaving] = useState(false);
  const [holidayMessage, setHolidayMessage] = useState("");
  const [holidayError, setHolidayError] = useState("");

  const authConfig = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;

  const fetchUpcomingHolidays = async () => {
    try {
      setHolidaysLoading(true);
      const response = await api.get("/holidays?limit=50", authConfig);
      setUpcomingHolidays(response.data?.data || []);
    } catch (err: any) {
      setHolidayError(
        getErrorText(err, "Failed to load upcoming holidays. Try again.")
      );
    } finally {
      setHolidaysLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUpcomingHolidays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setHolidayMessage("");
    setHolidayError("");

    if (!canManageHolidays) {
      setHolidayError("Only Admin and HR can create holidays.");
      return;
    }

    if (!holidayForm.name.trim() || !holidayForm.date) {
      setHolidayError("Holiday name and date are required.");
      return;
    }

    try {
      setHolidaySaving(true);

      const response = await api.post(
        "/holidays",
        {
          name: holidayForm.name.trim(),
          date: holidayForm.date,
          description: holidayForm.description.trim() || undefined,
          isRecurring: holidayForm.isRecurring,
        },
        authConfig
      );

      setHolidayMessage(response.data?.message || "Holiday created successfully.");
      setHolidayForm(emptyHolidayForm);
      await fetchUpcomingHolidays();
    } catch (err: any) {
      setHolidayError(
        getErrorText(err, "Failed to create holiday. Please try again.")
      );
    } finally {
      setHolidaySaving(false);
    }
  };

  const startEditingHoliday = (holiday: Holiday) => {
    setHolidayMessage("");
    setHolidayError("");
    setEditingHolidayId(holiday.id);
    setEditForm({
      name: holiday.name,
      date: formatDateForInput(holiday.date),
      description: holiday.description || "",
      isRecurring: holiday.isRecurring,
    });
  };

  const cancelEditingHoliday = () => {
    setEditingHolidayId(null);
    setEditForm(emptyHolidayForm);
  };

  const handleUpdateHoliday = async (holidayId: string) => {
    setHolidayMessage("");
    setHolidayError("");

    if (!canManageHolidays) {
      setHolidayError("Only Admin and HR can update holidays.");
      return;
    }

    if (!editForm.name.trim() || !editForm.date) {
      setHolidayError("Holiday name and date are required.");
      return;
    }

    try {
      setHolidaySaving(true);

      const response = await api.put(
        `/holidays/${holidayId}`,
        {
          name: editForm.name.trim(),
          date: editForm.date,
          description: editForm.description.trim() || undefined,
          isRecurring: editForm.isRecurring,
        },
        authConfig
      );

      setHolidayMessage(response.data?.message || "Holiday updated successfully.");
      cancelEditingHoliday();
      await fetchUpcomingHolidays();
    } catch (err: any) {
      setHolidayError(
        getErrorText(err, "Failed to update holiday. Please try again.")
      );
    } finally {
      setHolidaySaving(false);
    }
  };

  return (
    <div className="min-h-screen   bg-(--background) text-(--foreground) transition-colors duration-300">
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
        <div className="bg-(--card-bg) border border-(--border-color) rounded-2xl shadow-md p-8 space-y-8 transition-all duration-300">
          {/* 🌗 Theme Section */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-(--text-primary)">
              <ShieldCheck className="text-green-400 w-5 h-5" /> Appearance
            </h2>
            <div className="flex items-center justify-between bg-(--background) border border-(--border-color) rounded-lg p-4">
              <span className="text-(--text-primary) font-medium">
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

          <section className="space-y-4 border-t border-(--border-color) pt-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-(--text-primary)">
                <CalendarDays className="text-indigo-500 w-5 h-5" /> Holiday
                Management
              </h2>
              <button
                type="button"
                onClick={fetchUpcomingHolidays}
                className="px-3 py-2 text-sm border border-(--border-color) rounded-lg hover:bg-(--hover-bg) transition-colors"
              >
                Refresh List
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create and update upcoming holidays directly from Settings.
            </p>

            {!canManageHolidays && (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                You can view upcoming holidays, but only Admin and HR can create
                or update them.
              </div>
            )}

            {canManageHolidays && (
              <form
                onSubmit={handleCreateHoliday}
                className="rounded-xl border border-(--border-color) bg-(--background) p-4 space-y-4"
              >
                <h3 className="font-semibold text-(--text-primary)">
                  Create New Holiday
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Holiday Name
                    </label>
                    <input
                      value={holidayForm.name}
                      onChange={(e) =>
                        setHolidayForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Example: Republic Day"
                      className="w-full px-4 py-3 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={holidayForm.date}
                      onChange={(e) =>
                        setHolidayForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={holidayForm.description}
                    onChange={(e) =>
                      setHolidayForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Optional note for employees"
                    className="w-full px-4 py-3 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-2 text-sm text-(--text-primary)">
                      <input
                        type="checkbox"
                        checked={holidayForm.isRecurring}
                        onChange={(e) =>
                          setHolidayForm((prev) => ({
                            ...prev,
                            isRecurring: e.target.checked,
                          }))
                        }
                      />
                      Mark as recurring holiday
                    </label>
                    <p className="text-xs text-gray-500">
                      Recurring marks this as an annual holiday for future
                      planning and tracking.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={holidaySaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition-colors disabled:opacity-50 self-end sm:ml-auto"
                  >
                    {holidaySaving ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <CirclePlus className="w-4 h-4" />
                    )}
                    {holidaySaving ? "Saving..." : "Create Holiday"}
                  </button>
                </div>
              </form>
            )}

            {holidayError && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md border border-red-300">
                {holidayError}
              </p>
            )}
            {holidayMessage && (
              <p className="text-green-600 text-sm bg-green-50 p-2 rounded-md border border-green-300">
                {holidayMessage}
              </p>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-(--text-primary)">
                Upcoming Holidays
              </h3>

              {holidaysLoading ? (
                <p className="text-sm text-(--text-primary)">Loading holidays...</p>
              ) : upcomingHolidays.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming holidays found.</p>
              ) : (
                upcomingHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="rounded-lg border border-(--border-color) bg-(--background) p-4"
                  >
                    {editingHolidayId === holiday.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Holiday Name"
                            className="w-full px-4 py-2 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                date: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={2}
                          placeholder="Description"
                          className="w-full px-4 py-2 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />

                        <label className="inline-flex items-center gap-2 text-sm text-(--text-primary)">
                          <input
                            type="checkbox"
                            checked={editForm.isRecurring}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                isRecurring: e.target.checked,
                              }))
                            }
                          />
                          Recurring holiday
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={holidaySaving}
                            onClick={() => handleUpdateHoliday(holiday.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" /> Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingHoliday}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-(--text-primary)">
                            {holiday.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatDateForDisplay(holiday.date)}
                          </p>
                          {holiday.description && (
                            <p className="text-sm text-(--text-primary)">
                              {holiday.description}
                            </p>
                          )}
                          <span className="inline-flex text-xs px-2 py-1 rounded-full border border-(--border-color) text-(--text-primary)">
                            {holiday.isRecurring ? "Recurring" : "One-time"}
                          </span>
                        </div>

                        {canManageHolidays && (
                          <button
                            type="button"
                            onClick={() => startEditingHoliday(holiday)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-(--border-color) rounded-lg hover:bg-(--hover-bg) transition-colors"
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 🔐 Change Password */}
          <section className="space-y-3">
            <button
              onClick={() => setIsPasswordOpen(!isPasswordOpen)}
              className="w-full flex justify-between items-center px-4 py-3 bg-(--background) border border-(--border-color) rounded-lg hover:bg-(--hover-bg) text-(--text-primary) font-semibold transition-all"
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
                  className="overflow-hidden bg-(--background) border border-(--border-color) rounded-lg p-6 space-y-5"
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
                        className="w-full px-4 py-3 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none"
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
                        className="w-full px-4 py-3 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none"
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
                        className="w-full px-4 py-3 bg-(--card-bg) text-(--text-primary) rounded-lg border border-(--border-color) focus:ring-2 focus:ring-blue-500 outline-none"
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
                      <p className="text-red-400 text-sm bg-gray-100 p-2 rounded-md border border-red-700">
                        {error}
                      </p>
                    )}
                    {message && (
                      <p className="text-green-400 text-sm bg-gray-100 p-2 rounded-md border border-green-700">
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
          <section className="space-y-3 pt-3 border-t border-(--border-color)">
            <h2 className="font-semibold text-(--text-primary) flex items-center gap-2">
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

