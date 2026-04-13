import { Match, Player, PlayerStats } from './types';

export const mockMatches: Match[] = [
  {
    id: 1001,
    shortTitle: 'RCB vs CSK',
    teamA: 'RCB',
    teamB: 'CSK',
    startTimeIst: '2026-04-14T19:30:00+05:30',
    status: 'upcoming'
  },
  {
    id: 1002,
    shortTitle: 'MI vs KKR',
    teamA: 'MI',
    teamB: 'KKR',
    startTimeIst: '2026-04-13T19:30:00+05:30',
    status: 'live',
    statusNote: 'KKR need 18 runs in 12 balls'
  },
  {
    id: 1003,
    shortTitle: 'GT vs RR',
    teamA: 'GT',
    teamB: 'RR',
    startTimeIst: '2026-04-12T19:30:00+05:30',
    status: 'completed',
    statusNote: 'GT won by 6 wickets'
  }
];

export const mockPlayers: Player[] = [
  { id: 1, name: 'Virat Kohli', shortName: 'V. Kohli', team: 'RCB', role: 'BAT', credit: 10.5 },
  { id: 2, name: 'Faf du Plessis', shortName: 'F. du Plessis', team: 'RCB', role: 'BAT', credit: 9.5 },
  { id: 3, name: 'Dinesh Karthik', shortName: 'D. Karthik', team: 'RCB', role: 'WK', credit: 8 },
  { id: 4, name: 'Glenn Maxwell', shortName: 'G. Maxwell', team: 'RCB', role: 'AR', credit: 9 },
  { id: 5, name: 'Mohammed Siraj', shortName: 'M. Siraj', team: 'RCB', role: 'BOWL', credit: 8.5 },
  { id: 6, name: 'MS Dhoni', shortName: 'MS Dhoni', team: 'CSK', role: 'WK', credit: 8.5 },
  { id: 7, name: 'Ruturaj Gaikwad', shortName: 'R. Gaikwad', team: 'CSK', role: 'BAT', credit: 9.5 },
  { id: 8, name: 'Ravindra Jadeja', shortName: 'R. Jadeja', team: 'CSK', role: 'AR', credit: 9.5 },
  { id: 9, name: 'Shivam Dube', shortName: 'S. Dube', team: 'CSK', role: 'AR', credit: 8.5 },
  { id: 10, name: 'Deepak Chahar', shortName: 'D. Chahar', team: 'CSK', role: 'BOWL', credit: 8 },
  { id: 11, name: 'Matheesha Pathirana', shortName: 'M. Pathirana', team: 'CSK', role: 'BOWL', credit: 8.5 },
  { id: 12, name: 'Yash Dayal', shortName: 'Y. Dayal', team: 'RCB', role: 'BOWL', credit: 7.5 }
];

export const mockStats: PlayerStats[] = [
  { playerId: 1, runs: 65, fours: 8, sixes: 2, wickets: 0, catches: 1, stumpings: 0, runoutThrower: 0, runoutDirectHit: 0 },
  { playerId: 4, runs: 20, fours: 2, sixes: 1, wickets: 2, catches: 0, stumpings: 0, runoutThrower: 0, runoutDirectHit: 0 },
  { playerId: 8, runs: 35, fours: 3, sixes: 1, wickets: 1, catches: 1, stumpings: 0, runoutThrower: 1, runoutDirectHit: 0 },
  { playerId: 11, runs: 0, fours: 0, sixes: 0, wickets: 3, catches: 0, stumpings: 0, runoutThrower: 0, runoutDirectHit: 1 },
  { playerId: 6, runs: 18, fours: 1, sixes: 1, wickets: 0, catches: 0, stumpings: 1, runoutThrower: 0, runoutDirectHit: 0 }
];
