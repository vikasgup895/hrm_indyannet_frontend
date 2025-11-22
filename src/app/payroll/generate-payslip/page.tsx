// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { api } from "@/lib/api";
// import { useAuth } from "@/store/auth";
// import {
//   Download,
//   FileText,
//   Calendar as CalIcon,
//   UserRound,
//   ArrowLeft,
//   RefreshCcw,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// /* ───────────────────────────────── Types ───────────────────────────────── */
// type BasicEmployee = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   department?: string | null;
//   workEmail?: string | null;
// };

// type BankDetail = {
//   bankName?: string | null;
//   accountNumber?: string | null;
//   ifscCode?: string | null;
//   branch?: string | null;
//   pfNumber?: string | null;
//   uan?: string | null;
// };

// type FullEmployee = {
//   id: string;
//   personNo: string;
//   firstName: string;
//   lastName: string;
//   workEmail: string;
//   department?: string | null;
//   location?: string | null;
//   hireDate?: string | null;
//   user?: { role?: string | null } | null;
//   bankDetail?: BankDetail | null;
// };

// /* ─────────────────────────────── Utilities ─────────────────────────────── */
// const inr = (n: number) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(n);

// function toIndianWords(num: number): string {
//   if (Number.isNaN(num)) return "";
//   if (num === 0) return "Zero Rupees Only";
//   const belowTwenty = [
//     "",
//     "One",
//     "Two",
//     "Three",
//     "Four",
//     "Five",
//     "Six",
//     "Seven",
//     "Eight",
//     "Nine",
//     "Ten",
//     "Eleven",
//     "Twelve",
//     "Thirteen",
//     "Fourteen",
//     "Fifteen",
//     "Sixteen",
//     "Seventeen",
//     "Eighteen",
//     "Nineteen",
//   ];
//   const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

//   const two = (n: number) =>
//     n < 20
//       ? belowTwenty[n]
//       : `${tens[Math.floor(n / 10)]}${n % 10 ? " " + belowTwenty[n % 10] : ""}`;

//   const crore = Math.floor(num / 10000000);
//   const lakh = Math.floor((num % 10000000) / 100000);
//   const thousand = Math.floor((num % 100000) / 1000);
//   const hundred = Math.floor((num % 1000) / 100);
//   const rest = num % 100;

//   const parts: string[] = [];
//   if (crore) parts.push(`${two(crore)} Crore`);
//   if (lakh) parts.push(`${two(lakh)} Lakh`);
//   if (thousand) parts.push(`${two(thousand)} Thousand`);
//   if (hundred) parts.push(`${belowTwenty[hundred]} Hundred`);
//   if (rest) parts.push(two(rest));

//   return `${parts.join(" ")} Rupees Only`.replace(/\s+/g, " ").trim();
// }

// function monthLabel(isoYM: string) {
//   if (!isoYM) return "";
//   const [y, m] = isoYM.split("-").map(Number);
//   const d = new Date(y, (m || 1) - 1, 1);
//   return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
// }

// /* ─────────────────────────────── Component ─────────────────────────────── */
// export default function PayslipPage() {
//   const router = useRouter();
//   const { token } = useAuth();

//   const [employees, setEmployees] = useState<BasicEmployee[]>([]);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

//   const [month, setMonth] = useState<string>(() => {
//     const d = new Date();
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//   });

//   const [emp, setEmp] = useState<FullEmployee | null>(null);
//   const [loadingEmp, setLoadingEmp] = useState(false);
//   const [loadingList, setLoadingList] = useState(true);

//   const [showSlip, setShowSlip] = useState(false);
//   const [generating, setGenerating] = useState(false);

//   // inputs
//   const [earnings, setEarnings] = useState({
//     basic: 0,
//     hra: 0,
//     conveyance: 0,
//     medical: 0,
//     bonus: 0,
//     other: 0,
//   });
//   const [deductions, setDeductions] = useState({
//     epf: 0,
//     professionalTax: 0,
//     other: 0,
//   });

//   const payslipRef = useRef<HTMLDivElement>(null);

//   /* ─────────────────────── Data: employees + details ────────────────────── */
//   useEffect(() => {
//     (async () => {
//       try {
//         if (!token) return;
//         setLoadingList(true);
//         const res = await api.get("/employees/basic/all", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const list = res.data || [];
//         setEmployees(list);
//         if (list?.length && !selectedEmployeeId) setSelectedEmployeeId(list[0].id);
//       } catch (e) {
//         console.error("Failed to load employees:", e);
//       } finally {
//         setLoadingList(false);
//       }
//     })();
//   }, [token]);

