export type UnitType =
  | "TherAct"
  | "NeuroReEd"
  | "Gait"
  | "TherEx"
  | "Manual"
  | "Modalities";

type PatientUnitCounts = Record<UnitType, number>;

const baseXP = 10;

const difficultyMultiplier: Record<UnitType, number> = {
  TherAct: 1.6,
  NeuroReEd: 1.5,
  Gait: 1.4,
  TherEx: 1.2,
  Manual: 1.0,
  Modalities: 0.8,
};

// Diminishing values per additional unit of SAME TYPE per patient
const diminishingTable = [1.0, 0.85, 0.7, 0.55, 0.4, 0.3];

export function calculateSessionXP(
  type: UnitType,
  units: number,
  patientCounts: PatientUnitCounts
) {
  let xp = 0;

  const existingCount = patientCounts[type] || 0;

  for (let i = 0; i < units; i++) {
    const unitIndex = existingCount + i;

    const diminishing =
      diminishingTable[unitIndex] ??
      diminishingTable[diminishingTable.length - 1] * 0.5;

    const unitXP =
      baseXP * difficultyMultiplier[type] * diminishing;

    xp += unitXP;
  }

  return Math.round(xp);
}
