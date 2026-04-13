import { NextResponse } from 'next/server';
import { mockMatches } from '@/lib/mock-data';
import { hasSupabase, supabase } from '@/lib/supabase';

export async function GET() {
  // Mock-first approach. If Supabase is configured, read from DB.
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from('matches').select('*').order('start_time_ist');

    if (!error && data) {
      const matches = data.map((row) => ({
        id: row.id,
        shortTitle: row.short_title,
        teamA: row.team_a,
        teamB: row.team_b,
        startTimeIst: row.start_time_ist,
        status: row.status,
        statusNote: row.status_note ?? ''
      }));

      return NextResponse.json({ matches });
    }
  }

  return NextResponse.json({ matches: mockMatches });
}