//   const fetchEmployee = async (id: string) => {
//     if (!id || !token) return;
//     try {
//       setLoadingEmp(true);
//       const res = await api.get(`/employees/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setEmp(res.data);
//     } catch (e) {
//       console.error("Failed to load employee:", e);
//       setEmp(null);
//     } finally {
//       setLoadingEmp(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedEmployeeId) fetchEmployee(selectedEmployeeId);
//   }, [selectedEmployeeId]);

//   /* ───────────────────────────── Calculations ───────────────────────────── */
//   const grossEarnings = useMemo(
//     () =>
//       earnings.basic +
//       earnings.hra +
//       earnings.conveyance +
//       earnings.medical +
//       earnings.bonus +
//       earnings.other,
//     [earnings]
//   );
//   const totalDeductions = useMemo(
//     () => deductions.epf + deductions.professionalTax + deductions.other,
//     [deductions]
//   );
//   const netPay = useMemo(
//     () => Math.max(0, grossEarnings - totalDeductions),
//     [grossEarnings, totalDeductions]
//   );

//   /* ─────────────────────────────── Handlers ─────────────────────────────── */
//   const setEarn = (key: keyof typeof earnings, v: number | string) =>
//     setEarnings((s) => ({ ...s, [key]: Number(v) || 0 }));
//   const setDed = (key: keyof typeof deductions, v: number | string) =>
//     setDeductions((s) => ({ ...s, [key]: Number(v) || 0 }));

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedEmployeeId) {
//       alert("Please select an employee first.");
//       return;
//     }

//     setGenerating(true);

//     try {
//       console.log("🔍 FETCHING PAYROLL RUNS...");

//       const runRes = await api.get("/payroll/runs", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       console.log("📦 /payroll/runs response:", JSON.stringify(runRes.data, null, 2));

//       let run = runRes.data.find((r: any) =>
//       monthLabel(r.periodEnd) === monthLabel(month) && r.status === "DRAFT"
//     );

//     if (!run) {
//       run = runRes.data
//         .filter((r: any) => monthLabel(r.periodEnd) === monthLabel(month))
//         .sort(
//           (a: any, b: any) =>
//             new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
//         )[0];
//     }

//     if (!run) {
//       alert("❌ No payroll run found for this month.");
//       return;
//     }

//       const payload = {
//         employeeId: selectedEmployeeId,
//         runId: run.id,
//         gross: grossEarnings,
//         deductions: totalDeductions,
//         net: netPay,
//         currency: "INR",
//       };

//       console.log("📤 /payroll/generate payload:", payload);

//       const genRes = await api.post("/payroll/generate", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       console.log("✅ Payslip generated:", genRes.data);
//       alert("✅ Payslip generated successfully!");

//       setShowSlip(true);

//       setTimeout(() => {
//         payslipRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//       }, 150);
//     } catch (err: any) {
//       console.error("❌ Error generating payslip:", err);
//       const msg = err?.response?.data?.message ?? err?.message ?? "Unknown error";
//       alert(`❌ ${msg}`);
//     } finally {
//       setGenerating(false);
//     }
//   };

//   // Bulletproof html2canvas: render from an off-screen, inlined clone
//   const onDownloadPdf = async () => {
//     if (!payslipRef.current) return;
//     const source = payslipRef.current;

//     const clone = source.cloneNode(true) as HTMLElement;
//     clone.style.background = "white";

//     clone.querySelectorAll("*").forEach((node) => {
//       const el = node as HTMLElement;
//       el.style.color = "black";
//       el.style.backgroundColor = "white";
//       el.style.borderColor = "black";
//       el.style.boxShadow = "none";
//       el.style.filter = "none";
//     });

//     const container = document.createElement("div");
//     container.style.position = "fixed";
//     container.style.left = "-9999px";
//     container.appendChild(clone);
//     document.body.appendChild(container);

//     const canvas = await html2canvas(clone, {
//       scale: 2,
//       backgroundColor: "#fff",
//       useCORS: true,
//     });

//     document.body.removeChild(container);

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "pt", "a4");

