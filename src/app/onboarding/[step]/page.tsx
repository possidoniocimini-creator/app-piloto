import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MENTOR_SESSIONS } from "@/lib/mentor/sessions";
import { MentorChat } from "@/components/MentorChat";
import { LessonSessionForm } from "@/components/LessonSessionForm";
import type { HabitDraft } from "@/components/HabitBuilder";

export function generateStaticParams() {
  return MENTOR_SESSIONS.map((s) => ({ step: `sessao-${s.number}` }));
}

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const match = step.match(/^sessao-(\d)$/);
  const sessionNumber = match ? Number(match[1]) : null;
  const session = MENTOR_SESSIONS.find((s) => s.number === sessionNumber);

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_mode")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_mode) {
    redirect("/onboarding");
  }

  if (profile.onboarding_mode === "chat") {
    const { data: messages } = await supabase
      .from("mentor_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .eq("session_number", session.number)
      .order("created_at", { ascending: true });

    return (
      <MentorChat
        sessionNumber={session.number}
        totalSessions={MENTOR_SESSIONS.length}
        title={session.title}
        subtitle={session.subtitle}
        initialMessages={(messages ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
      />
    );
  }

  const [{ data: answerRows }, { data: videoRow }, habitsData] = await Promise.all([
    supabase
      .from("onboarding_answers")
      .select("question_key, answer")
      .eq("user_id", user.id)
      .eq("session_number", session.number),
    supabase
      .from("onboarding_session_videos")
      .select("video_url")
      .eq("session_number", session.number)
      .maybeSingle(),
    session.number === 4
      ? supabase
          .from("habits")
          .select("id, title, description, weekdays")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: null }),
  ]);

  const initialAnswers: Record<string, string> = {};
  for (const row of answerRows ?? []) {
    initialAnswers[row.question_key] = row.answer;
  }

  let initialHabits: HabitDraft[] = [];
  let originalHabitIds: string[] = [];

  if (session.number === 4 && habitsData.data) {
    initialHabits = habitsData.data.map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description ?? "",
      weekdays: h.weekdays,
      isNew: false,
    }));
    originalHabitIds = initialHabits.map((h) => h.id);
  }

  return (
    <LessonSessionForm
      session={session}
      totalSessions={MENTOR_SESSIONS.length}
      userId={user.id}
      videoUrl={videoRow?.video_url ?? null}
      initialAnswers={initialAnswers}
      initialHabits={initialHabits}
      originalHabitIds={originalHabitIds}
    />
  );
}
