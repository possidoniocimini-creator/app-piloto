import { NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient } from "@/lib/supabase/server";
import { createAnthropicClient, FAST_MODEL } from "@/lib/anthropic";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const wentWell = typeof body?.wentWell === "string" ? body.wentWell.trim() : "";
  const wentWrong = typeof body?.wentWrong === "string" ? body.wentWrong.trim() : "";
  const difficulty = typeof body?.difficulty === "string" ? body.difficulty.trim() : "";

  if (!wentWell && !wentWrong && !difficulty) {
    return NextResponse.json({ error: "Escreva pelo menos um dos campos." }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: lessons } = await supabase.from("lessons").select("slug, title").order("order_index");
  const availableLessons = lessons ?? [];

  let recommendedSlug: string | null = null;
  let recommendedNote: string | null = null;

  if (availableLessons.length > 0 && process.env.ANTHROPIC_API_KEY) {
    try {
      const RecommendationSchema = z.object({
        slug: z.enum(availableLessons.map((l) => l.slug) as [string, ...string[]]),
        note: z.string().describe("Uma frase curta explicando por que essa aula ajuda com o que a pessoa escreveu."),
      });

      const lessonList = availableLessons.map((l) => `- ${l.slug}: ${l.title}`).join("\n");
      const anthropic = createAnthropicClient();
      const response = await anthropic.messages.parse({
        model: FAST_MODEL,
        max_tokens: 500,
        system: `Você é o mentor. Com base no diário do mentorado de hoje, escolha UMA aula da lista abaixo que mais ajuda com o problema/dificuldade dele agora.\n\nAulas disponíveis:\n${lessonList}`,
        messages: [
          {
            role: "user",
            content: `O que deu certo: ${wentWell || "(não informado)"}\nO que deu errado: ${wentWrong || "(não informado)"}\nO que foi difícil: ${difficulty || "(não informado)"}`,
          },
        ],
        output_config: { format: zodOutputFormat(RecommendationSchema) },
      });

      if (response.parsed_output) {
        recommendedSlug = response.parsed_output.slug;
        recommendedNote = response.parsed_output.note;
      }
    } catch (err) {
      console.error("Erro ao recomendar aula:", err);
    }
  }

  const { error: upsertError } = await supabase.from("journal_entries").upsert(
    {
      user_id: user.id,
      entry_date: today,
      went_well: wentWell,
      went_wrong: wentWrong,
      difficulty,
      recommended_lesson_slug: recommendedSlug,
      recommended_note: recommendedNote,
    },
    { onConflict: "user_id,entry_date" }
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const recommendedLesson = availableLessons.find((l) => l.slug === recommendedSlug) ?? null;

  return NextResponse.json({
    recommendedSlug,
    recommendedTitle: recommendedLesson?.title ?? null,
    recommendedNote,
  });
}