//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const imgWidth = pageWidth - 40;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
//     const fileName = `Payslip_${emp?.firstName ?? "Employee"}_${monthLabel(month).replace(
//       " ",
//       "_"
//     )}.pdf`;
//     pdf.save(fileName);
//   };

//   /* ──────────────────────────────── Render ──────────────────────────────── */
//   return (
//     <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] px-4 py-6">
//       <div className="mx-auto max-w-6xl">
//         {/* Top bar with Back */}
//         <div className="mb-3">
//           <button
//             onClick={() => router.back()}
//             className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--card-bg)]"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             <span className="text-sm">Back</span>
//           </button>
//         </div>

//         <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
//           <FileText className="text-blue-500" /> Generate Payslip
//         </h1>

//         {/* Form card */}
//         <form
//           onSubmit={handleSubmit}
//           className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 mb-6"
//         >
//           {/* Inputs row */}
//           <div className="grid md:grid-cols-4 gap-4">
//             <label className="flex flex-col">
//               <span className="text-sm text-[var(--text-muted)] mb-1">Select Employee</span>
//               <select
//                 value={selectedEmployeeId}
//                 onChange={(e) => setSelectedEmployeeId(e.target.value)}
//                 className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]"
//               >
//                 {loadingList && <option>Loading…</option>}
//                 {!loadingList && employees.length === 0 && <option>No employees</option>}
//                 {!loadingList &&
//                   employees.map((e) => (
//                     <option key={e.id} value={e.id}>
//                       {e.firstName} {e.lastName}
//                     </option>
//                   ))}
//               </select>
//             </label>

//             <label className="flex flex-col">
//               <span className="text-sm text-[var(--text-muted)] mb-1">Month</span>
//               <div className="relative">
//                 <input
//                   type="month"
//                   value={month}
//                   onChange={(e) => setMonth(e.target.value)}
//                   className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pr-10"
//                 />
//                 <CalIcon className="w-4 h-4 absolute right-3 top-3 text-[var(--text-muted)]" />
//               </div>
//             </label>
//           </div>

//           {/* Earnings / Deductions */}
//           <div className="grid md:grid-cols-2 gap-6 mt-6">
//             <div>
//               <h3 className="font-semibold mb-2">Earnings</h3>
//               <div className="grid grid-cols-2 gap-3">
//                 {(
//                   [
//                     ["basic", "Basic"],
//                     ["hra", "HRA"],
//                     ["conveyance", "Conveyance Allowance"],
//                     ["medical", "Medical"],
//                     ["bonus", "Bonus"],
//                     ["other", "Other"],
//                   ] as const
//                 ).map(([key, label]) => (
//                   <label key={key} className="text-sm">
//                     <span className="text-[var(--text-muted)]">{label}</span>
//                     <input
//                       type="number"
//                       inputMode="decimal"
//                       className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]"
//                       placeholder="Enter amount ..."
//                       value={earnings[key] || ""}
//                       onChange={(e) => setEarn(key, e.target.value)}
//                     />
//                   </label>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <h3 className="font-semibold mb-2">Deductions</h3>
//               <div className="grid grid-cols-2 gap-3">
//                 {(
//                   [
//                     ["epf", "EPF Contribution"],
//                     ["professionalTax", "Professional Tax"],
//                     ["other", "Other"],
//                   ] as const
//                 ).map(([key, label]) => (
//                   <label key={key} className="text-sm">
//                     <span className="text-[var(--text-muted)]">{label}</span>
//                     <input
//                       type="number"
//                       inputMode="decimal"
//                       className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]"
//                       placeholder="Enter amount ..."
//                       value={deductions[key] || ""}
//                       onChange={(e) => setDed(key, e.target.value)}
//                     />
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Bottom actions (centered) */}
//           <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
//             <button
//               type="submit"
//               disabled={generating}
//               className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70"
//             >
//               {generating ? (
//                 <>
//                   <RefreshCcw className="w-4 h-4 animate-spin" />
//                   Generating…
//                 </>
//               ) : (
//                 <>Generate Payslip</>
//               )}
//             </button>
//             <button
//               type="button"
//               onClick={onDownloadPdf}
//               disabled={!showSlip || !emp}
//               className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border-color)] disabled:opacity-50"
//               title={!showSlip ? "Generate a payslip first" : "Download PDF"}
//             >
//               <Download className="w-4 h-4" />
//               Download PDF
//             </button>
//           </div>
//         </form>

