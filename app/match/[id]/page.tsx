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

export default function TeamBuilderPage() {
  const params = useParams<{ id: string }>();
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const loadSquads = async () => {
      const res = await fetch('/api/squads', { cache: 'no-store' });
      const data = (await res.json()) as SquadPlayer[];
      setPlayers(data);
    };

    loadSquads();
  }, []);

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
        return prev.filter((id) => id !== playerId);
      }

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

      <section className="card space-y-1 text-sm">
        <p>Total selected: {selected.length}</p>
        <p>Total credits used: {creditsUsed.toFixed(1)}</p>
        {error ? <p className="text-red-400">{error}</p> : null}
      </section>

      <section className="space-y-2">
        {players.map((player) => {
          const isSelected = selected.includes(player.player_id);

          return (
            <button
              key={player.player_id}
              type="button"
              onClick={() => togglePlayer(player.player_id)}
              className={`card w-full text-left ${isSelected ? 'border-indigo-500' : ''}`}
            >
              <p className="font-medium">{player.name}</p>
              <p className="text-xs text-slate-400">
                {player.role} • {player.team} • Credit: {player.credit}
              </p>
            </button>
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
