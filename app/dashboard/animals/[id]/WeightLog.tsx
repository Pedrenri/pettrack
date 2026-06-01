"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "motion/react";
import WeightChart from "@/app/components/WeightChart";

interface Entry { id: string; measured_at: string; weight: number; }

export default function WeightLog({ animalId }: { animalId: string }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetch() {
    const { data } = await supabase
      .from("animal_weight_history")
      .select("id, measured_at, weight")
      .eq("animal_id", animalId)
      .order("measured_at", { ascending: true });
    setEntries(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, [animalId]);

  async function add() {
    if (!weight || !date) return;
    setSaving(true);
    await supabase.from("animal_weight_history").insert({
      animal_id: animalId,
      weight: parseFloat(weight),
      measured_at: date,
    });
    setWeight("");
    await fetch();
    setSaving(false);
  }

  async function remove(id: string) {
    setDeleting(id);
    await supabase.from("animal_weight_history").delete().eq("id", id);
    setEntries((p) => p.filter((e) => e.id !== id));
    setDeleting(null);
  }

  const latest = entries.length ? entries[entries.length - 1] : null;
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;
  const trend = latest && prev ? latest.weight - prev.weight : null;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Weight history</p>
        {latest && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{latest.weight}g</span>
            {trend !== null && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? "bg-emerald-50 text-emerald-600" : trend < 0 ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"}`}>
                {trend > 0 ? "+" : ""}{trend.toFixed(1)}g
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      {!loading && <WeightChart entries={entries} />}

      {/* Add row */}
      <div className="flex items-end gap-2">
        <div className="flex-shrink-0">
          <p className="text-xs text-gray-400 mb-1">Weight (g)</p>
          <input
            type="number" min="0" step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="45"
            className="w-24 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-1">Date</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          type="button" onClick={add}
          disabled={saving || !weight || !date}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40"
        >
          {saving ? "…" : "Add"}
        </motion.button>
      </div>

      {/* Entry list */}
      {entries.length > 0 && (
        <div className="space-y-1 max-h-44 overflow-y-auto">
          <AnimatePresence initial={false}>
            {[...entries].reverse().map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="text-gray-400 text-xs">{e.measured_at.split("-").reverse().join("/")}</span>
                <span className="font-semibold text-gray-700">{e.weight}g</span>
                <button
                  type="button" onClick={() => remove(e.id)}
                  disabled={deleting === e.id}
                  className="text-gray-300 hover:text-red-400 transition text-xs disabled:opacity-30 ml-2"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
