/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/context/ThemeProvider";

import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  FileDigit,
  Wallet,
  Users,
  Activity,
  Copy,
  CheckCircle2,
  Clock,
  Edit3,
  X,
  Save,
  RefreshCcw,
  Landmark,
  Eye,
  EyeOff,
  IdCard,
  BanknoteIcon,
  Contact,
  FileText,
} from "lucide-react";

/* =========================================================================
   TYPES
   ========================================================================= */
type EmployeeProfile = {
  bankDetail: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
    pfNumber?: string;
    uan?: string;
  } | null;

  // Documents uploaded by the employee (optional)
  documents?: {
    id: string;
    title: string;
    storageUrl: string;
    createdAt: string;
  }[];

  id: string;
  personNo: string;
  firstName: string;
  lastName: string;
  workEmail: string;

  phone?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  educationQualification?: string;
  birthdate?: string;
  location?: string;
  designation?: string;

  department?: string;
  status: string;
  hireDate: string;

  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  user?: {
    email: string;
    role: string;
  };
};

/* =========================================================================
   REUSABLE INPUT FIELD
   ========================================================================= */
const InputField = React.memo((props: any) => {
  const { label, name, value, onChange, type = "text", placeholder = "" } = props;

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full p-2.5 rounded-lg border 
          border-[var(--border-color)]
          bg-[var(--card-bg)]
          text-[var(--text-primary)]
          focus:ring-2 focus:ring-indigo-400
          outline-none transition
        "
      />
    </div>
  );
});

/* =========================================================================
   CARD INFO COMPONENT - IMPROVED
   ========================================================================= */
