"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AnimalForm({ animal }: { animal: any }) {
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ ...animal });

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    setLoading(true);

    const { error } = await supabase
      .from("animals")
      .update({
        name: form.name,
        species: form.species,
        breed: form.breed,
        species_name_latin: form.species_name_latin,
        birthday: form.birthday,
        gender: form.gender,
        weight: form.weight,
        chip_id: form.chip_id,
        description: form.description,
      })
      .eq("id", animal.id);

    setLoading(false);

    if (!error) {
      setEditing(false);
    } else {
      alert(error.message);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Informações do animal
        </h2>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-emerald-600 font-medium hover:underline"
          >
            Editar
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-full bg-emerald-600 px-5 py-2 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            Salvar alterações
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          ["name", "Nome"],
          ["species", "Espécie"],
          ["breed", "Raça"],
          ["species_name_latin", "Nome científico"],
          ["weight", "Peso"],
          ["chip_id", "Microchip"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="text-sm text-gray-600">{label}</label>
            <input
              name={key}
              disabled={!editing}
              value={form[key] ?? ""}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2
                ${editing ? "bg-white" : "bg-gray-100"}
                text-gray-700`}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="text-sm text-gray-600">Descrição</label>
        <textarea
          name="description"
          disabled={!editing}
          value={form.description ?? ""}
          onChange={handleChange}
          rows={3}
          className={`mt-1 w-full rounded-lg border px-4 py-2
            ${editing ? "bg-white" : "bg-gray-100"}
            text-gray-700`}
        />
      </div>
    </div>
  );
}
