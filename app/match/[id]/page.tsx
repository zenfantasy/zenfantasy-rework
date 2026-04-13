'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

type SquadPlayer = {
  player_id: number;
  name: string;
  short_name: string;
  team_id: number;
  team: string;
  role: 'WK' | 'BAT' | 'AR' | 'BOWL';
  credit: number;
  is_overseas: boolean;
};

type MatchInfo = {
  match_id: number | string;
  team1: { id: number; short_name: string };
  team2: { id: number; short_name: string };
};

export default function TeamBuilderPage() {
  const params = useParams<{ id: string }>();
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const matchesRes = await fetch('/api/matches', { cache: 'no-store' });
      const matches = (await matchesRes.json()) as MatchInfo[];
      const currentMatch = matches.find((m) => m.match_id == params.id);

      setMatch(currentMatch ?? null);

      if (!currentMatch) {
        setPlayers([]);
        return;
      }

      const squadsRes = await fetch('/api/squads', { cache: 'no-store' });
      const allPlayers = (await squadsRes.json()) as SquadPlayer[];

      const filtered = allPlayers.filter(
        (p) => p.team_id === currentMatch.team1.id || p.team_id === currentMatch.team2.id
      );

      setPlayers(filtered);
    };

    loadData();
  }, [params.id]);

  const creditsUsed = useMemo(() => {
    return selected.reduce((sum, playerId) => {
      const player = players.find((p) => p.player_id === playerId);
      return sum + (player?.credit ?? 0);
    }, 0);
  }, [players, selected]);

  const hasValidationError = selected.length > 11 || creditsUsed > 100;

  useEffect(() => {
    if (selected.length > 11) {
      setError('You can select maximum 11 players.');
      return;
    }

    if (creditsUsed > 100) {
      setError('You can use maximum 100 credits.');
      return;
    }

    setError('');
  }, [selected.length, creditsUsed]);

  function togglePlayer(playerId: number) {
    setMessage('');

    setSelected((prev) => {
      if (prev.includes(playerId)) {
        setError('');
        return prev.filter((id) => id !== playerId);
      }

      if (prev.length >= 11) {
        setError('Max 11 players reached');
        return prev;
      }

      const player = players.find((p) => p.player_id === playerId);
      const nextCredits = creditsUsed + (player?.credit ?? 0);

      if (nextCredits > 100) {
        setError('Not enough credits');
        return prev;
      }

      setError('');
      return [...prev, playerId];
    });
  }

  async function handleSaveTeam() {
    setMessage('');

    if (hasValidationError) {
      setMessage('Fix validation errors before saving.');
      return;
    }

    if (selected.length !== 11) {
      setMessage('Please select exactly 11 players to save your team.');
      return;
    }

    const payload = {
      user_id: 'devansh',
      match_id: Number(params.id),
      players: selected,
      captain: selected[0],
      vice_captain: selected[1]
    };

    const res = await fetch('/api/save-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = (await res.json()) as { ok: boolean; message: string };
    setMessage(data.message);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Team Builder - Match {params.id}</h1>
      {match ? (
        <p className="text-sm text-slate-300">
          {match.team1.short_name} vs {match.team2.short_name}
        </p>
      ) : null}

      <section className="card space-y-1 text-sm">
        <p>Total selected: {selected.length}</p>
        <p>Total credits used: {creditsUsed.toFixed(1)}</p>
        {error ? <p className="text-red-400">{error}</p> : null}
      </section>

      <section className="space-y-2">
        {players.map((player) => {
          const isSelected = selected.includes(player.player_id);

          return (
            <article
              key={player.player_id}
              className={`card w-full text-left ${isSelected ? 'border-indigo-500' : ''}`}
            >
              <p className="font-medium">{player.name}</p>
              <p className="text-xs text-slate-400">
                {player.role} • {player.team} • Credit: {player.credit}
              </p>
              <button type="button" onClick={() => togglePlayer(player.player_id)} className="btn mt-3">
                {isSelected ? 'Remove' : 'Add'}
              </button>
            </article>
          );
        })}
      </section>

      <button type="button" onClick={handleSaveTeam} disabled={hasValidationError} className="btn w-full disabled:opacity-50">
        Save Team
      </button>

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}
    </div>
  );
}
