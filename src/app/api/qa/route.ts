import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAnthropicClient, MENTOR_MODEL } from "@/lib/anthropic";
import { MENTOR_PERSONA, MENTOR_SESSIONS } from "@/lib/mentor/sessions";

export const maxDuration = 60;

const MAX_HISTORY_MESSAGES = 20;

const QA_SYSTEM = `${MENTOR_PERSONA}

Aqui você não está conduzindo uma sessão — está disponível a qualquer momento pra tirar dúvidas do mentorado sobre qualquer parte do método. Responda com base no conteúdo das 5 sessões abaixo. Seja direto e prático. Se a dúvida não tiver relação nenhuma com a mentoria, gentilmente traga a pessoa de volta pro foco do método.

${MENTOR_SESSIONS.map((s) => `## ${s.title}\n${s.teachingContent}`).join("\n\n")}`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  const { data: history } = await supabase
    .from("mentor_qa_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(MAX_HISTORY_MESSAGES);

  await supabase.from("mentor_qa_messages").insert({ user_id: user.id, role: "user", content: message });

  const messages: Anthropic.MessageParam[] = [
    ...(history ?? [])
      .reverse()
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: message },
  ];

  try {
    const anthropic = createAnthropicClient();
    const response = await anthropic.messages.create({
      model: MENTOR_MODEL,
      max_tokens: 1500,
      system: [{ type: "text", text: QA_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages,
    });

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n\n")
      .trim() || "Certo.";

    await supabase.from("mentor_qa_messages").insert({ user_id: user.id, role: "assistant", content: reply });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Erro no assistente de dúvidas:", err);
    return NextResponse.json(
      { error: "O mentor IA está indisponível agora. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
