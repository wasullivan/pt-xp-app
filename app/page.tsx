"use client";

import { useState } from "react";

type PatientData = {
  totalUnits: number;
  totalXP: number;
};

export default function Home() {
  const [patientName, setPatientName] = useState("");
  const [type, setType] = useState("TherEx");
  const [units, setUnits] = useState(1);
  const [patients, setPatients] = useState<Record<string, PatientData>>({});
  const [totalXP, setTotalXP] = useState(0);

  function calculateXP(type: string, units: number, existingUnits: number) {
    const baseXP: Record<string, number> = {
      TherEx: 10,
      TherAct: 12,
      Neuro: 20,
      Manual: 15,
    };

    const diminishingFactor = 0.9;
    let xp = 0;

    for (let i = 0; i < units; i++) {
      xp += baseXP[type] * Math.pow(diminishingFactor, existingUnits + i);
    }

    return Math.round(xp);
  }

  function handleAddSession() {
    if (!patientName) return;

    const existingPatient = patients[patientName] || {
      totalUnits: 0,
      totalXP: 0,
    };

    const sessionXP = calculateXP(
      type,
      units,
      existingPatient.totalUnits
    );

    const updatedPatient = {
      totalUnits: existingPatient.totalUnits + units,
      totalXP: existingPatient.totalXP + sessionXP,
    };

    setPatients({
      ...patients,
      [patientName]: updatedPatient,
    });

    setTotalXP(totalXP + sessionXP);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>PT XP Tracker</h1>

      <div>
        <label>Patient Name: </label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Session Type: </label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="TherEx">TherEx</option>
          <option value="TherAct">TherAct</option>
          <option value="Neuro">Neuro</option>
          <option value="Manual">Manual</option>
        </select>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Units: </label>
        <input
          type="number"
          min="1"
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
        />
      </div>

      <button style={{ marginTop: "1rem" }} onClick={handleAddSession}>
        Add Session
      </button>

      <h2 style={{ marginTop: "2rem" }}>Total XP: {totalXP}</h2>

      <h3 style={{ marginTop: "2rem" }}>Patients</h3>
      <ul>
        {Object.entries(patients).map(([name, data]) => (
          <li key={name}>
            {name} — Units: {data.totalUnits} — XP: {data.totalXP}
          </li>
        ))}
      </ul>
    </main>
  );
}
