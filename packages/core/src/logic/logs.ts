import type { LogType } from "../types";

export const LOG_TYPE_CONFIG: Record<
  LogType,
  { label: string; icon: string; badge: string }
> = {
  feeding:  { label: "Feeding",  icon: "🍗", badge: "bg-amber-50 text-amber-700 border border-amber-200" },
  weight:   { label: "Weight",   icon: "⚖️", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  medical:  { label: "Medical",  icon: "🏥", badge: "bg-blue-50 text-blue-700 border border-blue-200" },
  shed:     { label: "Shed",     icon: "🐍", badge: "bg-purple-50 text-purple-700 border border-purple-200" },
  handling: { label: "Handling", icon: "🤚", badge: "bg-teal-50 text-teal-700 border border-teal-200" },
  custom:   { label: "Custom",   icon: "✏️", badge: "bg-gray-100 text-gray-600 border border-gray-200" },
};

export const LOG_TYPES = Object.keys(LOG_TYPE_CONFIG) as LogType[];
