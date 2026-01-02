"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function NewAnimalPage() {
  const supabase = createClient();
  const router = useRouter();

  const [photos, setPhotos] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [form, setForm] = useState({
    name: "",
    species_name: "",
    breed: "",
    species_name_latin: "",
    birthday: null,
    chipId: "",
    gender: "",
    weight: "",
    description: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files).slice(0, 3 - photos.length);
    setPhotos((prev) => [...prev, ...selected]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  async function uploadPhotos(animalId: string, userId: string) {
    const uploadedUrls: string[] = [];

    for (const file of photos) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/${animalId}/${fileName}`;

      const { error } = await supabase.storage
        .from("animal-photos")
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("animal-photos")
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDisabled(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1. Insere o animal
    const { data: animal, error } = await supabase
      .from("animals")
      .insert({
        owner_id: user.id,
        name: form.name,
        species_name: form.species_name,
        breed: form.breed || null,
        species_name_latin: form.species_name_latin || null,
        gender: form.gender,
        birthday: form.birthday || null,
        weight: form.weight || null,
        chip_id: form.chipId || null,
        description: form.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    // 2. Upload das fotos
    if (photos.length > 0) {
      const urls = await uploadPhotos(animal.id, user.id);

      const photosInsert = urls.map((url) => ({
        animal_id: animal.id,
        url,
      }));

      await supabase.from("animal_photos").insert(photosInsert);
    }

    // 3. Redireciona
    router.push("/dashboard");
  }

  function formatScientificName(value: string) {
    const parts = value.trim().split(/\s+/).slice(0, 2);

    if (parts.length === 0) return "";

    const genus =
      parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

    if (parts.length === 1) return genus;

    const species = parts[1].toLowerCase();

    return `${genus} ${species}`;
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => router.back()}
          className="
    inline-flex items-center gap-2 w-24
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

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-700">
            🐾 Novo animal
          </h1>
          <p className="text-gray-600 mt-1">Cadastre um novo pet no PetTrack</p>
        </div>

        {/* Nome */}
        <div>
          <label className="text-sm font-medium text-gray-700">Nome *</label>
          <input
            name="name"
            required
            placeholder="Ex: Maya"
            className="mt-1 w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={handleChange}
          />
        </div>

        {/* Espécie / Raça */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Espécie *
            </label>
            <input
              name="species_name"
              required
              placeholder="Ex: Gecko-leopardo"
              className="mt-1 w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={handleChange}
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
                species_name_latin: formatScientificName(
                  form.species_name_latin
                ),
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

        {/* Sexo */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Sexo *</p>

          <div className="flex flex-col md:flex-row gap-4">
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
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Datas / Peso */}
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
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Observações gerais, temperamento, histórico..."
            className="mt-1 w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            onChange={handleChange}
          />
        </div>

        {/* Upload de fotos */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Fotos do animal (até 3)
          </p>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition
              ${
                dragging
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-300 hover:border-emerald-400"
              }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />

            <span className="text-emerald-600 text-2xl">📷</span>
            <p className="text-gray-600 text-sm">
              Clique ou arraste imagens aqui
            </p>
            <p className="text-xs text-gray-400">JPG ou PNG • Máx. 3 fotos</p>
          </label>

          {photos.length > 0 && (
            <div className="mt-4 flex gap-3">
              {photos.map((file, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    className="h-24 w-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotos((p) => p.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={disabled}
          type="submit"
          className="w-full rounded-full bg-emerald-600 py-3 text-white font-semibold transition hover:bg-emerald-700 hover:shadow-md"
        >
          Salvar animal
        </motion.button>
      </form>
    </div>
  );
}
