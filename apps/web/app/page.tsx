import heroImage from "../public/assets/img/pets-hero.jpg";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LandingContent from "./components/LandingContent";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return <LandingContent heroImage={heroImage} />;
}
