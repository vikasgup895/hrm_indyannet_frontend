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
   CARD INFO COMPONENT
   ========================================================================= */
function CardInfo({ icon: Icon, label, value, copyable = false }: any) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div
      className="
        flex items-center gap-4 p-3 rounded-lg 
        bg-[var(--card-bg)] border border-[var(--border-color)]
      "
    >
      <div className="p-2 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 ">
        <Icon className="w-5 h-5 text-white dark:text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="text-sm font-semibold text-[var(--text-primary)] break-words">
          {value ?? "—"}
        </p>
      </div>

      {copyable && value && (
        <button
          onClick={() => copyToClipboard(value)}
          className="p-1.5 rounded-md hover:bg-[var(--hover-bg)]"
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4 text-[var(--text-primary)]" />
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
    <div className="min-h-screen bg-[var(--background)] py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* -------------------------------------------------------------
            HEADER CARD
        ------------------------------------------------------------- */}
        <div className="rounded-2xl border border-[var(--border-color)] p-6 bg-[var(--card-bg)] shadow-sm">
          <div className="flex justify-between flex-col md:flex-row gap-6">

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                {profile!.firstName[0]}
                {profile!.lastName[0]}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  {profile!.firstName} {profile!.lastName}
                </h1>

                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {profile!.user?.role || role}
                </p>

                <p className="text-xs mt-1">
                  Employee ID:{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {profile!.personNo}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  profile!.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {profile!.status}
              </span>

              <button
                onClick={openEditor}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex gap-2 items-center"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            </div>

          </div>
        </div>

        {/* -------------------------------------------------------------
            PROFILE GRID
        ------------------------------------------------------------- */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="space-y-8">

            {/* CONTACT */}
            <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
              <Section icon={Mail} title="Contact Details" />
              <div className="space-y-4">
                <CardInfo icon={Mail} label="Work Email" value={profile!.workEmail} copyable />
                <CardInfo icon={Phone} label="Phone" value={profile!.phone} copyable />
                <CardInfo icon={MapPin} label="Address" value={profile!.address} />
                <CardInfo icon={Users} label="Emergency Contact" value={profile!.emergencyContact} />
              </div>
            </div>

            {/* PERSONAL */}
            <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
              <Section icon={User} title="Personal Information" />
              <div className="space-y-4">
                <CardInfo icon={Calendar} label="Birthdate" value={profile!.birthdate} />
                <CardInfo icon={MapPin} label="Location" value={profile!.location} />
                <CardInfo icon={MapPin} label="Gender" value={profile!.gender} />
                <CardInfo icon={Briefcase} label="Education" value={profile!.educationQualification} />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="md:col-span-2 space-y-8">

            {/* EMPLOYMENT */}
            <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
              <Section icon={Briefcase} title="Employment Details" />

              <div className="grid md:grid-cols-2 gap-6">
                <CardInfo icon={Building} label="Department" value={profile!.department} />
                <CardInfo
                  icon={Users}
                  label="Manager"
                  value={profile!.manager ? `${profile!.manager.firstName} ${profile!.manager.lastName}` : "Direct Report"}
                />
                <CardInfo icon={Activity} label="Status" value={profile!.status} />
                <CardInfo icon={Calendar} label="Hire Date" value={profile!.hireDate} />
              </div>
            </div>

            {/* BANK */}
            <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
              <Section icon={Landmark} title="Bank & Financial Details" />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardInfo icon={Landmark} label="Bank Name" value={profile!.bankDetail?.bankName} />
                <CardInfo icon={Activity} label="Account Number" value={profile!.bankDetail?.accountNumber} />
                <CardInfo icon={FileDigit} label="IFSC" value={profile!.bankDetail?.ifscCode} />
                <CardInfo icon={MapPin} label="Branch" value={profile!.bankDetail?.branch} />
                <CardInfo icon={Wallet} label="PF Number" value={profile!.bankDetail?.pfNumber} />
                <CardInfo icon={Users} label="UAN Number" value={profile!.bankDetail?.uan} />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            EDIT MODAL
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

                    {/* ACCOUNT NUMBER */}
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
   SECTION TITLE
   ========================================================================= */
function Section({ icon: Icon, title }: any) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
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
