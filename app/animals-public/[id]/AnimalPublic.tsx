"use client";

import { useState, useEffect } from "react";
import AnimalQRCode from "@/app/dashboard/animals/[id]/AnimalQRCode";
import WeightChart from "@/app/components/WeightChart";
import { calcAge } from "@/utils/age";

interface WeightEntry {
  id: string;
  measured_at: string;
  weight: number;
}

export default function AnimalPublic({
  animal,
  weightHistory,
}: {
  animal: any;
  weightHistory: WeightEntry[];
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  function formatDate(date?: string) {
    if (!date) return undefined;
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatGender(value?: string) {
    if (value === "male") return "Male";
    if (value === "female") return "Female";
    return "Unknown";
  }

  useEffect(() => {
    document.body.style.overflow = selectedImage ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedImage]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-10 flex justify-center items-center">
        <div className="w-full max-w-3xl space-y-8">

          {/* Photos */}
          {animal.animal_photos?.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {animal.animal_photos.map((p: any) => (
                <button key={p.id} onClick={() => setSelectedImage(p.url)} className="focus:outline-none">
                  <img src={p.url} className="aspect-square rounded-xl object-cover border hover:opacity-90 transition" />
                </button>
              ))}
            </div>
          )}

          {/* Header */}
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{animal.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {animal.species_name}
              {animal.breed && ` • ${animal.breed}`}
            </p>
            {animal.species_name_latin && (
              <p className="italic text-sm text-gray-500 dark:text-gray-400">{animal.species_name_latin}</p>
            )}
          </header>

          {/* Data */}
          <section className="grid sm:grid-cols-2 gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
            <Item label="Gender" value={formatGender(animal.gender)} />
            <Item label="Weight" value={animal.weight && `${animal.weight} g`} />
            <Item
              label="Birth date"
              value={animal.birthday ? `${formatDate(animal.birthday)} · ${calcAge(animal.birthday)}` : undefined}
            />
            <Item label="Microchip" value={animal.chip_id} />
            <Item label="Last fed" value={formatDate(animal.last_fed)} />
            <Item label="Last handled" value={formatDate(animal.last_handled)} />
            <Item label="Last shed" value={formatDate(animal.last_shed)} />
            <Item label="Last weighed" value={formatDate(animal.last_weighed)} />
          </section>

          {/* Weight history chart */}
          {weightHistory.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow space-y-2">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Weight history</h2>
              <WeightChart entries={weightHistory} />
            </section>
          )}

          {/* Description */}
          {animal.description && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{animal.description}</p>
            </section>
          )}

          {/* QR Code */}
          <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <AnimalQRCode animalId={animal.id} />
            <div>
              <p className="font-semibold text-emerald-800">Animal Identification</p>
              <p className="text-sm text-emerald-700">
                This QR Code links to this public page. It can be printed or used for physical identification.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-xl font-bold"
            >
              ✕
            </button>
            <img src={selectedImage} className="w-full max-h-[85vh] object-contain rounded-xl bg-black" />
          </div>
        </div>
      )}
    </>
  );
}

function Item({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{value}</p>
    </div>
  );
}
