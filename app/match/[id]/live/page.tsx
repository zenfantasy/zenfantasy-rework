'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type LeaderboardItem = {
  user: string;
  points: number;
  rank: number;
};

export default function LiveLeaderboardPage() {
  const params = useParams<{ id: string }>();
  const [rows, setRows] = useState<LeaderboardItem[]>([]);
  const [statusNote, setStatusNote] = useState('Loading...');

  useEffect(() => {
    const loadLeaderboard = async () => {
      const res = await fetch(`/api/match-info?matchId=${params.id}`, { cache: 'no-store' });
      if (!res.ok) {
        setStatusNote('Match not found.');
        return;
      }

      const data = (await res.json()) as { leaderboard: LeaderboardItem[]; statusNote: string };
      setRows(data.leaderboard);
      setStatusNote(data.statusNote);
    };

    loadLeaderboard();
  }, [params.id]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Live Leaderboard - Match {params.id}</h1>
      <p className="text-sm text-slate-400">{statusNote}</p>

      <section className="space-y-2">
        {rows.map((row) => (
          <article key={row.user} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Rank #{row.rank}</p>
              <p className="font-medium">{row.user}</p>
            </div>
            <p className="text-lg font-semibold">{row.points}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
