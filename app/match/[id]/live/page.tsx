'use client';

import { useParams } from 'next/navigation';

const dummyLeaderboard = [
  { name: 'Devansh', points: 120 },
  { name: 'Rahul', points: 98 },
  { name: 'Amit', points: 75 }
];

export default function LiveLeaderboardPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Live Leaderboard - Match {params.id}</h1>

      <section className="space-y-2">
        {dummyLeaderboard.map((row, index) => (
          <article key={row.name} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Rank #{index + 1}</p>
              <p className="font-medium">{row.name}</p>
            </div>
            <p className="text-lg font-semibold">{row.points}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
