"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TYPE_CONFIG, LOG_TYPES, type LogType } from "@/app/dashboard/animals/[id]/UnifiedLog";

export interface LogEntryData {
  id: string;
  logged_at: string;
  type: LogType;
  title: string | null;
  value: number | null;
  unit: string | null;
  notes: string | null;
}

type EditForm = {
  logged_at: string;
  type: LogType;
  title: string;
  value: string;
  unit: string;
  notes: string;
};

const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-100 transition";

export default function LogEntryCard({
  entry,
  onDelete,
  onSave,
}: {
  entry: LogEntryData;
  onDelete?: (id: string) => void;
  onSave?: (id: string, form: EditForm) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    logged_at: entry.logged_at,
    type: entry.type,
    title: entry.title ?? "",
    value: entry.value != null ? String(entry.value) : "",
    unit: entry.unit ?? "",
    notes: entry.notes ?? "",
  });

  const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.custom;

  const valueStr = entry.value != null
    ? `${entry.value}${entry.unit ? ` ${entry.unit}` : entry.type === "weight" ? "g" : ""}`
    : null;

  const hasDetails = !!(entry.notes || entry.value != null || entry.unit || onDelete || onSave);

  function startEdit() {
    setEditForm({
      logged_at: entry.logged_at,
      type: entry.type,
      title: entry.title ?? "",
      value: entry.value != null ? String(entry.value) : "",
      unit: entry.unit ?? "",
      notes: entry.notes ?? "",
    });
    setEditing(true);
  }

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    await onSave(entry.id, editForm);
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => { if (!editing) hasDetails && setExpanded(e => !e); }}
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

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
          >
            {editing ? (
              /* ── Edit form ── */
              <div className="p-4 space-y-3">
                {/* Type pills */}
                <div className="flex flex-wrap gap-1.5">
                  {LOG_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setEditForm(f => ({ ...f, type: t }))}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition
                        ${editForm.type === t
                          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                      {TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}
                    </button>
                  ))}
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date <span className="text-red-400">*</span></p>
                  <input type="date" className={inputCls} value={editForm.logged_at}
                    onChange={(e) => setEditForm(f => ({ ...f, logged_at: e.target.value }))} />
                </div>

                {/* Feeding */}
                {editForm.type === "feeding" && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Food item</p>
                        <input placeholder="e.g. Dubia roaches" className={inputCls} value={editForm.title}
                          onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Qty</p>
                        <input type="number" min="0" step="0.1" placeholder="5" className={inputCls} value={editForm.value}
                          onChange={(e) => setEditForm(f => ({ ...f, value: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                      <input placeholder="Supplements, observations…" className={inputCls} value={editForm.notes}
                        onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                  </>
                )}

                {/* Weight */}
                {editForm.type === "weight" && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Weight (g) <span className="text-red-400">*</span></p>
                    <input type="number" min="0" step="0.1" placeholder="45" className={inputCls} value={editForm.value}
                      onChange={(e) => setEditForm(f => ({ ...f, value: e.target.value }))} />
                  </div>
                )}

                {/* Medical */}
                {editForm.type === "medical" && (
                  <>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Description</p>
                      <input placeholder="e.g. Vet check — City Exotic Vets" className={inputCls} value={editForm.title}
                        onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                      <textarea rows={2} placeholder="Findings, medications, follow-up…"
                        className={inputCls} style={{ resize: "none" }} value={editForm.notes}
                        onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                  </>
                )}

                {/* Shed / Handling */}
                {(editForm.type === "shed" || editForm.type === "handling") && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                    <input
                      placeholder={editForm.type === "shed" ? "Complete, stuck shed…" : "Duration, behaviour…"}
                      className={inputCls} value={editForm.notes}
                      onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                )}

                {/* Custom */}
                {editForm.type === "custom" && (
                  <>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Title <span className="text-red-400">*</span></p>
                      <input placeholder="What happened?" className={inputCls} value={editForm.title}
                        onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                      <textarea rows={2} placeholder="Details…" className={inputCls} style={{ resize: "none" }} value={editForm.notes}
                        onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditing(false)}
                    className="flex-1 rounded-xl border dark:border-gray-600 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Cancel
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button" onClick={handleSave} disabled={saving}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40">
                    {saving ? "Saving…" : "Save changes"}
                  </motion.button>
                </div>
              </div>
            ) : (
              /* ── Detail view ── */
              <div className="px-4 py-3 space-y-2.5">
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

                {(onSave || onDelete) && (
                  <div className="flex items-center gap-2 pt-1">
                    {onSave && (
                      <button type="button" onClick={startEdit}
                        className="rounded-lg border dark:border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" onClick={() => onDelete(entry.id)}
                        className="rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition">
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
