"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AnimalEditForm from "./AnimalEditForm";
import DeleteAnimalButton from "./DeleteAnimalButton";
import AnimalQRCode from "./AnimalQRCode";
import { useRouter } from "next/navigation";

export default function AnimalView({ id }: { id?: string }) {
  const supabase = createClient();
  const [animal, setAnimal] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data, error } = await supabase
        .from("animals")
        .select("*, animal_photos(*)")
        .eq("id", id)
        .maybeSingle();

      if (!error) setAnimal(data);
      setLoading(false);
    }

    load();
  }, [id]);

  if (!id) return <div>Animal não encontrado</div>;
  if (loading) return <div>Carregando…</div>;
  if (!animal) return <div>Animal não encontrado</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="
    inline-flex items-center gap-2
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
        </button>

        <div className="flex gap-4 items-center">
          {/*           <AnimalQRCode animalId={animal.id} />
           */}
        </div>
      </div>

      {/* Formulário */}
      <AnimalEditForm animal={animal} />
    </div>
  );
}
