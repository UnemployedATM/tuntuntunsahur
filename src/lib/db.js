// ---------------------------------------------------------------------------
// Studio Booking — data layer
//
// One small `store` abstraction with two interchangeable backends:
//   * Supabase  — used when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set.
//   * localStorage — automatic fallback so the app still works with no backend
//     (local dev without a .env, offline demos, etc).
//
// The UI never imports Supabase directly; it only ever talks to `store`:
//   store.loadAll()                          -> { clients, staff, ... , settings }
//   store.persistCollection(table, prev, next)
//   store.saveSettings(settingsObject)
//
// Ids are plain strings (the app generates its own), and timestamps are stored
// as the app's naive local wall-clock strings, so everything round-trips with
// no transformation. See supabase_schema.sql for the matching table shapes.
// ---------------------------------------------------------------------------
import { supabase } from './supabase';

export const DEFAULT_HOURLY_CAPACITY = 4;

export const INITIAL_SETTINGS = {
  daily_capacity: 10,
  hourly_capacity: DEFAULT_HOURLY_CAPACITY, // max bookings allowed in a single hour slot
  cancellation_policy_hours: 24,
  follow_up_interval_days: 7,
  open_hour: 7,
  close_hour: 19,
  closed_weekdays: [0], // 0=Dom ... 6=Sáb
  exempt_days: [],      // specific 'yyyy-MM-dd' closures (holidays, one-offs)
};

// Seed data used by the localStorage backend on first run. The Supabase backend
// is seeded by supabase_schema.sql instead, so these values match that file.
export const MOCK_CLIENTS = [
  { id: '1', name: 'Ana García', cellphone: '5512345678', age: 28, special_needs: 'Ninguna' },
  { id: '2', name: 'Carlos López', cellphone: '5587654321', age: 34, special_needs: 'Alergia al látex' },
];

export const MOCK_STAFF = [
  { id: '1', name: 'Admin User', role: 'Manager', is_available: true },
  { id: '2', name: 'Instructor A', role: 'Instructor', is_available: true },
];

export const MOCK_EQUIPMENT = [
  { id: '1', name: 'Reformer', total_count: 5, available_count: 3, in_repair_count: 2 },
  { id: '2', name: 'Cadillac', total_count: 2, available_count: 2, in_repair_count: 0 },
  { id: '3', name: 'Wunda Chair', total_count: 3, available_count: 1, in_repair_count: 2 },
];

export const MOCK_COMPLAINTS = [
  { id: 'c1', client_name: 'Ana García', category: 'Equipo', severity: 'Media', description: 'El Reformer 3 hace ruido al deslizar el carro.', status: 'open', created_at: '2026-05-26T10:00:00', resolved_at: null },
  { id: 'c2', client_name: 'Carlos López', category: 'Limpieza', severity: 'Baja', description: 'Vestidor sin toallas limpias por la mañana.', status: 'resolved', created_at: '2026-05-22T09:30:00', resolved_at: '2026-05-22T14:00:00' },
];

// --- Helpers ----------------------------------------------------------------
const TABLES = ['clients', 'staff', 'equipment', 'sessions', 'complaints'];

const toNum = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

// Normalizers: app object -> a DB row with a fixed, homogeneous shape. A fixed
// shape per table is required for bulk upserts (PostgREST rejects batches whose
// objects have differing keys) and guards against type errors (e.g. '' -> int).
const ROW = {
  clients: (c) => ({
    id: String(c.id),
    name: c.name ?? '',
    cellphone: c.cellphone ?? '',
    age: toNum(c.age),
    special_needs: c.special_needs ?? '',
  }),
  staff: (s) => ({
    id: String(s.id),
    name: s.name ?? '',
    role: s.role ?? '',
    is_available: !!s.is_available,
  }),
  equipment: (e) => ({
    id: String(e.id),
    name: e.name ?? '',
    total_count: toNum(e.total_count) ?? 0,
    available_count: toNum(e.available_count) ?? 0,
    in_repair_count: toNum(e.in_repair_count) ?? 0,
  }),
  sessions: (s) => ({
    id: String(s.id),
    client_name: s.client_name ?? '',
    cellphone: s.cellphone ?? '',
    age: toNum(s.age),
    special_needs: s.special_needs ?? '',
    needs_towel: !!s.needs_towel,
    needs_faja: !!s.needs_faja,
    needs_water: !!s.needs_water,
    brings_own: !!s.brings_own,
    start_time: s.start_time,
    end_time: s.end_time ?? null,
    status: s.status ?? 'booked',
    refund_eligible: s.refund_eligible ?? true,
    original_start_time: s.original_start_time ?? null,
    reschedule_history: s.reschedule_history ?? [],
  }),
  complaints: (c) => ({
    id: String(c.id),
    client_name: c.client_name ?? '',
    category: c.category ?? '',
    severity: c.severity ?? '',
    description: c.description ?? '',
    status: c.status ?? 'open',
    created_at: c.created_at ?? new Date().toISOString(),
    resolved_at: c.resolved_at ?? null,
  }),
};

