export type Match = {
  id: number;
  shortTitle: string;
  teamA: string;
  teamB: string;
  startTimeIst: string;
  status: 'upcoming' | 'live' | 'completed';
  statusNote?: string;
};

export type Player = {
  id: number;
  name: string;
  shortName: string;
  team: string;
  role: 'WK' | 'BAT' | 'AR' | 'BOWL';
  credit: number;
};

export type PlayerStats = {
  playerId: number;
  runs: number;
  fours: number;
  sixes: number;
  wickets: number;
  catches: number;
  stumpings: number;
  runoutThrower: number;
  runoutDirectHit: number;
};
