"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "motion/react";

interface Entry {
  id: string;
  fed_at: string;
  food_item: string | null;
  quantity: number | null;
  unit: string | null;
  supplements: string | null;
  notes: string | null;
}

interface LogFormState {
  fed_at: string;
  food_item: string;
  quantity: string;
  unit: string;
  supplements: string;
  notes: string;
}

const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-100 transition";

export default function FeedingLog({
  animalId,
  prefillDate,
  prefillSupplements,
  onLogged,
}: {
  animalId: string;
  prefillDate?: string;
  prefillSupplements?: string;
  onLogged?: () => void;
}) {
  const supabase = createClient();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(!!prefillDate);
  const [detailed, setDetailed] = useState(false);

  const [form, setForm] = useState<LogFormState>({
    fed_at: prefillDate ?? new Date().toISOString().split("T")[0],
    food_item: "",
    quantity: "",
    unit: "",
    supplements: prefillSupplements ?? "",
    notes: "",
  });

  async function fetchEntries() {
    const { data } = await supabase
      .from("animal_feeding_log")
      .select("id, fed_at, food_item, quantity, unit, supplements, notes")
      .eq("animal_id", animalId)
      .order("fed_at", { ascending: false })
      .limit(30);
    setEntries(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchEntries(); }, [animalId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function add() {
    if (!form.fed_at) return;
    setSaving(true);
    await supabase.from("animal_feeding_log").insert({
      animal_id: animalId,
      fed_at: form.fed_at,
      food_item: form.food_item || null,
      quantity: form.quantity ? parseFloat(form.quantity) : null,
      unit: form.unit || null,
      supplements: form.supplements || null,
      notes: form.notes || null,
    });
    // Update animals.last_fed
    await supabase.from("animals").update({ last_fed: form.fed_at }).eq("id", animalId);
    setForm({ fed_at: new Date().toISOString().split("T")[0], food_item: "", quantity: "", unit: "", supplements: "", notes: "" });
    setShowForm(false);
    setDetailed(false);
    await fetchEntries();
    setSaving(false);
    onLogged?.();
  }

  async function remove(id: string) {
    setDeleting(id);
    await supabase.from("animal_feeding_log").delete().eq("id", id);
    setEntries((p) => p.filter((e) => e.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Feeding log</p>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
          >
            + Log feeding
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date <span className="text-red-400">*</span></p>
                <input type="date" name="fed_at" className={inputCls} value={form.fed_at} onChange={handleChange} />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Food item</p>
                <input name="food_item" placeholder="e.g. Dubia roaches" className={inputCls} value={form.food_item} onChange={handleChange} />
              </div>
            </div>

            {/* Detailed toggle */}
            <button
              type="button"
              onClick={() => setDetailed((d) => !d)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {detailed ? "− Less detail" : "+ Add quantity, supplements & notes"}
            </button>

            <AnimatePresence>
              {detailed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Quantity</p>
                      <input type="number" min="0" step="0.1" name="quantity" placeholder="e.g. 5" className={inputCls} value={form.quantity} onChange={handleChange} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Unit</p>
                      <input name="unit" placeholder="insects / grams…" className={inputCls} value={form.unit} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Supplements</p>
                    <input name="supplements" placeholder="e.g. Calcium + D3, Repashy" className={inputCls} value={form.supplements} onChange={handleChange} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                    <textarea name="notes" rows={2} placeholder="Refused, ate eagerly…" className={inputCls} style={{ resize: "none" }} value={form.notes} onChange={handleChange} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setDetailed(false); }}
                className="flex-1 rounded-xl border dark:border-gray-600 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="button" onClick={add} disabled={saving || !form.fed_at}
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry list */}
      {!loading && entries.length > 0 && (
        <div className="space-y-1 max-h-52 overflow-y-auto">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start justify-between rounded-xl bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{e.fed_at.split("-").reverse().join("/")}</span>
                    {e.food_item && <span className="font-medium text-gray-700 dark:text-gray-200">{e.food_item}</span>}
                    {e.quantity != null && <span className="text-xs text-gray-500 dark:text-gray-400">{e.quantity}{e.unit ? ` ${e.unit}` : ""}</span>}
                  </div>
                  {e.supplements && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{e.supplements}</p>}
                  {e.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">{e.notes}</p>}
                </div>
                <button
                  type="button" onClick={() => remove(e.id)}
                  disabled={deleting === e.id}
                  className="text-gray-300 dark:text-gray-500 hover:text-red-400 transition text-xs disabled:opacity-30 mt-0.5 flex-shrink-0"
                >✕</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && entries.length === 0 && !showForm && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">No feeding entries yet</p>
      )}
    </div>
  );
}
