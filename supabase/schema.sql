-- Simple schema for private fantasy IPL app

create table if not exists players (
  id bigint primary key,
  name text not null,
  short_name text,
  team text not null,
  role text not null,
  credit numeric not null
);

create table if not exists users (
  id bigint generated always as identity primary key,
  name text unique not null
);

create table if not exists teams (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id),
  match_id bigint not null,
  player_ids bigint[] not null,
  captain bigint not null,
  vice_captain bigint not null,
  unique (user_id, match_id)
);

create table if not exists player_match_stats (
  id bigint generated always as identity primary key,
  match_id bigint not null,
  player_id bigint not null,
  runs int default 0,
  wickets int default 0,
  catches int default 0,
  points numeric default 0,
  unique (match_id, player_id)
);

create table if not exists leaderboard (
  id bigint generated always as identity primary key,
  match_id bigint not null,
  user_id bigint not null references users(id),
  points numeric not null,
  rank int not null,
  unique (match_id, user_id)
);
