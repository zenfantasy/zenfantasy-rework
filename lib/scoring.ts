import { PlayerStats } from './types';

export const scoringRules = {
  run: 1,
  four: 4,
  six: 6,
  wicket: 30,
  catch: 8,
  stumping: 12,
  runoutAssist: 6,
  runoutDirectHit: 12
};

export function getBasePoints(stats: PlayerStats): number {
  return (
    stats.runs * scoringRules.run +
    stats.fours * scoringRules.four +
    stats.sixes * scoringRules.six +
    stats.wickets * scoringRules.wicket +
    stats.catches * scoringRules.catch +
    stats.stumpings * scoringRules.stumping +
    stats.runoutThrower * scoringRules.runoutAssist +
    stats.runoutDirectHit * scoringRules.runoutDirectHit
  );
}

export function applyMultiplier(basePoints: number, isCaptain: boolean, isViceCaptain: boolean): number {
  if (isCaptain) return basePoints * 2;
  if (isViceCaptain) return basePoints * 1.5;
  return basePoints;
}
