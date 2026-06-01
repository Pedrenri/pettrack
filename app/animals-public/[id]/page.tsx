import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import AnimalPublic from "./AnimalPublic";
import { notFound } from "next/navigation";

export default async function AnimalPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: animal } = await supabase
    .from("animals")
    .select("*, animal_photos(id, url)")
    .eq("id", id)
    .single();

  if (!animal) notFound();

  const { data: weightHistory } = await supabase
    .from("animal_weight_history")
    .select("id, measured_at, weight")
    .eq("animal_id", id)
    .order("measured_at", { ascending: true });

  return <AnimalPublic animal={animal} weightHistory={weightHistory ?? []} />;
}
