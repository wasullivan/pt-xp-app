"use client"

import { useState } from "react"

type PatientBlock = {
  id: string
  name: string
  startSlot: number
}

type ScheduleProps = {
  shiftStart: string
  shiftEnd: string
}

export default function Schedule({ shiftStart, shiftEnd }: ScheduleProps) {
  const [patients, setPatients] = useState<PatientBlock[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const shiftStartMin =
    parseInt(shiftStart.split(":")[0]) * 60 +
    parseInt(shiftStart.split(":")[1])
  const shiftEndMin =
    parseInt(shiftEnd.split(":")[0]) * 60 +
    parseInt(shiftEnd.split(":")[1])
  const totalSlots = Math.ceil((shiftEndMin - shiftStartMin) / 30)

  const addPatientAtSlot = (slot: number) => {
    setPatients([
      ...patients,
      { id: crypto.randomUUID(), name: `Patient ${patients.length + 1}`, startSlot: slot },
    ])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingId) return
    const container = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - container.top
    let slot = Math.floor(y / 48) // each 30-min row = 48px height
    if (slot < 0) slot = 0
    if (slot >= totalSlots) slot = totalSlots - 1
    setPatients((prev) =>
      prev.map((p) => (p.id === draggingId ? { ...p, startSlot: slot } : p))
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex">
        {/* Left column: hours */}
        <div className="w-16 flex flex-col border-r">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const hour = Math.floor((shiftStartMin + i * 30) / 60)
            const minute = (shiftStartMin + i * 30) % 60
            return (
              <div key={i} className="h-12 border-b flex items-center justify-end pr-1 text-xs">
                {`${hour}:${minute.toString().padStart(2, "0")}`}
              </div>
            )
          })}
        </div>

        {/* Right column: schedule */}
        <div
          className="flex-1 relative border"
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDraggingId(null)}
        >
          {Array.from({ length: totalSlots }).map((_, slotIndex) => (
            <div
              key={slotIndex}
              className="h-12 border-b relative"
              onClick={() => addPatientAtSlot(slotIndex)}
            >
              {patients
                .filter((p) => p.startSlot === slotIndex)
                .map((p) => (
                  <div
                    key={p.id}
                    className="absolute left-2 right-2 bg-green-500 text-white rounded p-1 cursor-move flex justify-between items-center"
                    onMouseDown={() => setDraggingId(p.id)}
                  >
                    <span>{p.name}</span>
                    <button
                      className="ml-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPatients(patients.filter((x) => x.id !== p.id))
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
