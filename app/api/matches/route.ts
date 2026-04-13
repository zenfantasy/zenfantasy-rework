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
  teama_short_name: string;
  teama_logo_url: string;
  teamb_team_id: number;
  teamb_short_name: string;
  teamb_logo_url: string;
  date_start_ist: string;
  status_str: string;
  status_note: string;
};

function mapMatchStatus(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('live')) return 'Live';
  if (normalized.includes('complete') || normalized.includes('result')) return 'Completed';
  return 'Upcoming';
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
    const items = (data?.response?.items ?? []) as RawMatch[];

    const matches = items.map((item) => ({
      match_id: item.match_id,
      team1: {
        id: item.teama_team_id,
        short_name: item.teama_short_name,
        logo: item.teama_logo_url
      },
      team2: {
        id: item.teamb_team_id,
        short_name: item.teamb_short_name,
        logo: item.teamb_logo_url
      },
      start_time: item.date_start_ist,
      status: mapMatchStatus(item.status_str),
      status_note: item.status_note ?? ''
    }));

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json([]);
  }
}
