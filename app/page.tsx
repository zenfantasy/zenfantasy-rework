'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Match } from '@/lib/types';

function formatIst(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusColor(status: Match['status']) {
  if (status === 'live') return 'text-emerald-400';
  if (status === 'completed') return 'text-slate-400';
  return 'text-amber-400';
}

export default function LobbyPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const searchParams = useSearchParams();
  const user = searchParams.get('user') ?? 'guest';

  useEffect(() => {
    const loadMatches = async () => {
      const res = await fetch('/api/matches', { cache: 'no-store' });
      const data = (await res.json()) as { matches: Match[] };
      setMatches(data.matches);
    };

    loadMatches();
  }, []);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">IPL Fantasy Lobby</h1>
        <p className="text-sm text-slate-400">Pick your team before match lock. Open with /join?user=your_name</p>
      </header>

      <div className="space-y-3">
        {matches.map((match) => (
          <article key={match.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{match.shortTitle}</h2>
              <span className={`text-xs uppercase ${getStatusColor(match.status)}`}>{match.status}</span>
            </div>
            <p className="text-sm text-slate-300">{formatIst(match.startTimeIst)} IST</p>
            {match.statusNote ? <p className="text-xs text-slate-400">{match.statusNote}</p> : null}
            <div className="flex gap-2 pt-2">
              <Link className="btn text-sm" href={`/match/${match.id}?user=${encodeURIComponent(user)}`}>
                Build Team
              </Link>
              <Link className="btn bg-slate-700 text-sm" href={`/match/${match.id}/live?user=${encodeURIComponent(user)}`}>
                Leaderboard
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
