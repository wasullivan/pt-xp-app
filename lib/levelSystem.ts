export function xpRequiredForLevel(level: number) {
  return Math.floor(500 * Math.pow(level, 1.6));
}

export function calculateLevel(totalXP: number) {
  let level = 1;
  let xpForNext = xpRequiredForLevel(level);

  while (totalXP >= xpForNext) {
    totalXP -= xpForNext;
    level++;
    xpForNext = xpRequiredForLevel(level);
  }

  return {
    level,
    currentXPIntoLevel: totalXP,
    xpForNextLevel: xpForNext,
  };
}
