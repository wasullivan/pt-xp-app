"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type Units = {
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

type TherapistContextType = {
  patients: Patient[]
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>
}

const TherapistContext = createContext<TherapistContextType | undefined>(undefined)

export const TherapistProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([])

  return (
    <TherapistContext.Provider value={{ patients, setPatients }}>
      {children}
    </TherapistContext.Provider>
  )
}

export const useTherapist = () => {
  const context = useContext(TherapistContext)
  if (!context) {
    throw new Error("useTherapist must be used within a TherapistProvider")
  }
  return context
}
