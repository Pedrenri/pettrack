"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AnimalEditForm from "./AnimalEditForm";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

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

  if (!id) return <div>Animal not found</div>;
  if (loading) return <div>Loading…</div>;
  if (!animal) return <div>Animal not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        
      </div>

      {/* Form */}
      <AnimalEditForm animal={animal} />
    </div>
  );
}
