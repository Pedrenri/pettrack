import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AnimalsGrid from "./AnimalsGrid";

export default async function AnimalsList() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: animals, error } = await supabase
    .from("animals")
    .select("id, chip_id, name, species_name, breed, birthday, animal_photos ( url )")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
        Could not load your animals. ({error.message})
      </div>
    );
  }

  return <AnimalsGrid animals={animals ?? []} />;
}
