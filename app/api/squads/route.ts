import { NextResponse } from 'next/server';
import { mockPlayers } from '@/lib/mock-data';
import { hasSupabase, supabase } from '@/lib/supabase';

export async function GET() {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from('players').select('*').order('name');

    if (!error && data) {
      const players = data.map((row) => ({
        id: row.id,
        name: row.name,
        shortName: row.short_name ?? row.name,
        team: row.team,
        role: row.role,
        credit: row.credit
      }));

      return NextResponse.json({ players });
    }
  }

  return NextResponse.json({ players: mockPlayers });
}
