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

  console.log("Fetching public animal with ID:", id);

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: animal } = await supabase
    .from("animals")
    .select(
      `
      *,
      animal_photos (
        id,
        url
      )
    `
    )
    .eq("id", id)
    .single();

  if (!animal) notFound();

  return <AnimalPublic animal={animal} />;
}