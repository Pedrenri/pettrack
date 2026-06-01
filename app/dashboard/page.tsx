import { Suspense } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AnimalsList from "./AnimalsList";
import AnimalsSkeleton from "./AnimalsSkeleton";
import DashboardShell from "./DashboardShell";

async function getCount() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { count } = await supabase
    .from("animals")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export default async function DashboardPage() {
  const count = await getCount();

  return (
    <DashboardShell count={count}>
      <Suspense fallback={<AnimalsSkeleton />}>
        <AnimalsList />
      </Suspense>
    </DashboardShell>
  );
}
