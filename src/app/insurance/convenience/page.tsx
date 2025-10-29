"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ConvenienceChargePage() {
  const [insuranceId, setInsuranceId] = useState("");
  const [convenienceFee, setFee] = useState("");

  const handleSave = async () => {
    try {
      await api.put(`/insurance/${insuranceId}/financial`, {
        convenienceFee: Number(convenienceFee),
      });
      alert("Convenience charge updated successfully!");
    } catch (err) {
      console.error("Error updating convenience charge:", err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Convenience Charge</h1>
      <input
        placeholder="Insurance ID"
        value={insuranceId}
        onChange={(e) => setInsuranceId(e.target.value)}
        className="p-2 border w-full bg-transparent"
      />
      <input
        placeholder="Convenience Fee (₹)"
        value={convenienceFee}
        onChange={(e) => setFee(e.target.value)}
        className="p-2 border w-full bg-transparent"
      />
      <button
        onClick={handleSave}
        className="bg-orange-600 text-white px-4 py-2 rounded"
      >
        Update Fee
      </button>
    </div>
  );
}
