"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  species_name: string;
  breed: string;
  species_name_latin: string;
  gender: string;
  birthday: string;
  weight: string;
  chipId: string;
  description: string;
}

// ─── Shared input styles ─────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100";

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5";

// ─── Step config ─────────────────────────────────────────────────────────────

const STEPS = [
  { title: "Identity", subtitle: "Who is this animal?" },
  { title: "Details", subtitle: "A bit more about them" },
  { title: "Photos", subtitle: "Give them a face" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewAnimalPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    species_name: "",
    breed: "",
    species_name_latin: "",
    gender: "",
    birthday: "",
    weight: "",
    chipId: "",
    description: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files).slice(0, 3 - photos.length);
    setPhotos((p) => [...p, ...selected]);
  }

  function formatScientificName(value: string) {
    const parts = value.trim().split(/\s+/).slice(0, 2);
    if (!parts.length) return "";
    const genus = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    return parts.length === 1 ? genus : `${genus} ${parts[1].toLowerCase()}`;
  }

  async function handleSubmit() {
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: animal, error } = await supabase
      .from("animals")
      .insert({
        owner_id: user.id,
        name: form.name,
        species_name: form.species_name,
        breed: form.breed || null,
        species_name_latin: form.species_name_latin || null,
        gender: form.gender || null,
        birthday: form.birthday || null,
        chip_id: form.chipId || null,
        description: form.description || null,
      })
      .select()
      .single();

    if (error || !animal) { setSubmitting(false); return; }

    // Upload photos
    if (photos.length > 0) {
      for (const file of photos) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${animal.id}/${crypto.randomUUID()}.${ext}`;
        await supabase.storage.from("animal-photos").upload(path, file);
        const { data } = supabase.storage.from("animal-photos").getPublicUrl(path);
        await supabase.from("animal_photos").insert({ animal_id: animal.id, url: data.publicUrl });
      }
    }

    // Save initial weight
    if (form.weight) {
      await supabase.from("animal_weight_history").insert({
        animal_id: animal.id,
        weight: parseFloat(form.weight),
        measured_at: new Date().toISOString().split("T")[0],
      });
    }

    router.push("/dashboard");
  }

  // ─── Step validation ──────────────────────────────────────────────────────

  const canNext = [
    form.name.trim().length > 0 && form.species_name.trim().length > 0,
    true, // details optional
    true, // photos optional
  ][step];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold text-gray-900">New Animal</p>
          <p className="mt-1 text-sm text-gray-500">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
              <span className={`text-xs font-medium transition-colors ${i === step ? "text-emerald-600" : i < step ? "text-gray-400" : "text-gray-300"}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Step label */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{STEPS[step].title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{STEPS[step].subtitle}</p>
          </div>

          {/* Animated step content */}
          <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={step}
                initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ x: direction > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.22 } }}
                className="px-8 py-6 space-y-5"
              >
                {step === 0 && <StepIdentity form={form} set={set} formatScientificName={formatScientificName} />}
                {step === 1 && <StepDetails form={form} set={set} />}
                {step === 2 && <StepPhotos photos={photos} setPhotos={setPhotos} handleFiles={handleFiles} form={form} set={set} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="px-8 pb-8 pt-2 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => go(step - 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
              >
                ← Cancel
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => go(step + 1)}
                disabled={!canNext}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save Animal"}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Identity ─────────────────────────────────────────────────────────

function StepIdentity({
  form, set, formatScientificName,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  formatScientificName: (v: string) => string;
}) {
  return (
    <>
      <div>
        <label className={labelCls}>Name *</label>
        <input
          className={inputCls}
          placeholder="e.g. Luna"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Species *</label>
          <input
            className={inputCls}
            placeholder="e.g. Leopard Gecko"
            value={form.species_name}
            onChange={(e) => set("species_name", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Breed / Morph</label>
          <input
            className={inputCls}
            placeholder="Bell Albino"
            value={form.breed}
            onChange={(e) => set("breed", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Scientific name</label>
        <input
          className={`${inputCls} italic`}
          placeholder="e.g. Eublepharis macularius"
          value={form.species_name_latin}
          onChange={(e) => set("species_name_latin", e.target.value)}
          onBlur={(e) => set("species_name_latin", formatScientificName(e.target.value))}
        />
        <p className="mt-1 text-xs text-gray-400">Binomial format — auto-formatted on blur</p>
      </div>

      <div>
        <label className={labelCls}>Gender</label>
        <div className="flex gap-3">
          {(["Male", "Female", "Unknown"] as const).map((g) => {
            const val = g.toLowerCase();
            const active = form.gender === val;
            return (
              <button
                key={g}
                type="button"
                onClick={() => set("gender", val)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition
                  ${active
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                  }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Step 2: Details ──────────────────────────────────────────────────────────

function StepDetails({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Birth date</label>
          <input
            type="date"
            className={inputCls}
            value={form.birthday}
            onChange={(e) => set("birthday", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Initial weight (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            className={inputCls}
            placeholder="45"
            value={form.weight}
            onChange={(e) => set("weight", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Microchip ID</label>
        <input
          className={inputCls}
          placeholder="40028922"
          value={form.chipId}
          onChange={(e) => set("chipId", e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          rows={4}
          className={inputCls}
          placeholder="Temperament, history, special care notes…"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          style={{ resize: "none" }}
        />
      </div>
    </>
  );
}

// ─── Step 3: Photos ───────────────────────────────────────────────────────────

function StepPhotos({
  photos, setPhotos, handleFiles,
}: {
  photos: File[];
  setPhotos: React.Dispatch<React.SetStateAction<File[]>>;
  handleFiles: (f: FileList | null) => void;
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
}) {
  return (
    <>
      {photos.length < 3 && (
        <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center cursor-pointer transition hover:border-emerald-400 hover:bg-emerald-50/30">
          <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
          <span className="text-3xl">📷</span>
          <div>
            <p className="text-sm font-medium text-gray-600">Click or drag to upload</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG or PNG · up to 3 photos</p>
          </div>
        </label>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence>
            {photos.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200"
              >
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80 transition"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {photos.length === 0 && (
        <p className="text-center text-xs text-gray-400 -mt-2">Photos are optional — you can add them later.</p>
      )}
    </>
  );
}
