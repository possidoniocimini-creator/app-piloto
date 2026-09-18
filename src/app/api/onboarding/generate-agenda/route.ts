import { NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient } from "@/lib/supabase/server";
import { createAnthropicClient, FAST_MODEL } from "@/lib/anthropic";
import { MENTOR_SESSIONS } from "@/lib/mentor/sessions";

export const maxDuration = 60;

const AgendaSchema = z.object({
  habits: z
    .array(
      z.object({
        title: z.string().describe("Nome curto e específico do hábito/tarefa."),
        description: z
          .string()
          .describe("Como executar: horário sugerido, duração, técnica, quantidade."),
        weekdays: z
          .array(z.number().int().min(0).max(6))
          .describe("0=domingo ... 6=sábado"),
      })
    )
    .min(1)
    .describe("A agenda semanal completa, cobrindo o máximo possível dos 7 dias."),
});

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  const { data: answerRows } = await supabase
    .from("onboarding_answers")
    .select("session_number, question_key, answer")
    .eq("user_id", user.id)
    .lte("session_number", 4);

  const answersByKey = new Map((answerRows ?? []).map((r) => [`${r.session_number}:${r.question_key}`, r.answer]));

  const transcript = MENTOR_SESSIONS.filter((s) => s.number <= 4)
    .map((session) => {
      const qa = session.questions
        .map((q) => {
          const answer = answersByKey.get(`${session.number}:${q.key}`)?.trim();
          return answer ? `P: ${q.label}\nR: ${answer}` : null;
        })
        .filter(Boolean)
        .join("\n\n");
      return `### ${session.title}\n${qa || "(sem respostas)"}`;
    })
    .join("\n\n");

  const system = `Você é o mentor que ensina o método descrito abaixo. Com base nas respostas que o mentorado já deu nas sessões 1 a 4, monte a agenda semanal completa dele.

${MENTOR_SESSIONS[3].script}

Regras:
- Cubra o máximo possível dos 7 dias da semana, com tarefas específicas (nunca genéricas).
- Cada hábito precisa ter um "como executar" com horário sugerido, duração e técnica.
- Baseie os hábitos nas habilidades e no objetivo que o mentorado descreveu nas sessões anteriores, além do que ele disse na sessão 4.
- Se as respostas mencionarem obstáculos, incorpore a solução prática na descrição do hábito correspondente.`;

  try {
    const anthropic = createAnthropicClient();
    const response = await anthropic.messages.parse({
      model: FAST_MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: transcript || "O mentorado ainda não respondeu nada." }],
      output_config: { format: zodOutputFormat(AgendaSchema) },
    });

    if (!response.parsed_output) {
      return NextResponse.json({ error: "Não consegui gerar a agenda agora." }, { status: 502 });
    }

    return NextResponse.json(response.parsed_output);
  } catch (err) {
    console.error("Erro ao gerar agenda:", err);
    return NextResponse.json(
      { error: "O mentor IA está indisponível agora. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
