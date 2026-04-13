import { NextResponse } from 'next/server';

const API_URL = 'https://cricket-live-line-advance.p.rapidapi.com/competitions/129908/squads';
const API_HEADERS = {
  'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'a1cb1855cdmshe96d10b1934764cp1ee786jsnbaee01b7b84c',
  'x-rapidapi-host': 'cricket-live-line-advance.p.rapidapi.com',
  'Content-Type': 'application/json'
};

type RawPlayer = {
  pid: number;
  title: string;
  short_name: string;
  playing_role: string;
  fantasy_player_rating: number | string;
  country: string;
};

type RawSquad = {
  team_id: number;
  title: string;
  team?: { abbr?: string };
  players?: RawPlayer[];
};

function normalizeRole(role: string): 'WK' | 'BAT' | 'AR' | 'BOWL' {
  if (role === 'wk') return 'WK';
  if (role === 'bat') return 'BAT';
  if (role === 'all') return 'AR';
  return 'BOWL';
}

function normalizeCredits(rating: number, minRating: number, maxRating: number): number {
  if (Number.isNaN(rating)) return 6;
  if (maxRating === minRating) return 8;

  const raw = 6 + ((rating - minRating) * (11 - 6)) / (maxRating - minRating);
  const roundedToHalf = Math.round(raw * 2) / 2;
  return Math.min(11, Math.max(6, roundedToHalf));
}

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: API_HEADERS,
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    const squads = (data?.response?.squads ?? []) as RawSquad[];

    const allRatings: number[] = [];
    squads.forEach((squad) => {
      (squad.players ?? []).forEach((player) => {
        const rating = Number(player.fantasy_player_rating);
        if (!Number.isNaN(rating)) allRatings.push(rating);
      });
    });

    const minRating = allRatings.length > 0 ? Math.min(...allRatings) : 0;
    const maxRating = allRatings.length > 0 ? Math.max(...allRatings) : 0;

    const players = squads.flatMap((squad) => {
      const team = squad.team?.abbr ?? squad.title;

      return (squad.players ?? []).map((player) => {
        const rating = Number(player.fantasy_player_rating);

        return {
          player_id: player.pid,
          name: player.title,
          short_name: player.short_name,
          team_id: squad.team_id,
          team,
          role: normalizeRole(player.playing_role),
          credit: normalizeCredits(rating, minRating, maxRating),
          is_overseas: player.country !== 'India'
        };
      });
    });

    return NextResponse.json(players);
  } catch {
    return NextResponse.json([]);
  }
}
