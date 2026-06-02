"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "motion/react";
import LogEntryCard from "@/app/components/LogEntryCard";

export type LogType = "feeding" | "weight" | "medical" | "shed" | "handling" | "custom";

export interface LogEntry {
  id: string;
  logged_at: string;
  type: LogType;
  title: string | null;
  value: number | null;
  unit: string | null;
  notes: string | null;
}

export const TYPE_CONFIG: Record<LogType, { label: string; icon: string; badge: string }> = {
  feeding:  { label: "Feeding",  icon: "🍗", badge: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" },
  weight:   { label: "Weight",   icon: "⚖️", badge: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" },
  medical:  { label: "Medical",  icon: "🏥", badge: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" },
  shed:     { label: "Shed",     icon: "🐍", badge: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800" },
  handling: { label: "Handling", icon: "🤚", badge: "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800" },
  custom:   { label: "Custom",   icon: "✏️", badge: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600" },
};

const LOG_TYPES: LogType[] = ["feeding", "weight", "medical", "shed", "handling", "custom"];

const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-100 transition";

export default function UnifiedLog({ animalId, onWeightChange }: { animalId: string; onWeightChange?: () => void }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [type, setType] = useState<LogType>("feeding");
  const [form, setForm] = useState({
    logged_at: new Date().toISOString().split("T")[0],
    title: "",
    value: "",
    unit: "",
    notes: "",
  });

  async function fetchEntries() {
    const { data } = await supabase
      .from("animal_log")
      .select("id, logged_at, type, title, value, unit, notes")
      .eq("animal_id", animalId)
      .order("logged_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60);
    setEntries((data as LogEntry[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchEntries(); }, [animalId]);

  function resetForm() {
    setForm({ logged_at: new Date().toISOString().split("T")[0], title: "", value: "", unit: "", notes: "" });
  }

  const canSave =
    !!form.logged_at &&
    (type !== "weight" || !!form.value) &&
    (type !== "custom" || !!form.title);

  async function add() {
    if (!canSave) return;
    setSaving(true);

    await supabase.from("animal_log").insert({
      animal_id: animalId,
      logged_at: form.logged_at,
      type,
      title: form.title || null,
      value: form.value ? parseFloat(form.value) : null,
      unit: form.unit || null,
      notes: form.notes || null,
    });

    // Side effects — keep animals fields in sync
    const updates: Record<string, string | number> = {};
    if (type === "weight" && form.value) {
      updates.weight = parseFloat(form.value);
      updates.last_weighed = form.logged_at;
    }
    if (type === "feeding")  updates.last_fed      = form.logged_at;
    if (type === "shed")     updates.last_shed     = form.logged_at;
    if (type === "handling") updates.last_handled  = form.logged_at;

    if (Object.keys(updates).length > 0) {
      await supabase.from("animals").update(updates).eq("id", animalId);
    }

    resetForm();
    setShowForm(false);
    await fetchEntries();
    setSaving(false);
    if (type === "weight") onWeightChange?.();
  }

  async function remove(id: string) {
    setDeleting(id);
    const entry = entries.find(e => e.id === id);
    await supabase.from("animal_log").delete().eq("id", id);
    setEntries(p => p.filter(e => e.id !== id));
    setDeleting(null);
    if (entry?.type === "weight") onWeightChange?.();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Log</p>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
            + Add entry
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-4">
              {/* Type pills */}
              <div className="flex flex-wrap gap-1.5">
                {LOG_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition
                      ${type === t
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                    {TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}
                  </button>
                ))}
              </div>

              {/* Date — always shown */}
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date <span className="text-red-400">*</span></p>
                <input type="date" className={inputCls} value={form.logged_at}
                  onChange={(e) => setForm(f => ({ ...f, logged_at: e.target.value }))} />
              </div>

              {/* Feeding */}
              {type === "feeding" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Food item</p>
                      <input placeholder="e.g. Dubia roaches" className={inputCls} value={form.title}
                        onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Qty</p>
                      <input type="number" min="0" step="0.1" placeholder="5" className={inputCls} value={form.value}
                        onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                    <input placeholder="Supplements, observations…" className={inputCls} value={form.notes}
                      onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </>
              )}

              {/* Weight */}
              {type === "weight" && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Weight (g) <span className="text-red-400">*</span></p>
                  <input type="number" min="0" step="0.1" placeholder="45" className={inputCls} value={form.value}
                    onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} />
                </div>
              )}

              {/* Medical */}
              {type === "medical" && (
                <>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Description</p>
                    <input placeholder="e.g. Vet check — City Exotic Vets" className={inputCls} value={form.title}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                    <textarea rows={2} placeholder="Findings, medications, follow-up…"
                      className={inputCls} style={{ resize: "none" }} value={form.notes}
                      onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </>
              )}

              {/* Shed / Handling */}
              {(type === "shed" || type === "handling") && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                  <input
                    placeholder={type === "shed" ? "Complete, stuck shed…" : "Duration, behaviour…"}
                    className={inputCls} value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              )}

              {/* Custom */}
              {type === "custom" && (
                <>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Title <span className="text-red-400">*</span></p>
                    <input placeholder="What happened?" className={inputCls} value={form.title}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                    <textarea rows={2} placeholder="Details…" className={inputCls} style={{ resize: "none" }} value={form.notes}
                      onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 rounded-xl border dark:border-gray-600 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="button" onClick={add} disabled={saving || !canSave}
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40">
                  {saving ? "Saving…" : "Save"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log entries */}
      {!loading && entries.length > 0 && (
        <div className="space-y-2 max-h-[32rem] overflow-y-auto">
          <AnimatePresence initial={false}>
            {entries.map(e => (
              <motion.div key={e.id}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
              >
                <LogEntryCard
                  entry={e}
                  onDelete={deleting !== e.id ? remove : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && entries.length === 0 && !showForm && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">No log entries yet</p>
      )}
    </div>
  );
}
