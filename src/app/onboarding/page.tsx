import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_SESSIONS } from "@/lib/onboarding-content";

export default async function OnboardingIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_step, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const step = Math.min(profile?.onboarding_step ?? 1, ONBOARDING_SESSIONS.length);
  redirect(`/onboarding/sessao-${step}`);
}
