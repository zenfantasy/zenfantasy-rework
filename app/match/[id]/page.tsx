'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Match, Player } from '@/lib/types';

type SavedTeamResponse = { ok: boolean; message: string };

const roleLimits = {
  WK: { min: 1, max: 4 },
  BAT: { min: 3, max: 6 },
  AR: { min: 1, max: 4 },
  BOWL: { min: 3, max: 6 }
};

export default function TeamBuilderPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const user = searchParams.get('user') ?? 'guest';

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const [matchesRes, squadsRes] = await Promise.all([
        fetch('/api/matches', { cache: 'no-store' }),
        fetch('/api/squads', { cache: 'no-store' })
      ]);

      const matchesData = (await matchesRes.json()) as { matches: Match[] };
      const squadsData = (await squadsRes.json()) as { players: Player[] };

      setMatch(matchesData.matches.find((m) => String(m.id) === params.id) ?? null);
      setPlayers(squadsData.players);
    };

    loadData();
  }, [params.id]);

  const creditsUsed = useMemo(() => {
    return selected.reduce((sum, id) => {
      const player = players.find((p) => p.id === id);
      return sum + (player?.credit ?? 0);
    }, 0);
  }, [selected, players]);

  const roleCount = useMemo(() => {
    const counters = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
    selected.forEach((id) => {
      const player = players.find((p) => p.id === id);
      if (player) counters[player.role] += 1;
    });
    return counters;
  }, [selected, players]);

  const teamCount = useMemo(() => {
    const counts: Record<string, number> = {};
    selected.forEach((id) => {
      const player = players.find((p) => p.id === id);
      if (!player) return;
      counts[player.team] = (counts[player.team] ?? 0) + 1;
    });
    return counts;
  }, [selected, players]);

  const isLocked = useMemo(() => {
    if (!match) return false;
    return Date.now() > new Date(match.startTimeIst).getTime();
  }, [match]);

  function togglePlayer(playerId: number) {
    if (isLocked) return;

    if (selected.includes(playerId)) {
      setSelected((prev) => prev.filter((id) => id !== playerId));
      if (captain === playerId) setCaptain(null);
      if (viceCaptain === playerId) setViceCaptain(null);
      return;
    }

    if (selected.length >= 11) return setMessage('You can only select 11 players.');

    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    if (creditsUsed + player.credit > 100) return setMessage('Credit limit is 100.');

    const currentFromTeam = teamCount[player.team] ?? 0;
    if (currentFromTeam >= 7) return setMessage('Max 7 players from one real team.');

    setMessage('');
    setSelected((prev) => [...prev, playerId]);
  }

  function validateBeforeSave(): string | null {
    if (selected.length !== 11) return 'Select exactly 11 players.';

    for (const [role, limits] of Object.entries(roleLimits)) {
      const count = roleCount[role as keyof typeof roleCount];
      if (count < limits.min || count > limits.max) {
        return `${role} must be between ${limits.min} and ${limits.max}.`;
      }
    }

    if (!captain || !viceCaptain) return 'Select captain and vice captain.';
    if (captain === viceCaptain) return 'Captain and vice captain must be different.';
    return null;
  }

  async function saveTeam() {
    const validationError = validateBeforeSave();
    if (validationError) return setMessage(validationError);

    const res = await fetch('/api/save-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user,
        matchId: Number(params.id),
        playerIds: selected,
        captain,
        viceCaptain
      })
    });

    const payload = (await res.json()) as SavedTeamResponse;
    setMessage(payload.message);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Team Builder - Match {params.id}</h1>
      <p className="text-sm text-slate-400">User: {user}</p>
      {isLocked ? <p className="rounded bg-red-900/50 p-2 text-sm">Team is locked after match start.</p> : null}

      <section className="card space-y-1 text-sm">
        <p>Selected: {selected.length}/11</p>
        <p>Credits left: {(100 - creditsUsed).toFixed(1)}</p>
        <p>
          Role split: WK {roleCount.WK}, BAT {roleCount.BAT}, AR {roleCount.AR}, BOWL {roleCount.BOWL}
        </p>
      </section>

      <section className="space-y-2">
        {players.map((player) => {
          const isSelected = selected.includes(player.id);
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => togglePlayer(player.id)}
              className={`card w-full text-left ${isSelected ? 'border-indigo-500' : ''}`}
              disabled={isLocked}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{player.shortName}</p>
                <p className="text-sm text-slate-400">{player.credit}</p>
              </div>
              <p className="text-xs text-slate-400">
                {player.team} • {player.role}
              </p>

              {isSelected ? (
                <div className="mt-2 flex gap-2 text-xs">
                  <button
                    type="button"
                    className={`rounded px-2 py-1 ${captain === player.id ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) setCaptain(player.id);
                    }}
                  >
                    C
                  </button>
                  <button
                    type="button"
                    className={`rounded px-2 py-1 ${viceCaptain === player.id ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) setViceCaptain(player.id);
                    }}
                  >
                    VC
                  </button>
                </div>
              ) : null}
            </button>
          );
        })}
      </section>

      <button className="btn w-full" onClick={saveTeam} disabled={isLocked}>
        Save Team
      </button>

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}
    </div>
  );
}