//         {/* Payslip Preview (only after success) */}
//         {showSlip && (
//           <div
//             ref={payslipRef}
//             id="payslip"
//             className="bg-white text-black rounded-lg border p-8 print:p-0"
//           >
//             {/* Header */}
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-md bg-red-600 text-white font-black flex items-center justify-center">
//                   IN
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Kerala India</div>
//                   <div className="font-semibold text-gray-800">Indyanet HRM</div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="text-xs text-gray-500">Payslip for the Month</div>
//                 <div className="text-sm font-semibold text-gray-800">{monthLabel(month)}</div>
//               </div>
//             </div>

//             {/* Employee Summary */}
//             <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm">
//               <Field label="Employee Name" value={`${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`} />
//               <Field label="Designation" value={emp?.user?.role ?? "—"} />
//               <Field label="Employee ID" value={emp?.personNo ?? "—"} />
//               <Field label="Department" value={emp?.department ?? "—"} />
//               <Field
//                 label="Date of Joining"
//                 value={emp?.hireDate ? new Date(emp.hireDate).toLocaleDateString("en-GB") : "—"}
//               />
//               <Field label="Pay Period" value={monthLabel(month)} />
//               <Field label="Pay Date" value={new Date().toLocaleDateString("en-GB")} />
//               <Field label="PF A/C Number" value={emp?.bankDetail?.pfNumber ?? "—"} />
//               <Field label="UAN" value={emp?.bankDetail?.uan ?? "—"} />
//             </div>

//             {/* Earnings & Deductions */}
//             <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
//               <div className="grid grid-cols-2 bg-gray-50 text-gray-700 font-semibold text-sm">
//                 <div className="px-4 py-2 border-r border-gray-200">EARNINGS</div>
//                 <div className="px-4 py-2">DEDUCTIONS</div>
//               </div>
//               <div className="grid grid-cols-2">
//                 <div className="border-r border-gray-200">
//                   <Row label="Basic" amount={earnings.basic} />
//                   <Row label="HRA" amount={earnings.hra} />
//                   <Row label="Conveyance Allowance" amount={earnings.conveyance} />
//                   <Row label="Medical" amount={earnings.medical} />
//                   <Row label="Bonus" amount={earnings.bonus} />
//                   <Row label="Other" amount={earnings.other} />
//                   <Row label="Gross Earnings" amount={grossEarnings} bold />
//                 </div>
//                 <div>
//                   <Row label="EPF Contribution" amount={deductions.epf} />
//                   <Row label="Professional Tax" amount={deductions.professionalTax} />
//                   <Row label="Other" amount={deductions.other} />
//                   <Row label="Total Deductions" amount={totalDeductions} bold />
//                 </div>
//               </div>
//             </div>

//             {/* Net Pay */}
//             <div className="mt-4 grid grid-cols-3 gap-4">
//               <div className="col-span-2 rounded-lg border border-green-200 bg-green-50 p-4">
//                 <div className="text-xs text-gray-500">TOTAL NET PAYABLE</div>
//                 <div className="text-lg font-semibold text-gray-800">{inr(netPay)}</div>
//               </div>
//               <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center justify-center">
//                 <div className="text-center">
//                   <div className="text-xs text-gray-500">Net Pay</div>
//                   <div className="text-2xl font-bold text-gray-900">{inr(netPay)}</div>
//                 </div>
//               </div>
//             </div>

//             {/* Amount in Words */}
//             <div className="mt-6 text-center text-xs text-gray-600">
//               Amount in words :{" "}
//               <span className="font-medium text-gray-800">
//                 {toIndianWords(Math.round(netPay))}
//               </span>
//             </div>

//             <div className="mt-2 text-center text-[10px] text-gray-400">
//               This is a system generated payslip.
//             </div>

//             {/* Footer – signature */}
//             <div className="mt-10 flex items-center justify-between text-sm text-gray-600">
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
//                   <UserRound className="w-4 h-4 text-gray-600" />
//                 </div>
//                 <div>
//                   <div className="font-medium text-gray-800">
//                     {emp ? `${emp.firstName} ${emp.lastName}` : "Employee"}
//                   </div>
//                   <div className="text-xs text-gray-500">{emp?.user?.role ?? "—"}</div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="text-xs text-gray-500">Authorized Signatory</div>
//                 <div className="mt-6 border-t border-gray-300 w-40 ml-auto" />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ────────────────────── Little presentational bits ─────────────────────── */
// function Field({ label, value }: { label: string; value?: string | number | null }) {
//   return (
//     <div className="flex gap-2">
//       <span className="text-gray-500 w-36">{label} :</span>
//       <span className="text-gray-800 font-medium">{value ?? "—"}</span>
//     </div>
//   );
// }

