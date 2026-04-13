import { NextResponse } from 'next/server';

const API_URL = 'https://cricket-live-line-advance.p.rapidapi.com/competitions/129908/matches?paged=1&per_page=50';
const API_HEADERS = {
  'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'a1cb1855cdmshe96d10b1934764cp1ee786jsnbaee01b7b84c',
  'x-rapidapi-host': 'cricket-live-line-advance.p.rapidapi.com',
  'Content-Type': 'application/json'
};

type RawMatch = {
  match_id: number;
  teama_team_id: number;
  teama_short_name: string | null;
  teama_logo_url: string;
  teamb_team_id: number;
  teamb_short_name: string | null;
  teamb_logo_url: string;
  date_start_ist: string;
  status_str: string;
  status_note: string;
};

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
    const items = (data?.response?.items ?? []) as RawMatch[];

    const matches = items
      .filter((match) => match.teama_short_name !== null && match.teamb_short_name !== null)
      .map((match) => ({
        match_id: match.match_id,
        team1: {
          id: match.teama_team_id,
          short_name: match.teama_short_name,
          logo: match.teama_logo_url
        },
        team2: {
          id: match.teamb_team_id,
          short_name: match.teamb_short_name,
          logo: match.teamb_logo_url
        },
        start_time: match.date_start_ist,
        status: match.status_str,
        status_note: match.status_note
      }));

    console.log(JSON.stringify(data, null, 2));

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json([]);
  }
}
