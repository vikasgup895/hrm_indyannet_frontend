"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { UserCheck, User, Calendar, Coins, FileText, Plus, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/store/auth";

// Define TypeScript interfaces
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  personNo: string;
  workEmail: string;
  department: string;
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

export default function ConvenienceChargePage() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [existingCharges, setExistingCharges] = useState<ConvenienceCharge[]>([]);
  const [editingCharge, setEditingCharge] = useState<ConvenienceCharge | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"assign" | "view">("assign");

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await api.get("/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to load employees", err);
        alert("❌ Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
    if (token) loadEmployees();
  }, [token]);

  // Load existing charges when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeCharges(selectedEmployee);
    } else {
      setExistingCharges([]);
    }
  }, [selectedEmployee, token]);

  const loadEmployeeCharges = async (employeeId: string) => {
    setChargesLoading(true);
    try {
      const res = await api.get(`/convenience/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExistingCharges(res.data);
    } catch (err) {
      console.error("Failed to load convenience charges", err);
      // Don't show alert - employee might not have any charges yet
    } finally {
      setChargesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedEmployee) return alert("Please select an employee");
    if (!title.trim()) return alert("Enter charge name");
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    if (!date) return alert("Select date");

    setSubmitting(true);

    try {
      if (editingCharge) {
        // Update existing charge
        await api.put(
          `/convenience/${editingCharge.id}`,
          {
            employeeId: selectedEmployee,
            title,
            amount: Number(amount),
            date,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Convenience charge updated successfully!");
      } else {
        // Create new charge
        await api.post(
          "/convenience",
          {
            employeeId: selectedEmployee,
            title,
            amount: Number(amount),
            date,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Convenience charge added successfully!");
      }

      // Reset form and refresh data
      resetForm();
      if (selectedEmployee) {
        loadEmployeeCharges(selectedEmployee);
      }
    } catch (err: any) {
      console.error("Save failed:", err);
      const errorMessage = err.response?.data?.message || "Error assigning convenience charge";
      alert(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (chargeId: string) => {
    if (!confirm("Are you sure you want to delete this charge?")) return;

    try {
      await api.delete(`/convenience/${chargeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Convenience charge deleted successfully!");
      if (selectedEmployee) {
        loadEmployeeCharges(selectedEmployee);
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMessage = err.response?.data?.message || "Error deleting charge";
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleEdit = (charge: ConvenienceCharge) => {
    setEditingCharge(charge);
    setSelectedEmployee(charge.employeeId);
    setTitle(charge.title);
    setAmount(charge.amount.toString());
    setDate(charge.date.split('T')[0]); // Format date for input
    setActiveTab("assign");
  };

  const resetForm = () => {
    setEditingCharge(null);
    setTitle("");
    setAmount("");
    setDate("");
    // Don't reset selectedEmployee to maintain context
  };

  const getSelectedEmployeeName = () => {
    const employee = employees.find(emp => emp.id === selectedEmployee);
    return employee ? `${employee.firstName} ${employee.lastName}` : "";
  };

  if (loading) return <p className="p-6 text-center">Loading employees...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
        <FileText className="text-purple-500" />
        Convenience Charge Management
      </h1>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--border-color)]">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("assign")}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === "assign"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Plus size={16} className="inline mr-2" />
            Assign Charge
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === "view"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Coins size={16} className="inline mr-2" />
            View Charges
          </button>
        </div>
      </div>

      {/* Assign Charge Tab */}
      {activeTab === "assign" && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6 p-6 border border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)]">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              {editingCharge ? (
                <>
                  <Edit className="w-5 h-5 text-amber-500" />
                  Edit Convenience Charge
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-green-500" />
                  Assign New Charge
                </>
              )}
            </h2>

            {/* Employee select */}
            <div>
              <label className="text-sm font-medium mb-2 block text-[var(--text-primary)]">
                Select Employee *
              </label>
              <div className="flex items-center gap-2 border border-[var(--border-color)] rounded-lg p-3 bg-[var(--input-bg)] transition-colors">
                <UserCheck className="w-5 h-5 text-[var(--text-muted)]" />
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full bg-transparent outline-none text-[var(--text-primary)]"
                  disabled={editingCharge !== null} // Disable when editing
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.personNo}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block text-[var(--text-primary)]">
                Charge Name *
              </label>
              <div className="flex items-center gap-2 border border-[var(--border-color)] rounded-lg p-3 bg-[var(--input-bg)] transition-colors">
                <User className="w-5 h-5 text-[var(--text-muted)]" />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Food, Travel Charge, Rent..."
                  className="w-full bg-transparent outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium mb-2 block text-[var(--text-primary)]">
                Amount (₹) *
              </label>
              <div className="flex items-center gap-2 border border-[var(--border-color)] rounded-lg p-3 bg-[var(--input-bg)] transition-colors">
                <Coins className="w-5 h-5 text-[var(--text-muted)]" />
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  min="0"
                  
                  placeholder="0"
                  className="w-full bg-transparent outline-none text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium mb-2 block text-[var(--text-primary)]">
                Date *
              </label>
              <div className="flex items-center gap-2 border border-[var(--border-color)] rounded-lg p-3 bg-[var(--input-bg)] transition-colors">
                <Calendar className="w-5 h-5 text-[var(--text-muted)]" />
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="w-full bg-transparent outline-none text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
              >
                {submitting ? "Saving..." : editingCharge ? "Update Charge" : "Assign Charge"}
              </button>
              
              {editingCharge && (
                <button
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-6 border border-[var(--border-color)] text-[var(--text-primary)] py-2.5 rounded-lg hover:bg-[var(--hover-bg)] disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6 p-6 border border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)]">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Coins className="w-5 h-5 text-amber-500" />
              Charge Preview
            </h2>
            
            {selectedEmployee ? (
              <div className="space-y-4">
                <div className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--hover-bg)]">
                  <p className="font-medium text-[var(--text-primary)]">
                    Employee: {getSelectedEmployeeName()}
                  </p>
                  {title && <p className="text-sm text-[var(--text-primary)]">Charge: {title}</p>}
                  {amount && <p className="text-sm text-green-500">Amount: ₹{Number(amount).toLocaleString()}</p>}
                  {date && <p className="text-sm text-[var(--text-muted)]">Date: {new Date(date).toLocaleDateString()}</p>}
                </div>
                
                {!title || !amount || !date ? (
                  <p className="text-amber-500 text-sm text-center py-4">
                    Complete all fields to see full preview
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-center py-8">
                Select an employee to preview charge details
              </p>
            )}
          </div>
        </div>
      )}

      {/* View Charges Tab */}
      {activeTab === "view" && (
        <div className="space-y-6">
          <div className="p-6 border border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <Coins className="w-5 h-5 text-amber-500" />
              Employee Convenience Charges
            </h2>

            {/* Employee Selector for Viewing */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block text-[var(--text-primary)]">
                Select Employee to View Charges
              </label>
              <div className="flex items-center gap-2 border border-[var(--border-color)] rounded-lg p-3 bg-[var(--input-bg)] max-w-md">
                <UserCheck className="w-5 h-5 text-[var(--text-muted)]" />
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full bg-transparent outline-none text-[var(--text-primary)]"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.personNo}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Charges Table */}
            {selectedEmployee ? (
              chargesLoading ? (
                <p className="text-center py-8 text-[var(--text-muted)]">Loading charges...</p>
              ) : existingCharges.length > 0 ? (
                <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl">
                  <table className="min-w-full text-sm text-[var(--text-primary)]">
                    <thead>
                      <tr className="bg-[var(--hover-bg)] text-[var(--text-muted)] text-left">
                        <th className="p-3 font-medium">Title</th>
                        <th className="p-3 font-medium">Amount</th>
                        <th className="p-3 font-medium">Date</th>
                        <th className="p-3 font-medium">Created</th>
                        <th className="p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingCharges.map((charge) => (
                        <tr
                          key={charge.id}
                          className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
                        >
                          <td className="p-3">{charge.title}</td>
                          <td className="p-3 text-green-500 font-semibold">
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
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(charge)}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                title="Edit charge"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(charge.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete charge"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-[var(--text-muted)]">
                  No convenience charges found for {getSelectedEmployeeName()}
                </p>
              )
            ) : (
              <p className="text-center py-8 text-[var(--text-muted)]">
                Select an employee to view their convenience charges
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}