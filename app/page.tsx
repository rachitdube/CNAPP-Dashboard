import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Login from "@/components/auth/login";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <Login />;
}