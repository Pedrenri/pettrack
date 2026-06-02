import { createClient } from "@/utils/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import AnimalPublic from "./AnimalPublic";
import { notFound } from "next/navigation";

// Cookie-free client — runs as the anon role, respects public RLS policies
const anonSupabase = createAnonClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

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

  const { data: weightLog } = await anonSupabase
    .from("animal_log")
    .select("id, logged_at, value")
    .eq("animal_id", id)
    .eq("type", "weight")
    .order("logged_at", { ascending: true });

  const weightHistory = (weightLog ?? [])
    .filter((e: any) => e.value != null)
    .map((e: any) => ({ id: e.id, measured_at: e.logged_at, weight: e.value }));

  const { data: logEntries } = await anonSupabase
    .from("animal_log")
    .select("id, logged_at, type, title, value, unit, notes")
    .eq("animal_id", id)
    .order("logged_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  return <AnimalPublic animal={animal} weightHistory={weightHistory} logEntries={logEntries ?? []} />;
}