// function Row({ label, amount, bold = false }: { label: string; amount: number; bold?: boolean }) {
//   return (
//     <div className={`grid grid-cols-2 text-sm ${bold ? "bg-gray-50 font-semibold" : ""}`}>
//       <div className="px-4 py-2 border-b border-gray-200">{label}</div>
//       <div className="px-4 py-2 border-b border-gray-200 text-right">{inr(amount)}</div>
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { downloadPayslipPDF } from "@/lib/payslip-pdf";
import logo from "@/assets/logo.jpg";
import { useAuth } from "@/store/auth";
import {
  Download,
  FileText,
  UserRound,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ───────────────────────────────── Types ───────────────────────────────── */
type BasicEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  department?: string | null;
  workEmail?: string | null;

};

type BankDetail = {
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  branch?: string | null;
  pfNumber?: string | null;
  uan?: string | null;
};

type FullEmployee = {
  id: string;
  personNo: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  department?: string | null;
  designation?: string;
  location?: string | null;
  hireDate?: string | null;
  user?: { role?: string | null } | null;
  bankDetail?: BankDetail | null;
};

/* ─────────────────────────────── Utilities ─────────────────────────────── */
const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

function toIndianWords(num: number): string {
  if (Number.isNaN(num)) return "";
  if (num === 0) return "Zero Rupees Only";
  const belowTwenty = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const two = (n: number) =>
    n < 20
      ? belowTwenty[n]
      : `${tens[Math.floor(n / 10)]}${n % 10 ? " " + belowTwenty[n % 10] : ""}`;

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = num % 100;

  const parts: string[] = [];
  if (crore) parts.push(`${two(crore)} Crore`);
  if (lakh) parts.push(`${two(lakh)} Lakh`);
  if (thousand) parts.push(`${two(thousand)} Thousand`);
  if (hundred) parts.push(`${belowTwenty[hundred]} Hundred`);
  if (rest) parts.push(two(rest));

  return `${parts.join(" ")} Rupees Only`.replace(/\s+/g, " ").trim();
}

