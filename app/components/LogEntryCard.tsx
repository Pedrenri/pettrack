"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TYPE_CONFIG, type LogType } from "@/app/dashboard/animals/[id]/UnifiedLog";

export interface LogEntryData {
  id: string;
  logged_at: string;
  type: LogType;
  title: string | null;
  value: number | null;
  unit: string | null;
  notes: string | null;
}

export default function LogEntryCard({
  entry,
  onDelete,
}: {
  entry: LogEntryData;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.custom;

  const valueStr = entry.value != null
    ? `${entry.value}${entry.unit ? ` ${entry.unit}` : entry.type === "weight" ? "g" : ""}`
    : null;

  const hasDetails = !!(entry.notes || entry.value != null || entry.unit || onDelete);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => hasDetails && setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${hasDetails ? "hover:bg-gray-50 dark:hover:bg-gray-700/50" : "cursor-default"}`}
      >
        <span className="text-lg flex-shrink-0">{cfg.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${cfg.badge}`}>
              {cfg.label}
            </span>
            {entry.title && (
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{entry.title}</span>
            )}
            {valueStr && (
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{valueStr}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {entry.logged_at.split("-").reverse().join("/")}
            {entry.notes && !expanded && (
              <span className="ml-1.5 text-gray-300 dark:text-gray-600 truncate max-w-[180px] inline-block align-bottom">· {entry.notes}</span>
            )}
          </p>
        </div>

        {hasDetails && (
          <span className={`text-gray-400 dark:text-gray-500 text-xs flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
        )}
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
          >
            <div className="px-4 py-3 space-y-2.5">
              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 mb-0.5">Date</p>
                  <p className="text-gray-700 dark:text-gray-200 font-medium">{entry.logged_at.split("-").reverse().join("/")}</p>
                </div>
                {entry.title && (
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 mb-0.5">
                      {entry.type === "feeding" ? "Food item" : entry.type === "medical" ? "Description" : "Title"}
                    </p>
                    <p className="text-gray-700 dark:text-gray-200 font-medium">{entry.title}</p>
                  </div>
                )}
                {entry.value != null && (
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 mb-0.5">
                      {entry.type === "weight" ? "Weight" : "Quantity"}
                    </p>
                    <p className="text-gray-700 dark:text-gray-200 font-medium">{entry.value}{entry.unit ? ` ${entry.unit}` : entry.type === "weight" ? "g" : ""}</p>
                  </div>
                )}
              </div>

              {entry.notes && (
                <div className="text-xs bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2">
                  <p className="text-gray-400 dark:text-gray-500 mb-0.5">Notes</p>
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{entry.notes}</p>
                </div>
              )}

              {onDelete && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
                  >
                    Delete entry
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
