"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import WeightChart from "@/app/components/WeightChart";

export default function WeightChartSection({ animalId, refreshKey }: { animalId: string; refreshKey?: number }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<{ measured_at: string; weight: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("animal_log")
      .select("logged_at, value")
      .eq("animal_id", animalId)
      .eq("type", "weight")
      .not("value", "is", null)
      .order("logged_at", { ascending: true })
      .then(({ data }) => {
        setEntries((data ?? []).map((e: any) => ({ measured_at: e.logged_at, weight: e.value })));
        setLoading(false);
      });
  }, [animalId, refreshKey]);

  if (loading || entries.length === 0) return null;

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Weight history</p>
      <WeightChart entries={entries} />
    </section>
  );
}
