/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  X,
} from "lucide-react";

/* ────────────────────────────── */
/* Shared Form Components */
/* ────────────────────────────── */

// Form Field Wrapper
const FormField = ({
  label,
  required = false,
  children,
  error,
  helpText,
  icon: Icon,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  helpText?: string;
  icon?: any;
}) => (
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
      {Icon && <Icon className="w-4 h-4 text-[var(--text-muted)]" />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {helpText && (
      <p className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
        <AlertCircle className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
        {helpText}
      </p>
    )}
    {error && (
      <p className="flex items-start gap-2 text-xs text-red-500">
        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// Input Field
const Input = ({ className = "", error = false, ...props }: any) => (
  <input
    className={`w-full px-4 py-3 rounded-xl bg-[var(--card-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500
    ${error ? "border-red-500 focus:ring-red-500/40" : "border-[var(--border-color)] hover:border-blue-400/40"}
    ${className}`}
    {...props}
  />
);

// Select Field
const Select = ({ children, className = "", error = false, ...props }: any) => (
  <select
    className={`w-full px-4 py-3 rounded-xl bg-[var(--card-bg)] text-[var(--text-primary)] border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500
    ${error ? "border-red-500 focus:ring-red-500/40" : "border-[var(--border-color)] hover:border-blue-400/40"}
    ${className}`}
    {...props}
  >
    {children}
  </select>
);

// Textarea Field
const Textarea = ({ className = "", error = false, ...props }: any) => (
  <textarea
    className={`w-full px-4 py-3 rounded-xl bg-[var(--card-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border resize-none transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500
    ${error ? "border-red-500 focus:ring-red-500/40" : "border-[var(--border-color)] hover:border-blue-400/40"}
    ${className}`}
    {...props}
  />
);

/* ────────────────────────────── */
/* Main Leave Form */
/* ────────────────────────────── */

export default function LeaveForm({
  onSubmit,
  onClose,
  policies = [],
}: {
  onSubmit: (data: any) => void;
  onClose?: () => void;
  policies?: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    policyId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Calculate leave duration
  const calculateDuration = () => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff + 1;
    }
    return 0;
  };

  // Validate Form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.policyId) newErrors.type = "Please select a leave type";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (!form.reason.trim())
      newErrors.reason = "Please provide a reason for your leave";

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (start > end)
        newErrors.endDate = "End date cannot be before start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        days: calculateDuration(),
      });
      setForm({ policyId: "", startDate: "", endDate: "", reason: "" });
      setErrors({});
    } catch (err) {
      console.error("Failed to submit leave:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const duration = calculateDuration();
  const leaveTypes = policies.map((p) => ({ value: p.id, label: p.name }));

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">My Leave Requests</h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <X className="w-4 h-4" />
              Close Form
            </button>
          )}
        </div>

        {/* Card */}
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Leave Request</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Submit your time-off request for approval
              </p>
            </div>
          </div>

          {/* Section Title */}
          <div className="px-6 py-3 border-b border-[var(--border-color)] bg-[var(--background)]/30">
            <h3 className="text-lg font-semibold">Request Details</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Please fill in all required fields
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Leave Type */}
              <FormField
                label="Leave Type"
                required
                error={errors.type}
                icon={FileText}
                helpText="Select the appropriate leave category"
              >
                <Select
                  value={form.policyId}
                  onChange={(e: any) =>
                    setForm({ ...form, policyId: e.target.value })
                  }
                  error={!!errors.type}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Dates */}
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  label="Start Date"
                  required
                  error={errors.startDate}
                  icon={Calendar}
                >
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e: any) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    error={!!errors.startDate}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </FormField>

                <FormField
                  label="End Date"
                  required
                  error={errors.endDate}
                  icon={Calendar}
                >
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e: any) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    error={!!errors.endDate}
                    min={
                      form.startDate || new Date().toISOString().split("T")[0]
                    }
                  />
                </FormField>
              </div>

              {/* Duration */}
              {duration > 0 && (
                <div className="p-4 border border-blue-500/30 bg-blue-500/10 rounded-xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-blue-400">
                      Duration
                    </p>
                    <p className="text-lg font-bold text-blue-300">
                      {duration} {duration === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
              )}

              {/* Reason */}
              <FormField
                label="Reason for Leave"
                required
                error={errors.reason}
                icon={FileText}
                helpText="Provide a brief explanation for your request"
              >
                <Textarea
                  value={form.reason}
                  onChange={(e: any) =>
                    setForm({ ...form, reason: e.target.value })
                  }
                  rows={4}
                  placeholder="Explain the reason for your leave..."
                  error={!!errors.reason}
                />
              </FormField>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--background)]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    Your request will be sent to your manager for approval
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-6 border border-amber-500/40 bg-amber-500/10 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-300">
              <p className="font-semibold mb-2">Important Notes:</p>
              <ul className="space-y-1 text-xs">
                <li>• Submit requests at least 3 days in advance.</li>
                <li>• Emergency leave should be submitted ASAP.</li>
                <li>• You will receive an email confirmation.</li>
                <li>• Check your leave balance before submitting.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
