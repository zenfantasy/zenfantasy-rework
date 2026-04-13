'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type MatchItem = {
  match_id: number;
  team1: {
    id: number;
    short_name: string;
    logo: string;
  };
  team2: {
    id: number;
    short_name: string;
    logo: string;
  };
  start_time: string;
  status: string;
  status_note: string;
};

export default function LobbyPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);

  useEffect(() => {
    const loadMatches = async () => {
      const res = await fetch('/api/matches', { cache: 'no-store' });
      const data = (await res.json()) as MatchItem[];
      setMatches(data);
    };

    loadMatches();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">IPL Fantasy Lobby</h1>

      <div className="space-y-3">
        {matches.map((match) => (
          <Link key={match.match_id} href={`/match/${match.match_id}`} className="card block space-y-1">
            <p className="text-lg font-semibold">
              {match.team1.short_name} vs {match.team2.short_name}
            </p>
            <p className="text-sm text-slate-300">Start: {match.start_time}</p>
            <p className="text-sm text-slate-400">Status: {match.status}</p>
            {match.status_note ? <p className="text-xs text-slate-500">{match.status_note}</p> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
