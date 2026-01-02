import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { motion } from "motion/react";

interface Animal {
  id: string;
  chip_id: string | null;
  name: string;
  species_name: string;
  breed: string | null;
  animal_photos: Array<{ url: string }>;
}

export default async function AnimalsList() {
  const cookieStore = await cookies(); // NÃO usa await
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: animals, error } = await supabase
    .from("animals")
    .select(
      `
      id,
      chip_id,
      name,
      species_name,
      breed,
      animal_photos ( url )
    `
    )
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-gray-600">
        Não foi possível carregar seus animais. ({error.message})
      </div>
    );
  }

  if (!animals || animals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
        <p className="text-gray-600 mb-6">
          Você ainda não cadastrou nenhum animal 🐾
        </p>
        <Link
          href="/dashboard/animals/new"
          className="inline-block rounded-full bg-emerald-600 px-8 py-3 text-white font-semibold transition hover:bg-emerald-700 hover:shadow-md"
        >
          Adicionar primeiro animal
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {animals.map((animal: Animal) => {
        const photo = animal.animal_photos?.[0]?.url;

        return (
          <Link
            key={animal.id}
            href={`/dashboard/animals/${animal.id}`}
            className="flex items-center gap-5 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:border-emerald-300"
          >
            <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden border">
              {photo ? (
                <img
                  src={photo}
                  alt={animal.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400 text-2xl">
                  🐾
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {animal.name}
              </h3>
              <p className="text-sm text-gray-600">
                {animal.species_name}
                {animal.breed && ` • ${animal.breed}`}
                {animal.chip_id && ` • ${animal.chip_id}`}
              </p>
            </div>

            <div className="hidden md:block text-sm font-medium text-emerald-600">Ver →</div>
          </Link>
        );
      })}
    </div>
  );
}
