"use client"

import React, { useState, useMemo, useEffect } from "react"

type Units = {
  eval: number
  therAct: number
  neuro: number
  therEx: number
  manual: number
  self: number
  modality: number
}

export type Patient = {
  id: string
  name: string
  start: number
  duration: number
  units: Units
}

const DAY_START = 8 * 60 // 8:00am
const DAY_END = 18 * 60 // 6:00pm
const SLOT = 30
const PIXELS_PER_MINUTE = 1.2

const UNIT_VALUES = {
  eval: 30,
  therAct: 18,
  neuro: 16,
  therEx: 14,
  manual: 12,
  self: 9,
  modality: 6,
}

// Diminishing return XP function
function calculateUnitXP(count: number, base: number) {
  let xp = 0
  for (let i = 1; i <= count; i++) {
    if (i === 1) xp += base
    else if (i === 2) xp += base * 0.8
    else if (i === 3) xp += base * 0.65
    else xp += base * 0.5
  }
  return xp
}

export default function Schedule() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  const totalMinutes = DAY_END - DAY_START
  const dayHeight = totalMinutes * PIXELS_PER_MINUTE

  // XP Calculation
  const xpBreakdown = useMemo(() => {
    const totals = {
      eval: 0,
      therAct: 0,
      neuro: 0,
      therEx: 0,
      manual: 0,
      self: 0,
      modality: 0,
    }

    patients.forEach(p => {
      totals.eval += calculateUnitXP(p.units.eval, UNIT_VALUES.eval)
      totals.therAct += calculateUnitXP(p.units.therAct, UNIT_VALUES.therAct)
      totals.neuro += calculateUnitXP(p.units.neuro, UNIT_VALUES.neuro)
      totals.therEx += calculateUnitXP(p.units.therEx, UNIT_VALUES.therEx)
      totals.manual += calculateUnitXP(p.units.manual, UNIT_VALUES.manual)
      totals.self += calculateUnitXP(p.units.self, UNIT_VALUES.self)
      totals.modality += calculateUnitXP(p.units.modality, UNIT_VALUES.modality)
    })

    return totals
  }, [patients])

  const totalXP = Object.values(xpBreakdown).reduce((a, b) => a + b, 0)
  const level = Math.floor(totalXP / 100) + 1
  const xpIntoLevel = totalXP % 100

  // Add / Delete
  function addPatient() {
    setPatients(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "New Patient",
        start: 0,
        duration: 60,
        units: {
          eval: 0,
          therAct: 0,
          neuro: 0,
          therEx: 0,
          manual: 0,
          self: 0,
          modality: 0,
        },
      },
    ])
  }

  function deletePatient(id: string) {
    setPatients(prev => prev.filter(p => p.id !== id))
  }

  // Drag & Drop
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging) return
      const container = document.getElementById("schedule")
      if (!container) return
      const rect = container.getBoundingClientRect()
      let offsetY = e.clientY - rect.top
      offsetY = Math.max(0, Math.min(offsetY, dayHeight - 30))
      let minutes = Math.round(offsetY / PIXELS_PER_MINUTE / SLOT) * SLOT
      setPatients(prev =>
        prev.map(p => (p.id === dragging ? { ...p, start: minutes } : p))
      )
    }

    function stopDrag() {
      setDragging(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", stopDrag)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", stopDrag)
    }
  }, [dragging, dayHeight])

  // Calculate lanes to prevent overlap
  function calculateLanes() {
    const sorted = [...patients].sort((a, b) => a.start - b.start)
    const lanes: Patient[][] = []
    sorted.forEach(p => {
      let placed = false
      for (let lane of lanes) {
        const conflict = lane.some(
          other =>
            p.start < other.start + other.duration &&
            other.start < p.start + p.duration
        )
        if (!conflict) {
          lane.push(p)
          placed = true
          break
        }
      }
      if (!placed) lanes.push([p])
    })
    return lanes
  }

  const lanes = calculateLanes()

  function formatTime(mins: number) {
    const total = DAY_START + mins
    const h = Math.floor(total / 60)
    const m = total % 60
    return `${h}:${m === 0 ? "00" : m}`
  }

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      {/* XP bar */}
      <div style={{ marginBottom: 20, border: "1px solid #ccc", padding: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>Total XP: {totalXP}</div>
          <div>Level: {level}</div>
        </div>

        <div
          style={{
            height: 20,
            background: "#eee",
            marginTop: 8,
            display: "flex",
          }}
        >
          {Object.entries(xpBreakdown).map(([key, value]) => {
            const percent = totalXP === 0 ? 0 : (value / 100)
            return (
              <div
                key={key}
                style={{
                  width: `${percent}%`,
                  background:
                    key === "eval"
                      ? "#f43f5e"
                      : key === "therAct"
                      ? "#3b82f6"
                      : key === "neuro"
                      ? "#8b5cf6"
                      : key === "therEx"
                      ? "#22c55e"
                      : key === "manual"
                      ? "#f59e0b"
                      : key === "self"
                      ? "#06b6d4"
                      : "#6b7280",
                }}
              />
            )
          })}
        </div>
      </div>

      <button onClick={addPatient}>+ Add Patient</button>

      <div style={{ display: "flex", marginTop: 20 }}>
        {/* TIME COLUMN */}
        <div style={{ width: 80, position: "relative", height: dayHeight }}>
          {Array.from({ length: totalMinutes / SLOT + 1 }).map((_, i) => {
            const minute = i * SLOT
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: minute * PIXELS_PER_MINUTE,
                  fontSize: 12,
                }}
              >
                {formatTime(minute)}
              </div>
            )
          })}
        </div>

        {/* SCHEDULE */}
        <div
          id="schedule"
          style={{
            flex: 1,
            height: dayHeight,
            position: "relative",
            border: "1px solid #ccc",
          }}
        >
          {lanes.map((lane, laneIndex) =>
            lane.map(p => {
              const top = p.start * PIXELS_PER_MINUTE
              const height = p.duration * PIXELS_PER_MINUTE
              const width = 100 / lanes.length
              const left = laneIndex * width

              return (
                <div
                  key={p.id}
                  style={{
                    position: "absolute",
                    top,
                    left: `${left}%`,
                    width: `${width}%`,
                    minHeight: height,
                    background: "#3b82f6",
                    padding: 8,
                    color: "white",
                    boxSizing: "border-box",
                    borderRadius: 6,
                  }}
                >
                  {/* Drag handle */}
                  <div
                    onMouseDown={() => setDragging(p.id)}
                    style={{
                      height: 8,
                      background: "rgba(255,255,255,0.4)",
                      cursor: "grab",
                      marginBottom: 6,
                      borderRadius: 4,
                    }}
                  />

                  <input
                    value={p.name}
                    onChange={e =>
                      setPatients(prev =>
                        prev.map(pt =>
                          pt.id === p.id
                            ? { ...pt, name: e.target.value }
                            : pt
                        )
                      )
                    }
                    style={{
                      width: "100%",
                      marginBottom: 6,
                      borderRadius: 4,
                      padding: 2,
                    }}
                  />

                  <button
                    onClick={() =>
                      setExpanded(expanded === p.id ? null : p.id)
                    }
                  >
                    {expanded === p.id ? "Close" : "Edit Units"}
                  </button>

                  {expanded === p.id && (
                    <div style={{ marginTop: 6 }}>
                      <button onClick={() => deletePatient(p.id)}>Delete</button>

                      {[
                        ["eval", "Evaluation"],
                        ["therAct", "97530 Ther Act"],
                        ["neuro", "97112 Neuro Re-ed"],
                        ["therEx", "97110 Ther Ex"],
                        ["manual", "97140 Manual"],
                        ["self", "Self Management"],
                        ["modality", "Modalities"],
                      ].map(([key, label]) => (
                        <div key={key} style={{ marginTop: 4 }}>
                          <label>{label}</label>
                          <input
                            type="number"
                            value={(p.units as any)[key]}
                            onChange={e =>
                              setPatients(prev =>
                                prev.map(pt =>
                                  pt.id === p.id
                                    ? {
                                        ...pt,
                                        units: {
                                          ...pt.units,
                                          [key]: Number(e.target.value),
                                        },
                                      }
                                    : pt
                                )
                              )
                            }
                            style={{ width: "100%" }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
