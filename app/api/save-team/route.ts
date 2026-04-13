import { NextRequest, NextResponse } from 'next/server';
import { hasSupabase, supabase } from '@/lib/supabase';
import { savedTeams } from '@/lib/store';

type SavePayload = {
  user: string;
  matchId: number;
  playerIds: number[];
  captain: number;
  viceCaptain: number;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SavePayload;

  if (!body.user || !body.matchId || !Array.isArray(body.playerIds)) {
    return NextResponse.json({ ok: false, message: 'Invalid payload.' }, { status: 400 });
  }

  if (hasSupabase && supabase) {
    let userId: number | null = null;
    const existingUser = await supabase.from('users').select('id').eq('name', body.user).single();

    if (existingUser.data) {
      userId = existingUser.data.id;
    } else {
      const insertedUser = await supabase.from('users').insert({ name: body.user }).select('id').single();
      userId = insertedUser.data?.id ?? null;
    }

    if (userId) {
      const { error } = await supabase.from('teams').upsert({
        user_id: userId,
        match_id: body.matchId,
        player_ids: body.playerIds,
        captain: body.captain,
        vice_captain: body.viceCaptain
      });

      if (!error) {
        return NextResponse.json({ ok: true, message: 'Team saved to Supabase.' });
      }
    }
  }

  const existingIndex = savedTeams.findIndex((t) => t.user === body.user && t.matchId === body.matchId);
  const nextItem = {
    user: body.user,
    matchId: body.matchId,
    playerIds: body.playerIds,
    captain: body.captain,
    viceCaptain: body.viceCaptain
  };

  if (existingIndex >= 0) savedTeams[existingIndex] = nextItem;
  else savedTeams.push(nextItem);

  return NextResponse.json({ ok: true, message: 'Team saved (in-memory).' });
}
