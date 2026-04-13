'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function JoinPage() {
  const searchParams = useSearchParams();
  const user = searchParams.get('user') ?? 'guest';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome, {user}</h1>
      <p className="text-sm text-slate-400">No login needed. Continue to match lobby.</p>
      <Link className="btn inline-block" href={`/?user=${encodeURIComponent(user)}`}>
        Go to Lobby
      </Link>
    </div>
  );
}
