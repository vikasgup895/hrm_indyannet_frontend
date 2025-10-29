// "use client";
// import { useEffect, useState } from "react";
// import { api } from "@/lib/api";

// // ✅ Define the insurance data structure
// interface Insurance {
//   id: string;
//   policyNumber: string;
//   provider: string;
//   coverageAmount: number;
//   bonusPercent?: number | null;
//   convenienceFee?: number | null;
//   ctcFileUrl?: string | null;
//   employeeId: string;
// }

// export default function InsuranceDetailsPage() {
//   const [insurances, setInsurances] = useState<Insurance[]>([]); // ✅ type hint added
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api
//       .get("/insurance/my")
//       .then((res) => setInsurances(res.data as Insurance[]))
//       .catch((err) => console.error("[Insurance/My] Error:", err))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <p className="p-6">Loading your insurance details...</p>;

//   if (insurances.length === 0)
//     return (
//       <p className="p-6 text-gray-400">No insurance found for your account.</p>
//     );

//   const ins = insurances[0];

//   return (
//     <div className="p-6 space-y-4">
//       <h2 className="text-2xl font-semibold">My Insurance Details</h2>
//       <div className="bg-gray-800 p-4 rounded-md space-y-2 text-sm">
//         <p>
//           <strong>Policy Number:</strong> {ins.policyNumber}
//         </p>
//         <p>
//           <strong>Provider:</strong> {ins.provider}
//         </p>
//         <p>
//           <strong>Coverage:</strong> ₹{ins.coverageAmount}
//         </p>
//         <p>
//           <strong>Bonus %:</strong> {ins.bonusPercent ?? "-"}
//         </p>
//         <p>
//           <strong>Convenience Fee:</strong> ₹{ins.convenienceFee ?? 0}
//         </p>
//         <p>
//           <strong>CTC Sheet:</strong>{" "}
//           {ins.ctcFileUrl ? (
//             <a
//               href={`http://localhost:4000/${ins.ctcFileUrl}`}
//               target="_blank"
//               className="text-blue-400"
//             >
//               View File
//             </a>
//           ) : (
//             "Not Uploaded"
//           )}
//         </p>
//       </div>
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Wallet, ShieldCheck, FileText, Coins, Send } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/context/ThemeProvider";

export default function ECashPage() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [insurance, setInsurance] = useState<any>(null);
  const [eCashAmount, setECashAmount] = useState("");
  const [convenienceFee, setConvenienceFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 🧩 Fetch employee insurance automatically
  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        const res = await api.get("/insurance/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.length > 0) setInsurance(res.data[0]);
      } catch (err) {
        console.error("[E-Cash] Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchInsurance();
  }, [token]);

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
    } catch (err) {
      console.error("Error claiming E-Cash:", err);
      alert("❌ Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 space-y-6 min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Header */}
      <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
        <Wallet className="text-purple-500" /> E-Cash Claim
      </h1>

      {/* Insurance Summary */}
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
                <strong>Coverage:</strong> ₹{insurance.coverageAmount}
              </p>
              <p>
                <strong>Bonus %:</strong> {insurance.bonusPercent ?? "—"}
              </p>
              <p>
                <strong>Existing E-Cash:</strong> ₹{insurance.eCashAmount ?? 0}
              </p>
              <p>
                <strong>Convenience Fee:</strong> ₹
                {insurance.convenienceFee ?? 0}
              </p>
              <p>
                <strong>CTC Sheet:</strong>{" "}
                {insurance.ctcFileUrl ? (
                  <a
                    href={`http://localhost:4000/${insurance.ctcFileUrl}`}
                    target="_blank"
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

      {/* History */}
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
                    ₹{insurance.eCashAmount ?? 0}
                  </td>
                  <td className="p-3 text-amber-500">
                    ₹{insurance.convenienceFee ?? 0}
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
    </main>
  );
}
