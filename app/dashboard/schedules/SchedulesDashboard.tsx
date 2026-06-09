"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  type ScheduleItem,
  type FormState,
  defaultForm,
  itemToForm,
  canSave,
  ScheduleForm,
  nextDue,
  dueStatus,
  scheduleFrequencyLabel,
  isAppointment,
  TYPE_CONFIG,
} from "@/app/dashboard/animals/[id]/ScheduleManager";

interface Animal {
  id: string;
  name: string;
  animal_photos: Array<{ url: string }>;
}

const STATUS_BADGE = {
  overdue: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
  today:   "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  soon:    "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
  ok:      "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  done:    "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600",
};

const STATUS_LABEL: Record<string, (d: number) => string> = {
  overdue: (d) => `${d}d overdue`,
  today:   () => "Due today",
  soon:    (d) => `In ${d}d`,
  ok:      (d) => `In ${d}d`,
  done:    () => "Completed",
};

const inputCls = "w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-emerald-400 transition";

function diffDays(item: ScheduleItem) {
  const due = nextDue(item);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.floor((due.getTime() - now.getTime()) / 86400000);
}

function applyType(form: FormState, type: FormState["type"]): FormState {
  return { ...form, type, mode: TYPE_CONFIG[type].defaultAppointment ? "appointment" : form.mode === "appointment" ? "recurring" : form.mode };
}
function toggleDay(form: FormState, d: number): FormState {
  return { ...form, weekdays: form.weekdays.includes(d) ? form.weekdays.filter(x => x !== d) : [...form.weekdays, d] };
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

  const [showAdd, setShowAdd] = useState(false);
  const [addAnimalId, setAddAnimalId] = useState(animals[0]?.id ?? "");
  const [addForm, setAddForm] = useState<FormState>(defaultForm);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(defaultForm);

  const [animalSearch, setAnimalSearch] = useState("");
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
  const animalComboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (animalComboRef.current && !animalComboRef.current.contains(e.target as Node)) {
        setShowAnimalDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const [feedForm, setFeedForm] = useState({ food_item: "", supplements: "", notes: "" });
  const [vetForm, setVetForm]   = useState({ clinic: "", notes: "" });

  const animalMap = Object.fromEntries(animals.map((a) => [a.id, a]));

  const sorted = [...schedules].sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, today: 1, soon: 2, ok: 3, done: 4 };
    const sa = dueStatus(a), sb = dueStatus(b);
    if (order[sa] !== order[sb]) return order[sa] - order[sb];
    return diffDays(a) - diffDays(b);
  });

  async function handleAdd() {
    if (!canSave(addForm) || !addAnimalId) return;
    setSaving(true);
    const { data } = await supabase.from("animal_schedules").insert({
      animal_id: addAnimalId,
      name: addForm.name, type: addForm.type,
      interval_days: addForm.mode === "recurring" && addForm.recurMode === "interval" ? parseInt(addForm.interval_days) : null,
      weekdays: addForm.mode === "recurring" && addForm.recurMode === "weekdays" ? addForm.weekdays : null,
      due_date: addForm.mode === "appointment" ? addForm.due_date : null,
      due_time: addForm.due_time || null,
      notes: addForm.notes || null,
    }).select("id, animal_id, name, type, interval_days, weekdays, due_date, due_time, last_done, notes").single();
    if (data) setSchedules(p => [...p, data as ScheduleItem]);
    setAddForm(defaultForm);
    setShowAdd(false);
    setSaving(false);
  }

  async function handleSaveEdit(id: string) {
    if (!canSave(editForm)) return;
    setSaving(true);
    const patch = {
      name: editForm.name, type: editForm.type,
      interval_days: editForm.mode === "recurring" && editForm.recurMode === "interval" ? parseInt(editForm.interval_days) : null,
      weekdays: editForm.mode === "recurring" && editForm.recurMode === "weekdays" ? editForm.weekdays : null,
      due_date: editForm.mode === "appointment" ? editForm.due_date : null,
      due_time: editForm.due_time || null,
      notes: editForm.notes || null,
    };
    await supabase.from("animal_schedules").update(patch).eq("id", id);
    setSchedules(p => p.map(s => s.id === id ? { ...s, ...patch } : s));
    setEditingId(null);
    setExpandedId(id);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("animal_schedules").delete().eq("id", id);
    setSchedules(p => p.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  async function markDone(item: ScheduleItem, date: string) {
    await supabase.from("animal_schedules").update({ last_done: date }).eq("id", item.id);
    setSchedules(p => p.map(s => s.id === item.id ? { ...s, last_done: date } : s));
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
      await supabase.from("animal_log").insert({ animal_id: modal.item.animal_id, logged_at: modal.date, type: "medical", title: vetForm.clinic || null, notes: vetForm.notes || null });
    } else {
      await supabase.from("animal_log").insert({ animal_id: modal.item.animal_id, logged_at: modal.date, type: "feeding",
        title: feedForm.food_item || null,
        notes: feedForm.supplements ? `${feedForm.supplements}${feedForm.notes ? ` · ${feedForm.notes}` : ""}` : feedForm.notes || null });
      if (feedForm.food_item || feedForm.supplements) await supabase.from("animals").update({ last_fed: modal.date }).eq("id", modal.item.animal_id);
    }
    setSaving(false);
    setFeedForm({ food_item: "", supplements: "", notes: "" });
    setVetForm({ clinic: "", notes: "" });
    setModal(null);
  }

  if (schedules.length === 0 && !showAdd) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4 opacity-40">📅</div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No schedules yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Create one here or open an animal&apos;s profile.</p>
        <button onClick={() => setShowAdd(true)}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
          + Add schedule
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-3">

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Schedules</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {sorted.filter(s => ["overdue", "today"].includes(dueStatus(s))).length} need attention
          </span>
          {!showAdd && (
            <button onClick={() => { setShowAdd(true); setAddAnimalId(animals[0]?.id ?? ""); setAddForm(defaultForm); setAnimalSearch(""); setShowAnimalDropdown(false); }}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
              + Add schedule
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 space-y-3">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">New schedule</p>
              <div ref={animalComboRef}>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Animal <span className="text-red-400">*</span></p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search animal…"
                    value={showAnimalDropdown ? animalSearch : (animals.find(a => a.id === addAnimalId)?.name ?? "")}
                    onFocus={() => { setAnimalSearch(""); setShowAnimalDropdown(true); }}
                    onChange={e => setAnimalSearch(e.target.value)}
                    className={inputCls}
                    autoComplete="off"
                  />
                  {showAnimalDropdown && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {animals
                        .filter(a => a.name.toLowerCase().includes(animalSearch.toLowerCase()))
                        .map(a => (
                          <button key={a.id} type="button"
                            onMouseDown={() => { setAddAnimalId(a.id); setShowAnimalDropdown(false); }}
                            className={`w-full text-left px-3 py-2 text-sm transition hover:bg-emerald-50 dark:hover:bg-emerald-950 ${a.id === addAnimalId ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium" : "text-gray-800 dark:text-gray-100"}`}>
                            {a.name}
                          </button>
                        ))}
                      {animals.filter(a => a.name.toLowerCase().includes(animalSearch.toLowerCase())).length === 0 && (
                        <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No animals found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <ScheduleForm
                form={addForm}
                onChange={setAddForm}
                setType={t => setAddForm(f => applyType(f, t))}
                toggleDay={d => setAddForm(f => toggleDay(f, d))}
              />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowAdd(false); setAddForm(defaultForm); setAnimalSearch(""); setShowAnimalDropdown(false); }}
                  className="flex-1 rounded-xl border dark:border-gray-600 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleAdd} disabled={saving || !canSave(addForm) || !addAnimalId}
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40">
                  {saving ? "Saving…" : "Add"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.map((item) => {
        const animal = animalMap[item.animal_id];
        if (!animal) return null;
        const status = dueStatus(item);
        const d = diffDays(item);
        const photo = animal.animal_photos?.[0]?.url;
        const expanded = expandedId === item.id;
        const editing = editingId === item.id;
        const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.custom;

        return (
          <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

            <button type="button"
              onClick={() => { if (editing) return; setExpandedId(expanded ? null : item.id); if (expanded) setEditingId(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <Link href={`/dashboard/animals/${animal.id}`} className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                {photo
                  ? <img src={photo} className="h-9 w-9 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
                  : <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-lg">{cfg.icon}</div>}
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${cfg.color}`}>{cfg.label}</span>
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

              <div className="flex items-center gap-2 flex-shrink-0">
                {status !== "done" && (
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); setModal({ step: "confirm", item, date: new Date().toISOString().split("T")[0] }); }}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                    Done
                  </button>
                )}
                <span className={`text-gray-300 dark:text-gray-600 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
              </div>
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }} className="overflow-hidden border-t border-gray-100 dark:border-gray-700">
                  {editing ? (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <button type="button" onClick={() => setEditingId(null)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm transition">←</button>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Edit schedule</p>
                      </div>
                      <ScheduleForm
                        form={editForm}
                        onChange={setEditForm}
                        setType={t => setEditForm(f => applyType(f, t))}
                        toggleDay={d => setEditForm(f => toggleDay(f, d))}
                      />
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setEditingId(null)}
                          className="flex-1 rounded-xl border dark:border-gray-600 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          Cancel
                        </button>
                        <button type="button" onClick={() => handleSaveEdit(item.id)} disabled={saving || !canSave(editForm)}
                          className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40">
                          {saving ? "Saving…" : "Save changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 space-y-3">
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
                      <div className="flex items-center gap-2 pt-1">
                        <button type="button" onClick={() => { setEditForm(itemToForm(item)); setEditingId(item.id); }}
                          className="rounded-lg border dark:border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          Edit
                        </button>
                        <Link href={`/dashboard/animals/${animal.id}`}
                          className="rounded-lg border dark:border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          Open animal →
                        </Link>
                        <button type="button" onClick={() => handleDelete(item.id)}
                          className="rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition ml-auto">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden">

              {modal.step === "confirm" && (
                <div className="p-5 space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Mark &quot;{modal.item.name}&quot; done</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{animalMap[modal.item.animal_id]?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date completed <span className="text-red-400">*</span></p>
                    <input type="date" value={modal.date} onChange={(e) => setModal({ ...modal, date: e.target.value })} className={inputCls} />
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
                    <button type="button" onClick={() => setModal({ step: "log", item: modal.item, date: modal.date })}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                      Done + log →
                    </button>
                  </div>
                </div>
              )}

              {modal.step === "log" && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setModal({ step: "confirm", item: modal.item, date: modal.date })}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition text-sm">←</button>
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
                        <textarea rows={3} placeholder="Reason for visit, findings, medications…" className={inputCls} style={{ resize: "none" }}
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
                        <textarea rows={2} placeholder="Refused, ate eagerly…" className={inputCls} style={{ resize: "none" }}
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
