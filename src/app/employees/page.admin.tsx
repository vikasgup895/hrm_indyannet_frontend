// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect } from "react";
// import {
//   Plus,
//   Search,
//   Users,
//   X,
//   ChevronDown,
//   ChevronUp,
//   MoreHorizontal,
//   UserPlus,
//   Building2,
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
//   Briefcase,
//   DollarSign,
// } from "lucide-react";
// import { api } from "@/lib/api";
// import { useAuth } from "@/store/auth";
// import { useTheme } from "@/context/ThemeProvider"; // ✅ use global theme

// type Employee = {
//   id: string;
//   personNo: string;
//   firstName: string;
//   lastName: string;
//   workEmail: string;
//   phone?: string;
//   department?: string;
//   location?: string;
//   status: string;
//   hireDate: string;
//   manager?: {
//     id: string;
//     firstName: string;
//     lastName: string;
//   };
//   compensation?: {
//     baseSalary: number;
//     currency: string;
//   };
// };

// /* -----------------------------
//    Reusable Theme-Aware Components
// ------------------------------ */
// const FormField = ({
//   label,
//   required = false,
//   children,
//   error,
//   helpText,
// }: {
//   label: string;
//   required?: boolean;
//   children: React.ReactNode;
//   error?: string;
//   helpText?: string;
// }) => (
//   <div className="space-y-2">
//     <label className="flex items-center text-sm font-semibold text-[var(--text-primary)]">
//       {label}
//       {required && <span className="text-red-500 ml-1">*</span>}
//     </label>
//     {children}
//     {helpText && <p className="text-xs text-[var(--text-muted)]">{helpText}</p>}
//     {error && <p className="text-xs text-red-500">{error}</p>}
//   </div>
// );

// const Input = ({ className = "", error = false, ...props }: any) => (
//   <input
//     className={`w-full px-4 py-3 rounded-xl text-[var(--text-primary)] bg-[var(--input-bg)] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
//       ${error ? "border-red-500" : "border-[var(--border-color)] hover:border-blue-400"} ${className}`}
//     {...props}
//   />
// );

// const Select = ({ children, className = "", error = false, ...props }: any) => (
//   <select
//     className={`w-full px-4 py-3 rounded-xl text-[var(--text-primary)] bg-[var(--input-bg)] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
//       ${error ? "border-red-500" : "border-[var(--border-color)] hover:border-blue-400"} ${className}`}
//     {...props}
//   >
//     {children}
//   </select>
// );

// const StatsCard = ({ icon: Icon, label, value, change, trend }: any) => (
//   <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm transition-colors hover:bg-[var(--hover-bg)] duration-200">
//     <div className="flex items-center justify-between">
//       <div className="flex items-center gap-3">
//         <div className="p-3 bg-blue-500/10 rounded-xl">
//           <Icon className="w-6 h-6 text-blue-500" />
//         </div>
//         <div>
//           <p className="text-sm font-medium text-[var(--text-muted)]">
//             {label}
//           </p>
//           <p className="text-2xl font-bold text-[var(--text-primary)]">
//             {value}
//           </p>
//         </div>
//       </div>
//       {change && (
//         <div
//           className={`text-sm font-medium ${
//             trend === "up" ? "text-green-500" : "text-red-500"
//           }`}
//         >
//           {change}
//         </div>
//       )}
//     </div>
//   </div>
// );

// export default function EmployeesAdminPage() {
//   const { theme } = useTheme(); // ✅ integrated theme context
//   const [search, setSearch] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [openSection, setOpenSection] = useState<string>("personal");
//   const [activeTab, setActiveTab] = useState("all");
//   const { token } = useAuth();

//   const [form, setForm] = useState({
//     firstName: "",
//     lastName: "",
//     workEmail: "",
//     phone: "",
//     role: "",
//     department: "",
//     location: "",
//     hireDate: "",
//     status: "Active",
//     salary: "",
//   });

//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});

//   const toggleSection = (section: string) =>
//     setOpenSection(openSection === section ? "" : section);

