"use client"

import { useState } from "react"

type Patient = {
  id: string
  name: string
  slot: number
}

export default function Schedule() {
  const [shiftStart, setShiftStart] = useState("08:00")
  const [shiftEnd, setShiftEnd] = useState("17:00")
  const [patients, setPatients] = useState<Patient[]>([])

  // Convert HH:MM to minutes
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const startMin = timeToMinutes(shiftStart)
  const endMin = timeToMinutes(shiftEnd)

  // Calculate number of 30-minute slots (including last 30 min)
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
      {/* Settings */}
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
      </div>

      {/* Schedule Grid */}
      <div className="flex border rounded overflow-hidden">
        {/* Time labels */}
        <div className="w-24 flex flex-col border-r">
          {Array.from({ length: slots }).map((_, i) => {
            const totalMin = startMin + i * 30
            return (
              <div
                key={i}
                className="h-[50px] flex items-center justify-end pr-2 border-b bg-gray-100 text-sm"
              >
                {formatTime(totalMin)}
              </div>
            )
          })}
        </div>

        {/* Slots */}
        <div className="flex-1 flex flex-col">
          {Array.from({ length: slots }).map((_, i) => (
            <div
              key={i}
              className="h-[50px] border-b relative flex items-center px-2"
            >
              {/* + Add Patient button inside the row */}
              <button
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded mr-2"
                onClick={() => addPatient(i)}
              >
                + Add
              </button>

              {/* Patient blocks in same row */}
              {patients
                .filter((p) => p.slot === i)
                .map((p) => (
                  <div
                    key={p.id}
                    className="ml-4 bg-green-500 text-white px-2 py-1 rounded inline-block"
                  >
                    {p.name}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
