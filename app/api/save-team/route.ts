import { NextRequest, NextResponse } from 'next/server';

type SaveTeamPayload = {
  user_id: string;
  match_id: number;
  players: number[];
  captain: number;
  vice_captain: number;
};

type SavedTeam = SaveTeamPayload;

declare global {
  // eslint-disable-next-line no-var
  var __savedTeamsBasic: SavedTeam[] | undefined;
}

if (!global.__savedTeamsBasic) {
  global.__savedTeamsBasic = [];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SaveTeamPayload;

  if (!body.user_id || !body.match_id || !Array.isArray(body.players)) {
    return NextResponse.json({ ok: false, message: 'Invalid payload.' }, { status: 400 });
  }

  const entry: SavedTeam = {
    user_id: body.user_id,
    match_id: body.match_id,
    players: body.players,
    captain: body.captain,
    vice_captain: body.vice_captain
  };

  const existingIndex = global.__savedTeamsBasic.findIndex(
    (item) => item.user_id === body.user_id && item.match_id === body.match_id
  );

  if (existingIndex >= 0) {
    global.__savedTeamsBasic[existingIndex] = entry;
  } else {
    global.__savedTeamsBasic.push(entry);
  }

  console.log('Saved team:', entry);

  return NextResponse.json({ ok: true, message: 'Team saved (temporary memory).' });
}
