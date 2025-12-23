/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/store/auth";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  status?: string;
};

export default function InsuranceDashboard() {
  const { token, role } = useAuth();

  const [insurances, setInsurances] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  // Upload form state
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [insuranceId, setInsuranceId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  // List filtering state
  const [listFilterMode, setListFilterMode] = useState<
    "employee" | "insurance"
  >("employee");
  const [docFilterEmployeeId, setDocFilterEmployeeId] = useState<string>("");
  const [docFilterInsuranceId, setDocFilterInsuranceId] = useState<string>("");

  // File input ref to clear it
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [insuranceRes, employeeRes] = await Promise.all([
          api.get("/insurance"),
          api.get(
            "/employees",
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined
          ),
        ]);
        setInsurances(insuranceRes.data || []);
        const emps: Employee[] = (employeeRes.data || []).filter(
          (e: any) => (e.status ?? "Active").toLowerCase() === "active"
        );
        setEmployees(emps);
        // Initial documents list (unfiltered or filtered by employee if available)
        await fetchDocuments({
          employeeId: docFilterEmployeeId,
          insuranceId: docFilterInsuranceId,
        });
      } catch (err) {
        console.error("❌ Error fetching insurance/employees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const fetchDocuments = async ({
    employeeId,
    insuranceId,
  }: {
    employeeId?: string;
    insuranceId?: string;
  }) => {
    try {
      const params: any = {};
      if (employeeId) params.employeeId = employeeId;
      if (insuranceId) params.insuranceId = insuranceId;
      const res = await api.get("/insurance/docs", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params,
      });
      setDocuments(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
      setDocuments([]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return alert("Please choose an employee");
    if (!insuranceId.trim()) return alert("Enter Insurance ID");
    if (!file) return alert("Please select a document to upload");

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("employeeId", selectedEmployee);
      formData.append("insuranceId", insuranceId);

      // Upload to /insurance/docs (backend expects this path now)
      await api.post("/insurance/docs", formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Document uploaded successfully");

      // CLEAR ALL FORM FIELDS AFTER SUCCESSFUL UPLOAD
      setSelectedEmployee("");
      setInsuranceId("");
      setFile(null);

      // Clear the file input visually
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh documents list based on current filter mode
      if (listFilterMode === "employee") {
        await fetchDocuments({ employeeId: selectedEmployee });
        setDocFilterEmployeeId(selectedEmployee);
      } else {
        await fetchDocuments({ insuranceId });
        setDocFilterInsuranceId(insuranceId);
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err?.response?.data?.message || "❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearForm = () => {
    setSelectedEmployee("");
    setInsuranceId("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-400">
        Loading insurance records...
      </p>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Insurance Management
      </h1>

      {/* Admin or HR upload form */}
      {(role === "ADMIN" || role === "HR") && (
        <form
          onSubmit={handleUpload}
          className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Upload Insurance Document
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                📌 Document size should not exceed 1 MB
              </p>
            </div>
            <button
              type="button"
              onClick={clearForm}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Form
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {/* 1. Choose employee */}
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-2">
                Choose Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2"
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Insurance ID */}
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-2">
                Insurance ID
              </label>
              <input
                value={insuranceId}
                onChange={(e) => setInsuranceId(e.target.value)}
                placeholder="Enter insurance/policy id"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2"
              />
            </div>

            {/* 3. Upload document */}
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-2">
                Upload Document
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.png,.jpg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2"
              />
              {file && (
                <p className="text-xs text-green-600 mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      )}

      {insurances.length === 0 ? (
        <p className="text-gray-500">No insurance records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[var(--border-color)] text-sm">
            <thead className="bg-[var(--card-bg)] text-[var(--text-primary)]">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Policy</th>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Coverage</th>
                <th className="p-3 text-left">Bonus %</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map((i) => (
                <tr
                  key={i.id}
                  className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)]"
                >
                  <td className="p-3">
                    {i.employee?.firstName} {i.employee?.lastName}
                  </td>
                  <td className="p-3">{i.policyNumber}</td>
                  <td className="p-3">{i.provider}</td>
                  <td className="p-3">₹{i.coverageAmount}</td>
                  <td className="p-3">{i.bonusPercent ?? "—"}</td>
                  <td className="p-3 flex gap-3">
                    <Link
                      href={`/insurance/increment?id=${i.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Bonus
                    </Link>
                    <Link
                      href={`/insurance/ctc?id=${i.id}`}
                      className="text-green-500 hover:underline"
                    >
                      CTC
                    </Link>
                    <Link
                      href={`/insurance/convenience?id=${i.id}`}
                      className="text-yellow-400 hover:underline"
                    >
                      Fee
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📄 Documents list & filters */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Insurance Documents
        </h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-lg border ${
                listFilterMode === "employee"
                  ? "bg-blue-600 text-white"
                  : "bg-[var(--input-bg)] text-[var(--text-primary)]"
              }`}
              onClick={() => setListFilterMode("employee")}
              type="button"
            >
              Filter by Employee
            </button>
          </div>

          <div className="min-w-64">
            <select
              value={docFilterEmployeeId}
              onChange={async (e) => {
                const val = e.target.value;
                setDocFilterEmployeeId(val);
                setDocFilterInsuranceId("");
                await fetchDocuments({ employeeId: val || undefined });
              }}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2"
            >
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-[var(--border-color)] text-sm">
            <thead className="bg-[var(--card-bg)] text-[var(--text-primary)]">
              <tr>
                <th className="p-3 text-left">File</th>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Insurance ID</th>
                <th className="p-3 text-left">Uploaded At</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-[var(--text-muted)]"
                  >
                    No documents found.
                  </td>
                </tr>
              ) : (
                documents.map((d: any) => (
                  <tr
                    key={d.id}
                    className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)]"
                  >
                    <td className="p-3">
                      {d.title || d.fileName || d.originalName || "Document"}
                    </td>
                    <td className="p-3">
                      {d.employee?.firstName} {d.employee?.lastName}
                    </td>
                    <td className="p-3">{d.title}</td>
                    <td className="p-3">
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleString()
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
                        <span className="text-[var(--text-muted)]">N/A</span>
                      )}
                      {(role === "ADMIN" || role === "HR") && (
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = confirm(
                              "Delete this document? This cannot be undone."
                            );
                            if (!ok) return;
                            try {
                              await api.delete(`/insurance/docs/${d.id}`, {
                                headers: token
                                  ? { Authorization: `Bearer ${token}` }
                                  : undefined,
                              });
                              setDocuments((prev) =>
                                prev.filter((x) => x.id !== d.id)
                              );
                            } catch (err: any) {
                              alert(
                                err?.response?.data?.message || "Delete failed"
                              );
                            }
                          }}
                          className="ml-4 text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
