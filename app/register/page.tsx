import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import RegisterPage from "./RegisterPage";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await (await supabase).auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <RegisterPage />;
}
