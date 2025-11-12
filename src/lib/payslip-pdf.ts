/* src/lib/payslip-pdf.ts
   📄 Generates a professional, printable PDF payslip.
   - Accepts (ref, dataObject) or (ref, filename)
   - Auto builds HTML layout if ref is null
   - Creates high-quality A4 PDF with html2canvas + jsPDF
*/

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ---------- Type Definitions ---------- */
export interface PayslipData {
  personNo?: string;
  employeeId: string;
  email?: string;
  employee?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    designation?: string;
    workEmail?: string;
    hireDate?: string;
    bankDetail?: {
      accountNumber?: string;
      pfNumber?: string;
      uan?: string;
    };
    user?: {
      role?: string;
    };
  };
  payrollRun?: {
    periodStart?: string;
    periodEnd?: string;
    payDate?: string;
  };
  payPeriod?: string;
  payDate?: string;
  pfNumber?: string;
  uan?: string;
  gross: number;
  totalDeductions: number;
  net: number;
  netWords?: string;
  earnings: Record<string, number>;
  deductions: Record<string, number>;
}

type MaybeRef = React.RefObject<HTMLElement> | null;

/* ---------- Utility Functions ---------- */
function formatINR(n = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}

function toIndianWords(num: number) {
  if (!num && num !== 0) return "";
  const a = [
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
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function two(n: number) {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
  }
  function three(n: number) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (hundred ? a[hundred] + " Hundred " : "") + (rest ? two(rest) : "");
  }
  if (num === 0) return "Zero Rupees Only";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = num % 100;
  const parts: string[] = [];
  if (crore) parts.push(three(crore) + " Crore");
  if (lakh) parts.push(three(lakh) + " Lakh");
  if (thousand) parts.push(three(thousand) + " Thousand");
  if (hundred) parts.push(a[hundred] + " Hundred");
  if (rest) parts.push(two(rest));
  return (parts.join(" ") + " Rupees Only").replace(/\s+/g, " ").trim();
}

