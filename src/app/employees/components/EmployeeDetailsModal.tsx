/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  Briefcase,
} from "lucide-react";

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
  const { token } = require("@/store/auth").useAuth();
  const [details, setDetails] = React.useState<any>(employee);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDetails = async () => {
      if (!open || !employee?.id) return;
      setLoading(true);
      setError(null);
      try {
        const { api } = require("@/lib/api");
        const res = await api.get(`/employees/${employee.id}`, {
          headers: { Authorization: `Bearer ${token}` },
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

  if (!open || !employee) return null;

  const fullName = `${details?.firstName || ""} ${
    details?.lastName || ""
  }`.trim();
  const doj = details?.hireDate
    ? new Date(employee.hireDate).toLocaleDateString()
    : "—";
  const birthday = details?.birthdate
    ? new Date(details.birthdate).toLocaleDateString()
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {fullName}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {details?.personNo || "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p>
              <Briefcase className="inline w-4 h-4 mr-2 text-blue-500" />
              Designation:{" "}
              <span className="text-[var(--text-primary)]">
                {details?.designation || "—"}
              </span>
            </p>
            <p>
              <GraduationCap className="inline w-4 h-4 mr-2 text-blue-500" />
              Department:{" "}
              <span className="text-[var(--text-primary)]">
                {details?.department || "—"}
              </span>
            </p>
            <p>
              <User className="inline w-4 h-4 mr-2 text-blue-500" />
              Gender:{" "}
              <span className="text-[var(--text-primary)]">
                {details?.gender || "—"}
              </span>
            </p>
            <p>
              <Calendar className="inline w-4 h-4 mr-2 text-blue-500" />
              Date of Joining:{" "}
              <span className="text-[var(--text-primary)]">{doj}</span>
            </p>
            <p>
              <Calendar className="inline w-4 h-4 mr-2 text-blue-500" />
              Birthday:{" "}
              <span className="text-[var(--text-primary)]">{birthday}</span>
            </p>
            <p>
              <MapPin className="inline w-4 h-4 mr-2 text-blue-500" />
              Address:{" "}
              <span className="text-[var(--text-primary)]">
                {details?.address || "—"}
              </span>
            </p>
          </div>
          <div className="space-y-3">
            <p>
              <Mail className="inline w-4 h-4 mr-2 text-blue-500" />
              Work Email:{" "}
              <span className="text-[var(--text-primary)]">
                {details?.workEmail}
              </span>
            </p>
            <p>
              <Mail className="inline w-4 h-4 mr-2 text-blue-500" />
              Personal Email:{" "}
              <span className="text-[var(--text-primary)]">
                {details?.personalEmail || "—"}
              </span>
            </p>
            <p>
              <Phone className="inline w-4 h-4 mr-2 text-blue-500" />
              Phone:{" "}
              <span className="text-[var(--text-primary)]">
                {details?.phone || "—"}
              </span>
            </p>
            <p>
              <Phone className="inline w-4 h-4 mr-2 text-blue-500" />
              Emergency Contact:{" "}
              <span className="text-[var(--text-primary)]">
                {details?.emergencyContact || "—"}
              </span>
            </p>
          </div>
        </div>

        {/* Bank Details */}
        <div className="px-6 pb-6">
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">
            Bank Details
          </h4>
          {details?.bankDetail ? (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="text-[var(--text-muted)]">Bank Name: </span>
                <span className="text-[var(--text-primary)]">
                  {details.bankDetail.bankName}
                </span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">
                  Account Holder:{" "}
                </span>
                <span className="text-[var(--text-primary)]">
                  {details.bankDetail.accountHolder}
                </span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">
                  Account Number:{" "}
                </span>
                <span className="text-[var(--text-primary)]">
                  {details.bankDetail.accountNumber}
                </span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">IFSC Code: </span>
                <span className="text-[var(--text-primary)]">
                  {details.bankDetail.ifscCode}
                </span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">Branch: </span>
                <span className="text-[var(--text-primary)]">
                  {details.bankDetail.branch || "—"}
                </span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">PF Number: </span>
                <span className="text-[var(--text-primary)]">
                  {details.bankDetail.pfNumber || "—"}
                </span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">UAN: </span>
                <span className="text-[var(--text-primary)]">
                  {details.bankDetail.uan || "—"}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] italic">
              No bank details available.
            </p>
          )}
        </div>

        {/* Documents */}
        <div className="px-6 pb-6">
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">
            Documents
          </h4>
          {details?.documents?.length ? (
            <ul className="space-y-2">
              {details.documents.map((doc: any) => (
                <li key={doc.id}>
                  <a
                    href={`${
                      process.env.NODE_ENV === "production"
                        ? "https://hrm.indyanet.com/"
                        : "http://localhost:4000/"
                    }${doc.storageUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    📄 {doc.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)] italic">
              No documents uploaded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
