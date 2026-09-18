import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_SESSIONS } from "@/lib/onboarding-content";
import { OnboardingForm } from "@/components/OnboardingForm";
import type { HabitDraft } from "@/components/HabitBuilder";

export function generateStaticParams() {
  return ONBOARDING_SESSIONS.map((s) => ({ step: `sessao-${s.number}` }));
}

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const match = step.match(/^sessao-(\d)$/);
  const sessionNumber = match ? Number(match[1]) : null;
  const session = ONBOARDING_SESSIONS.find((s) => s.number === sessionNumber);

  if (!session) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: answerRows } = await supabase
    .from("onboarding_answers")
    .select("question_key, answer")
    .eq("user_id", user.id)
    .eq("session_number", session.number);

  const initialAnswers: Record<string, string> = {};
  for (const row of answerRows ?? []) {
    initialAnswers[row.question_key] = row.answer;
  }

  let initialHabits: HabitDraft[] = [];
  let originalHabitIds: string[] = [];

  if (session.number === 4) {
    const { data: habitRows } = await supabase
      .from("habits")
      .select("id, title, description, weekdays")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    initialHabits = (habitRows ?? []).map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description ?? "",
      weekdays: h.weekdays,
      isNew: false,
    }));
    originalHabitIds = initialHabits.map((h) => h.id);
  }

  return (
    <OnboardingForm
      session={session}
      totalSessions={ONBOARDING_SESSIONS.length}
      userId={user.id}
      initialAnswers={initialAnswers}
      initialHabits={initialHabits}
      originalHabitIds={originalHabitIds}
    />
  );
}
