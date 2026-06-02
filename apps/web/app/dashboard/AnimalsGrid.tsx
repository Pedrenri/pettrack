"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import AnimalCard from "./AnimalCard";
import Link from "next/link";
import type { Animal } from "@pettrack/core";

export default function AnimalsGrid({ animals }: { animals: Animal[] }) {
  const [query, setQuery] = useState("");
  const [activeSpecies, setActiveSpecies] = useState<string | null>(null);

  // Unique species for filter chips
  const speciesList = useMemo(() => {
    const set = new Set(animals.map((a) => a.species_name));
    return Array.from(set).sort();
  }, [animals]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return animals.filter((a) => {
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.species_name.toLowerCase().includes(q) ||
        (a.breed ?? "").toLowerCase().includes(q);
      const matchesSpecies = !activeSpecies || a.species_name === activeSpecies;
      return matchesQuery && matchesSpecies;
    });
  }, [animals, query, activeSpecies]);

  if (animals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4 opacity-40">🦎</div>
        <p className="text-sm font-medium text-gray-500 mb-1">No animals yet</p>
        <p className="text-xs text-gray-400 mb-6">Add your first reptile to get started</p>
        <Link
          href="/dashboard/animals/new"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
        >
          Add your first animal
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or species…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl bg-white border border-gray-100 shadow-sm pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Species chips — only show if >1 species */}
        {speciesList.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveSpecies(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                !activeSpecies
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              All
            </button>
            {speciesList.map((sp) => (
              <button
                key={sp}
                onClick={() => setActiveSpecies(sp === activeSpecies ? null : sp)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeSpecies === sp
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center text-sm text-gray-400"
        >
          No animals match "{query}"
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((animal, index) => (
              <AnimalCard key={animal.id} animal={animal} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
