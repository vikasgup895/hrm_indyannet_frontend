/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { X, FileText, User, Building, Calendar, CreditCard, DollarSign, Calculator, ArrowDownToLine } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PayslipModal({ data, onClose }: { data: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "detailed">("overview");
  const slipRef = useRef<HTMLDivElement>(null);

  const safe = (n: any) => (isNaN(Number(n)) ? 0 : Number(n));
  const gross = safe(data.gross);
  const deductions = safe(data.deductions);
  const net = safe(data.net);

  const month = new Date(data.payrollRun?.periodEnd).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  const handleDownloadPdf = async () => {
    if (!slipRef.current) return;

    const clone = slipRef.current.cloneNode(true) as HTMLElement;
    clone.style.background = "white";

    clone.querySelectorAll("*").forEach((n: any) => {
      n.style.color = "black";
      n.style.backgroundColor = "white";
      n.style.borderColor = "black";
      n.style.boxShadow = "none";
    });

    const hidden = document.createElement("div");
    hidden.style.position = "fixed";
    hidden.style.left = "-9999px";
    hidden.appendChild(clone);
    document.body.appendChild(hidden);

    const canvas = await html2canvas(clone, { scale: 2, backgroundColor: "#fff" });
    document.body.removeChild(hidden);

    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");

    const pageW = pdf.internal.pageSize.getWidth();
    const w = pageW - 40;
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(img, "PNG", 20, 20, w, h);
    pdf.save(`Payslip_${data.employee?.firstName}_${month}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--background)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Payslip</h2>
              <p className="text-sm text-[var(--text-muted)]">{month}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--border-color)]/40 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "overview" ? "text-blue-500 border-b-2 border-blue-500" : "text-[var(--text-muted)]"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("detailed")}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "detailed" ? "text-blue-500 border-b-2 border-blue-500" : "text-[var(--text-muted)]"
            }`}
          >
            Detailed
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto text-[var(--text-primary)]">
          {activeTab === "overview" ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Box icon={User} label="Employee" value={`${data.employee.firstName} ${data.employee.lastName}`} sub={`ID: ${data.employeeId}`} />
                <Box icon={Building} label="Department" value={data.employee.department ?? "—"} />
                <Box icon={Calendar} label="Month" value={month} />
                <Box icon={CreditCard} label="Status" value={data.status ?? "Paid"} />
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20 text-center">
                <div className="flex items-center gap-3 justify-center mb-3">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold">Net Salary</h3>
                </div>
                <div className="text-3xl font-bold text-blue-500">{formatINR(net)}</div>
              </div>
            </>
          ) : (
            <div ref={slipRef} className="space-y-4 p-6" style={{ background:"#fff", border:"1px solid #ccc", borderRadius:"12px" }}>

  {/* HEADER FIXED CENTERED */}
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-3">
      <div style={{width:'48px',height:'48px',borderRadius:'8px',background:"#dc2626"}} className="text-white font-black flex items-center justify-center">
        IN
      </div>
      <div>
        <div style={{color:"#111", fontSize:"18px", fontWeight:600}}>Indyanet HRM</div>
        <div style={{color:"#555", fontSize:"12px"}}>Bengaluru, Karnataka, India</div>
      </div>
    </div>

    <div style={{ textAlign:"right" }}>
      <div style={{color:"#777", fontSize:"11px"}}>Payslip for the Month</div>
      <div style={{color:"#111", fontSize:"14px", fontWeight:600}}>{month}</div>
    </div>
  </div>

  <Row label="Gross Earnings" value={gross} />
  <Row label="Total Deductions" value={deductions} />

  <div style={{border:"1px solid #86efac", background:"#f0fdf4", borderRadius:"12px", padding:"16px", textAlign:"center"}}>
    <div style={{color:"#4b5563", fontSize:"13px"}}>Net Pay</div>
    <div style={{color:"#15803d", fontSize:"32px", fontWeight:700}}>{formatINR(net)}</div>
  </div>

</div>

          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[var(--border-color)] bg-[var(--background)]">
          <span className="text-sm text-[var(--text-muted)]">Generated on {new Date().toLocaleDateString()}</span>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <ArrowDownToLine className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function Box({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-[var(--background)] border border-[var(--border-color)] p-4 rounded-xl">
      <Icon className="w-5 h-5 text-blue-500 mb-1" />
      <p className="font-semibold">{value}</p>
      {sub && <p className="text-sm text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-black border-b border-gray-300 pb-2">
      <span>{label}</span>
      <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)}</span>
    </div>
  );
}
