"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import AnimalQRCode from "./AnimalQRCode";
import DeleteAnimalButton from "./DeleteAnimalButton";
import { motion } from "motion/react";
import Link from "next/link";
export default function AnimalEditForm({ animal }: { animal: any }) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState(
    animal.animal_photos || []
  );

  function formatScientificName(value: string) {
    const parts = value.trim().split(/\s+/).slice(0, 2);

    if (parts.length === 0) return "";

    const genus =
      parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

    if (parts.length === 1) return genus;

    const species = parts[1].toLowerCase();

    return `${genus} ${species}`;
  }

  const [form, setForm] = useState({
    name: animal.name || "",
    species_name: animal.species_name || "",
    breed: animal.breed || "",
    species_name_latin: animal.species_name_latin || "",
    birthday: animal.birthday || null,
    chip_id: animal.chip_id || "",
    gender: animal.gender || "",
    weight: animal.weight || "",
    description: animal.description || "",
    last_fed: animal.last_fed || null,
    last_handled: animal.last_handled || null,
    last_shed: animal.last_shed || null,
    last_weighed: animal.last_weighed || null,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* =========================
     FOTOS
  ========================== */

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = 3 - existingPhotos.length - photos.length;
    const selected = Array.from(files).slice(0, remaining);
    setPhotos((prev) => [...prev, ...selected]);
  }

  async function removeExistingPhoto(photoId: string, url: string) {
    const path = url.split("/animal-photos/")[1];

    await supabase.storage.from("animal-photos").remove([path]);
    await supabase.from("animal_photos").delete().eq("id", photoId);

    setExistingPhotos((p: any[]) => p.filter((x) => x.id !== photoId));
  }

  function removeNewPhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadNewPhotos(animalId: string, userId: string) {
    for (const file of photos) {
      const ext = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const path = `${userId}/${animalId}/${fileName}`;

      await supabase.storage.from("animal-photos").upload(path, file);

      const { data } = supabase.storage
        .from("animal-photos")
        .getPublicUrl(path);

      await supabase.from("animal_photos").insert({
        animal_id: animalId,
        url: data.publicUrl,
      });
    }
  }

  /* =========================
     SUBMIT
  ========================== */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("animals").update(form).eq("id", animal.id);

    if (photos.length > 0) {
      await uploadNewPhotos(animal.id, user.id);
    }

    setPhotos([]);
    setSaving(false);
    router.push("/dashboard");
  }

  /* =========================
     UI
  ========================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow p-6 space-y-4 max-w-3xl mx-auto flex flex-col"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => router.back()}
        className="
    inline-flex items-center gap-2
    w-24
    rounded-full border border-gray-400
    px-4 py-2
    text-sm font-medium text-gray-600
    bg-white
    hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700
    transition
  "
      >
        <span className="text-base leading-none">←</span>
        <span>Voltar</span>
      </motion.button>
      {/* =========================
          FOTOS (TOPO)
      ========================== */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Fotos do animal
        </p>

        <div className="grid grid-cols-3 gap-3">
          {existingPhotos.map((p: any) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={p.id}
              className="relative rounded-xl overflow-hidden border aspect-square"
            >
              <img src={p.url} className="w-full h-full object-cover" />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => removeExistingPhoto(p.id, p.url)}
                className="absolute top-1 right-1 bg-red-600 border-2 border-white text-white rounded-full h-7 w-7 flex items-center justify-center text-sm"
              >
                ✕
              </motion.button>
            </motion.div>
          ))}

          {photos.map((file, index) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={index}
              className="relative rounded-xl overflow-hidden border aspect-square"
            >
              <img
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover"
              />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => removeNewPhoto(index)}
                className="absolute top-1 right-1 bg-red-600 border-2 border-white text-white rounded-full h-7 w-7 flex items-center justify-center text-sm"
              >
                ✕
              </motion.button>
            </motion.div>
          ))}

          {existingPhotos.length + photos.length < 3 && (
            <label className="flex items-center justify-center rounded-xl border-2 border-dashed text-gray-400 cursor-pointer hover:border-emerald-500 transition aspect-square">
              <input
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              📷
            </label>
          )}
        </div>
      </div>

      {/* =========================
          QR CODE
      ========================== */}
      {animal && (
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-6 shadow-sm">
          <AnimalQRCode animalId={animal.id} />
          <div>
            <p className="text-base font-semibold text-emerald-800">
              Identificação do animal
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              Escaneie o QR Code para acessar o perfil público
            </p>
            <Link href={`/animals-public/${animal.id}`} className="mt-2 text-lg font-bold text-emerald-900 underline">
              Ver página pública →
            </Link>
          </div>
        </div>
      )}

      {/* =========================
          DADOS PRINCIPAIS
      ========================== */}
      {/* Nome */}
      <div>
        <label className="text-sm font-medium text-gray-700">Nome *</label>
        <input
          name="name"
          required
          placeholder="Ex: Maya"
          className="mt-1 w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
          onChange={handleChange}
          value={form.name}
        />
      </div>

      {/* Espécie / Raça */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Espécie *</label>
          <input
            name="species_name"
            required
            placeholder="Ex: Gecko-leopardo"
            className="mt-1 w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={handleChange}
            value={form.species_name}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Raça (opcional)
          </label>
          <input
            name="breed"
            placeholder="Bell Albino"
            className="mt-1 w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={handleChange}
            value={form.breed}
          />
        </div>
      </div>

      {/* Nome científico */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Nome científico (opcional)
        </label>

        <input
          name="species_name_latin"
          placeholder="Ex: Eublepharis macularius"
          value={form.species_name_latin}
          onChange={(e) =>
            setForm({ ...form, species_name_latin: e.target.value })
          }
          onBlur={() =>
            setForm({
              ...form,
              species_name_latin: formatScientificName(form.species_name_latin),
            })
          }
          className="mt-1 w-full rounded-lg border px-4 py-3
             placeholder-gray-400 text-gray-600 italic
             focus:ring-2 focus:ring-emerald-500 outline-none"
        />

        <p className="mt-1 text-xs text-gray-400">
          Formato binomial (Gênero espécie)
        </p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Sexo *</p>

        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { label: "Macho", value: "male" },
            { label: "Fêmea", value: "female" },
            { label: "Indefinido", value: "unknown" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2 text-gray-600 hover:border-emerald-400 transition"
            >
              <input
                type="radio"
                name="gender"
                value={option.value}
                required
                className="accent-emerald-600"
                onChange={handleChange}
                checked={form.gender === option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Data de nascimento (opcional)
          </label>
          <input
            type="date"
            name="birthday"
            className="mt-1 w-full rounded-lg border px-4 py-3 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={handleChange}
            value={form.birthday}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Peso (g) (opcional)
          </label>
          <input
            name="weight"
            placeholder="Ex: 45g"
            className="mt-1 w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={handleChange}
            value={form.weight}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Microchip (opcional)
          </label>
          <input
            name="chipId"
            placeholder="40028922"
            className="mt-1 w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={handleChange}
            value={form.chip_id}
          />
        </div>
      </div>

      {/* =========================
          HISTÓRICO (COLAPSÁVEL)
      ========================== */}
      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer text-sm text-gray-600 font-medium">
          Controle e histórico
        </summary>

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {[
            ["last_fed", "Última alimentação"],
            ["last_handled", "Último manejo"],
            ["last_shed", "Última troca de pele"],
            ["last_weighed", "Última pesagem"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="text-xs text-gray-500">{label}</label>
              <input
                type="date"
                name={name}
                value={(form as any)[name] || ""}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-gray-500"
              />
            </div>
          ))}
        </div>
      </details>

      <div>
        <label className="text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          name="description"
          value={form.description}
          rows={3}
          placeholder="Observações gerais, temperamento, histórico..."
          className="mt-1 w-full h-50 rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-4 items-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={saving}
          className="disabled:bg-emerald-300 disabled:text-gray-100 w-90 md:w-120 rounded-full bg-emerald-600 py-3 text-white font-semibold"
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </motion.button>
        <DeleteAnimalButton animalId={animal.id} />
      </div>
    </form>
  );
}
