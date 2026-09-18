"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MentorSession } from "@/lib/mentor/sessions";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { HabitBuilder, createEmptyHabit, type HabitDraft } from "@/components/HabitBuilder";

function toYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

const DURATION_OPTIONS_MONTHS = [1, 2, 3, 6, 9, 12];

export function LessonSessionForm({
  session,
  totalSessions,
  userId,
  videoUrl,
  initialAnswers,
  initialHabits,
  originalHabitIds,
  initialGoalDurationDays,
}: {
  session: MentorSession;
  totalSessions: number;
  userId: string;
  videoUrl: string | null;
  initialAnswers: Record<string, string>;
  initialHabits: HabitDraft[];
  originalHabitIds: string[];
  initialGoalDurationDays: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [habits, setHabits] = useState<HabitDraft[]>(
    initialHabits.length > 0 ? initialHabits : session.number === 4 ? [createEmptyHabit()] : []
  );
  const [durationMonths, setDurationMonths] = useState<number>(
    Math.max(1, Math.round(initialGoalDurationDays / 30))
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const isHabitStep = session.number === 4;
  const isGoalStep = session.number === 2;
  const isLastStep = session.number === totalSessions;
  const embedUrl = videoUrl ? toYoutubeEmbed(videoUrl) : null;

  async function generateAgenda() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/generate-agenda", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Não foi possível gerar a agenda.");
      }
      const data: { habits: { title: string; description: string; weekdays: number[] }[] } =
        await res.json();

      const generated: HabitDraft[] = data.habits.map((h) => ({
        id: `temp-${Math.random().toString(36).slice(2)}-${Date.now()}`,
        title: h.title,
        description: h.description,
        weekdays: h.weekdays,
        isNew: true,
      }));

      setHabits((prev) => {
        const manuallyFilled = prev.filter((h) => h.title.trim().length > 0);
        return [...manuallyFilled, ...generated];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar a agenda.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const answerRows = session.questions.map((q) => ({
        user_id: userId,
        session_number: session.number,
        question_key: q.key,
        answer: answers[q.key]?.trim() ?? "",
        updated_at: new Date().toISOString(),
      }));

      if (answerRows.length > 0) {
        const { error: answersError } = await supabase
          .from("onboarding_answers")
          .upsert(answerRows, { onConflict: "user_id,session_number,question_key" });
        if (answersError) throw answersError;
      }

      if (isHabitStep) {
        const validHabits = habits.filter((h) => h.title.trim().length > 0);

        const toInsert = validHabits
          .filter((h) => h.isNew)
          .map((h) => ({
            user_id: userId,
            title: h.title.trim(),
            description: h.description.trim() || null,
            weekdays: h.weekdays,
            active: true,
          }));

        const toUpdate = validHabits.filter((h) => !h.isNew);
        const currentIds = new Set(toUpdate.map((h) => h.id));
        const toDelete = originalHabitIds.filter((id) => !currentIds.has(id));

        if (toInsert.length > 0) {
          const { error: insertError } = await supabase.from("habits").insert(toInsert);
          if (insertError) throw insertError;
        }

        for (const h of toUpdate) {
          const { error: updateError } = await supabase
            .from("habits")
            .update({
              title: h.title.trim(),
              description: h.description.trim() || null,
              weekdays: h.weekdays,
            })
            .eq("id", h.id);
          if (updateError) throw updateError;
        }

        if (toDelete.length > 0) {
          const { error: deleteError } = await supabase.from("habits").delete().in("id", toDelete);
          if (deleteError) throw deleteError;
        }
      }

      const summary = session.questions
        .map((q) => answers[q.key]?.trim())
        .filter(Boolean)
        .join(" · ")
        .slice(0, 500);

      const { error: summaryError } = await supabase.from("onboarding_session_summaries").upsert(
        {
          user_id: userId,
          session_number: session.number,
          summary,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,session_number" }
      );
      if (summaryError) throw summaryError;

      const profileUpdate: Record<string, unknown> = {
        onboarding_step: Math.min(session.number + 1, totalSessions + 1),
      };
      if (isGoalStep) {
        profileUpdate.goal_duration_days = durationMonths * 30;
      }
      if (isLastStep) {
        profileUpdate.onboarding_completed = true;
        profileUpdate.cycle_start_date = new Date().toISOString().slice(0, 10);
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", userId);
      if (profileError) throw profileError;

      router.push(isLastStep ? "/dashboard" : `/onboarding/sessao-${session.number + 1}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar. Tente novamente.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OnboardingProgress currentSession={session.number} totalSessions={totalSessions} />

      <div>
        <p className="text-sm font-medium text-brand-light">
          Etapa {session.number} de {totalSessions}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{session.title}</h1>
        <p className="mt-1 text-white/60">{session.subtitle}</p>
      </div>

      <div className="card space-y-4">
        {embedUrl ? (
          <div className="aspect-video overflow-hidden rounded-xl">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-base-border px-4 py-3 text-sm text-white/40">
            Vídeo da aula em breve — por enquanto, leia o conteúdo abaixo.
          </p>
        )}
        <div className="whitespace-pre-line leading-relaxed text-white/80">
          {session.teachingContent}
        </div>
      </div>

      <div className="space-y-5">
        {session.questions.map((q) => (
          <div key={q.key}>
            <label className="label" htmlFor={q.key}>
              {q.label}
            </label>
            {q.helper && <p className="helper-text mb-2 mt-0">{q.helper}</p>}
            <textarea
              id={q.key}
              className="input-field min-h-[100px]"
              value={answers[q.key] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      {isGoalStep && (
        <div className="card space-y-3">
          <label className="label mb-0" htmlFor="goal-duration">
            Em quanto tempo você quer atingir esse objetivo?
          </label>
          <p className="helper-text mt-0">
            É esse prazo que define o ritmo em que seu avatar vai encher lá no checklist.
          </p>
          <select
            id="goal-duration"
            className="input-field"
            value={durationMonths}
            onChange={(e) => setDurationMonths(Number(e.target.value))}
          >
            {DURATION_OPTIONS_MONTHS.map((m) => (
              <option key={m} value={m}>
                {m} {m === 1 ? "mês" : "meses"}
              </option>
            ))}
          </select>
        </div>
      )}

      {isHabitStep && (
        <div className="space-y-4">
          <div className="card flex flex-col items-center gap-3 text-center">
            <p className="text-white/70">
              Já respondeu tudo acima? Deixa a IA montar sua agenda semanal a partir do que você
              escreveu nas sessões anteriores — depois você pode ajustar cada hábito à vontade.
            </p>
            <button
              type="button"
              onClick={generateAgenda}
              disabled={generating}
              className="btn-primary"
            >
              {generating ? "Gerando sua agenda..." : "Gerar minha agenda com IA"}
            </button>
          </div>
          <HabitBuilder habits={habits} onChange={setHabits} />
        </div>
      )}

      {error && <p className="text-sm text-accent-danger">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Salvando..." : isLastStep ? "Concluir e ir para o checklist" : "Próxima etapa"}
        </button>
      </div>
    </form>
  );
}
