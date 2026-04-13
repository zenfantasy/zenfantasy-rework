import { NextRequest, NextResponse } from 'next/server';
import { mockMatches, mockStats } from '@/lib/mock-data';
import { hasSupabase, supabase } from '@/lib/supabase';
import { applyMultiplier, getBasePoints } from '@/lib/scoring';
import { savedTeams } from '@/lib/store';

function buildLeaderboard(matchId: number) {
  // Post-match style calculation from available stats.
  return savedTeams
    .filter((team) => team.matchId === matchId)
    .map((team) => {
      const points = team.playerIds.reduce((sum, playerId) => {
        const stats = mockStats.find((s) => s.playerId === playerId);
        if (!stats) return sum;

        const base = getBasePoints(stats);
        const withMultiplier = applyMultiplier(base, team.captain === playerId, team.viceCaptain === playerId);
        return sum + withMultiplier;
      }, 0);

      return { user: team.user, points };
    })
    .sort((a, b) => b.points - a.points)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export async function GET(req: NextRequest) {
  const matchId = Number(req.nextUrl.searchParams.get('matchId') ?? 0);
  const match = mockMatches.find((m) => m.id === matchId);

  if (!matchId || !match) {
    return NextResponse.json({ message: 'Match not found.' }, { status: 404 });
  }

  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from('leaderboard')
      .select('points, rank, users(name)')
      .eq('match_id', matchId)
      .order('rank', { ascending: true });

    if (data && data.length > 0) {
      const leaderboard = data.map((row: any) => ({
        user: row.users?.name ?? 'Unknown',
        points: row.points,
        rank: row.rank
      }));

      return NextResponse.json({ leaderboard, statusNote: match.statusNote ?? '' });
    }
  }

  const leaderboard = buildLeaderboard(matchId);
  const fallback =
    leaderboard.length > 0
      ? leaderboard
      : [
          { user: 'akash', points: 132, rank: 1 },
          { user: 'riya', points: 118, rank: 2 },
          { user: 'dev', points: 96, rank: 3 },
          { user: 'sam', points: 75, rank: 4 }
        ];

  return NextResponse.json({ leaderboard: fallback, statusNote: match.statusNote ?? 'Live updates every few minutes.' });
}
