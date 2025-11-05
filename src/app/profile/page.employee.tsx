/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
  MapIcon,
  Landmark
} from "lucide-react";

type EmployeeProfile = {
  bankDetail: any;
  id: string;
  personNo: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  phone?: string;
  department?: string;
  location?: string;
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
  // optional editable fields
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branchName?: string;
  uanNumber?: string;
  pfNumber?: string;
};

const InfoCard = ({
  icon: Icon,
  label,
  value,
  copyable = false,
}: {
  icon: any;
  label: string;
  value?: string | null;
  copyable?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="group bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-4 hover:bg-[var(--hover-bg)] transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
            {label}
          </p>
          <p className="text-base font-semibold text-[var(--text-primary)] break-words">
            {value || "—"}
          </p>
        </div>
        {copyable && value && (
          <button
            onClick={() => copyToClipboard(value)}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default function EmployeesEmployeePage() {
  const { token, role } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editModel, setEditModel] = useState<Partial<EmployeeProfile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) {
          setError("Please login to view your profile");
          setLoading(false);
          return;
        }
        const response = await api.get("/employees/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        if (err.response?.status === 404) {
          setError("Employee profile not found. Please contact HR.");
        } else if (err.response?.status === 401) {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getYearsOfService = (hireDate?: string) => {
    if (!hireDate) return "Not specified";
    const hired = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hired.getFullYear();
    const months = now.getMonth() - hired.getMonth();
    if (years === 0) {
      const m = months >= 0 ? months : 0;
      return `${m} month${m !== 1 ? "s" : ""}`;
    }
    return `${years} year${years !== 1 ? "s" : ""}`;
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/(\+\d{2})-?(\d{4})(\d{3})(\d{3})/, "$1 $2 $3 $4");
  };

  // open editor (prefill)
  const openEditor = () => {
    if (!profile) return;
    setEditModel({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      accountNumber: profile.accountNumber,
      ifscCode: profile.ifscCode,
      bankName: profile.bankName,
      branchName: profile.branchName,
      uanNumber: profile.uanNumber,
      pfNumber: profile.pfNumber,
    });
    setEditing(true);
  };

  // handle inputs in editor
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditModel((s) => ({ ...(s || {}), [e.target.name]: e.target.value }));
  };

  // save profile changes
  const handleSave = async () => {
    if (!token || !profile) return;
    setSaving(true);
  
    try {
      // ✅ Build clean payload structure
      const payload = {
        firstName: editModel.firstName,
        lastName: editModel.lastName,
        phone: editModel.phone,
        // ✅ Backend expects nested "bankDetail" object
        bankDetail: {
          bankName: editModel.bankName,
          accountNumber: editModel.accountNumber,
          ifscCode: editModel.ifscCode,
          branch: editModel.branchName,
          pfNumber: editModel.pfNumber,
          uan: editModel.uanNumber,
        },
      };
  
      // ✅ Remove empty/null/undefined values for clean payload
      Object.keys(payload).forEach((key) => {
        const val = (payload as any)[key];
        if (val === undefined || val === null || val === "") {
          delete (payload as any)[key];
        }
      });
      if ((payload as any).bankDetail) {
        Object.keys((payload as any).bankDetail).forEach((key) => {
          const val = (payload as any).bankDetail[key];
          if (val === undefined || val === null || val === "") {
            delete (payload as any).bankDetail[key];
          }
        });
      }

      //  console.log(
      //    "🟦 Sending payload to server:",
      //    JSON.stringify(payload, null, 2)
      //  );

      // ✅ Send request
      const res = await api.put("/employees/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
    //  console.log("🟩 Server raw response:", res.data);
  
      // ✅ If backend returns updated data, merge into profile
      if (res?.data) {
        setProfile((prev) => ({
          ...(prev as any),
          ...(res.data as any),
          bankDetail: res.data.bankDetail || (prev as any).bankDetail,
        }));
      } else {
        // fallback: refetch if no response body
        const refetch = await api.get("/employees/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(refetch.data);
      }
  
      setEditing(false);
    //  console.log("✅ Profile updated successfully", payload);
      alert("Profile updated successfully");
    } catch (err: any) {
      console.error("❌ Failed to update profile:", err);
      alert(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  // cancel editing
  const handleCancel = () => {
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-[var(--text-muted)]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] transition-colors p-4">
        <div className="bg-[var(--card-bg)] rounded-xl p-8 shadow-lg border border-red-800 max-w-md mx-auto text-center">
          <div className="p-3 bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4">
            <User className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Profile Error
          </h2>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] transition-colors p-4">
        <div className="bg-[var(--card-bg)] rounded-xl p-8 shadow-lg border border-[var(--border-color)] max-w-md mx-auto text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            No Profile Found
          </h2>
          <p className="text-[var(--text-muted)]">
            Please contact HR to set up your employee profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Edit button top-right */}
        <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border-color)] mb-8 transition-colors">
          <div className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {(profile.firstName?.[0] || "").toUpperCase()}
                    {(profile.lastName?.[0] || "").toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <p className="text-lg text-[var(--text-muted)] mb-1">
                      {profile.user?.role || role || "Employee"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Employee ID: {profile.personNo}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        profile.status === "Active"
                          ? "bg-green-900/30 text-green-400 border border-green-700/50"
                          : "bg-red-900/30 text-red-400 border border-red-700/50"
                      }`}
                    >
                      <Activity className="w-4 h-4 mr-1.5" />
                      {profile.status}
                    </span>

                    <button
                      onClick={openEditor}
                      className="ml-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Clock className="w-4 h-4" />
                    <span>{getYearsOfService(profile.hireDate)} of service</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Building className="w-4 h-4" />
                    <span>{profile.department || "No department"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location || "Remote"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile content */}
        {/* Profile content */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* ───── Personal Info ───── */}
  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-sm transition-colors p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-500/10 rounded-lg">
        <User className="w-6 h-6 text-blue-500" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Personal Information
      </h2>
    </div>
    <div className="space-y-4">
      <InfoCard
        icon={User}
        label="Full Name"
        value={`${profile.firstName} ${profile.lastName}`}
      />
      <InfoCard icon={Mail} label="Work Email" value={profile.workEmail} copyable />
      <InfoCard
        icon={Phone}
        label="Phone Number"
        value={profile.phone ? formatPhoneNumber(profile.phone) : "Not provided"}
        copyable={!!profile.phone}
      />
      <InfoCard icon={MapPin} label="Work Location" value={profile.location || "Not specified"} />
    </div>
  </div>

  {/* ───── Employment Info ───── */}
  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-sm transition-colors p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-green-500/10 rounded-lg">
        <Briefcase className="w-6 h-6 text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Employment Details
      </h2>
    </div>
    <div className="space-y-4">
      <InfoCard icon={Briefcase} label="Job Title" value={profile.user?.role || role || "Employee"} />
      <InfoCard icon={Building} label="Department" value={profile.department || "Not assigned"} />
      <InfoCard icon={Calendar} label="Hire Date" value={formatDate(profile.hireDate)} />
      <InfoCard
        icon={Users}
        label="Reporting Manager"
        value={profile.manager ? `${profile.manager.firstName} ${profile.manager.lastName}` : "Direct Report"}
      />
      <InfoCard icon={Activity} label="Employment Status" value={profile.status} />
    </div>
  </div>
</div>

{/* ───── Bank Details (New Horizontal Section) ───── */}
<div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-sm p-6 transition-colors col-span-3">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-purple-500/10 rounded-lg">
        <Building className="w-6 h-6 text-purple-500" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Bank & Financial Details
      </h2>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <InfoCard label="Bank Name" value={profile.bankDetail?.bankName || "Not provided"} icon={Landmark} />
      <InfoCard label="Account Number" value={profile.bankDetail?.accountNumber || "Not provided"} icon={Activity} copyable />
      <InfoCard label="IFSC Code" value={profile.bankDetail?.ifscCode || "Not provided"} icon={FileDigit} copyable />
      <InfoCard label="Branch" value={profile.bankDetail?.branch || "Not provided"} icon={MapPin} />
      <InfoCard label="PF Number" value={profile.bankDetail?.pfNumber || "Not provided"} icon={Wallet} copyable />
      <InfoCard label="UAN Number" value={profile.bankDetail?.uan || "Not provided"} icon={Users} copyable />
    </div>
  </div>
</div>


        {/* Contact actions */}
        <div className="mt-8 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6 transition-colors">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {profile.workEmail && (
              <a
                href={`mailto:${profile.workEmail}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </a>
            )}
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Phone
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal / drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Edit Profile</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">First Name</span>
                <input
                  name="firstName"
                  value={editModel.firstName ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">Last Name</span>
                <input
                  name="lastName"
                  value={editModel.lastName ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">Phone</span>
                <input
                  name="phone"
                  value={editModel.phone ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">Work Email (read-only)</span>
                <input
                  name="workEmail"
                  value={profile.workEmail}
                  readOnly
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] opacity-70 cursor-not-allowed"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">Bank Name</span>
                <input
                  name="bankName"
                  value={editModel.bankName ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">Account Number</span>
                <input
                  name="accountNumber"
                  value={editModel.accountNumber ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">IFSC</span>
                <input
                  name="ifscCode"
                  value={editModel.ifscCode ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">Branch</span>
                <input
                  name="branchName"
                  value={editModel.branchName ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">PF Number</span>
                <input
                  name="pfNumber"
                  value={editModel.pfNumber ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-[var(--text-muted)] mb-1">UAN</span>
                <input
                  name="uanNumber"
                  value={editModel.uanNumber ?? ""}
                  onChange={handleEditChange}
                  className="px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 text-white"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                type="button"
                disabled={saving}
              >
                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
