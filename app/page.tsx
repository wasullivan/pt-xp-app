"use client"

import { useState } from "react"
import Schedule from "./components/Schedule"

export default function Home() {
  const [shiftStart, setShiftStart] = useState("08:00")
  const [shiftEnd, setShiftEnd] = useState("17:00")
  const [lunchStart, setLunchStart] = useState("12:00")
  const [lunchEnd, setLunchEnd] = useState("12:30")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clinician Scheduler</h1>

      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm">Shift Start</label>
          <input
            type="time"
            value={shiftStart}
            onChange={(e) => setShiftStart(e.target.value)}
            className="border p-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Shift End</label>
          <input
            type="time"
            value={shiftEnd}
            onChange={(e) => setShiftEnd(e.target.value)}
            className="border p-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Lunch Start</label>
          <input
            type="time"
            value={lunchStart}
            onChange={(e) => setLunchStart(e.target.value)}
            className="border p-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Lunch End</label>
          <input
            type="time"
            value={lunchEnd}
            onChange={(e) => setLunchEnd(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
      </div>

      <Schedule
        shiftStart={shiftStart}
        shiftEnd={shiftEnd}
        lunchStart={lunchStart}
        lunchEnd={lunchEnd}
      />
    </div>
  )
}
