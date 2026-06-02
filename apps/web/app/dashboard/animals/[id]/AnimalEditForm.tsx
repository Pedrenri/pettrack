"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { calcAge } from "@/utils/age";
import AnimalQRCode from "./AnimalQRCode";
import DeleteAnimalButton from "./DeleteAnimalButton";
import UnifiedLog from "./UnifiedLog";
import WeightChartSection from "./WeightChartSection";
import ScheduleManager from "./ScheduleManager";
import { motion } from "motion/react";
import Link from "next/link";

const inputCls =
  "w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-emerald-300 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900";

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5";

export default function AnimalEditForm({ animal }: { animal: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState(animal.animal_photos || []);
  const [weightKey, setWeightKey] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const initialForm = {
    name: animal.name || "",
    species_name: animal.species_name || "",
    breed: animal.breed || "",
    species_name_latin: animal.species_name_latin || "",
    birthday: animal.birthday || "",
    chip_id: animal.chip_id || "",
    gender: animal.gender || "",
    description: animal.description || "",
  };

  const [form, setForm] = useState(initialForm);

  const isDirty = useRef(false);
  useEffect(() => {
    isDirty.current =
      JSON.stringify(form) !== JSON.stringify(initialForm) || photos.length > 0;
  });

  // Warn on browser close / tab unload
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty.current) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function tryGoBack() {
    if (isDirty.current) {
      setShowConfirm(true);
    } else {
      router.back();
    }
  }

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    set(e.target.name, e.target.value);
  }

  function formatScientificName(value: string) {
    const parts = value.trim().split(/\s+/).slice(0, 2);
    if (!parts.length) return "";
    const genus = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    return parts.length === 1 ? genus : `${genus} ${parts[1].toLowerCase()}`;
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = 3 - existingPhotos.length - photos.length;
    setPhotos((prev) => [...prev, ...Array.from(files).slice(0, remaining)]);
  }

  async function removeExistingPhoto(photoId: string, url: string) {
    const path = url.split("/animal-photos/")[1];
    await supabase.storage.from("animal-photos").remove([path]);
    await supabase.from("animal_photos").delete().eq("id", photoId);
    setExistingPhotos((p: any[]) => p.filter((x) => x.id !== photoId));
  }

  async function uploadNewPhotos(animalId: string, userId: string) {
    for (const file of photos) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${animalId}/${crypto.randomUUID()}.${ext}`;
      await supabase.storage.from("animal-photos").upload(path, file);
      const { data } = supabase.storage.from("animal-photos").getPublicUrl(path);
      await supabase.from("animal_photos").insert({ animal_id: animalId, url: data.publicUrl });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = { ...form, birthday: form.birthday || null };
    await supabase.from("animals").update(payload).eq("id", animal.id);
    if (photos.length > 0) await uploadNewPhotos(animal.id, user.id);
    setPhotos([]);
    isDirty.current = false;
    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Back */}
      <button
        type="button"
        onClick={tryGoBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        ← Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Photos ─────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <p className={labelCls}>Photos</p>
          <div className="grid grid-cols-3 gap-3">
            {existingPhotos.map((p: any) => (
              <div key={String(p.id)} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={p.url} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(p.id, p.url)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition"
                >✕</button>
              </div>
            ))}
            {photos.map((file, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition"
                >✕</button>
              </div>
            ))}
            {existingPhotos.length + photos.length < 3 && (
              <label className="flex items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition text-gray-400 text-xl">
                <input type="file" multiple accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
                📷
              </label>
            )}
          </div>
        </section>

        {/* ── Identity ────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <p className={labelCls}>Identity</p>

          <div>
            <label className={labelCls}>Name <span className="text-red-400">*</span></label>
            <input name="name" required placeholder="e.g. Luna" className={inputCls} value={form.name} onChange={handleChange} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Species <span className="text-red-400">*</span></label>
              <input name="species_name" required placeholder="e.g. Leopard Gecko" className={inputCls} value={form.species_name} onChange={handleChange} />
            </div>
            <div>
              <label className={labelCls}>Breed / Morph</label>
              <input name="breed" placeholder="Bell Albino" className={inputCls} value={form.breed} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Scientific name</label>
            <input
              name="species_name_latin"
              placeholder="e.g. Eublepharis macularius"
              className={`${inputCls} italic`}
              value={form.species_name_latin}
              onChange={handleChange}
              onBlur={(e) => set("species_name_latin", formatScientificName(e.target.value))}
            />
          </div>

          <div>
            <label className={labelCls}>Gender</label>
            <div className="flex gap-3">
              {[{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Unknown", value: "unknown" }].map((o) => (
                <label
                  key={o.value}
                  className={`flex-1 flex items-center justify-center rounded-xl py-2.5 text-sm font-medium cursor-pointer transition border
                    ${form.gender === o.value
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200"}`}
                >
                  <input type="radio" name="gender" value={o.value} className="sr-only" onChange={handleChange} checked={form.gender === o.value} />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ── Details ─────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <p className={labelCls}>Details</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className={labelCls} style={{ marginBottom: 0 }}>Birth date</label>
                {form.birthday && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{calcAge(form.birthday)}</span>}
              </div>
              <input type="date" name="birthday" className={inputCls} value={form.birthday ?? ""} onChange={handleChange} />
            </div>
            <div>
              <label className={labelCls}>Microchip ID</label>
              <input name="chip_id" placeholder="40028922" className={inputCls} value={form.chip_id ?? ""} onChange={handleChange} />
            </div>
          </div>
        </section>


        {/* ── Weight chart ─────────────────────────────────── */}
        <WeightChartSection animalId={animal.id} refreshKey={weightKey} />

        {/* ── Log ─────────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <UnifiedLog animalId={animal.id} onWeightChange={() => setWeightKey(k => k + 1)} />
        </section>

        {/* ── Schedules ───────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <ScheduleManager animalId={animal.id} />
        </section>

        {/* ── Notes ──────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-3">
          <p className={labelCls}>Notes</p>
          <textarea
            name="description"
            value={form.description}
            rows={4}
            placeholder="Temperament, history, special care notes…"
            className={inputCls}
            style={{ resize: "none" }}
            onChange={handleChange}
          />
        </section>

        {/* ── QR ─────────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-5">
          <AnimalQRCode animalId={animal.id} />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Animal Identification</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Scan to open the public profile. Print or attach to enclosure.</p>
            <Link href={`/animals-public/${animal.id}`} className="text-xs text-emerald-600 hover:underline">
              View public page →
            </Link>
          </div>
        </section>

        {/* ── Actions ────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pb-8">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </motion.button>
          <DeleteAnimalButton animalId={animal.id} />
        </div>

      </form>

      {/* Unsaved changes confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl mx-4"
          >
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Unsaved changes</h2>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              You have unsaved changes. Leave without saving?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border dark:border-gray-600 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Keep editing
              </button>
              <button
                onClick={() => { isDirty.current = false; router.back(); }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}