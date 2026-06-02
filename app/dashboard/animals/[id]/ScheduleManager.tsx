"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "motion/react";

export type ScheduleType = "feeding" | "supplement" | "handling" | "vet" | "medication" | "custom";

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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const TYPE_CONFIG: Record<ScheduleType, { label: string; icon: string; defaultAppointment: boolean; color: string }> = {
  feeding:    { label: "Feeding",    icon: "🍗", defaultAppointment: false, color: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" },
  supplement: { label: "Supplement", icon: "💊", defaultAppointment: false, color: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800" },
  handling:   { label: "Handling",   icon: "🤚", defaultAppointment: false, color: "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800" },
  vet:        { label: "Vet",        icon: "🏥", defaultAppointment: true,  color: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" },
  medication: { label: "Medication", icon: "💉", defaultAppointment: false, color: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" },
  custom:     { label: "Custom",     icon: "✏️", defaultAppointment: false, color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600" },
};

const SCHEDULE_TYPES = Object.keys(TYPE_CONFIG) as ScheduleType[];

export function isAppointment(item: ScheduleItem): boolean {
  return item.due_date !== null;
}

export function scheduleFrequencyLabel(item: ScheduleItem): string {
  if (isAppointment(item)) return item.due_date!.split("-").reverse().join("/");
  if (item.weekdays?.length) return item.weekdays.slice().sort((a, b) => a - b).map(d => DAY_NAMES[d]).join(", ");
  return `every ${item.interval_days}d`;
}

export function nextDue(item: ScheduleItem): Date {
  if (isAppointment(item)) { const d = new Date(item.due_date!); d.setHours(0,0,0,0); return d; }
  if (item.weekdays?.length) return nextDueFromWeekdays(item.weekdays, item.last_done);
  if (!item.last_done) return new Date();
  const d = new Date(item.last_done);
  d.setDate(d.getDate() + (item.interval_days ?? 1));
  return d;
}

function nextDueFromWeekdays(weekdays: number[], lastDone: string | null): Date {
  const today = new Date(); today.setHours(0,0,0,0);
  const lastDoneDate = lastDone ? (() => { const d = new Date(lastDone); d.setHours(0,0,0,0); return d; })() : null;
  const doneToday = lastDoneDate?.getTime() === today.getTime();
  for (let offset = doneToday ? 1 : 0; offset <= 7; offset++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + offset);
    if (weekdays.includes(candidate.getDay())) return candidate;
  }
  return today;
}

export function dueStatus(item: ScheduleItem): "overdue" | "today" | "soon" | "ok" | "done" {
  if (isAppointment(item) && item.last_done) return "done";
  const due = nextDue(item);
  const now = new Date(); now.setHours(0,0,0,0);
  const diffDays = Math.floor((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 2) return "soon";
  return "ok";
}

const STATUS_STYLES = {
  overdue: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
  today:   "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  soon:    "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400",
  ok:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  done:    "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500",
};

function dueSummary(item: ScheduleItem) {
  const status = dueStatus(item);
  if (status === "done") return "Completed";
  const due = nextDue(item);
  const now = new Date(); now.setHours(0,0,0,0);
  const diffDays = Math.floor((due.getTime() - now.getTime()) / 86400000);
  if (!item.last_done && !item.weekdays?.length && !item.due_date) return "Never done";
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return isAppointment(item) ? "Today" : "Due today";
  return `In ${diffDays}d`;
}

const inputCls = "w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-100 transition";
const pillBase = "flex-1 rounded-xl border py-2 text-xs font-semibold transition text-center";
const pillActive = "border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300";
const pillInactive = "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400";

type FormState = {
  name: string;
  type: ScheduleType;
  mode: "recurring" | "appointment";
  recurMode: "interval" | "weekdays";
  interval_days: string;
  weekdays: number[];
  due_date: string;
  due_time: string;
  notes: string;
};

const defaultForm: FormState = {
  name: "", type: "feeding", mode: "recurring", recurMode: "interval",
  interval_days: "7", weekdays: [], due_date: "", due_time: "", notes: "",
};

function itemToForm(item: ScheduleItem): FormState {
  return {
    name: item.name,
    type: item.type,
    mode: isAppointment(item) ? "appointment" : "recurring",
    recurMode: item.weekdays?.length ? "weekdays" : "interval",
    interval_days: item.interval_days?.toString() ?? "7",
    weekdays: item.weekdays ?? [],
    due_date: item.due_date ?? "",
    due_time: item.due_time ?? "",
    notes: item.notes ?? "",
  };
}

type DoneModalState =
  | null
  | { step: "confirm"; item: ScheduleItem; date: string }
  | { step: "log";     item: ScheduleItem; date: string };

export default function ScheduleManager({ animalId }: { animalId: string }) {
  const supabase = createClient();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(defaultForm);
  const [addForm, setAddForm] = useState<FormState>(defaultForm);
  const [doneModal, setDoneModal] = useState<DoneModalState>(null);
  const [logForm, setLogForm] = useState({ title: "", value: "", notes: "" });

  // Map schedule type → log type
  function scheduleToLogType(type: ScheduleType): "feeding" | "medical" | "handling" | "custom" {
    if (type === "feeding" || type === "supplement") return "feeding";
    if (type === "vet" || type === "medication")     return "medical";
    if (type === "handling")                         return "handling";
    return "custom";
  }

  async function fetchItems() {
    const { data } = await supabase
      .from("animal_schedules")
      .select("id, animal_id, name, type, interval_days, weekdays, due_date, due_time, last_done, notes")
      .eq("animal_id", animalId)
      .order("created_at", { ascending: true });
    setItems((data as ScheduleItem[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, [animalId]);

  function setFormType(form: FormState, type: ScheduleType): FormState {
    return { ...form, type, mode: TYPE_CONFIG[type].defaultAppointment ? "appointment" : form.mode === "appointment" ? "recurring" : form.mode };
  }

  function toggleWeekday(form: FormState, d: number): FormState {
    return { ...form, weekdays: form.weekdays.includes(d) ? form.weekdays.filter(x => x !== d) : [...form.weekdays, d] };
  }

  function canSave(form: FormState) {
    return form.name && (form.mode === "appointment" ? !!form.due_date : form.recurMode === "interval" ? !!form.interval_days : form.weekdays.length > 0);
  }

  async function addItem() {
    if (!canSave(addForm)) return;
    setSaving(true);
    await supabase.from("animal_schedules").insert({
      animal_id: animalId,
      name: addForm.name, type: addForm.type,
      interval_days: addForm.mode === "recurring" && addForm.recurMode === "interval" ? parseInt(addForm.interval_days) : null,
      weekdays: addForm.mode === "recurring" && addForm.recurMode === "weekdays" ? addForm.weekdays : null,
      due_date: addForm.mode === "appointment" ? addForm.due_date : null,
      due_time: addForm.due_time || null,
      notes: addForm.notes || null,
    });
    setAddForm(defaultForm);
    setShowAddForm(false);
    await fetchItems();
    setSaving(false);
  }

  async function saveEdit(id: string) {
    if (!canSave(editForm)) return;
    setSaving(true);
    await supabase.from("animal_schedules").update({
      name: editForm.name, type: editForm.type,
      interval_days: editForm.mode === "recurring" && editForm.recurMode === "interval" ? parseInt(editForm.interval_days) : null,
      weekdays: editForm.mode === "recurring" && editForm.recurMode === "weekdays" ? editForm.weekdays : null,
      due_date: editForm.mode === "appointment" ? editForm.due_date : null,
      due_time: editForm.due_time || null,
      notes: editForm.notes || null,
    }).eq("id", id);
    setEditingId(null);
    setExpandedId(id);
    await fetchItems();
    setSaving(false);
  }

  async function removeItem(id: string) {
    await supabase.from("animal_schedules").delete().eq("id", id);
    setItems(p => p.filter(i => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  async function markDone(id: string, date: string) {
    await supabase.from("animal_schedules").update({ last_done: date }).eq("id", id);
    setItems(p => p.map(i => i.id === id ? { ...i, last_done: date } : i));
  }

  async function handleDoneNoLog() {
    if (!doneModal) return;
    setSaving(true);
    await markDone(doneModal.item.id, doneModal.date);
    setSaving(false);
    setDoneModal(null);
  }

  async function handleDoneWithLog() {
    if (!doneModal || doneModal.step !== "log") return;
    setSaving(true);
    await markDone(doneModal.item.id, doneModal.date);

    const logType = scheduleToLogType(doneModal.item.type);
    await supabase.from("animal_log").insert({
      animal_id: doneModal.item.animal_id,
      logged_at: doneModal.date,
      type: logType,
      title: logForm.title || null,
      value: logForm.value ? parseFloat(logForm.value) : null,
      notes: logForm.notes || null,
    });

    // Sync animal fields
    if (logType === "feeding")  await supabase.from("animals").update({ last_fed:     doneModal.date }).eq("id", doneModal.item.animal_id);
    if (logType === "handling") await supabase.from("animals").update({ last_handled: doneModal.date }).eq("id", doneModal.item.animal_id);

    setSaving(false);
    setLogForm({ title: "", value: "", notes: "" });
    setDoneModal(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Schedules</p>
        {!showAddForm && (
          <button type="button" onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
            + Add schedule
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 space-y-3">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">New schedule</p>
              <ScheduleForm form={addForm} onChange={setAddForm} setType={t => setAddForm(f => setFormType(f, t))} toggleDay={d => setAddForm(f => toggleWeekday(f, d))} />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowAddForm(false); setAddForm(defaultForm); }}
                  className="flex-1 rounded-xl border dark:border-gray-600 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="button" onClick={addItem} disabled={saving || !canSave(addForm)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40">
                  {saving ? "Saving…" : "Add"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && items.length === 0 && !showAddForm && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">No schedules yet</p>
      )}

      {/* Schedule cards */}
      <div className="space-y-2">
        {items.map(item => {
          const status = dueStatus(item);
          const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.custom;
          const expanded = expandedId === item.id;
          const editing = editingId === item.id;

          return (
            <div key={item.id} className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              {/* Card header — always visible */}
              <button
                type="button"
                onClick={() => {
                  if (editing) return;
                  setExpandedId(expanded ? null : item.id);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <span className="text-lg flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${cfg.color}`}>{cfg.label}</span>
                    {isAppointment(item) && (
                      <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded-md font-medium">Appointment</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {scheduleFrequencyLabel(item)}{item.due_time ? ` · ${item.due_time}` : ""}
                    </span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${STATUS_STYLES[status]}`}>{dueSummary(item)}</span>
                  </div>
                </div>
                <span className={`text-gray-400 dark:text-gray-500 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
                  >
                    {editing ? (
                      <div className="p-4 space-y-3">
                        <ScheduleForm form={editForm} onChange={setEditForm} setType={t => setEditForm(f => setFormType(f, t))} toggleDay={d => setEditForm(f => toggleWeekday(f, d))} />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setEditingId(null)}
                            className="flex-1 rounded-xl border dark:border-gray-600 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            Cancel
                          </button>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            type="button" onClick={() => saveEdit(item.id)} disabled={saving || !canSave(editForm)}
                            className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40">
                            {saving ? "Saving…" : "Save changes"}
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 space-y-3">
                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400 dark:text-gray-500 mb-0.5">Schedule</p>
                            <p className="text-gray-700 dark:text-gray-200 font-medium">
                            {scheduleFrequencyLabel(item)}{item.due_time ? ` at ${item.due_time}` : ""}
                          </p>
                          </div>
                          {item.last_done && (
                            <div>
                              <p className="text-gray-400 dark:text-gray-500 mb-0.5">Last done</p>
                              <p className="text-gray-700 dark:text-gray-200 font-medium">{item.last_done.split("-").reverse().join("/")}</p>
                            </div>
                          )}
                          {!isAppointment(item) && (
                            <div>
                              <p className="text-gray-400 dark:text-gray-500 mb-0.5">Next due</p>
                              <p className="text-gray-700 dark:text-gray-200 font-medium">{nextDue(item).toLocaleDateString("en-GB")}</p>
                            </div>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2">{item.notes}</p>
                        )}
                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          {status !== "done" && (
                            <button type="button"
                              onClick={() => setDoneModal({ step: "confirm", item, date: isAppointment(item) ? item.due_date! : new Date().toISOString().split("T")[0] })}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                              ✓ Done
                            </button>
                          )}
                          <button type="button"
                            onClick={() => { setEditForm(itemToForm(item)); setEditingId(item.id); }}
                            className="rounded-lg border dark:border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            Edit
                          </button>
                          <button type="button" onClick={() => removeItem(item.id)}
                            className="rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition ml-auto">
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Mark done modal ── */}
      <AnimatePresence>
        {doneModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDoneModal(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
            >
              {/* Step 1: Confirm date */}
              {doneModal.step === "confirm" && (
                <div className="p-5 space-y-4">
                  <p className="font-semibold text-gray-900 dark:text-white">Mark "{doneModal.item.name}" done</p>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date completed <span className="text-red-400">*</span></p>
                    <input type="date" value={doneModal.date}
                      onChange={(e) => setDoneModal({ ...doneModal, date: e.target.value })}
                      className={inputCls} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setDoneModal(null)}
                      className="flex-1 rounded-xl border dark:border-gray-600 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      Cancel
                    </button>
                    <button type="button" disabled={saving} onClick={handleDoneNoLog}
                      className="flex-1 rounded-xl border border-emerald-300 dark:border-emerald-700 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition disabled:opacity-40">
                      Done, no log
                    </button>
                    <button type="button"
                      onClick={() => setDoneModal({ step: "log", item: doneModal.item, date: doneModal.date })}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                      Done + log →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Add log */}
              {doneModal.step === "log" && (() => {
                const logType = scheduleToLogType(doneModal.item.type);
                return (
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <button type="button"
                        onClick={() => setDoneModal({ step: "confirm", item: doneModal.item, date: doneModal.date })}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition text-sm">
                        ←
                      </button>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Log {logType}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{doneModal.date} · all fields optional</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Feeding */}
                      {logType === "feeding" && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Food item</p>
                              <input placeholder="e.g. Dubia roaches" className={inputCls}
                                value={logForm.title} onChange={e => setLogForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Qty</p>
                              <input type="number" min="0" step="0.1" placeholder="5" className={inputCls}
                                value={logForm.value} onChange={e => setLogForm(f => ({ ...f, value: e.target.value }))} />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                            <input placeholder="Supplements, observations…" className={inputCls}
                              value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} />
                          </div>
                        </>
                      )}

                      {/* Medical */}
                      {logType === "medical" && (
                        <>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Description</p>
                            <input placeholder="e.g. Vet check — City Exotic Vets" className={inputCls}
                              value={logForm.title} onChange={e => setLogForm(f => ({ ...f, title: e.target.value }))} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                            <textarea rows={2} placeholder="Findings, medications, follow-up…"
                              className={inputCls} style={{ resize: "none" }}
                              value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} />
                          </div>
                        </>
                      )}

                      {/* Handling */}
                      {logType === "handling" && (
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                          <input placeholder="Duration, behaviour…" className={inputCls}
                            value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                      )}

                      {/* Custom */}
                      {logType === "custom" && (
                        <>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Title</p>
                            <input placeholder="What happened?" className={inputCls}
                              value={logForm.title} onChange={e => setLogForm(f => ({ ...f, title: e.target.value }))} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                            <textarea rows={2} placeholder="Details…" className={inputCls} style={{ resize: "none" }}
                              value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} />
                          </div>
                        </>
                      )}
                    </div>

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
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Time input with 12h/24h toggle ───────────────────────────────────────────

function parseTo12h(time: string): { h: number; m: number; ampm: "AM" | "PM" } {
  const [hh, mm] = time.split(":").map(Number);
  return {
    h: hh === 0 ? 12 : hh > 12 ? hh - 12 : hh,
    m: mm,
    ampm: hh < 12 ? "AM" : "PM",
  };
}

function to24h(h: number, m: number, ampm: "AM" | "PM"): string {
  let hh = h;
  if (ampm === "AM" && h === 12) hh = 0;
  if (ampm === "PM" && h !== 12) hh = h + 12;
  return `${hh.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [fmt, setFmt] = useState<"24h" | "12h">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("timeFormat") as "24h" | "12h") ?? "24h";
    return "24h";
  });

  function switchFmt(f: "24h" | "12h") {
    setFmt(f);
    localStorage.setItem("timeFormat", f);
  }

  const p = value ? parseTo12h(value) : null;

  const label = (
    <div className="flex items-center justify-between mb-1">
      <p className="text-xs text-gray-400 dark:text-gray-500">Time</p>
      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 text-xs font-semibold">
        {(["24h", "12h"] as const).map(f => (
          <button key={f} type="button" onClick={() => switchFmt(f)}
            className={`px-2 py-0.5 transition ${fmt === f ? "bg-emerald-600 text-white" : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );

  if (fmt === "24h") {
    return (
      <div>
        {label}
        <input type="time" className={inputCls} value={value}
          onChange={e => onChange(e.target.value)} />
      </div>
    );
  }

  // 12h mode
  const h = p?.h ?? 12;
  const m = p?.m ?? 0;
  const ampm = p?.ampm ?? "AM";

  return (
    <div>
      {label}
      <div className="flex items-center gap-2">
        {/* Hour */}
        <input
          type="number" min={1} max={12}
          value={h}
          onChange={e => {
            const v = Math.min(12, Math.max(1, parseInt(e.target.value) || 1));
            onChange(to24h(v, m, ampm));
          }}
          className={`${inputCls} w-16 text-center`}
        />
        <span className="text-gray-400 dark:text-gray-500 font-semibold">:</span>
        {/* Minute */}
        <input
          type="number" min={0} max={59}
          value={m.toString().padStart(2, "0")}
          onChange={e => {
            const v = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
            onChange(to24h(h, v, ampm));
          }}
          className={`${inputCls} w-16 text-center`}
        />
        {/* AM/PM */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 text-xs font-semibold flex-shrink-0">
          {(["AM", "PM"] as const).map(a => (
            <button key={a} type="button" onClick={() => onChange(to24h(h, m, a))}
              className={`px-3 py-2 transition ${ampm === a ? "bg-emerald-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared form UI ────────────────────────────────────────────────────────────

function ScheduleForm({
  form, onChange, setType, toggleDay,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  setType: (t: ScheduleType) => void;
  toggleDay: (d: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Name <span className="text-red-400">*</span></p>
        <input placeholder="e.g. Evening feeding, Calcium D3, Annual check-up…" className={inputCls}
          value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} />
      </div>

      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Type</p>
        <div className="flex flex-wrap gap-1.5">
          {SCHEDULE_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition
                ${form.type === t ? pillActive : pillInactive}`}>
              {TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Schedule type <span className="text-red-400">*</span></p>
        <div className="flex gap-2">
          {(["recurring", "appointment"] as const).map(m => (
            <button key={m} type="button" onClick={() => onChange({ ...form, mode: m })}
              className={`${pillBase} ${form.mode === m ? pillActive : pillInactive}`}>
              {m === "recurring" ? "↻ Recurring" : "📅 Appointment"}
            </button>
          ))}
        </div>
      </div>

      {form.mode === "recurring" && (
        <>
          <div className="flex gap-2">
            {(["interval", "weekdays"] as const).map(m => (
              <button key={m} type="button" onClick={() => onChange({ ...form, recurMode: m })}
                className={`${pillBase} ${form.recurMode === m ? pillActive : pillInactive}`}>
                {m === "interval" ? "Every X days" : "Set weekdays"}
              </button>
            ))}
          </div>
          {form.recurMode === "interval" && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Every (days)</p>
              <input type="number" min="1" placeholder="7" className={inputCls}
                value={form.interval_days} onChange={e => onChange({ ...form, interval_days: e.target.value })} />
            </div>
          )}
          {form.recurMode === "weekdays" && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">On these days</p>
              <div className="flex gap-1.5">
                {DAY_NAMES.map((name, d) => {
                  const active = form.weekdays.includes(d);
                  return (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition
                        ${active ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {form.mode === "appointment" && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date <span className="text-red-400">*</span></p>
          <input type="date" className={inputCls} value={form.due_date}
            onChange={e => onChange({ ...form, due_date: e.target.value })} />
        </div>
      )}

      <TimeInput
        value={form.due_time}
        onChange={v => onChange({ ...form, due_time: v })}
      />

      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
        <input placeholder={form.mode === "appointment" ? "Clinic, reason, preparation…" : "Optional notes…"} className={inputCls}
          value={form.notes} onChange={e => onChange({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

// ── Mark done button ──────────────────────────────────────────────────────────

function MarkDoneButton({ item, onDone }: { item: ScheduleItem; onDone: (date: string) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(isAppointment(item) ? item.due_date! : new Date().toISOString().split("T")[0]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
        ✓ Done
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xs rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-xl mx-4 space-y-4">
              <p className="font-semibold text-gray-900 dark:text-white">Mark "{item.name}" done</p>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date completed <span className="text-red-400">*</span></p>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-emerald-400 transition" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border dark:border-gray-600 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Cancel
                </button>
                <button type="button" onClick={() => { onDone(date); setOpen(false); }}
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
