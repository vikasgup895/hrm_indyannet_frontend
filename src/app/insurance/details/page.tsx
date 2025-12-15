"use client";

import { useEffect, useState } from "react";
import { Wallet, ShieldCheck, FileText, Coins, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/context/ThemeProvider";

// Define TypeScript interfaces
interface Insurance {
  id: string;
  employeeId: string;
  policyNumber: string;
  provider: string;
  startDate: string;
  endDate: string;
  coverageAmount: number;
  bonusPercent?: number;
  ctcFileUrl?: string;
  eCashAmount?: number;
  convenienceFee?: number;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    workEmail: string;
  };
}

interface ConvenienceCharge {
  id: string;
  employeeId: string;
  title: string;
  amount: number;
  date: string;
  status?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface InsuranceDocument {
  id: string;
  title: string;
  type: string;
  storageUrl: string;
  createdAt: string;
  employee?: { id: string; firstName: string; lastName: string };
}

export default function ECashPage() {
  const { token } = useAuth(); // Removed employeeId from destructuring
  const { theme } = useTheme();
  const [insurance, setInsurance] = useState<Insurance | null>(null);
  const [loading, setLoading] = useState(true);
  const [convenienceCharges, setConvenienceCharges] = useState<
    ConvenienceCharge[]
  >([]);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>("");
  const [docs, setDocs] = useState<InsuranceDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"claims" | "charges">("claims");

  // 🧩 Fetch convenience charges by first getting insurance to extract employeeId
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        const insuranceRes = await api.get("/insurance/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (insuranceRes.data && insuranceRes.data.length > 0) {
          const insuranceData = insuranceRes.data[0];
          setInsurance(insuranceData);
          const employeeId = insuranceData.employeeId;
          setCurrentEmployeeId(employeeId);

          // Fetch convenience charges for this employee
          await fetchConvenienceCharges(employeeId);
          await fetchDocuments();
        } else {
          // No insurance found. Try a safer fallback:
          // 1) Attempt to extract employeeId from the JWT payload (client-side) and
          //    call the convenience endpoint for the decoded employeeId.
          // 2) If decoding fails or no employeeId exists in the token, bail out.
          try {
            const payload = token.split(".")[1];
            const decoded: any = JSON.parse(atob(payload));
            const employeeIdFromToken =
              decoded.employeeId || decoded.sub || decoded.employee?.id;

            if (employeeIdFromToken) {
              setCurrentEmployeeId(employeeIdFromToken);
              await fetchConvenienceCharges(employeeIdFromToken);
              await fetchDocuments();
            } else {
              // no employee id available from token
              setConvenienceCharges([]);
            }
          } catch (err) {
            // token decode failed or token malformed - do not log sensitive token data
            setConvenienceCharges([]);
          }
        }
      } catch (err: any) {
        console.error("[E-Cash] Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchConvenienceCharges = async (employeeId: string) => {
      setChargesLoading(true);
      try {
        const chargesRes = await api.get(`/convenience/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConvenienceCharges(chargesRes.data || []);
      } catch (chargesError: any) {
        console.error("[Convenience Charges] Fetch Error:", chargesError);
        // Fail silently for users; don't expose sensitive error details
      } finally {
        setChargesLoading(false);
      }
    };

    const fetchDocuments = async () => {
      setDocsLoading(true);
      try {
        // Employee role: backend automatically scopes to own documents
        const res = await api.get("/insurance/docs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocs(res.data || []);
      } catch (err) {
        console.error("[Insurance Docs] Fetch Error:", err);
        setDocs([]);
      } finally {
        setDocsLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const refreshCharges = async () => {
    if (!currentEmployeeId) return;

    setChargesLoading(true);
    try {
      const chargesRes = await api.get(`/convenience/${currentEmployeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConvenienceCharges(chargesRes.data || []);
    } catch (chargesError: any) {
      console.error("[Convenience Charges] Refresh Error:", chargesError);
      // Do not expose error details to the UI
    } finally {
      setChargesLoading(false);
    }
  };

  // New charge form state
  const [chargeFormRows, setChargeFormRows] = useState<
    Array<{ fieldName: string; value: string; date: string }>
  >([
    { fieldName: "", value: "", date: new Date().toISOString().split("T")[0] },
  ]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Edit charge state
  const [editingChargeId, setEditingChargeId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    amount: string;
    date: string;
  }>({ title: "", amount: "", date: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleAddChargeRow = () => {
    setChargeFormRows([
      ...chargeFormRows,
      {
        fieldName: "",
        value: "",
        date: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveChargeRow = (index: number) => {
    setChargeFormRows(chargeFormRows.filter((_, i) => i !== index));
  };

  const handleChargeFieldChange = (
    index: number,
    field: "fieldName" | "value" | "date",
    newValue: string
  ) => {
    const updated = [...chargeFormRows];
    updated[index][field] = newValue;
    setChargeFormRows(updated);
  };

  const handleSubmitCharges = async () => {
    // Validate
    const validRows = chargeFormRows.filter(
      (r) => r.fieldName.trim() && r.value.trim() && r.date
    );
    if (validRows.length === 0) {
      setSubmitMessage({
        type: "error",
        text: "Please enter at least one charge with field name, value, and date",
      });
      return;
    }

    setSubmitLoading(true);
    setSubmitMessage(null);

    try {
      // Convert to API format
      const chargesData = validRows.map((row) => ({
        title: row.fieldName,
        amount: parseFloat(row.value),
        date: row.date,
      }));

      const response = await api.post(
        `/convenience/bulk-create`,
        { charges: chargesData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitMessage({
        type: "success",
        text: `Successfully submitted ${response.data.created.length} charge(s)!`,
      });
      setChargeFormRows([
        {
          fieldName: "",
          value: "",
          date: new Date().toISOString().split("T")[0],
        },
      ]);

      // Refresh charges list
      if (currentEmployeeId) {
        await refreshCharges();
      }
    } catch (err: any) {
      setSubmitMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit charges",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (charge: ConvenienceCharge) => {
    // Ensure date is in yyyy-MM-dd format (not ISO datetime)
    const dateStr =
      typeof charge.date === "string"
        ? charge.date.split("T")[0] // If ISO format, extract date part
        : new Date(charge.date).toISOString().split("T")[0]; // Convert to date string

    setEditingChargeId(charge.id);
    setEditFormData({
      title: charge.title,
      amount: charge.amount.toString(),
      date: dateStr,
    });
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditingChargeId(null);
    setEditFormData({ title: "", amount: "", date: "" });
  };

  // Update charge
  const handleUpdateCharge = async () => {
    if (
      !editingChargeId ||
      !editFormData.title.trim() ||
      !editFormData.amount.trim() ||
      !editFormData.date
    ) {
      alert("Please fill all fields");
      return;
    }

    setEditLoading(true);
    try {
      await api.put(
        `/convenience/my/${editingChargeId}`,
        {
          title: editFormData.title,
          amount: parseFloat(editFormData.amount),
          date: editFormData.date,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitMessage({
        type: "success",
        text: "Charge updated successfully!",
      });
      handleCloseEdit();

      if (currentEmployeeId) {
        await refreshCharges();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update charge");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete charge
  const handleDeleteCharge = async (chargeId: string) => {
    if (!confirm("Are you sure you want to delete this charge?")) return;

    setDeleteLoading(chargeId);
    try {
      await api.delete(`/convenience/my/${chargeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubmitMessage({
        type: "success",
        text: "Charge deleted successfully!",
      });

      if (currentEmployeeId) {
        await refreshCharges();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete charge");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <main className="p-1 space-y-6 min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
          <Wallet className="text-purple-500" /> Insurance & Claims
        </h1>
        <button
          onClick={refreshCharges}
          disabled={chargesLoading || !currentEmployeeId}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            size={14}
            className={chargesLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--border-color)]">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("claims")}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === "claims"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Wallet size={16} className="inline mr-2" />
            E-Cash Claims & Documents
          </button>
          <button
            onClick={() => setActiveTab("charges")}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === "charges"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Coins size={16} className="inline mr-2" />
            Convenience Charges
          </button>
        </div>
      </div>

      {/* Debug info removed for production - sensitive details are not displayed */}

      {/* Insurance Summary - Only show if insurance exists and on claims tab */}
      {activeTab === "claims" && (
        <>
          {loading ? (
            <p className="text-[var(--text-muted)]">
              Loading your insurance...
            </p>
          ) : !insurance ? (
            <div className="text-center py-10 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-2xl">
              <p className="text-[var(--text-muted)] mb-2 text-lg">
                No insurance record found
              </p>
              <p className="text-gray-500 text-sm">
                Once insurance is assigned, you can view and claim E-Cash here.
              </p>
            </div>
          ) : (
            <section className="grid md:grid-cols-2 gap-6">
              {/* Left Card: Details */}
              <div className="border border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)] p-5 space-y-3 transition-colors">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
                  <ShieldCheck className="text-blue-500" size={20} /> Insurance
                  Details
                </h2>
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Policy Number:</strong> {insurance.policyNumber}
                  </p>
                  <p>
                    <strong>Provider:</strong> {insurance.provider}
                  </p>
                  <p>
                    <strong>Coverage:</strong> ₹
                    {insurance.coverageAmount.toLocaleString()}
                  </p>
                  <p>
                    <strong>Bonus %:</strong> {insurance.bonusPercent ?? "—"}
                  </p>
                  <p>
                    <strong>Existing E-Cash:</strong> ₹
                    {insurance.eCashAmount?.toLocaleString() ?? 0}
                  </p>
                  <p>
                    <strong>Convenience Fee:</strong> ₹
                    {insurance.convenienceFee?.toLocaleString() ?? 0}
                  </p>
                  <p>
                    <strong>CTC Sheet:</strong>{" "}
                    {insurance.ctcFileUrl ? (
                      <a
                        href={`http://localhost:4000/${insurance.ctcFileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View File
                      </a>
                    ) : (
                      "Not Uploaded"
                    )}
                  </p>
                </div>
              </div>

              {/* Right Card: E-Cash Info */}
              <div className="border border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)] p-5 space-y-4 transition-colors">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
                  <Coins className="text-amber-500" size={20} /> E-Cash &
                  Convenience Info
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-blue-900 dark:text-blue-200">
                      <strong>Available E-Cash:</strong> ₹
                      {insurance.eCashAmount?.toLocaleString() ?? 0}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                    <p className="text-amber-900 dark:text-amber-200">
                      <strong>Convenience Fee:</strong> ₹
                      {insurance.convenienceFee?.toLocaleString() ?? 0}
                    </p>
                  </div>

                  <div className="text-xs text-[var(--text-muted)] p-2 bg-[var(--hover-bg)] rounded">
                    💡 Tip: Contact HR to request E-Cash or convenience charge
                    updates. Charges are managed by your HR department.
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Convenience Charge Submission Form */}
          <section className="border border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)] p-6 space-y-4 transition-colors">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Coins className="text-amber-500" size={20} /> Submit Convenience
              Charges
            </h2>

            {/* Submission Message */}
            {submitMessage && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  submitMessage.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {submitMessage.text}
              </div>
            )}

            {/* Form Rows */}
            <div className="space-y-3">
              {chargeFormRows.map((row, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-end bg-[var(--hover-bg)] p-3 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                      Field Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Travel, Food, Accommodation"
                      value={row.fieldName}
                      onChange={(e) =>
                        handleChargeFieldChange(
                          index,
                          "fieldName",
                          e.target.value
                        )
                      }
                      disabled={submitLoading}
                      className="w-full px-3 py-2 mt-1 bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="1"
                      value={row.value}
                      onChange={(e) =>
                        handleChargeFieldChange(index, "value", e.target.value)
                      }
                      disabled={submitLoading}
                      className="w-full px-3 py-2 mt-1 bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                      Date
                    </label>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        handleChargeFieldChange(index, "date", e.target.value)
                      }
                      disabled={submitLoading}
                      className="w-full px-3 py-2 mt-1 bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveChargeRow(index)}
                    disabled={chargeFormRows.length === 1 || submitLoading}
                    className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Remove row"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddChargeRow}
                disabled={submitLoading}
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
              >
                + Add Another Charge
              </button>

              <button
                onClick={handleSubmitCharges}
                disabled={
                  submitLoading ||
                  chargeFormRows.every(
                    (r) => !r.fieldName && !r.value && !r.date
                  )
                }
                className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {submitLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Charges"
                )}
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] bg-blue-50 dark:bg-blue-900/10 p-2 rounded">
              💡 Tip: Enter all your convenience charges here. HR will review
              and approve them. Once approved, they'll be added to your salary
              slip.
            </p>
          </section>

          {/* Claim History - Only show if insurance exists */}
          {insurance && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--text-primary)]">
                <FileText className="text-blue-400" /> Claim Summary
              </h2>

              <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] transition-colors">
                <table className="min-w-full text-sm text-[var(--text-primary)]">
                  <thead>
                    <tr className="bg-[var(--hover-bg)] text-[var(--text-muted)] text-left">
                      <th className="p-3">Policy</th>
                      <th className="p-3">E-Cash</th>
                      <th className="p-3">Convenience</th>
                      <th className="p-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors">
                      <td className="p-3">{insurance.policyNumber}</td>
                      <td className="p-3 text-green-500">
                        ₹{insurance.eCashAmount?.toLocaleString() ?? 0}
                      </td>
                      <td className="p-3 text-amber-500">
                        ₹{insurance.convenienceFee?.toLocaleString() ?? 0}
                      </td>
                      <td className="p-3">
                        {new Date(insurance.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Insurance Documents */}
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <FileText className="text-blue-500" /> My Insurance Documents
            </h2>
            <div className="mt-4 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] overflow-x-auto">
              <table className="min-w-full text-sm text-[var(--text-primary)]">
                <thead>
                  <tr className="bg-[var(--hover-bg)] text-[var(--text-muted)] text-left">
                    <th className="p-3">Insurance No</th>
                    <th className="p-3">Uploaded</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docsLoading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-[var(--text-muted)]"
                      >
                        Loading documents...
                      </td>
                    </tr>
                  ) : docs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-[var(--text-muted)]"
                      >
                        No documents uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    docs.map((d) => (
                      <tr
                        key={d.id}
                        className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <td className="p-3">{d.title}</td>
                        <td className="p-3">
                          {d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="p-3">
                          {d.storageUrl ? (
                            <a
                              href={`${
                                process.env.NODE_ENV === "production"
                                  ? "https://hrm.indyanet.com"
                                  : "http://localhost:4000"
                              }${d.storageUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-[var(--text-muted)]">
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Convenience Charges Tab */}
      {activeTab === "charges" && (
        <section className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Coins className="text-amber-500" /> My Convenience Charges
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--text-muted)]">
                {convenienceCharges.length} charge(s)
              </span>
            </div>
          </div>

          {!currentEmployeeId ? (
            <div className="text-center py-10 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-2xl">
              <p className="text-[var(--text-muted)] mb-2 text-lg">
                Employee ID not available
              </p>
              <p className="text-gray-500 text-sm">
                Please make sure you have an insurance record to determine your
                employee ID.
              </p>
            </div>
          ) : (
            <div className="border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] overflow-x-auto">
              <table className="min-w-full text-sm text-[var(--text-primary)]">
                <thead>
                  <tr className="bg-[var(--hover-bg)] text-[var(--text-muted)] text-left">
                    <th className="p-3">Title</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Rejection Reason</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chargesLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-4 text-center text-[var(--text-muted)]"
                      >
                        <RefreshCw
                          className="animate-spin inline mr-2"
                          size={16}
                        />
                        Loading convenience charges...
                      </td>
                    </tr>
                  ) : convenienceCharges.length > 0 ? (
                    convenienceCharges.map((charge: any) => (
                      <tr
                        key={charge.id}
                        className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <td className="p-3">{charge.title}</td>
                        <td className="p-3 text-amber-600 font-semibold">
                          ₹{charge.amount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          {new Date(charge.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3">
                          {charge.status ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                charge.status === "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : charge.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {charge.status}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-sm max-w-xs">
                          {charge.status === "REJECTED" &&
                          charge.rejectionReason ? (
                            <span className="text-red-600 font-medium">
                              {charge.rejectionReason}
                            </span>
                          ) : charge.status === "REJECTED" ? (
                            <span className="text-[var(--text-muted)] italic">
                              No reason provided
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-[var(--text-muted)]">
                          {new Date(charge.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 flex gap-2">
                          {(charge.status === "PENDING" ||
                            charge.status === "REJECTED") && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(charge)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium transition-colors"
                                title="Edit charge"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCharge(charge.id)}
                                disabled={deleteLoading === charge.id}
                                className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium disabled:opacity-50 transition-colors"
                                title="Delete charge"
                              >
                                {deleteLoading === charge.id ? "..." : "Delete"}
                              </button>
                            </>
                          )}
                          {charge.status === "APPROVED" && (
                            <span className="text-xs text-[var(--text-muted)]">
                              No actions
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-4 text-center text-[var(--text-muted)]"
                      >
                        No convenience charges assigned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Edit Charge Modal */}
      {editingChargeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 max-w-md w-full border border-[var(--border-color)]">
            <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
              Edit Convenience Charge
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[var(--text-muted)] uppercase">
                  Field Name
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  disabled={editLoading}
                  className="w-full px-3 py-2 mt-1 bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--text-muted)] uppercase">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, amount: e.target.value })
                  }
                  disabled={editLoading}
                  className="w-full px-3 py-2 mt-1 bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--text-muted)] uppercase">
                  Date
                </label>
                <input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, date: e.target.value })
                  }
                  disabled={editLoading}
                  className="w-full px-3 py-2 mt-1 bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseEdit}
                disabled={editLoading}
                className="flex-1 px-4 py-2 bg-[var(--hover-bg)] text-[var(--text-primary)] hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCharge}
                disabled={editLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {editLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