//   // Fetch employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/employees", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setEmployees(res.data);
//       } catch (err) {
//         console.error("Failed to fetch employees:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (token) fetchEmployees();
//   }, [token]);

//   const validateForm = () => {
//     const errors: Record<string, string> = {};
//     if (!form.firstName.trim()) errors.firstName = "First name is required";
//     if (!form.lastName.trim()) errors.lastName = "Last name is required";
//     if (!form.workEmail.trim()) errors.workEmail = "Work email is required";
//     if (form.workEmail && !/\S+@\S+\.\S+/.test(form.workEmail))
//       errors.workEmail = "Invalid email address";
//     if (!form.role) errors.role = "Role is required";
//     if (!form.department) errors.department = "Department is required";
//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleAddEmployee = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setSubmitting(true);
//     try {
//       const employeeData = {
//         firstName: form.firstName.trim(),
//         lastName: form.lastName.trim(),
//         workEmail: form.workEmail.trim(),
//         phone: form.phone || undefined,
//         department: form.department,
//         location: form.location,
//         hireDate: form.hireDate || new Date().toISOString().split("T")[0],
//         salary: form.salary || "0",
//         currency: "INR",
//         status: form.status || "Active",
//       };

//       const res = await api.post("/employees", employeeData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setEmployees((prev) => [...prev, res.data]);
//       setShowForm(false);
//       setForm({
//         firstName: "",
//         lastName: "",
//         workEmail: "",
//         phone: "",
//         role: "",
//         department: "",
//         location: "",
//         hireDate: "",
//         status: "Active",
//         salary: "",
//       });
//     } catch (err) {
//       console.error("Failed to add employee:", err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const filteredEmployees = employees.filter((e) => {
//     const matchesSearch =
//       `${e.firstName} ${e.lastName}`
//         .toLowerCase()
//         .includes(search.toLowerCase()) ||
//       e.workEmail.toLowerCase().includes(search.toLowerCase()) ||
//       e.personNo.toLowerCase().includes(search.toLowerCase());
//     if (activeTab === "all") return matchesSearch;
//     if (activeTab === "active") return matchesSearch && e.status === "Active";
//     if (activeTab === "inactive")
//       return matchesSearch && e.status === "Inactive";
//     return matchesSearch;
//   });

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
//           <p className="text-lg font-medium">Loading employees...</p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-6">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="p-2 bg-blue-600 rounded-xl shadow-sm">
//               <Users className="w-7 h-7 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-[var(--text-primary)]">
//                 Employee Management
//               </h1>
//               <p className="text-[var(--text-muted)]">
//                 Manage your workforce efficiently
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => setShowForm(!showForm)}
//             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
//               showForm
//                 ? "bg-[var(--hover-bg)] text-[var(--text-primary)]"
//                 : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
//             }`}
//           >
//             {showForm ? (
//               <>
//                 <X className="w-5 h-5" /> Cancel
//               </>
//             ) : (
//               <>
//                 <UserPlus className="w-5 h-5" /> Add Employee
//               </>
//             )}
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <StatsCard
//             icon={Users}
//             label="Total Employees"
//             value={employees.length}
//             change="+12%"
//             trend="up"
//           />
//           <StatsCard
//             icon={UserPlus}
//             label="New Hires"
//             value="24"
//             change="+8%"
//             trend="up"
//           />
//           <StatsCard icon={Building2} label="Departments" value="7" />
//           <StatsCard
//             icon={Briefcase}
//             label="Active Projects"
//             value="156"
//             change="+5%"
//             trend="up"
//           />
//         </div>

