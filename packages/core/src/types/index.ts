// ── Animal ────────────────────────────────────────────────────────────────────

export interface AnimalPhoto {
  url: string;
}

export interface Animal {
  id: string;
  name: string;
  species_name: string | null;
  chip_id: string | null;
  breed: string | null;
  morph: string | null;
  birthday: string | null;
  sex: string | null;
  weight: number | null;
  last_fed: string | null;
  last_weighed: string | null;
  last_shed: string | null;
  last_handled: string | null;
  notes: string | null;
  animal_photos?: AnimalPhoto[];
}

// ── Schedules ─────────────────────────────────────────────────────────────────

export type ScheduleType =
  | "feeding"
  | "supplement"
  | "handling"
  | "vet"
  | "medication"
  | "custom";

export interface ScheduleItem {
  id: string;
  animal_id: string;
  name: string;
  type: ScheduleType;
  interval_days: number | null;
  weekdays: number[] | null;
  due_date: string | null;
  due_time: string | null;
  last_done: string | null;
  notes: string | null;
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export type LogType =
  | "feeding"
  | "weight"
  | "medical"
  | "shed"
  | "handling"
  | "custom";

export interface LogEntry {
  id: string;
  animal_id?: string;
  logged_at: string;
  type: LogType;
  title: string | null;
  value: number | null;
  unit: string | null;
  notes: string | null;
}