function CardInfo({ icon: Icon, label, value, copyable = false, size = "default" }: any) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { }
  };

  const textSize = size === "large" ? "text-base" : "text-sm";

  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-xl 
        bg-[var(--card-bg)] border border-[var(--border-color)]
        hover:shadow-sm transition-all duration-200
        ${size === "large" ? "min-h-[80px]" : "min-h-[72px]"}
      `}
    >
      <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 shadow-sm flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
          {label}
        </p>
        <p className={`font-semibold text-[var(--text-primary)] break-words leading-relaxed ${textSize}`}>
          {value ?? <span className="text-[var(--text-muted)] italic">Not provided</span>}
        </p>
      </div>

      {copyable && value && (
        <button
          onClick={() => copyToClipboard(value)}
          className="p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors flex-shrink-0"
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
          )}
        </button>
      )}
    </div>
  );
}

/* =========================================================================
   PAGE COMPONENT
   ========================================================================= */
export default function EmployeesEmployeePage() {
  const { token, role } = useAuth();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editModel, setEditModel] = useState<any>({
    phone: "",
    gender: "",
    address: "",
    emergencyContact: "",
    educationQualification: "",
    birthdate: "",
    location: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    pfNumber: "",
    uanNumber: "",
  });

  const [showSensitive, setShowSensitive] = useState({
    accountNumber: false,
    pfNumber: false,
    uanNumber: false,
  });

  /* ----------------------------------------------
     LOAD PROFILE
     ---------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/employees/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data);

        const p = res.data;
        setEditModel({
          phone: p.phone ?? "",
          gender: p.gender ?? "",
          address: p.address ?? "",
          emergencyContact: p.emergencyContact ?? "",
          educationQualification: p.educationQualification ?? "",
          birthdate: p.birthdate ?? "",
          location: p.location ?? "",
          bankName: p.bankDetail?.bankName ?? "",
          accountNumber: p.bankDetail?.accountNumber ?? "",
          ifscCode: p.bankDetail?.ifscCode ?? "",
          branchName: p.bankDetail?.branch ?? "",
          pfNumber: p.bankDetail?.pfNumber ?? "",
          uanNumber: p.bankDetail?.uan ?? "",
        });
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const openEditor = () => setEditing(true);

  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    setEditModel((prev: any) => ({ ...prev, [name]: value }));
  };

  const toggleSensitive = (key: keyof typeof showSensitive) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }));
  };


  // ------------fileupload -----------
  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        `/employees/${profile!.id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // refresh profile
      const updated = await api.get("/employees/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(updated.data);
      alert("Document uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload document");
    }
  };


  /* ----------------------------------------------
     SAVE PROFILE
     ---------------------------------------------- */
  const handleSave = async () => {
    setSaving(true);

    const payload: any = {
      phone: editModel.phone,
      gender: editModel.gender,
      address: editModel.address,
      emergencyContact: editModel.emergencyContact,
      educationQualification: editModel.educationQualification,
      birthdate: editModel.birthdate,
      location: editModel.location,
      bankDetail: {
        bankName: editModel.bankName,
        accountNumber: editModel.accountNumber,
        ifscCode: editModel.ifscCode,
        branch: editModel.branchName,
        pfNumber: editModel.pfNumber,
        uan: editModel.uanNumber,
      },
    };

    // Remove empty values
    Object.keys(payload).forEach((k) => payload[k] ?? delete payload[k]);
    Object.keys(payload.bankDetail).forEach(
      (k) => payload.bankDetail[k] ?? delete payload.bankDetail[k]
    );
    if (Object.keys(payload.bankDetail).length === 0) delete payload.bankDetail;

    try {
      const res = await api.put("/employees/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
      setEditing(false);
    } catch {
      alert("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================================
     RENDER
     ========================================================================= */
  if (loading) return <div className="p-20">Loading...</div>;
  if (error) return <div className="p-20 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] py-1 px-2">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* -------------------------------------------------------------
            IMPROVED HEADER CARD
        ------------------------------------------------------------- */}
        <div className="rounded-2xl border border-[var(--border-color)] p-8 bg-[var(--card-bg)] shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile!.firstName[0]}
                {profile!.lastName[0]}
              </div>

              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                    {profile!.firstName} {profile!.lastName}
                  </h1>
                  <p className="text-lg text-[var(--text-primary)] font-medium mt-1">
                    {profile!.designation ?? profile!.user?.role}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-primary)]">
                      <strong>ID:</strong> {profile!.personNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-primary)]">
                      {profile!.department}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${profile!.status === "Active"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}
              >
                {profile!.status}
              </span>

              <button
                onClick={openEditor}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex gap-2 items-center font-medium transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            IMPROVED PROFILE GRID
        ------------------------------------------------------------- */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT COLUMN - PERSONAL & CONTACT INFO */}
          <div className="space-y-8">

            {/* EMPLOYMENT OVERVIEW */}
            <SectionCard icon={Briefcase} title="Employment Overview">
              <div className="grid gap-4">
                <CardInfo icon={Building} label="Department" value={profile!.department} size="large" />
                <CardInfo icon={Briefcase} label="Designation" value={profile!.designation} size="large" />
                <CardInfo icon={Users} label="Manager"
                  value={profile!.manager ? `${profile!.manager.firstName} ${profile!.manager.lastName}` : "Direct Report"}
                  size="large"
                />
                <CardInfo
                  icon={Calendar}
                  label="Hire Date"
                  value={
                    profile?.hireDate
                      ? new Date(profile.hireDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      : "—"
                  }
                  size="large"
                />
              </div>
            </SectionCard>

            {/* CONTACT INFORMATION */}
            <SectionCard icon={Contact} title="Contact Information">
              <div className="grid gap-4">
                <CardInfo icon={Mail} label="Work Email" value={profile!.workEmail} copyable size="large" />
                <CardInfo icon={Phone} label="Phone" value={profile!.phone} copyable size="large" />
                <CardInfo icon={MapPin} label="Address" value={profile!.address} size="large" />
                <CardInfo icon={Users} label="Emergency Contact" value={profile!.emergencyContact} size="large" />
              </div>
            </SectionCard>

          </div>

          {/* RIGHT COLUMN - PERSONAL & FINANCIAL INFO */}
          <div className="space-y-8">

            {/* PERSONAL DETAILS */}
            <SectionCard icon={User} title="Personal Details">
              <div className="grid gap-4">
                <CardInfo icon={Calendar} label="Birthdate" value={profile!.birthdate} size="large" />
                <CardInfo icon={MapPin} label="Location" value={profile!.location} size="large" />
                <CardInfo icon={User} label="Gender" value={profile!.gender} size="large" />
                <CardInfo icon={Briefcase} label="Education Qualification" value={profile!.educationQualification} size="large" />
              </div>
            </SectionCard>

            {/* BANK & FINANCIAL DETAILS */}
            <SectionCard icon={BanknoteIcon} title="Bank & Financial Information">
              <div className="grid gap-4">
                <CardInfo icon={Landmark} label="Bank Name" value={profile!.bankDetail?.bankName} size="large" />
                <CardInfo icon={FileDigit} label="Account Number" value={profile!.bankDetail?.accountNumber} size="large" />
                <CardInfo icon={FileDigit} label="IFSC Code" value={profile!.bankDetail?.ifscCode} size="large" />
                <CardInfo icon={MapPin} label="Branch" value={profile!.bankDetail?.branch} size="large" />
                <CardInfo icon={Wallet} label="PF Number" value={profile!.bankDetail?.pfNumber} size="large" />
                <CardInfo icon={Users} label="UAN Number" value={profile!.bankDetail?.uan} size="large" />
              </div>
            </SectionCard>

          </div>
        </div>

        {/* =============================================================
    DOCUMENTS SECTION
============================================================== */}
        <SectionCard icon={FileText} title="Uploaded Documents">
          <div className="space-y-4">

            {/* Upload Button */}
            <div className="flex items-center justify-between">
              <h4 className="text-[var(--text-primary)] font-medium">Your Documents</h4>

              <label className="px-5 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition">
                Upload Document
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </label>
            </div>

            {/* Documents List */}
            {profile?.documents?.length ? (
              <ul className="space-y-3">
                {profile.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-indigo-500 w-5 h-5" />
                      <a
                        href={`${process.env.NODE_ENV === "production"
                            ? "https://hrm.indyanet.com/"
                            : "http://localhost:4000/"
                          }${doc.storageUrl}`}
                        target="_blank"
                        className="text-[var(--text-primary)] hover:underline"
                      >
                        {doc.title}
                      </a>
                    </div>

                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No documents uploaded yet.</p>
            )}
          </div>
        </SectionCard>


        {/* =====================================================================
            EDIT MODAL (UNCHANGED)
        ===================================================================== */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setEditing(false)}
            />

            {/* MODAL */}
            <div className="relative max-w-3xl w-full rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-lg overflow-hidden">
              {/* HEADER */}
              <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Edit Profile
                </h3>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 hover:bg-[var(--hover-bg)] rounded-full"
                >
                  <X className="w-5 h-5 text-[var(--text-primary)]" />
                </button>
              </div>

              {/* CONTENT */}
              <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-6">
                {/* LOCKED FIELDS */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-[var(--text-primary)]">
                    Personal Details (Locked)
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <LockedField label="First Name" value={profile!.firstName} />
                    <LockedField label="Last Name" value={profile!.lastName} />
                    <LockedField label="Work Email" value={profile!.workEmail} />
                    <LockedField label="Department" value={profile!.department} />
                    <LockedField label="Designation" value={profile!.designation} />
                  </div>
                </div>

                {/* EDITABLE PERSONAL INFO */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-[var(--text-primary)]">
                    Personal Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField label="Phone" name="phone" value={editModel.phone} onChange={handleEditChange} />
                    <InputField label="Gender" name="gender" value={editModel.gender} onChange={handleEditChange} />
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-[var(--text-primary)]">Address</label>
                    <textarea
                      name="address"
                      rows={3}
                      value={editModel.address}
                      onChange={handleEditChange}
                      className="
                        w-full mt-1 p-2.5 rounded-lg border border-[var(--border-color)]
                        bg-[var(--card-bg)] text-[var(--text-primary)]
                        focus:ring-2 focus:ring-indigo-400 outline-none
                      "
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <InputField label="Emergency Contact" name="emergencyContact" value={editModel.emergencyContact} onChange={handleEditChange} />
                    <InputField label="Education Qualification" name="educationQualification" value={editModel.educationQualification} onChange={handleEditChange} />
                    <div>
                      <label className="text-sm font-medium text-[var(--text-primary)]">
                        Birthdate
                      </label>
                      <input
                        type="date"
                        name="birthdate"
                        value={editModel.birthdate?.split("T")[0] ?? ""}
                        onChange={handleEditChange}
                        className="
                          w-full p-2.5 rounded-lg border border-[var(--border-color)]
                          bg-[var(--card-bg)] text-[var(--text-primary)]
                        "
                      />
                    </div>
                    <InputField label="Location" name="location" value={editModel.location} onChange={handleEditChange} />
                  </div>
                </div>

                {/* BANK DETAILS */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-[var(--text-primary)]">
                    Bank & Financial Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField label="Bank Name" name="bankName" value={editModel.bankName} onChange={handleEditChange} />
                    <SensitiveField
                      label="Account Number"
                      name="accountNumber"
                      value={editModel.accountNumber}
                      onChange={handleEditChange}
                      revealed={showSensitive.accountNumber}
                      onToggle={() => toggleSensitive("accountNumber")}
                    />
                    <InputField label="IFSC Code" name="ifscCode" value={editModel.ifscCode} onChange={handleEditChange} />
                    <InputField label="Branch" name="branchName" value={editModel.branchName} onChange={handleEditChange} />
                    <SensitiveField
                      label="PF Number"
                      name="pfNumber"
                      value={editModel.pfNumber}
                      onChange={handleEditChange}
                      revealed={showSensitive.pfNumber}
                      onToggle={() => toggleSensitive("pfNumber")}
                    />
                    <SensitiveField
                      label="UAN Number"
                      name="uanNumber"
                      value={editModel.uanNumber}
                      onChange={handleEditChange}
                      revealed={showSensitive.uanNumber}
                      onToggle={() => toggleSensitive("uanNumber")}
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--card-bg)]">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--hover-bg)] text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? <RefreshCcw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* =========================================================================
   IMPROVED SECTION CARD COMPONENT
   ========================================================================= */
function SectionCard({ icon: Icon, title, children }: any) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* Locked readonly fields */
function LockedField({ label, value }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-[var(--text-muted)]">{label}</label>
      <input
        value={value ?? ""}
        readOnly
        className="
          w-full p-2.5 rounded-lg border border-[var(--border-color)]
          bg-[var(--hover-bg)] text-[var(--text-muted)] cursor-not-allowed
        "
      />
    </div>
  );
}

/* Password-like sensitive fields */
function SensitiveField({ label, name, value, onChange, revealed, onToggle }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <div className="flex items-center gap-2 mt-1">
        <input
          name={name}
          value={value ?? ""}
          onChange={onChange}
          type={revealed ? "text" : "password"}
          className="
            w-full p-2.5 rounded-lg border border-[var(--border-color)]
            bg-[var(--card-bg)] text-[var(--text-primary)]
          "
        />
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)]"
        >
          {revealed ? (
            <EyeOff className="w-4 h-4 text-[var(--text-primary)]" />
          ) : (
            <Eye className="w-4 h-4 text-[var(--text-primary)]" />
          )}
        </button>
      </div>
    </div>
  );
}