//         {/* Search */}
//         <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm mb-8 p-6">
//           <div className="flex flex-col lg:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
//               <input
//                 type="text"
//                 placeholder="Search employees by name, email, or ID..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex bg-[var(--hover-bg)] rounded-xl p-1">
//               {["all", "active", "inactive"].map((key) => (
//                 <button
//                   key={key}
//                   onClick={() => setActiveTab(key)}
//                   className={`px-4 py-2 text-sm font-medium rounded-lg ${
//                     activeTab === key
//                       ? "bg-blue-600 text-white"
//                       : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
//                   }`}
//                 >
//                   {key[0].toUpperCase() + key.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Add Employee Form */}
//         {showForm && (
//           <form
//             onSubmit={handleAddEmployee}
//             className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-lg mb-8 p-8 space-y-6 transition-colors"
//           >
//             <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
//               <UserPlus className="text-blue-500" /> Add New Employee
//             </h2>

//             <div className="grid gap-6 md:grid-cols-2">
//               <FormField
//                 label="First Name"
//                 required
//                 error={formErrors.firstName}
//               >
//                 <Input
//                   type="text"
//                   value={form.firstName}
//                   onChange={(e: any) =>
//                     setForm({ ...form, firstName: e.target.value })
//                   }
//                 />
//               </FormField>
//               <FormField label="Last Name" required error={formErrors.lastName}>
//                 <Input
//                   type="text"
//                   value={form.lastName}
//                   onChange={(e: any) =>
//                     setForm({ ...form, lastName: e.target.value })
//                   }
//                 />
//               </FormField>
//               <FormField
//                 label="Work Email"
//                 required
//                 error={formErrors.workEmail}
//               >
//                 <Input
//                   type="email"
//                   value={form.workEmail}
//                   onChange={(e: any) =>
//                     setForm({ ...form, workEmail: e.target.value })
//                   }
//                 />
//               </FormField>
//               <FormField label="Phone">
//                 <Input
//                   type="tel"
//                   value={form.phone}
//                   onChange={(e: any) =>
//                     setForm({ ...form, phone: e.target.value })
//                   }
//                 />
//               </FormField>
//               <FormField
//                 label="Department"
//                 required
//                 error={formErrors.department}
//               >
//                 <Input
//                   type="text"
//                   value={form.department}
//                   onChange={(e: any) =>
//                     setForm({ ...form, department: e.target.value })
//                   }
//                 />
//               </FormField>
//               <FormField label="Role" required error={formErrors.role}>
//                 <Input
//                   type="text"
//                   value={form.role}
//                   onChange={(e: any) =>
//                     setForm({ ...form, role: e.target.value })
//                   }
//                 />
//               </FormField>
//               <FormField label="Location">
//                 <Input
//                   type="text"
//                   value={form.location}
//                   onChange={(e: any) =>
//                     setForm({ ...form, location: e.target.value })
//                   }
//                 />
//               </FormField>
//               <FormField label="Hire Date">
//                 <Input
//                   type="date"
//                   value={form.hireDate}
//                   onChange={(e: any) =>
//                     setForm({ ...form, hireDate: e.target.value })
//                   }
//                 />
//               </FormField>
//             </div>

//             <div className="flex items-center justify-end gap-4 pt-6 border-t border-[var(--border-color)]">
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-40"
//               >
//                 {submitting ? "Adding..." : "Add Employee"}
//               </button>
//             </div>
//           </form>
//         )}

