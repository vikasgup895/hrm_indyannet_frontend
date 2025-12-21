/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  Briefcase,
  Landmark,
  FileText,
  Loader,
  AlertCircle,
  Copy,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";

type EmployeeDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  employee: any | null;
};

export default function EmployeeDetailsModal({
  open,
  onClose,
  employee,
}: EmployeeDetailsModalProps) {
  const { token, role } = useAuth();

  const [details, setDetails] = useState<any>(employee);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!open || !employee?.id || !token) return;

      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/employees/${employee.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDetails(res.data);
      } catch (err: any) {
        console.error("Failed to fetch employee details:", err);
        setError(err?.response?.data?.message || "Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [open, employee?.id, token]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDeleteDocument = async (docId: string, docTitle: string) => {
    if (role !== "HR" && role !== "ADMIN") {
      alert("Only HR or Admin can delete documents");
      return;
    }
    if (!window.confirm(`Delete "${docTitle}"?`)) return;

    try {
      await api.delete(`/employees/${employee.id}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh details after deletion
      const res = await api.get(`/employees/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetails(res.data);
      alert("Document deleted successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete document");
    }
  };

  if (!open || !employee) return null;

  const fullName = `${details?.firstName || ""} ${
    details?.lastName || ""
  }`.trim();

  const doj = details?.hireDate
    ? new Date(details.hireDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const birthday = details?.birthdate
    ? new Date(details.birthdate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)] bg-[var(--card-bg)] z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                {fullName}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {details?.designation || "Employee"} • {details?.personNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mx-8 mt-6 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Employment & Contact Info */}
            <div className="px-8 py-6 border-b border-[var(--border-color)]">
              <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Employment & Contact Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoCard
                  icon={Briefcase}
                  label="Designation"
                  value={details?.designation || "—"}
                />
                <InfoCard
                  icon={GraduationCap}
                  label="Department"
                  value={details?.department || "—"}
                />
                <InfoCard icon={Calendar} label="Date of Joining" value={doj} />
                <InfoCard
                  icon={Mail}
                  label="Work Email"
                  value={details?.workEmail || "—"}
                  copyable
                  onCopy={() =>
                    copyToClipboard(details?.workEmail, "work-email")
                  }
                  copied={copied === "work-email"}
                />
                <InfoCard
                  icon={Mail}
                  label="Personal Email"
                  value={details?.personalEmail || "—"}
                  copyable={!!details?.personalEmail}
                  onCopy={() =>
                    copyToClipboard(details?.personalEmail, "personal-email")
                  }
                  copied={copied === "personal-email"}
                />
                <InfoCard
                  icon={Phone}
                  label="Phone"
                  value={details?.phone || "—"}
                  copyable
                  onCopy={() => copyToClipboard(details?.phone, "phone")}
                  copied={copied === "phone"}
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="px-8 py-6 border-b border-[var(--border-color)]">
              <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                Personal Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoCard
                  icon={User}
                  label="Gender"
                  value={details?.gender || "—"}
                />
                <InfoCard icon={Calendar} label="Birthday" value={birthday} />
                <InfoCard
                  icon={MapPin}
                  label="Location"
                  value={details?.location || "—"}
                />
                <InfoCard
                  icon={MapPin}
                  label="Address"
                  value={details?.address || "—"}
                />
                <InfoCard
                  icon={Phone}
                  label="Emergency Contact"
                  value={details?.emergencyContact || "—"}
                  copyable={!!details?.emergencyContact}
                  onCopy={() =>
                    copyToClipboard(details?.emergencyContact, "emergency")
                  }
                  copied={copied === "emergency"}
                />
                <InfoCard
                  icon={GraduationCap}
                  label="Education"
                  value={details?.educationQualification || "—"}
                />
              </div>
            </div>

            {/* Bank Details */}
            {details?.bankDetail && (
              <div className="px-8 py-6 border-b border-[var(--border-color)]">
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-500" />
                  Bank & Financial Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <InfoCard
                    icon={Landmark}
                    label="Bank Name"
                    value={details.bankDetail.bankName || "—"}
                  />
                  <InfoCard
                    icon={User}
                    label="Account Holder"
                    value={details.bankDetail.accountHolder || "—"}
                  />
                  <InfoCard
                    icon={FileText}
                    label="Account Number"
                    value={details.bankDetail.accountNumber || "—"}
                    copyable={!!details.bankDetail.accountNumber}
                    onCopy={() =>
                      copyToClipboard(
                        details.bankDetail.accountNumber,
                        "account-number"
                      )
                    }
                    copied={copied === "account-number"}
                    masked
                  />
                  <InfoCard
                    icon={FileText}
                    label="IFSC Code"
                    value={details.bankDetail.ifscCode || "—"}
                    copyable={!!details.bankDetail.ifscCode}
                    onCopy={() =>
                      copyToClipboard(details.bankDetail.ifscCode, "ifsc")
                    }
                    copied={copied === "ifsc"}
                  />
                  <InfoCard
                    icon={MapPin}
                    label="Branch"
                    value={details.bankDetail.branch || "—"}
                  />
                  <InfoCard
                    icon={FileText}
                    label="PF Number"
                    value={details.bankDetail.pfNumber || "—"}
                    copyable={!!details.bankDetail.pfNumber}
                    onCopy={() =>
                      copyToClipboard(details.bankDetail.pfNumber, "pf-number")
                    }
                    copied={copied === "pf-number"}
                    masked
                  />
                  <InfoCard
                    icon={FileText}
                    label="UAN"
                    value={details.bankDetail.uan || "—"}
                    copyable={!!details.bankDetail.uan}
                    onCopy={() =>
                      copyToClipboard(details.bankDetail.uan, "uan")
                    }
                    copied={copied === "uan"}
                    masked
                  />
                </div>
              </div>
            )}

            {/* Documents */}
            {details?.documents && details.documents.length > 0 && (
              <div className="px-8 py-6">
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Documents ({details.documents.length})
                </h4>
                <ul className="space-y-2">
                  {details.documents.map((doc: any) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]"
                    >
                      <a
                        href={`${
                          process.env.NODE_ENV === "production"
                            ? "https://hrm.indyanet.com/"
                            : "http://localhost:4000/"
                        }${doc.storageUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:underline transition-colors flex-1"
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="break-all">{doc.title}</span>
                      </a>
                      {(role === "HR" || role === "ADMIN") && (
                        <button
                          onClick={() =>
                            handleDeleteDocument(doc.id, doc.title)
                          }
                          className="ml-3 p-2 rounded-lg hover:bg-rose-100 hover:text-rose-600 text-[var(--text-muted)] transition-colors flex-shrink-0"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   INFO CARD COMPONENT
   ========================================================================= */
function InfoCard({
  icon: Icon,
  label,
  value,
  copyable = false,
  onCopy,
  copied = false,
  masked = false,
}: any) {
  const [revealed, setRevealed] = useState(false);

  const displayValue = masked && !revealed ? "•".repeat(8) : value;

  return (
    <div className="p-4 rounded-xl bg-[var(--hover-bg)] border border-[var(--border-color)] hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Icon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
        {masked && (
          <button
            onClick={() => setRevealed(!revealed)}
            className="p-1 hover:bg-[var(--card-bg)] rounded transition-colors"
            title={revealed ? "Hide" : "Show"}
          >
            {revealed ? "👁️" : "🔒"}
          </button>
        )}
      </div>
      <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-[var(--text-primary)] break-all">
          {displayValue}
        </p>
        {copyable && value !== "—" && (
          <button
            onClick={onCopy}
            className="p-1.5 rounded hover:bg-[var(--card-bg)] transition-colors flex-shrink-0"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
