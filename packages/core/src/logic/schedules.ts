import type { ScheduleItem, ScheduleType, LogType } from "../types";

export const SCHEDULE_TYPE_CONFIG: Record<
  ScheduleType,
  { label: string; icon: string; defaultAppointment: boolean; color: string }
> = {
  feeding:    { label: "Feeding",    icon: "🍗", defaultAppointment: false, color: "bg-amber-50 text-amber-700 border border-amber-200" },
  supplement: { label: "Supplement", icon: "💊", defaultAppointment: false, color: "bg-purple-50 text-purple-700 border border-purple-200" },
  handling:   { label: "Handling",   icon: "🤚", defaultAppointment: false, color: "bg-teal-50 text-teal-700 border border-teal-200" },
  vet:        { label: "Vet",        icon: "🏥", defaultAppointment: true,  color: "bg-blue-50 text-blue-700 border border-blue-200" },
  medication: { label: "Medication", icon: "💉", defaultAppointment: false, color: "bg-red-50 text-red-700 border border-red-200" },
  custom:     { label: "Custom",     icon: "✏️", defaultAppointment: false, color: "bg-gray-100 text-gray-600 border border-gray-200" },
};

export const SCHEDULE_TYPES = Object.keys(SCHEDULE_TYPE_CONFIG) as ScheduleType[];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isAppointment(item: ScheduleItem): boolean {
  return item.due_date !== null;
}

export function scheduleFrequencyLabel(item: ScheduleItem): string {
  if (isAppointment(item)) return item.due_date!.split("-").reverse().join("/");
  if (item.weekdays?.length)
    return item.weekdays
      .slice()
      .sort((a, b) => a - b)
      .map((d) => DAY_NAMES[d])
      .join(", ");
  return `every ${item.interval_days}d`;
}

function nextDueFromWeekdays(weekdays: number[], lastDone: string | null): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDoneDate = lastDone
    ? (() => {
        const d = new Date(lastDone);
        d.setHours(0, 0, 0, 0);
        return d;
      })()
    : null;
  const doneToday = lastDoneDate?.getTime() === today.getTime();
  for (let offset = doneToday ? 1 : 0; offset <= 7; offset++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + offset);
    if (weekdays.includes(candidate.getDay())) return candidate;
  }
  return today;
}

export function nextDue(item: ScheduleItem): Date {
  if (isAppointment(item)) {
    const d = new Date(item.due_date!);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (item.weekdays?.length) return nextDueFromWeekdays(item.weekdays, item.last_done);
  if (!item.last_done) return new Date();
  const d = new Date(item.last_done);
  d.setDate(d.getDate() + (item.interval_days ?? 1));
  return d;
}

export type DueStatus = "overdue" | "today" | "soon" | "ok" | "done";

export function dueStatus(item: ScheduleItem): DueStatus {
  if (isAppointment(item) && item.last_done) return "done";
  const due = nextDue(item);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 2) return "soon";
  return "ok";
}

export function dueSummary(item: ScheduleItem): string {
  const status = dueStatus(item);
  if (status === "done") return "Completed";
  const due = nextDue(item);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - now.getTime()) / 86400000);
  if (!item.last_done && !item.weekdays?.length && !item.due_date) return "Never done";
  if (diff < 0) return `Overdue by ${Math.abs(diff)}d`;
  if (diff === 0) return isAppointment(item) ? "Today" : "Due today";
  return `In ${diff}d`;
}

/** Maps a schedule type to the appropriate log type. */
export function scheduleToLogType(type: ScheduleType): LogType {
  if (type === "feeding" || type === "supplement") return "feeding";
  if (type === "vet" || type === "medication") return "medical";
  if (type === "handling") return "handling";
  return "custom";
}
