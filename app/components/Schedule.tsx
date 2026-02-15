"use client"

import React, { useState } from "react"

type Patient = {
  id: string
  name: string
  slot: number
}

export default function Schedule() {
  const [shiftStart, setShiftStart] = useState("08:00")
  const [shiftEnd, setShiftEnd] = useState("17:00")
  const [lunchStart, setLunchStart] = useState("12:00")
  const [lunchEnd, setLunchEnd] = useState("12:30")
  const [patients, setPatients] = useState<Patient[]>([])

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const startMin = timeToMinutes(shiftStart)
  const endMin = timeToMinutes(shiftEnd)
  const lunchStartMin = timeToMinutes(lunchStart)
  const lunchEndMin = timeToMinutes(lunchEnd)

  const slots = Math.ceil((endMin - startMin) / 30)

  const addPatient = (slot: number) => {
    setPatients([
      ...patients,
      { id: crypto.randomUUID(), name: `Patient ${patients.length + 1}`, slot },
    ])
  }

  const formatTime = (totalMin: number) => {
    let h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    const ampm = h >= 12 ? "PM" : "AM"
    h = h % 12
    if (h === 0) h = 12
    return `${h}:${m.toString().padStart(2, "0")} ${ampm}`
  }

  return (
    <div className="p-4">
      {/* Shift settings */}
      <div className="flex space-x-4 mb-6">
        <label>
          Shift Start:
          <input
            type="time"
            value={shiftStart}
            onChange={(e) => setShiftStart(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          />
        </label>
        <label>
          Shift End:
          <input
            type="time"
            value={shiftEnd}
            onChange={(e) => setShiftEnd(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          />
        </label>
        <label>
          Lunch Start:
          <input
            type="time"
            value={lunchStart}
            onChange={(e) => setLunchStart(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          />
        </label>
        <label>
          Lunch End:
          <input
            type="time"
            value={lunchEnd}
            onChange={(e) => setLunchEnd(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          />
        </label>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-[100px_1fr] border rounded">
        {Array.from({ length: slots }).map((_, i) => {
          const slotStart = startMin + i * 30
          const slotEnd = slotStart + 30
          const isLunch = slotStart >= lunchStartMin && slotStart < lunchEndMin

          return (
            <React.Fragment key={i}>
              {/* Time Label */}
              <div className="h-[50px] flex items-center justify-end pr-2 border-b bg-gray-100 text-sm">
                {formatTime(slotStart)}
              </div>

              {/* Slot Row */}
              <div
                className={`h-[50px] border-b flex items-center px-2 gap-2 relative ${
                  isLunch ? "bg-yellow-200" : ""
                }`}
              >
                {!isLunch && (
                  <button
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => addPatient(i)}
                  >
                    + Add
                  </button>
                )}

                {patients
                  .filter((p) => p.slot === i)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="ml-2 bg-green-500 text-white px-2 py-1 rounded inline-block"
                    >
                      {p.name}
                    </div>
                  ))}

                {isLunch && <span className="ml-2 text-gray-700">Lunch</span>}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
