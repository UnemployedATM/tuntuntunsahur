-- ============================================================================
-- Studio Booking App — Supabase schema
-- ----------------------------------------------------------------------------
-- This script REBUILDS the studio tables to match the application's data model
-- exactly (see src/App.jsx + src/lib/db.js). Running it DROPS and recreates the
-- studio tables, so any existing rows in them are removed. It is safe to run
-- more than once.
--
-- Design notes:
--   * Primary keys are TEXT. The app generates its own ids (e.g. "1717000000000"),
--     so text PKs let rows round-trip without uuid remapping.
--   * Date/time fields are stored as TEXT. The app stores naive local wall-clock
--     strings ("2026-05-28T09:00:00"); text preserves them exactly with no
--     timezone shifting.
--   * `settings` is a single JSON row (id = 'singleton'), matching the nested
--     settings object the app uses (including the closed_weekdays / exempt_days
--     arrays).
--   * There is no `follow_ups` table: the app has no follow-up feature wired.
-- ============================================================================

-- Clean slate -----------------------------------------------------------------
drop table if exists follow_ups cascade;   -- legacy / unused by the app
drop table if exists complaints cascade;
drop table if exists sessions   cascade;
drop table if exists settings   cascade;
drop table if exists equipment  cascade;
drop table if exists staff      cascade;
drop table if exists clients    cascade;

-- Clients (reusable client directory; auto-captured from bookings) ------------
create table clients (
  id            text primary key,
  name          text not null,
  cellphone     text,
  age           integer,
  special_needs text
);

-- Staff -----------------------------------------------------------------------
create table staff (
  id           text primary key,
  name         text not null,
  role         text,
  is_available boolean not null default true
);

-- Equipment (studio inventory) ------------------------------------------------
create table equipment (
  id              text primary key,
  name            text not null,
  total_count     integer not null default 0,
  available_count integer not null default 0,
  in_repair_count integer not null default 0
);

-- Sessions / bookings ---------------------------------------------------------
-- Client info is denormalized onto the booking (the app does not use FKs).
create table sessions (
  id                  text primary key,
  client_name         text,
  cellphone           text,
  age                 integer,
  special_needs       text,
  needs_towel         boolean not null default false,
  needs_faja          boolean not null default false,
  needs_water         boolean not null default false,
  brings_own          boolean not null default false,
  start_time          text not null,   -- naive local "yyyy-MM-ddTHH:00:00"
  end_time            text,
  status              text not null default 'booked',  -- booked | attended | no_show
  refund_eligible     boolean not null default true,
  original_start_time text,
  reschedule_history  jsonb not null default '[]'::jsonb,
  created_at          timestamptz not null default now()
);

-- Complaints ------------------------------------------------------------------
create table complaints (
  id          text primary key,
  client_name text,
  category    text,   -- Servicio | Limpieza | Equipo | Staff | Instalaciones | Otro
  severity    text,   -- Baja | Media | Alta
  description text,
  status      text not null default 'open',  -- open | resolved
  created_at  text,   -- ISO string set by the app
  resolved_at text
);

-- Settings (single JSON document) ---------------------------------------------
create table settings (
  id   text primary key default 'singleton',
  data jsonb not null
);

-- Helpful indexes -------------------------------------------------------------
create index idx_sessions_start_time on sessions (start_time);
create index idx_sessions_status     on sessions (status);
create index idx_complaints_status   on complaints (status);

-- ============================================================================
-- Seed data (mirrors the in-app demo data in src/lib/db.js)
-- ============================================================================
insert into clients (id, name, cellphone, age, special_needs) values
  ('1', 'Ana García',   '5512345678', 28, 'Ninguna'),
  ('2', 'Carlos López', '5587654321', 34, 'Alergia al látex')
on conflict (id) do nothing;

insert into staff (id, name, role, is_available) values
  ('1', 'Admin User',   'Manager',    true),
  ('2', 'Instructor A', 'Instructor', true)
on conflict (id) do nothing;

insert into equipment (id, name, total_count, available_count, in_repair_count) values
  ('1', 'Reformer',    5, 3, 2),
  ('2', 'Cadillac',    2, 2, 0),
  ('3', 'Wunda Chair', 3, 1, 2)
on conflict (id) do nothing;

insert into complaints (id, client_name, category, severity, description, status, created_at, resolved_at) values
  ('c1', 'Ana García',   'Equipo',   'Media', 'El Reformer 3 hace ruido al deslizar el carro.', 'open',     '2026-05-26T10:00:00', null),
  ('c2', 'Carlos López', 'Limpieza', 'Baja',  'Vestidor sin toallas limpias por la mañana.',    'resolved', '2026-05-22T09:30:00', '2026-05-22T14:00:00')
on conflict (id) do nothing;

insert into settings (id, data) values
  ('singleton', '{
    "daily_capacity": 10,
    "hourly_capacity": 4,
    "cancellation_policy_hours": 24,
    "follow_up_interval_days": 7,
    "open_hour": 7,
    "close_hour": 19,
    "closed_weekdays": [0],
    "exempt_days": []
  }'::jsonb)
on conflict (id) do nothing;

-- ============================================================================
-- Row Level Security
-- ----------------------------------------------------------------------------
-- WARNING: these policies allow ANYONE with the public anon key full read/write
-- access. The anon key ships in the browser bundle, so in this configuration
-- the database is effectively open to anyone who can load the site. This is
-- acceptable for a private/internal demo, but BEFORE going to production you
-- should add Supabase Auth and restrict these policies to authenticated staff.
-- ============================================================================
alter table clients    enable row level security;
alter table staff      enable row level security;
alter table equipment  enable row level security;
alter table sessions   enable row level security;
alter table complaints enable row level security;
alter table settings   enable row level security;

create policy "studio allow all" on clients    for all using (true) with check (true);
create policy "studio allow all" on staff      for all using (true) with check (true);
create policy "studio allow all" on equipment  for all using (true) with check (true);
create policy "studio allow all" on sessions   for all using (true) with check (true);
create policy "studio allow all" on complaints for all using (true) with check (true);
create policy "studio allow all" on settings   for all using (true) with check (true);
