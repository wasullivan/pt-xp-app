"use client";

import React, { useState, useMemo, useEffect } from "react";

type Billing = {
  theract: number;
  neuro: number;
  therex: number;
  modalities: number;
  evaluation: number;
  selfManagement: number;
};

type Patient = {
  id: string;
  name: string;
  start: number; // minutes from midnight
  billing?: Billing;
};

const SLOT_HEIGHT = 45;
const PATIENT_HEIGHT = SLOT_HEIGHT * 2; // 1 hour
const DAY_START = 8 * 60;
const DAY_END = 17 * 60;

const defaultBilling: Billing = {
  theract: 0,
  neuro: 0,
  therex: 0,
  modalities: 0,
  evaluation: 0,
  selfManagement: 0,
};

const generateSlots = () => {
  const arr: number[] = [];
  for (let m = DAY_START; m <= DAY_END; m += 30) arr.push(m);
  return arr;
};

const formatTime = (m: number) => {
  let h = Math.floor(m / 60);
  const min = m % 60;
  const period = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${min.toString().padStart(2, "0")} ${period}`;
};

const levelLabel = (lvl: number) => {
  if (lvl === 1) return "Novice";
  if (lvl === 2) return "Apprentice";
  if (lvl === 3) return "Practitioner";
  if (lvl === 4) return "Expert";
  return "Master";
};

export default function Schedule() {
  const slots = generateSlots();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [animatedXP, setAnimatedXP] = useState(0);

  const safePatients = useMemo(
    () =>
      patients.map((p) => ({
        ...p,
        billing: p.billing ?? { ...defaultBilling },
      })),
    [patients]
  );

  const addPatient = () => {
    setPatients((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        start: DAY_START,
        billing: { ...defaultBilling },
      },
    ]);
  };

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const movePatient = (id: string, minutes: number) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, start: minutes } : p))
    );
  };

  const updateUnit = (id: string, field: keyof Billing, delta: number) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id && p.billing
          ? {
              ...p,
              billing: {
                ...p.billing,
                [field]: Math.max(0, p.billing[field] + delta),
              },
            }
          : p
      )
    );
  };

  const calculateXP = (b: Billing) =>
    b.theract * 3 +
    b.neuro * 2.5 +
    b.therex * 1.5 +
    b.modalities * 0.5 +
    b.evaluation * 4 +
    b.selfManagement * 2;

  // Prevent overlap: assign lanes horizontally
  const layout = useMemo(() => {
    const lanes: Record<number, Patient[]> = {};
    safePatients.forEach((p) => {
      if (!lanes[p.start]) lanes[p.start] = [];
      lanes[p.start].push(p);
    });

    const map: Record<string, { lane: number; total: number }> = {};
    Object.values(lanes).forEach((group) => {
      group.forEach((p, idx) => {
        map[p.id] = { lane: idx, total: group.length };
      });
    });
    return map;
  }, [safePatients]);

  const totalXP = safePatients.reduce(
    (sum, p) => sum + calculateXP(p.billing!),
    0
  );
  const xpForNextLevel = 50;
  const level = Math.floor(totalXP / xpForNextLevel) + 1;

  useEffect(() => {
    const animation = requestAnimationFrame(() => {
      setAnimatedXP((prev) => {
        if (prev < totalXP) return Math.min(prev + 2, totalXP);
        if (prev > totalXP) return Math.max(prev - 2, totalXP);
        return prev;
      });
    });
    return () => cancelAnimationFrame(animation);
  }, [totalXP, animatedXP]);

  return (
    <div className="w-full flex flex-col items-center p-6 gap-4">
      {/* XP + Level + Badges */}
      <div className="w-full p-4 bg-gray-100 rounded-lg border border-gray-400 mb-6 flex flex-col gap-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg">{totalXP.toFixed(0)} XP</span>
          <span className="font-bold text-lg">{levelLabel(level)}</span>
        </div>
        <div className="relative w-full h-6 bg-gray-300 rounded overflow-hidden border border-gray-400">
          <div
            className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${Math.min((animatedXP / xpForNextLevel) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="flex gap-2 mt-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-yellow-400 rounded-full border border-gray-600"
            />
          ))}
        </div>
      </div>

      {/* Add Patient Button */}
      <button
        onClick={addPatient}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Patient
      </button>

      {/* Schedule Grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "120px 1fr" }}
        className="w-full border border-gray-300 rounded-lg relative"
      >
        {/* TIME COLUMN */}
        <div className="border-r border-gray-300">
          {slots.map((m) => (
            <div
              key={m}
              style={{ height: SLOT_HEIGHT }}
              className="border-b pr-3 pt-3 text-right font-semibold bg-gray-50"
            >
              {formatTime(m)}
            </div>
          ))}
        </div>

        {/* SCHEDULE COLUMN */}
        <div
          style={{
            position: "relative",
            height: slots.length * SLOT_HEIGHT,
          }}
          className="bg-white"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData("text");
            const rect = e.currentTarget.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            const slotIndex = Math.floor(offsetY / SLOT_HEIGHT);
            const snappedMinutes = DAY_START + slotIndex * 30;
            movePatient(id, snappedMinutes);
          }}
        >
          {/* Grid lines */}
          {slots.map((m) => (
            <div key={m} style={{ height: SLOT_HEIGHT }} className="border-b" />
          ))}

          {/* PATIENTS */}
          {safePatients.map((p) => {
            const lane = layout[p.id]?.lane ?? 0;
            const totalLanes = layout[p.id]?.total ?? 1;
            const top = ((p.start - DAY_START) / 30) * SLOT_HEIGHT;
            const leftPercent = (lane / totalLanes) * 100;
            const widthPercent = 100 / totalLanes;

            const isExpanded = expanded === p.id;

            return (
              <div
                key={p.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text", p.id)}
                onClick={() => setExpanded(isExpanded ? null : p.id)}
                style={{
                  position: "absolute",
                  top,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  height: PATIENT_HEIGHT,
                  padding: 4,
                  zIndex: isExpanded ? 50 : 1,
                  cursor: "grab",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: isExpanded ? "white" : "#2563eb",
                    color: isExpanded ? "black" : "white",
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    padding: 8,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {!isExpanded ? (
                    <div className="font-bold text-center flex-1 flex items-center justify-center">
                      {p.name || "New Patient"}
                    </div>
                  ) : (
                    <div className="space-y-2 flex-1">
                      <input
                        value={p.name}
                        onChange={(e) =>
                          setPatients((prev) =>
                            prev.map((pt) =>
                              pt.id === p.id
                                ? { ...pt, name: e.target.value }
                                : pt
                            )
                          )
                        }
                        className="w-full border p-2 rounded"
                        placeholder="Patient Name"
                        autoFocus
                      />
                      {(Object.keys(p.billing ?? {}) as (keyof Billing)[]).map(
                        (key) => (
                          <div
                            key={key}
                            className="flex justify-between items-center text-sm"
                          >
                            <span>{key}</span>
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateUnit(p.id, key, -1);
                                }}
                                className="px-2 bg-gray-200 rounded"
                              >
                                -
                              </button>
                              {p.billing![key]}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateUnit(p.id, key, 1);
                                }}
                                className="px-2 bg-gray-200 rounded"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      )}
                      <div className="font-semibold">
                        XP: {calculateXP(p.billing!)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(null);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePatient(p.id);
                          }}
                          className="flex-1 bg-red-600 text-white py-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
