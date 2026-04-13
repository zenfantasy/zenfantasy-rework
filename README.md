# zenfantasy-rework

A simple mobile-first fantasy IPL PWA built with:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (optional fallback to mock data)

## Run

```bash
npm install
npm run dev
```

Open:

- Lobby: `http://localhost:3000/?user=akash`
- Join URL: `http://localhost:3000/join?user=akash`

## Environment variables (optional)

Create `.env.local` for Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

If env vars are missing, APIs automatically use mock data and in-memory team storage.

## API routes

- `GET /api/matches`
- `GET /api/squads`
- `GET /api/match-info?matchId=1001`
- `POST /api/save-team`

## Supabase schema

Use `supabase/schema.sql`.