function monthLabel(isoYM: string) {
  if (!isoYM) return "";
  const [y, m] = isoYM.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Return yyyy-mm from a payrollRun periodEnd (BUG-3 util) */
function runMonth(r: any): string {
  return new Date(r.periodEnd).toISOString().slice(0, 7);
}

/* ─────────────────────────────── Component ─────────────────────────────── */
export default function PayslipPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [employees, setEmployees] = useState<BasicEmployee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [emp, setEmp] = useState<FullEmployee | null>(null);
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const [showSlip, setShowSlip] = useState(false);
  const [generating, setGenerating] = useState(false);

  // inputs
  const [earnings, setEarnings] = useState({
    basic: 0,
    hra: 0,
    conveyance: 0,
    medical: 0,
    bonus: 0,
    other: 0,
  });
  const [deductions, setDeductions] = useState({
    epf: 0,
    professionalTax: 0,
    other: 0,
  });
  // Track input field values as strings to avoid leading zeros
  const [earningsInput, setEarningsInput] = useState({
    basic: "",
    hra: "",
    conveyance: "",
    medical: "",
    bonus: "",
    other: "",
  });
  const [deductionsInput, setDeductionsInput] = useState({
    epf: "",
    professionalTax: "",
    other: "",
  });

  const payslipRef = useRef<HTMLDivElement>(null);

  /* ─────────────────────── Data: employees + details ────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        setLoadingList(true);
        const res = await api.get("/employees/basic/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = res.data || [];
        setEmployees(list);
        if (list?.length && !selectedEmployeeId)
          setSelectedEmployeeId(list[0].id);
      } catch (e) {
        console.error("Failed to load employees:", e);
      } finally {
        setLoadingList(false);
      }
    })();
  }, [token]);

  const fetchEmployee = async (id: string) => {
    if (!id || !token) return;
    try {
      setLoadingEmp(true);
      const res = await api.get(`/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmp(res.data);
    } catch (e) {
      console.error("Failed to load employee:", e);
      setEmp(null);
    } finally {
      setLoadingEmp(false);
    }
  };

  useEffect(() => {
    if (selectedEmployeeId) fetchEmployee(selectedEmployeeId);
  }, [selectedEmployeeId]);

  /* ───────────────────────────── Calculations ───────────────────────────── */
  const grossEarnings = useMemo(
    () =>
      earnings.basic +
      earnings.hra +
      earnings.conveyance +
      earnings.medical +
      earnings.bonus +
      earnings.other,
    [earnings]
  );
  const totalDeductions = useMemo(
    () => deductions.epf + deductions.professionalTax + deductions.other,
    [deductions]
  );
  const netPay = useMemo(
    () => Math.max(0, grossEarnings - totalDeductions),
    [grossEarnings, totalDeductions]
  );

  const setEarn = (key: keyof typeof earnings, v: number | string) => {
    const strValue = String(v);
    setEarningsInput((s) => ({ ...s, [key]: strValue }));
    const numValue = strValue === "" ? 0 : Number(strValue);
    if (!isNaN(numValue)) {
      setEarnings((s) => ({ ...s, [key]: numValue }));
    }
  };
  const setDed = (key: keyof typeof deductions, v: number | string) => {
    const strValue = String(v);
    setDeductionsInput((s) => ({ ...s, [key]: strValue }));
    const numValue = strValue === "" ? 0 : Number(strValue);
    if (!isNaN(numValue)) {
      setDeductions((s) => ({ ...s, [key]: numValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      alert("Please select an employee first.");
      return;
    }

    setGenerating(true);

    try {
      // 1) Get all runs
      const runRes = await api.get("/payroll/runs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const runs: any[] = Array.isArray(runRes.data) ? runRes.data : [];

      // 2) Filter runs for the SELECTED month (BUG-1 + BUG-3 fix)
      const targetMonth = month; // yyyy-mm from the input
      const monthRuns = runs.filter((r) => runMonth(r) === targetMonth);

      if (monthRuns.length === 0) {
        alert(`❌ No payroll run exists for ${monthLabel(targetMonth)}.`);
        return;
      }

      // 3) Choose DRAFT first; otherwise latest APPROVED within that month
      const run =
        monthRuns.find((r) => r.status === "DRAFT") ||
        monthRuns
          .filter((r) => r.status === "APPROVED")
          .sort(
            (a, b) =>
              new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
          )[0];

      if (!run) {
        alert(`❌ No usable payroll run found for ${monthLabel(targetMonth)}.`);
        return;
      }

      // 4) Generate payslip
      const payload = {
        employeeId: selectedEmployeeId,
        runId: run.id,
        gross: grossEarnings,
        deductions: totalDeductions,
        net: netPay,
        currency: "INR",

        basic: earnings.basic,
        hra: earnings.hra,
        conveyance: earnings.conveyance,
        medical: earnings.medical,
        bonus: earnings.bonus,
        other: earnings.other,
        epf: deductions.epf,
        professionalTax: deductions.professionalTax,
        otherDeduction: deductions.other,
      };

      await api.post("/payroll/generate", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Payslip generated successfully!");
      setShowSlip(true);

      setTimeout(() => {
        payslipRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    } catch (err: any) {
      console.error("❌ Error generating payslip:", err);
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Unknown error";
      alert(`❌ ${msg}`);
    } finally {
      setGenerating(false);
    }
  };

  // PDF: render from an off-screen, inlined clone (robust vs Tailwind)
  // const onDownloadPdf = async () => {
  //   if (!payslipRef.current) return;
  //   const source = payslipRef.current;

  //   const clone = source.cloneNode(true) as HTMLElement;
  //   clone.style.background = "white";

  //   clone.querySelectorAll("*").forEach((node) => {
  //     const el = node as HTMLElement;
  //     el.style.color = "black";
  //     el.style.backgroundColor = "white";
  //     el.style.borderColor = "black";
  //     el.style.boxShadow = "none";
  //     el.style.filter = "none";
  //   });

  //   const container = document.createElement("div");
  //   container.style.position = "fixed";
  //   container.style.left = "-9999px";
  //   container.appendChild(clone);
  //   document.body.appendChild(container);

  //   const canvas = await html2canvas(clone, {
  //     scale: 2,
  //     backgroundColor: "#fff",
  //     useCORS: true,
  //   });

  //   document.body.removeChild(container);

  //   const imgData = canvas.toDataURL("image/png");
  //   const pdf = new jsPDF("p", "pt", "a4");

  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const imgWidth = pageWidth - 40;
  //   const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //   pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
  //   const fileName = `Payslip_${emp?.firstName ?? "Employee"}_${monthLabel(month).replace(
  //     " ",
  //     "_"
  //   )}.pdf`;
  //   pdf.save(fileName);
  // };
  // 🧾 Download Payslip PDF (Full Screenshot-Matching Layout)
  const onDownloadPdf = () => {
    if (!emp) return alert("No employee selected.");

    downloadPayslipPDF(null, {
      employee: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.department ?? undefined,
        designation:emp.designation ?? undefined,
        hireDate: emp.hireDate ?? undefined,
      },
      employeeId: emp.personNo,
      email: emp.workEmail ?? "—",
      payPeriod: monthLabel(month),
      payDate: new Date().toLocaleDateString("en-GB"),
      pfNumber: emp.bankDetail?.pfNumber ?? "—",
      uan: emp.bankDetail?.uan ?? "—",
      earnings: {
        Basic: earnings.basic,
        HRA: earnings.hra,
        "Conveyance Allowance": earnings.conveyance,
        Medical: earnings.medical,
        Bonus: earnings.bonus,
        Other: earnings.other,
      },
      deductions: {
        "EPF Contribution": deductions.epf,
        "Professional Tax": deductions.professionalTax,
        Other: deductions.other,
      },
      gross: grossEarnings,
      totalDeductions: totalDeductions,
      net: netPay,
      netWords: toIndianWords(Math.round(netPay)),
    });
  };

  /* ──────────────────────────────── Render ──────────────────────────────── */
  return (
    <div className="min-h-screen bg-(--background) text-(--text-primary) px-4 py-6">
      <div className="mx-auto max-w-6xl">
        {/* Top bar with Back */}
        <div className="mb-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-(--border-color) hover:bg-(--card-bg)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-blue-500" /> Generate Payslip
        </h1>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-(--card-bg) border border-(--border-color) rounded-xl p-4 mb-6"
        >
          {/* Inputs row */}
          <div className="grid md:grid-cols-4 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-(--text-muted) mb-1">
                Select Employee
              </span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-(--border-color) bg-(--card-bg)"
              >
                {loadingList && <option>Loading…</option>}
                {!loadingList && employees.length === 0 && (
                  <option>No employees</option>
                )}
                {!loadingList &&
                  employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-(--text-muted) mb-1">
                Month (payslip period)
              </span>
              <div className="relative">
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className=" px-2 py-2 rounded-lg border border-(--border-color) bg-(--card-bg) pr-1"
                />
              </div>
            </label>
          </div>

          {/* Earnings / Deductions */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-semibold mb-2">Earnings</h3>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["basic", "Basic"],
                    ["hra", "HRA"],
                    ["conveyance", "Conveyance Allowance"],
                    ["medical", "Medical"],
                    ["bonus", "Bonus"],
                    ["other", "Other"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="text-sm">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]"
                      placeholder="Enter amount ..."
                      value={earningsInput[key]}
                      onChange={(e) => setEarn(key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Deductions</h3>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["epf", "EPF Contribution"],
                    ["professionalTax", "Professional Tax"],
                    ["other", "Other"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="text-sm">
                    <span className="text-(--text-muted)">{label}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--card-bg)"
                      placeholder="Enter amount ..."
                      value={deductionsInput[key]}
                      onChange={(e) => setDed(key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom actions (centered) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70"
            >
              {generating ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>Generate Payslip</>
              )}
            </button>
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={!showSlip || !emp}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-(--border-color) disabled:opacity-50"
              title={!showSlip ? "Generate a payslip first" : "Download PDF"}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </form>

        {/* Payslip Preview (only after success) */}
        {showSlip && (
          <div
            ref={payslipRef}
            id="payslip"
            className="bg-white text-black rounded-lg border p-8 print:p-0"
          >
            {/* Header */}
            {/* Header */}
<div className="border-b border-gray-300 pb-5 mb-6">

  <div className="flex items-center justify-between">

    {/* Left: Logo */}
    <div className="flex items-center">
      <img
        src={logo.src}
        alt="Indyanet Logo"
        className="h-14 w-auto object-contain"
      />
    </div>

    {/* Center: Company Details */}
    <div className="text-center flex-1 px-4">
      <h1 className="text-2xl font-bold text-gray-900">Indyanet</h1>

      <p className="text-sm text-gray-600 leading-tight mt-1">
        Hustlehub Tech Park, 208, 27th Main Rd, ITI Layout, Sector 2,<br />
        HSR Layout, Bengaluru, Karnataka 560102, India
      </p>

      <p className="text-sm text-gray-600 mt-1">
        +91 81479 84043 &nbsp; | &nbsp; support@indyanet.com
      </p>
    </div>

    {/* Right: Payslip Month */}
    <div className="text-right w-40">
      <div className="text-xs text-gray-500">Payslip for the Month</div>
      <div className="text-sm font-semibold text-gray-800">
        {monthLabel(month)}
      </div>
    </div>

  </div>
</div>


            {/* Employee Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm">
              <Field
                label="Employee Name"
                value={`${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`}
              />
              <Field label="Designation" value={emp?.designation?? "—"} />
              <Field label="Employee ID" value={emp?.personNo ?? "—"} />
              <Field label="Department" value={emp?.department ?? "—"} />
              <Field
                label="Date of Joining"
                value={
                  emp?.hireDate
                    ? new Date(emp.hireDate).toLocaleDateString("en-GB")
                    : "—"
                }
              />
              <Field label="Pay Period" value={monthLabel(month)} />
              <Field
                label="Pay Date"
                value={new Date().toLocaleDateString("en-GB")}
              />
              <Field
                label="PF A/C Number"
                value={emp?.bankDetail?.pfNumber ?? "—"}
              />
              <Field label="UAN" value={emp?.bankDetail?.uan ?? "—"} />
            </div>

            {/* Earnings & Deductions */}
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 bg-gray-50 text-gray-700 font-semibold text-sm">
                <div className="px-4 py-2 border-r border-gray-200">
                  EARNINGS
                </div>
                <div className="px-4 py-2">DEDUCTIONS</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="border-r border-gray-200">
                  <Row label="Basic" amount={earnings.basic} />
                  <Row label="HRA" amount={earnings.hra} />
                  <Row
                    label="Conveyance Allowance"
                    amount={earnings.conveyance}
                  />
                  <Row label="Medical" amount={earnings.medical} />
                  <Row label="Bonus" amount={earnings.bonus} />
                  <Row label="Other" amount={earnings.other} />
                  <Row label="Gross Earnings" amount={grossEarnings} bold />
                </div>
                <div>
                  <Row label="EPF Contribution" amount={deductions.epf} />
                  <Row
                    label="Professional Tax"
                    amount={deductions.professionalTax}
                  />
                  <Row label="Other" amount={deductions.other} />
                  <Row label="Total Deductions" amount={totalDeductions} bold />
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="col-span-2 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="text-xs text-gray-500">TOTAL NET PAYABLE</div>
                <div className="text-lg font-semibold text-gray-800">
                  {inr(netPay)}
                </div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Net Pay</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {inr(netPay)}
                  </div>
                </div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="mt-6 text-center text-xs text-gray-600">
              Amount in words :{" "}
              <span className="font-medium text-gray-800">
                {toIndianWords(Math.round(netPay))}
              </span>
            </div>

            <div className="mt-2 text-center text-[10px] text-gray-400">
              This is a system generated payslip.
            </div>

            {/* Footer – signature */}
            <div className="mt-10 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserRound className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {emp ? `${emp.firstName} ${emp.lastName}` : "Employee"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {emp?.designation || "—"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  <p className="text-base font-bold text-red-500">HR Department</p>
                  Authorized Signatory
                </div>
                <div className="mt-6 border-t border-gray-300 w-40 ml-auto" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────── Little presentational bits ─────────────────────── */
function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-36">{label} :</span>
      <span className="text-gray-800 font-medium">{value ?? "—"}</span>
    </div>
  );
}

function Row({
  label,
  amount,
  bold = false,
}: {
  label: string;
  amount: number;
  bold?: boolean;
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(n);
  return (
    <div
      className={`grid grid-cols-2 text-sm ${
        bold ? "bg-gray-50 font-semibold" : ""
      }`}
    >
      <div className="px-4 py-2 border-b border-gray-200">{label}</div>
      <div className="px-4 py-2 border-b border-gray-200 text-right">
        {fmt(amount)}
      </div>
    </div>
  );
}