/* ---------- Payslip HTML Builder ---------- */
function buildPayslipHTML(data: PayslipData) {
  const empName =
    data.employee?.firstName || data.employee?.lastName
      ? `${data.employee?.firstName || ""} ${data.employee?.lastName || ""}`.trim()
      : "Employee";
  const designation = data.employee?.designation || data.employee?.user?.role || "Employee";
  const empId = data.personNo || data.employeeId || "EMPXXXX";
  const dept = data.employee?.department || "—";

  const hireDateRaw = data.employee?.hireDate;
  const hireDate = hireDateRaw
    ? new Date(hireDateRaw).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const payPeriod =
    data.payPeriod ||
    `${data.payrollRun?.periodStart?.slice(0, 10)} - ${data.payrollRun?.periodEnd?.slice(0, 10)}`;
  const payDate = data.payDate
    ? new Date(data.payDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  const pf = data.pfNumber || data.employee?.bankDetail?.pfNumber || "Not Available";
  const uan = data.uan || data.employee?.bankDetail?.uan || "Not Available";

  const earnings = data.earnings || {
    Basic: data.gross ? Number(data.gross) * 0.7 : 0,
    HRA: data.gross ? Number(data.gross) * 0.12 : 0,
    "Conveyance Allowance": data.gross ? Number(data.gross) * 0.06 : 0,
    Medical: data.gross ? Number(data.gross) * 0.03 : 0,
    Bonus: 0,
    Other: 0,
  };

  const deductions = data.deductions || {
    "EPF Contribution": data.totalDeductions ? Number(data.totalDeductions) * 0.93 : 0,
    "Professional Tax": data.totalDeductions ? Number(data.totalDeductions) * 0.07 : 0,
    Other: 0,
  };

  const gross = data.gross ?? Object.values(earnings).reduce((s, v) => s + Number(v || 0), 0);
  const totalDeductions =
    data.totalDeductions ?? Object.values(deductions).reduce((s, v) => s + Number(v || 0), 0);
  const net = data.net ?? Math.max(0, Number(gross) - Number(totalDeductions));
  const words = data.netWords || toIndianWords(Math.round(Number(net)));

  const watermarkStyle = `
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%, -50%) rotate(-30deg);
    color:#f3f4f6;
    font-size:80px;
    font-weight:700;
    opacity:0.15;
    white-space:nowrap;
    z-index:0;
  `;

  return `
  <div id="payslip-root"
       style="font-family: Inter, Arial, sans-serif; width:794px; padding:24px; color:#111; background:#fff; border-radius:12px; border:1px solid #e5e7eb; box-sizing:border-box; position:relative;">
    
    <!-- Watermark -->
    <div style="${watermarkStyle}">INDYANET HRM</div>

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:36px; height:36px; border-radius:8px; background:#dc2626; color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center;">IN</div>
        <div>
          <div style="font-weight:600; font-size:16px; color:#111827;">Indyanet HRM</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px; color:#6b7280;">Payslip for the Month</div>
        <div style="font-size:14px; font-weight:600; color:#111827;">${payPeriod}</div>
      </div>
    </div>

    <!-- Employee Info -->
    <div style="margin-top:24px; display:grid; grid-template-columns:repeat(3,1fr); gap:12px; font-size:13px;">
      <div><strong>Employee Name:</strong> ${empName}</div>
      <div><strong>Designation:</strong> ${designation}</div>
      <div><strong>Employee ID:</strong> ${empId}</div>
      <div><strong>Department:</strong> ${dept}</div>
      <div><strong>Date of Joining:</strong> ${hireDate}</div>
      <div><strong>Pay Period:</strong> ${payPeriod}</div>
      <div><strong>Pay Date:</strong> ${payDate}</div>
      <div><strong>PF A/C Number:</strong> ${pf}</div>
      <div><strong>UAN:</strong> ${uan}</div>
    </div>

    <!-- EARNINGS & DEDUCTIONS -->
    <div style="margin-top:20px; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
      <div style="display:grid; grid-template-columns:1fr 1fr; background:#f9fafb; font-weight:600; color:#374151; font-size:13px;">
        <div style="padding:10px 14px; border-right:1px solid #e5e7eb;">EARNINGS</div>
        <div style="padding:10px 14px;">DEDUCTIONS</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr;">
        <div style="border-right:1px solid #e5e7eb;">
          ${Object.entries(earnings)
            .map(
              ([k, v]) =>
                `<div style="display:flex; justify-content:space-between; padding:8px 14px; border-bottom:1px solid #f3f4f6;">
                   <span>${k}</span>
                   <span style="font-weight:500;">${formatINR(Number(v || 0))}</span>
                 </div>`
            )
            .join("")}
          <div style="display:flex; justify-content:space-between; padding:10px 14px; background:#f9fafb; font-weight:600;">
            <span>Gross Earnings</span><span>${formatINR(gross)}</span>
          </div>
        </div>

        <div>
          ${Object.entries(deductions)
            .map(
              ([k, v]) =>
                `<div style="display:flex; justify-content:space-between; padding:8px 14px; border-bottom:1px solid #f3f4f6;">
                   <span>${k}</span>
                   <span style="font-weight:500;">${formatINR(Number(v || 0))}</span>
                 </div>`
            )
            .join("")}
          <div style="display:flex; justify-content:space-between; padding:10px 14px; background:#f9fafb; font-weight:600;">
            <span>Total Deductions</span><span>${formatINR(totalDeductions)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- NET PAY -->
    <div style="margin-top:20px; display:grid; grid-template-columns:2fr 1fr; gap:12px;">
      <div style="border:1px solid #bbf7d0; background:#ecfdf5; border-radius:10px; padding:14px;">
        <div style="font-size:11px; color:#6b7280;">TOTAL NET PAYABLE</div>
        <div style="font-weight:600; font-size:16px; color:#111827;">${formatINR(net)}</div>
      </div>
      <div style="border:1px solid #bbf7d0; background:#ecfdf5; border-radius:10px; padding:14px; text-align:center;">
        <div style="font-size:11px; color:#6b7280;">Net Pay</div>
        <div style="font-size:22px; font-weight:700; color:#064e3b;">${formatINR(net)}</div>
      </div>
    </div>

    <!-- Amount in Words -->
    <div style="margin-top:20px; text-align:center; font-size:12px; color:#6b7280;">
      Amount in words : <span style="font-weight:600; color:#111827;">${words}</span>
    </div>
    <div style="margin-top:6px; text-align:center; font-size:11px; color:#9ca3af;">This is a system generated payslip.</div>

    <!-- Footer -->
    <div style="margin-top:28px; display:flex; justify-content:space-between; align-items:center; font-size:13px; color:#374151;">
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:32px; height:32px; border-radius:50%; background:#f3f4f6; display:flex; align-items:center; justify-content:center;">
          <svg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='12' cy='7' r='4' fill='#6b7280'/>
            <path d='M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7' stroke='#6b7280' stroke-width='1.2'/>
          </svg>
        </div>
        <div>
          <div style="font-weight:600; color:#111827;">${empName}</div>
          <div style="font-size:12px; color:#6b7280;">${designation}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:14px; font-weight:600; color:#dc2626;">HR Department</div>
        <div style="font-size:12px; color:#6b7280;">Authorized Signatory</div>
        <div style="margin-top:18px; border-top:1px solid #d1d5db; width:160px; margin-left:auto;"></div>
      </div>
    </div>
  </div>
  `;
}

/* ---------- PDF Generator ---------- */
export async function downloadPayslipPDF(
  refOrNull: MaybeRef,
  fileNameOrData?: string | PayslipData
) {
  try {
    let htmlSource: string | null = null;

    const data =
      typeof fileNameOrData === "object" ? (fileNameOrData as PayslipData) : undefined;

    const employeeName =
      (data?.employee?.firstName || "Employee")
        .trim()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    const periodEnd =
      data?.payrollRun?.periodEnd || data?.payDate || new Date().toISOString();
    const monthOfPayslip = new Date(periodEnd).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const fileName = `Payslip_${employeeName}_${monthOfPayslip.replace(/\s+/g, "")}.pdf`;

    // CASE 1: Render from a live DOM element
    if (refOrNull && "current" in refOrNull && refOrNull.current instanceof HTMLElement) {
      const clone = refOrNull.current.cloneNode(true) as HTMLElement;
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.background = "#fff";
      container.appendChild(clone);
      document.body.appendChild(container);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
        imageTimeout: 0,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      document.body.removeChild(container);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      pdf.save(fileName);
      return;
    }

    // CASE 2: Build HTML from data
    if (data) {
      htmlSource = buildPayslipHTML(data);
    } else {
      throw new Error("No ref to element and no data provided for PDF generation.");
    }

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0";
    wrapper.innerHTML = htmlSource;
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
      allowTaint: true,
      imageTimeout: 0,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    document.body.removeChild(wrapper);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    pdf.save(fileName);
  } catch (err) {
    console.error("❌ downloadPayslipPDF failed:", err);
    alert("Failed to generate payslip PDF. See console for details.");
  }
}

export default downloadPayslipPDF;