//         {/* Employee Table */}
//         <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm overflow-hidden transition-colors">
//           <div className="px-6 py-5 border-b border-[var(--border-color)]">
//             <h3 className="text-lg font-semibold text-[var(--text-primary)]">
//               Employee Directory
//             </h3>
//             <p className="text-sm text-[var(--text-muted)]">
//               {filteredEmployees.length} employee
//               {filteredEmployees.length !== 1 ? "s" : ""} found
//             </p>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-[var(--border-color)] bg-[var(--hover-bg)]">
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-muted)]">
//                     Employee
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-muted)]">
//                     Contact
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-muted)]">
//                     Department
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-muted)]">
//                     Location
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-muted)]">
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-[var(--border-color)]">
//                 {filteredEmployees.length ? (
//                   filteredEmployees.map((employee) => (
//                     <tr
//                       key={employee.id}
//                       className="hover:bg-[var(--hover-bg)] transition-colors"
//                     >
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
//                             {employee.firstName[0]}
//                             {employee.lastName[0]}
//                           </div>
//                           <div>
//                             <p className="font-semibold text-[var(--text-primary)]">
//                               {employee.firstName} {employee.lastName}
//                             </p>
//                             <p className="text-sm text-[var(--text-muted)]">
//                               {employee.personNo}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-[var(--text-primary)]">
//                           {employee.workEmail}
//                         </p>
//                         <p className="text-sm text-[var(--text-muted)]">
//                           {employee.phone || "—"}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
//                         {employee.department || "—"}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
//                         {employee.location || "—"}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
//                             employee.status === "Active"
//                               ? "bg-green-500/10 text-green-600 border border-green-500/30"
//                               : "bg-red-500/10 text-red-600 border border-red-500/30"
//                           }`}
//                         >
//                           {employee.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="px-6 py-16 text-center text-[var(--text-muted)]"
//                     >
//                       No employees found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Users,
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Building2,
  Briefcase,
  UserCheck,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/context/ThemeProvider";
import React from "react";
import { get } from "http";

/* -------------------------------------------
   Employee Type (extended with new fields)
-------------------------------------------- */
type Employee = {
  id: string;
  personNo: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  personalEmail?: string;
  phone?: string;
  emergencyContact?: string;
  gender?: string;
  address?: string;
  role?: string;
  educationQualification?: string;
  birthdate?: string;
  designation?: string;
  department?: string;
  location?: string;
  status: string;
  hireDate: string | null;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  compensation?: {
    baseSalary: number;
    currency: string;
  };
  documents?: {
    id: string;
    title: string;
    type: string;
    storageUrl: string;
    uploadedBy?: string;
    signedAt?: string;
    expiryDate?: string;
  }[];
};

