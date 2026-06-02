import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import SchedulesDashboard from "./SchedulesDashboard";

export default async function SchedulesPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: animals } = await supabase
    .from("animals")
    .select("id, name, animal_photos(url)");

  const { data: schedules } = await supabase
    .from("animal_schedules")
    .select("id, animal_id, name, type, interval_days, weekdays, due_date, due_time, last_done, notes")
    .order("created_at", { ascending: true });

  return <SchedulesDashboard animals={animals ?? []} schedules={schedules ?? []} />;
}
