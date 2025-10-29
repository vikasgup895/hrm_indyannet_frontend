"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function CTCSheetPage() {
  const [insuranceId, setInsuranceId] = useState("");
  const [ctcFileUrl, setCtcFileUrl] = useState("");

  const handleSave = async () => {
    try {
      await api.put(`/insurance/${insuranceId}`, { ctcFileUrl });
      alert("CTC sheet URL updated!");
    } catch (err) {
      console.error("Error updating CTC:", err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">CTC Sheet Upload</h1>
      <input
        placeholder="Insurance ID"
        value={insuranceId}
        onChange={(e) => setInsuranceId(e.target.value)}
        className="p-2 border w-full bg-transparent"
      />
      <input
        placeholder="CTC File URL (uploads/...path)"
        value={ctcFileUrl}
        onChange={(e) => setCtcFileUrl(e.target.value)}
        className="p-2 border w-full bg-transparent"
      />
      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save CTC Sheet
      </button>
    </div>
  );
}