/* -----------------------------
   Reusable Components
------------------------------ */
const FormField = ({
  label,
  required = false,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="space-y-2">
    <label className="flex items-center text-sm font-semibold text-[var(--text-primary)]">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Input = ({ className = "", error = false, ...props }: any) => (
  <input
    className={`w-full px-4 py-3 rounded-xl text-[var(--text-primary)] bg-[var(--input-bg)] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
      ${
        error
          ? "border-red-500"
          : "border-[var(--border-color)] hover:border-blue-400"
      } ${className}`}
    {...props}
  />
);

const Select = ({ children, className = "", error = false, ...props }: any) => (
  <select
    className={`w-full px-4 py-3 rounded-xl text-[var(--text-primary)] bg-[var(--input-bg)] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
      ${
        error
          ? "border-red-500"
          : "border-[var(--border-color)] hover:border-blue-400"
      } ${className}`}
    {...props}
  >
    {children}
  </select>
);

const StatsCard = ({ icon: Icon, label, value, change, trend }: any) => (
  <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm transition-colors hover:bg-[var(--hover-bg)] duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Icon className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {label}
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {value}
          </p>
        </div>
      </div>
      {change && (
        <div
          className={`text-sm font-medium ${
            trend === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          {change}
        </div>
      )}
    </div>
  </div>
);

/* -------------------------------------------
   Main Component
-------------------------------------------- */
export default function EmployeesAdminPage() {
  const { theme } = useTheme();
  const { token, role } = useAuth();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);
  // Filter tabs: default to Active per requirement
  const [activeTab, setActiveTab] = useState("active");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  /* -------------------------------------------
     Form State
  -------------------------------------------- */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    personalEmail: "",
    phone: "",
    emergencyContact: "",
    gender: "",
    address: "",
    educationQualification: "",
    designation: "",
    birthdate: "",
    role: "",
    department: "",
    location: "",
    hireDate: "",
    status: "Active",
    salary: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* -------------------------------------------
     Fetch Employees
  -------------------------------------------- */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched employees:", res.data);
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchEmployees();
  }, [token]);

  /* -------------------------------------------
     Form Validation
  -------------------------------------------- */
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required";
    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    if (!form.workEmail.trim()) errors.workEmail = "Work email is required";
    if (form.workEmail && !/\S+@\S+\.\S+/.test(form.workEmail))
      errors.workEmail = "Invalid email address";
    if (!form.department) errors.department = "Department is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* -------------------------------------------
     Handle Add Employee
  -------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const employeeData = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        workEmail: form.workEmail.trim(),
        personalEmail: form.personalEmail || undefined,
        phone: form.phone || undefined,
        role: form.role,
        emergencyContact: form.emergencyContact || undefined,
        gender: form.gender || undefined,
        address: form.address || undefined,
        educationQualification: form.educationQualification || undefined,
        birthdate: form.birthdate
          ? new Date(form.birthdate).toISOString()
          : undefined,
        department: form.department || undefined,
        location: form.location || undefined,
        hireDate: form.hireDate ? new Date(form.hireDate).toISOString() : null,
        status: form.status || "Active",
        designation: form.designation || undefined,
      };

      // 🔥 CHECK IF EDIT MODE
      if (editingEmployee) {
        const res = await api.put(
          `/employees/${editingEmployee.id}`,
          employeeData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setEmployees((prev) =>
          prev.map((e) =>
            e.id === editingEmployee.id ? { ...e, ...employeeData } : e
          )
        );

        alert("Employee updated successfully.");
      } else {
        // CREATE NEW EMPLOYEE
        const res = await api.post("/employees", employeeData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newEmployee = res.data;

        // Upload document if needed
        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);

          await api.post(`/employees/${newEmployee.id}/upload`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        }

        setEmployees((prev) => [newEmployee, ...prev]);
      }

      // RESET FORM
      setShowForm(false);
      setEditingEmployee(null);
      setForm({
        firstName: "",
        lastName: "",
        workEmail: "",
        personalEmail: "",
        phone: "",
        emergencyContact: "",
        gender: "",
        address: "",
        educationQualification: "",
        birthdate: "",
        role: "",
        department: "",
        location: "",
        hireDate: "",
        status: "Active",
        salary: "",
        designation: "",
      });
      setSelectedFile(null);
      setFormErrors({});
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  };
  // inside the EmployeesAdminPage component (top-level of page.admin.tsx)
  const deactivateEmployee = async (employeeId: string) => {
    // simple confirmation
    if (
      !window.confirm(
        "Mark this employee as Inactive? This will change their status."
      )
    )
      return;

    try {
      // call existing update endpoint (PUT /employees/:id) to update only the status
      const res = await api.put(
        `/employees/${employeeId}`,
        { status: "Inactive" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // update local state (immutable map)
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employeeId ? { ...e, status: "Inactive" } : e
        )
      );

      alert("Employee marked as Inactive.");
    } catch (err: any) {
      console.error("Failed to deactivate employee:", err);
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  /* ----------------- delete Employee --------------------------*/
  const deleteEmployee = async (employeeId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this employee? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update UI
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId));

      alert("Employee deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete employee:", err);
      alert(err?.response?.data?.message || "Failed to delete employee.");
    }
  };

  const startEdit = (emp: Employee) => {
    setEditingEmployee(emp);

    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      workEmail: emp.workEmail,
      personalEmail: emp.personalEmail || "",
      phone: emp.phone || "",
      emergencyContact: emp.emergencyContact || "",
      gender: emp.gender || "",
      address: emp.address || "",
      educationQualification: emp.educationQualification || "",
      birthdate: emp.birthdate ? emp.birthdate.split("T")[0] : "",
      designation: emp.designation || "",
      role: emp.role || "",
      department: emp.department || "",
      location: emp.location || "",
      hireDate: emp.hireDate ? emp.hireDate.split("T")[0] : "",
      status: emp.status,
      salary: "",
    });

    setShowForm(true); // Open the same form in edit mode
  };

  const getNewHireCount = (employees: any[]): number => {
    if (!employees || employees.length === 0) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return employees.filter((emp) => {
      if (!emp.hireDate) return false;
      const hireDate = new Date(emp.hireDate);
      return (
        hireDate.getMonth() === currentMonth &&
        hireDate.getFullYear() === currentYear
      );
    }).length;
  };

  /* -------------------------------------------
     Filtering
  -------------------------------------------- */
  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      `${e.firstName} ${e.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      e.workEmail.toLowerCase().includes(search.toLowerCase()) ||
      e.personNo.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && e.status === "Active";
    if (activeTab === "inactive")
      return matchesSearch && e.status === "Inactive";
    return matchesSearch;
  });

  /* -------------------------------------------
     Loading UI
  -------------------------------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-lg font-medium">Loading employees...</p>
        </div>
      </div>
    );

  /* -------------------------------------------
     Main Render
  -------------------------------------------- */
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl shadow-sm">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                Employee Management
              </h1>
              <p className="text-[var(--text-muted)]">
                Manage your workforce efficiently
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              showForm
                ? "bg-[var(--hover-bg)] text-[var(--text-primary)]"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            }`}
          >
            {showForm ? (
              <>
                <X className="w-5 h-5" /> Cancel
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Add Employee
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            label="Total Employees"
            value={employees.length}
          />
          <StatsCard
            icon={UserCheck}
            label="Active Employees"
            value={employees.filter((e) => e.status === "Active").length}
          />
          <StatsCard
            icon={UserPlus}
            label="New Hires (This Month)"
            value={getNewHireCount(employees)}
          />
          <StatsCard
            icon={GraduationCap}
            label="Employee Records"
            value="Active"
          />
        </div>

        {/* Search + Status Filter (All / Active / Inactive) */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm mb-8 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">Status:</span>
              <div className="flex bg-[var(--hover-bg)] rounded-xl p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "inactive", label: "Inactive" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      activeTab === key
                        ? "bg-blue-600 text-white"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Employee Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-lg mb-8 p-8 space-y-6 transition-colors"
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <UserPlus className="text-blue-500" />{" "}
              {editingEmployee ? "Update Employee" : "Add New Employee"}
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Info */}
              <FormField
                label="First Name"
                required
                error={formErrors.firstName}
              >
                <Input
                  type="text"
                  value={form.firstName}
                  onChange={(e: any) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Last Name" required error={formErrors.lastName}>
                <Input
                  type="text"
                  value={form.lastName}
                  onChange={(e: any) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </FormField>

              <FormField
                label="Work Email"
                required
                error={formErrors.workEmail}
              >
                <Input
                  type="email"
                  value={form.workEmail}
                  onChange={(e: any) =>
                    setForm({ ...form, workEmail: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Personal Email">
                <Input
                  type="email"
                  value={form.personalEmail}
                  onChange={(e: any) =>
                    setForm({ ...form, personalEmail: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Phone">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e: any) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Emergency Contact">
                <Input
                  type="tel"
                  value={form.emergencyContact}
                  onChange={(e: any) =>
                    setForm({ ...form, emergencyContact: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Gender">
                <Select
                  value={form.gender}
                  onChange={(e: any) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </FormField>

              <FormField label="Role" required error={formErrors.role}>
                <Select
                  value={form.role}
                  onChange={(e: any) =>
                    setForm({ ...form, role: e.target.value })
                  }
                >
                  <option value="">Select Role</option>
                  <option value="EMPLOYEE">Employee</option>
                  {role === "ADMIN" && <option value="HR">HR</option>}
                  {role === "ADMIN" && <option value="ADMIN">Admin</option>}
                </Select>
              </FormField>

              <FormField label="Birthday">
                <Input
                  type="date"
                  value={form.birthdate}
                  onChange={(e: any) =>
                    setForm({ ...form, birthdate: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Hire Date">
                <Input
                  type="date"
                  value={form.hireDate}
                  onChange={(e: any) =>
                    setForm({ ...form, hireDate: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Education Qualification">
                <Input
                  type="text"
                  value={form.educationQualification}
                  onChange={(e: any) =>
                    setForm({ ...form, educationQualification: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Address">
                <Input
                  type="text"
                  value={form.address}
                  onChange={(e: any) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </FormField>

              <FormField
                label="Department"
                required
                error={formErrors.department}
              >
                <Input
                  type="text"
                  value={form.department}
                  onChange={(e: any) =>
                    setForm({ ...form, department: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Designation" required>
                <Input
                  type="text"
                  value={form.designation}
                  onChange={(e: any) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Location">
                <Input
                  type="text"
                  value={form.location}
                  onChange={(e: any) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Upload Document">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      className="hidden"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-[var(--text-muted)]">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-40"
              >
                {submitting
                  ? editingEmployee
                    ? "Updating..."
                    : "Adding..."
                  : editingEmployee
                  ? "Update Employee"
                  : "Add Employee"}
              </button>
            </div>
          </form>
        )}

        {/* Employee Table */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Employee Directory
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--hover-bg)]">
                  <th className="text-left px-6 py-4">Employee</th>
                  <th className="text-left px-6 py-4">Contact</th>
                  <th className="text-left px-6 py-4">Desgination</th>
                  <th className="text-left px-6 py-4">Department</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.id}>
                    <tr className="hover:bg-[var(--hover-bg)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-sm text-[var(--text-muted)]">
                              {employee.personNo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {employee.workEmail}
                        <br />
                        <span className="text-[var(--text-muted)]">
                          {employee.phone || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {employee.designation || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {employee.department || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            employee.status === "Active"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            setOpenRow(
                              openRow === employee.id ? null : employee.id
                            )
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {openRow === employee.id ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </button>
                      </td>
                    </tr>

                    {openRow === employee.id && (
                      <tr>
                        <td
                          colSpan={6}
                          className="bg-[var(--hover-bg)] px-8 py-6"
                        >
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <p>
                              <User className="inline w-4 h-4 mr-2 text-blue-500" />
                              Gender: {employee.gender || "—"}
                            </p>
                            <p>
                              <Mail className="inline w-4 h-4 mr-2 text-blue-500" />
                              Personal Email: {employee.personalEmail || "—"}
                            </p>
                            <p>
                              <Phone className="inline w-4 h-4 mr-2 text-blue-500" />
                              Emergency Contact:{" "}
                              {employee.emergencyContact || "—"}
                            </p>
                            <p>
                              <MapPin className="inline w-4 h-4 mr-2 text-blue-500" />
                              Address: {employee.address || "—"}
                            </p>
                            <p>
                              <GraduationCap className="inline w-4 h-4 mr-2 text-blue-500" />
                              Education:{" "}
                              {employee.educationQualification || "—"}
                            </p>
                            <p>
                              <Calendar className="inline w-4 h-4 mr-2 text-blue-500" />
                              Birthday:{" "}
                              {employee.birthdate
                                ? new Date(
                                    employee.birthdate
                                  ).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                          <div className="col-span-full mt-6 border-t border-[var(--border-color)] pt-6">
                            {/* Header + Actions */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                              {/* Left Title */}
                              <h4 className="font-semibold text-[var(--text-primary)] text-lg">
                                Uploaded Documents
                              </h4>

                              {/* Right Side Buttons */}
                              <div className="flex items-center gap-3">
                                {employee.status === "Active" && (
                                  <button
                                    onClick={() =>
                                      deactivateEmployee(employee.id)
                                    }
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
                                  >
                                    Mark Inactive
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteEmployee(employee.id)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
                                >
                                  Delete
                                </button>

                                {(role === "HR" || role === "ADMIN") && (
                                  <button
                                    onClick={() => startEdit(employee)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Document List */}
                            {employee.documents?.length ? (
                              <ul className="space-y-2">
                                {employee.documents.map((doc) => (
                                  <li key={doc.id}>
                                    <a
                                      href={`${
                                        process.env.NODE_ENV === "production"
                                          ? "https://hrm.indyanet.com/"
                                          : "http://localhost:4000/"
                                      }${doc.storageUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      📄 {doc.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-[var(--text-muted)] italic">
                                No documents uploaded.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
