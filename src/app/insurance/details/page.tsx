"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  ShieldCheck,
  FileText,
  Coins,
  Send,
  RefreshCw,
} from "lucide-react";
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
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function ECashPage() {
  const { token } = useAuth(); // Removed employeeId from destructuring
  const { theme } = useTheme();
  const [insurance, setInsurance] = useState<Insurance | null>(null);
  const [eCashAmount, setECashAmount] = useState("");
  const [convenienceFee, setConvenienceFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [convenienceCharges, setConvenienceCharges] = useState<
    ConvenienceCharge[]
  >([]);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>("");

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

  const handleClaim = async () => {
    if (!insurance) return alert("No insurance record found.");
    if (!eCashAmount) return alert("Please enter an E-Cash amount.");

    setSubmitting(true);
    try {
      await api.put(
        `/insurance/${insurance.id}/ecash`,
        {
          eCashAmount: Number(eCashAmount),
          convenienceFee: Number(convenienceFee) || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ E-Cash claim submitted successfully!");
      setECashAmount("");
      setConvenienceFee("");

      // Refresh insurance data to show updated values
      const res = await api.get("/insurance/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.length > 0) {
        setInsurance(res.data[0]);
      }
    } catch (err: any) {
      console.error("Error claiming E-Cash:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to submit claim. Please try again.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 space-y-6 min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
          <Wallet className="text-purple-500" /> E-Cash Claim
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
          Refresh Charges
        </button>
      </div>

      {/* Debug info removed for production - sensitive details are not displayed */}

      {/* Insurance Summary - Only show if insurance exists */}
      {loading ? (
        <p className="text-[var(--text-muted)]">Loading your insurance...</p>
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

          {/* Right Card: Claim Form */}
          <div className="border border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)] p-5 space-y-4 transition-colors">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Coins className="text-amber-500" size={20} /> Submit E-Cash Claim
            </h2>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Enter new E-Cash amount"
                value={eCashAmount}
                onChange={(e) => setECashAmount(e.target.value)}
                className="p-2 border border-[var(--border-color)] rounded-md w-full bg-transparent focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
              <input
                type="number"
                placeholder="Enter convenience fee (optional)"
                value={convenienceFee}
                onChange={(e) => setConvenienceFee(e.target.value)}
                className="p-2 border border-[var(--border-color)] rounded-md w-full bg-transparent focus:ring-2 focus:ring-purple-500 outline-none transition"
              />

              <button
                onClick={handleClaim}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <Send size={16} />
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>
            </div>

            <div className="text-xs text-[var(--text-muted)] mt-2">
              ⚠️ Note: Please verify details before submitting an E-Cash claim.
              Once processed, changes may require admin approval.
            </div>
          </div>
        </section>
      )}

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

      {/* Convenience Charges Section - Show if we have an employeeId */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
            <Coins className="text-amber-500" /> Convenience Charges
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
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {chargesLoading ? (
                  <tr>
                    <td
                      colSpan={4}
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
                  convenienceCharges.map((charge) => (
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
                      <td className="p-3 text-[var(--text-muted)]">
                        {new Date(charge.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
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
    </main>
  );
}
