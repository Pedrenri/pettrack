"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { calcAge } from "@/utils/age";

interface Animal {
  id: string;
  chip_id: string | null;
  name: string;
  species_name: string;
  breed: string | null;
  birthday: string | null;
  animal_photos: Array<{ url: string }>;
}

export default function AnimalCard({ animal, index }: { animal: Animal; index: number }) {
  const photo = animal.animal_photos?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Link href={`/dashboard/animals/${animal.id}`} className="block group">
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200">

          {/* Photo */}
          <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
            {photo ? (
              <img
                src={photo}
                alt={animal.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl bg-gradient-to-br from-emerald-50 dark:from-emerald-950 to-gray-100 dark:to-gray-700">
                🦎
              </div>
            )}
            {/* Chip badge */}
            {animal.chip_id && (
              <div className="absolute bottom-2 left-2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-xs text-white/90 font-medium">
                # {animal.chip_id}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-4 py-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{animal.name}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {animal.species_name}
                {animal.breed && ` · ${animal.breed}`}
                {animal.birthday && ` · ${calcAge(animal.birthday)}`}
              </p>
            </div>
            <span className="flex-shrink-0 text-emerald-500 text-sm group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
