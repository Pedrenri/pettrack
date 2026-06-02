"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { type ScheduleItem, type Animal, nextDue, dueStatus, scheduleFrequencyLabel, isAppointment } from "@pettrack/core";

const STATUS_BADGE = {
  overdue: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
  today:   "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  soon:    "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
  ok:      "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  done:    "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600",
};

const STATUS_LABEL = {
  overdue: (d: number) => `${d}d overdue`,
  today:   () => "Due today",
  soon:    (d: number) => `In ${d}d`,
  ok:      (d: number) => `In ${d}d`,
  done:    () => "Completed",
};

const inputCls = "w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-emerald-400 transition";

function diffDays(item: ScheduleItem) {
  const due = nextDue(item);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.floor((due.getTime() - now.getTime()) / 86400000);
}

type ModalState =
  | null
  | { step: "confirm"; item: ScheduleItem; date: string }
  | { step: "log";     item: ScheduleItem; date: string };

export default function SchedulesDashboard({
  animals,
  schedules: initialSchedules,
}: {
  animals: Animal[];
  schedules: ScheduleItem[];
}) {
  const supabase = createClient();
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);

  // Feeding log form state
  const [feedForm, setFeedForm] = useState({ food_item: "", supplements: "", notes: "" });
  // Vet log form state
  const [vetForm, setVetForm] = useState({ clinic: "", notes: "" });

  const animalMap = Object.fromEntries(animals.map((a) => [a.id, a]));

  const sorted = [...schedules].sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, today: 1, soon: 2, ok: 3 };
    const sa = dueStatus(a), sb = dueStatus(b);
    if (order[sa] !== order[sb]) return order[sa] - order[sb];
    return diffDays(a) - diffDays(b);
  });

  async function markDone(item: ScheduleItem, date: string) {
    await supabase.from("animal_schedules").update({ last_done: date }).eq("id", item.id);
    setSchedules((p) => p.map((s) => s.id === item.id ? { ...s, last_done: date } : s));
  }

  async function handleDoneNoLog() {
    if (!modal) return;
    setSaving(true);
    await markDone(modal.item, modal.date);
    setSaving(false);
    setModal(null);
  }

  async function handleDoneWithLog() {
    if (!modal || modal.step !== "log") return;
    setSaving(true);
    await markDone(modal.item, modal.date);

    if (isAppointment(modal.item)) {
      await supabase.from("animal_log").insert({
        animal_id: modal.item.animal_id,
        logged_at: modal.date,
        type: "medical",
        title: vetForm.clinic || null,
        notes: vetForm.notes || null,
      });
    } else {
      await supabase.from("animal_log").insert({
        animal_id: modal.item.animal_id,
        logged_at: modal.date,
        type: "feeding",
        title: feedForm.food_item || null,
        notes: feedForm.supplements
          ? `${feedForm.supplements}${feedForm.notes ? ` · ${feedForm.notes}` : ""}`
          : feedForm.notes || null,
      });
      if (feedForm.food_item || feedForm.supplements) {
        await supabase.from("animals").update({ last_fed: modal.date }).eq("id", modal.item.animal_id);
      }
    }

    setSaving(false);
    setFeedForm({ food_item: "", supplements: "", notes: "" });
    setVetForm({ clinic: "", notes: "" });
    setModal(null);
  }

  if (schedules.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4 opacity-40">📅</div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No schedules yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Open an animal's profile to add feeding or supplement schedules.</p>
        <Link href="/dashboard" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
          Go to animals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Schedules</h1>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {sorted.filter(s => dueStatus(s) !== "ok").length} need attention
        </span>
      </div>

      {sorted.map((item) => {
        const animal = animalMap[item.animal_id];
        if (!animal) return null;
        const status = dueStatus(item);
        const d = diffDays(item);
        const photo = animal.animal_photos?.[0]?.url;

        return (
          <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-3 shadow-sm"
          >
            <Link href={`/dashboard/animals/${animal.id}`} className="flex-shrink-0">
              {photo
                ? <img src={photo} className="h-9 w-9 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
                : <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-lg">🦎</div>}
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</span>
                {isAppointment(item) && (
                  <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded-md font-medium">Appointment</span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">· {animal.name}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${STATUS_BADGE[status]}`}>
                  {STATUS_LABEL[status](Math.abs(d))}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {scheduleFrequencyLabel(item)}{item.due_time ? ` · ${item.due_time}` : ""}{item.last_done ? ` · last ${item.last_done.split("-").reverse().join("/")}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModal({ step: "confirm", item, date: new Date().toISOString().split("T")[0] })}
              className="flex-shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              ✓ Done
            </button>
          </motion.div>
        );
      })}

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
            >
              {/* ── Step 1: Confirm date ── */}
              {modal.step === "confirm" && (
                <div className="p-5 space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Mark "{modal.item.name}" done</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{animalMap[modal.item.animal_id]?.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date completed <span className="text-red-400">*</span></p>
                    <input type="date" value={modal.date}
                      onChange={(e) => setModal({ ...modal, date: e.target.value })}
                      className={inputCls} />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setModal(null)}
                      className="flex-1 rounded-xl border dark:border-gray-600 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      Cancel
                    </button>
                    <button type="button" disabled={saving} onClick={handleDoneNoLog}
                      className="flex-1 rounded-xl border border-emerald-300 dark:border-emerald-700 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition disabled:opacity-40">
                      Done, no log
                    </button>
                    <button type="button"
                      onClick={() => setModal({ step: "log", item: modal.item, date: modal.date })}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                      Done + log →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Add log ── */}
              {modal.step === "log" && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setModal({ step: "confirm", item: modal.item, date: modal.date })}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition text-sm">
                      ←
                    </button>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {isAppointment(modal.item) ? "Log appointment details" : "Log feeding"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{modal.date} · all fields optional</p>
                    </div>
                  </div>

                  {isAppointment(modal.item) ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Clinic / vet name</p>
                        <input placeholder="e.g. City Exotic Vets" className={inputCls}
                          value={vetForm.clinic} onChange={(e) => setVetForm(f => ({ ...f, clinic: e.target.value }))} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                        <textarea rows={3} placeholder="Reason for visit, findings, medications…"
                          className={inputCls} style={{ resize: "none" }}
                          value={vetForm.notes} onChange={(e) => setVetForm(f => ({ ...f, notes: e.target.value }))} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Food item</p>
                        <input placeholder="e.g. Dubia roaches" className={inputCls}
                          value={feedForm.food_item} onChange={(e) => setFeedForm(f => ({ ...f, food_item: e.target.value }))} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Supplements</p>
                        <input placeholder="e.g. Calcium + D3, Repashy" className={inputCls}
                          value={feedForm.supplements} onChange={(e) => setFeedForm(f => ({ ...f, supplements: e.target.value }))} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                        <textarea rows={2} placeholder="Refused, ate eagerly…"
                          className={inputCls} style={{ resize: "none" }}
                          value={feedForm.notes} onChange={(e) => setFeedForm(f => ({ ...f, notes: e.target.value }))} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button type="button" disabled={saving} onClick={handleDoneNoLog}
                      className="flex-1 rounded-xl border dark:border-gray-600 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40">
                      Skip log
                    </button>
                    <button type="button" disabled={saving} onClick={handleDoneWithLog}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40">
                      {saving ? "Saving…" : "Save & done"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