const ORDER = {
  clients: { column: 'name', ascending: true },
  staff: { column: 'name', ascending: true },
  equipment: { column: 'name', ascending: true },
  sessions: { column: 'start_time', ascending: true },
  complaints: { column: 'created_at', ascending: false },
};

const jsonEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Diff two arrays by id -> { toUpsert: [rows], toDelete: [ids] }.
const diffCollection = (table, prev, next) => {
  const prevById = new Map(prev.map((r) => [String(r.id), r]));
  const nextIds = new Set(next.map((r) => String(r.id)));
  const make = ROW[table];
  const toUpsert = next
    .filter((r) => {
      const old = prevById.get(String(r.id));
      return !old || !jsonEqual(old, r);
    })
    .map(make);
  const toDelete = prev.filter((r) => !nextIds.has(String(r.id))).map((r) => String(r.id));
  return { toUpsert, toDelete };
};

// --- Supabase backend -------------------------------------------------------
function supabaseStore() {
  return {
    mode: 'supabase',

    async loadAll() {
      const queries = await Promise.all(
        TABLES.map((t) => supabase.from(t).select('*').order(ORDER[t].column, { ascending: ORDER[t].ascending }))
      );
      const out = {};
      TABLES.forEach((t, i) => {
        if (queries[i].error) throw new Error(`No se pudo cargar "${t}": ${queries[i].error.message}`);
        out[t] = queries[i].data ?? [];
      });

      const settingsRes = await supabase.from('settings').select('data').eq('id', 'singleton').maybeSingle();
      if (settingsRes.error) throw new Error(`No se pudo cargar settings: ${settingsRes.error.message}`);
      out.settings = settingsRes.data?.data ?? null;

      return out;
    },

    async persistCollection(table, prev, next) {
      const { toUpsert, toDelete } = diffCollection(table, prev, next);
      try {
        if (toUpsert.length) {
          const { error } = await supabase.from(table).upsert(toUpsert, { onConflict: 'id' });
          if (error) throw error;
        }
        if (toDelete.length) {
          const { error } = await supabase.from(table).delete().in('id', toDelete);
          if (error) throw error;
        }
      } catch (e) {
        console.error(`[studio] No se pudo guardar "${table}":`, e.message || e);
      }
    },

    async saveSettings(settings) {
      try {
        const { error } = await supabase.from('settings').upsert({ id: 'singleton', data: settings }, { onConflict: 'id' });
        if (error) throw error;
      } catch (e) {
        console.error('[studio] No se pudo guardar settings:', e.message || e);
      }
    },
  };
}

// --- localStorage backend ---------------------------------------------------
const LS_KEY = {
  clients: 'studio_clients',
  staff: 'studio_staff',
  equipment: 'studio_equipment',
  sessions: 'studio_sessions',
  complaints: 'studio_complaints',
};
const LS_FALLBACK = {
  clients: MOCK_CLIENTS,
  staff: MOCK_STAFF,
  equipment: MOCK_EQUIPMENT,
  sessions: [],
  complaints: MOCK_COMPLAINTS,
};

function localStore() {
  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  return {
    mode: 'local',

    async loadAll() {
      const out = {};
      for (const t of TABLES) out[t] = read(LS_KEY[t], LS_FALLBACK[t]);
      out.settings = read('studio_settings', null);
      return out;
    },

    async persistCollection(table, _prev, next) {
      try {
        localStorage.setItem(LS_KEY[table], JSON.stringify(next));
      } catch {
        /* quota / private mode */
      }
    },

    async saveSettings(settings) {
      try {
        localStorage.setItem('studio_settings', JSON.stringify(settings));
      } catch {
        /* quota / private mode */
      }
    },
  };
}

// Use Supabase only when a usable client was actually created; otherwise fall
// back to localStorage (no credentials, or an invalid/placeholder .env).
export const store = supabase ? supabaseStore() : localStore();
export const STORE_MODE = store.mode;
