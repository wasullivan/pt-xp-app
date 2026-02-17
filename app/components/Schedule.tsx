"use client"

import React, { useState } from "react"

type BillingUnits = {
  theract: number
  neuro: number
  therex: number
  manual: number
  gait: number
  modalities: number
}

type Patient = {
  id: string
  name: string
  time: string // e.g., "8:00 AM"
  billing: BillingUnits
}

const generateTimeSlots = (start = 8, end = 17) => {
  const slots: string[] = []
  let hour = start
  let minute = 0
  while (hour < end || (hour === end && minute === 0)) {
    const displayHour = hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? "PM" : "AM"
    slots.push(`${displayHour}:${minute.toString().padStart(2, "0")} ${period}`)
    minute += 30
    if (minute === 60) {
      minute = 0
      hour++
    }
  }
  return slots
}

// Convert HH:MM AM/PM to minutes since midnight
const timeToMinutes = (time: string) => {
  const [hm, period] = time.split(" ")
  let [h, m] = hm.split(":").map(Number)
  if (period === "PM" && h < 12) h += 12
  if (period === "AM" && h === 12) h = 0
  return h * 60 + m
}

// Convert minutes since midnight to HH:MM AM/PM
const minutesToTime = (minutes: number) => {
  let h = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h >= 12 ? "PM" : "AM"
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${h}:${m.toString().padStart(2, "0")} ${period}`
}

export default function Schedule() {
  const slots = generateTimeSlots()
  const [patients, setPatients] = useState<Patient[]>([])
  const [expandedPatients, setExpandedPatients] = useState<Record<string, boolean>>({})
  const [newPatientTime, setNewPatientTime] = useState(slots[0] || "")

  const calculateXP = (billing: BillingUnits) =>
    billing.theract * 3 +
    billing.neuro * 2.5 +
    billing.therex * 1.5 +
    billing.manual * 1 +
    billing.gait * 1 +
    billing.modalities * 0.5

  const addPatient = () => {
    if (!newPatientTime) return
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name: "",
      time: newPatientTime,
      billing: { theract: 0, neuro: 0, therex: 0, manual: 0, gait: 0, modalities: 0 },
    }
    setPatients(prev => [...prev, newPatient])
    setExpandedPatients(prev => ({ ...prev, [newPatient.id]: true }))
  }

  const movePatientToMinutes = (id: string, topMinutes: number) => {
    const nearestHalfHour = Math.round(topMinutes / 30) * 30
    const newTime = minutesToTime(nearestHalfHour)
    setPatients(prev => prev.map(p => (p.id === id ? { ...p, time: newTime } : p)))
  }

  const updateBilling = (id: string, field: keyof BillingUnits, delta: number) => {
    setPatients(prev =>
      prev.map(p =>
        p.id === id ? { ...p, billing: { ...p.billing, [field]: Math.max(0, p.billing[field] + delta) } } : p
      )
    )
  }

  const scheduleStart = timeToMinutes(slots[0])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daily Schedule</h1>

      {/* Add Patient Panel */}
      <div className="mb-6 flex gap-2 items-center">
        <label>Start time:</label>
        <select
          value={newPatientTime}
          onChange={e => setNewPatientTime(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {slots.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button onClick={addPatient} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Patient
        </button>
      </div>

      <div className="flex">
        {/* Left: Time Labels */}
        <div className="flex flex-col w-24">
          {slots.map((slot, i) => (
            <div key={i} className="h-12 border-b flex items-center justify-end pr-2 text-sm font-semibold">
              {slot}
            </div>
          ))}
        </div>

        {/* Right: Schedule Area */}
        <div
          className="relative flex-1 border bg-gray-50"
          style={{ height: `${slots.length * 50}px` }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            const id = e.dataTransfer.getData("text/plain")
            const rect = e.currentTarget.getBoundingClientRect()
            const top = e.clientY - rect.top
            const minutesFromStart = scheduleStart + (top / 50) * 30
            movePatientToMinutes(id, minutesFromStart)
          }}
        >
          {patients.map(p => {
            const topOffset = ((timeToMinutes(p.time) - scheduleStart) / 30) * 50
            const isExpanded = expandedPatients[p.id] || false
            const xp = calculateXP(p.billing)

            return (
              <div
                key={p.id}
                draggable
                onDragStart={e => e.dataTransfer.setData("text/plain", p.id)}
                style={{ top: `${topOffset}px`, height: "100px" }} // 1-hour block
                className={`absolute left-2 right-2 cursor-pointer rounded shadow transition-all
                  ${isExpanded ? "bg-white z-10" : "bg-blue-400 text-white flex items-center justify-center font-bold"}`}
                onClick={() => setExpandedPatients(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
              >
                {!isExpanded ? (
                  <span>{p.name || "New Patient"}</span>
                ) : (
                  <div className="p-2 space-y-2">
                    <input
                      type="text"
                      value={p.name}
                      onChange={e =>
                        setPatients(prev =>
                          prev.map(pt => (pt.id === p.id ? { ...pt, name: e.target.value } : pt))
                        )
                      }
                      placeholder="Patient Name"
                      className="w-full border px-2 py-1 rounded"
                      autoFocus
                    />
                    {(
                      [
                        ["theract", "TherAct"],
                        ["neuro", "Neuro"],
                        ["therex", "TherEx"],
                        ["manual", "Manual"],
                        ["gait", "Gait"],
                        ["modalities", "Modalities"],
                      ] as [keyof BillingUnits, string][]
                    ).map(([field, label]) => (
                      <div key={field} className="flex justify-between items-center">
                        <span>{label}</span>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              updateBilling(p.id, field, -1)
                            }}
                            className="px-2 bg-gray-200 rounded"
                          >
                            -
                          </button>
                          <span>{p.billing[field]}</span>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              updateBilling(p.id, field, 1)
                            }}
                            className="px-2 bg-gray-200 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="font-semibold">XP: {xp}</div>
                    <div className="flex justify-between">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setPatients(prev => prev.filter(pt => pt.id !== p.id))
                        }}
                        className="text-xs text-red-600 underline"
                      >
                        Delete
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setExpandedPatients(prev => ({ ...prev, [p.id]: false }))
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                      >
                        Save & Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
