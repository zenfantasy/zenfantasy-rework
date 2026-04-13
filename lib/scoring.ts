import { PlayerStats } from './types';

export function calculatePoints(player: { runs?: number; wickets?: number; catches?: number }) {
  let points = 0;

  points += player.runs || 0;
  points += (player.wickets || 0) * 30;
  points += (player.catches || 0) * 8;

  return points;
}

// Backward-compatible helpers used by existing routes.
export function getBasePoints(stats: PlayerStats): number {
  return calculatePoints({ runs: stats.runs, wickets: stats.wickets, catches: stats.catches });
}

export function applyMultiplier(basePoints: number, isCaptain: boolean, isViceCaptain: boolean): number {
  if (isCaptain) return basePoints * 2;
  if (isViceCaptain) return basePoints * 1.5;
  return basePoints;
}
