"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function IncrementBonusPage() {
  const [insuranceId, setInsuranceId] = useState("");
  const [bonusPercent, setBonusPercent] = useState("");

  const handleSave = async () => {
    try {
      await api.put(`/insurance/${insuranceId}/financial`, {
        bonusPercent: Number(bonusPercent),
      });
      alert("Bonus updated successfully!");
    } catch (err) {
      console.error("Error updating bonus:", err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Increment & Bonus</h1>
      <input
        placeholder="Insurance ID"
        value={insuranceId}
        onChange={(e) => setInsuranceId(e.target.value)}
        className="p-2 border w-full bg-transparent"
      />
      <input
        placeholder="Bonus %"
        value={bonusPercent}
        onChange={(e) => setBonusPercent(e.target.value)}
        className="p-2 border w-full bg-transparent"
      />
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Bonus
      </button>
    </div>
  );
}
