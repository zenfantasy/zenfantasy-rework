// In-memory store is enough for a private small tool and local dev.
// In production on serverless, use Supabase tables for persistence.

type TeamEntry = {
  user: string;
  matchId: number;
  playerIds: number[];
  captain: number;
  viceCaptain: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __savedTeams: TeamEntry[] | undefined;
}

if (!global.__savedTeams) {
  global.__savedTeams = [];
}

export const savedTeams = global.__savedTeams;
