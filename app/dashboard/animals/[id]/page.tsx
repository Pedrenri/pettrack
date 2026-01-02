import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AnimalView from "./AnimalView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AnimalPage({ params }: Props) {
  const { id } = await params;

  return <AnimalView id={id} />;
}
