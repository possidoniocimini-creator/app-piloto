import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAnthropicClient, MENTOR_MODEL } from "@/lib/anthropic";
import { buildSystemPrompt, MENTOR_SESSIONS } from "@/lib/mentor/sessions";
import { MENTOR_TOOLS } from "@/lib/mentor/tools";

export const maxDuration = 60;

const MAX_TOOL_ITERATIONS = 6;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const sessionNumber = Number(body?.sessionNumber);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!MENTOR_SESSIONS.some((s) => s.number === sessionNumber) || !message) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  const { data: history } = await supabase
    .from("mentor_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .eq("session_number", sessionNumber)
    .order("created_at", { ascending: true });

  await supabase.from("mentor_messages").insert({
    user_id: user.id,
    session_number: sessionNumber,
    role: "user",
    content: message,
  });

  const messages: Anthropic.MessageParam[] = [
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const anthropic = createAnthropicClient();
  const system = buildSystemPrompt(sessionNumber);

  let sessionCompleted = false;
  let sessionSummary = "";
  const assistantTextParts: string[] = [];

  try {
    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const response = await anthropic.messages.create({
        model: MENTOR_MODEL,
        max_tokens: 2000,
        system,
        tools: MENTOR_TOOLS,
        messages,
      });

      messages.push({ role: "assistant", content: response.content });

      for (const block of response.content) {
        if (block.type === "text" && block.text.trim()) {
          assistantTextParts.push(block.text.trim());
        }
      }

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) break;

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      let finishedThisTurn = false;

      for (const block of toolUseBlocks) {
        if (block.name === "log_habit") {
          const input = block.input as {
            title?: string;
            description?: string;
            weekdays?: number[];
          };
          if (
            typeof input.title === "string" &&
            Array.isArray(input.weekdays) &&
            input.weekdays.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)
          ) {
            const { error } = await supabase.from("habits").insert({
              user_id: user.id,
              title: input.title,
              description: input.description ?? null,
              weekdays: input.weekdays,
              active: true,
            });
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: error ? `Erro ao salvar: ${error.message}` : "Hábito registrado com sucesso.",
              is_error: Boolean(error),
            });
          } else {
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: "Entrada inválida: title e weekdays (0-6) são obrigatórios.",
              is_error: true,
            });
          }
        } else if (block.name === "finish_session") {
          const input = block.input as { summary?: string };
          sessionSummary = input.summary ?? "";
          finishedThisTurn = true;
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: "Sessão encerrada.",
          });
        } else {
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: "Ferramenta desconhecida.",
            is_error: true,
          });
        }
      }

      if (finishedThisTurn) {
        sessionCompleted = true;
        break;
      }

      messages.push({ role: "user", content: toolResults });
    }
  } catch (err) {
    console.error("Erro ao chamar o mentor IA:", err);
    return NextResponse.json(
      { error: "O mentor IA está indisponível agora. Tente novamente em instantes." },
      { status: 502 }
    );
  }

  const replyText = assistantTextParts.join("\n\n") || "Certo, seguindo.";

  await supabase.from("mentor_messages").insert({
    user_id: user.id,
    session_number: sessionNumber,
    role: "assistant",
    content: replyText,
  });

  let nextPath: string | null = null;

  if (sessionCompleted) {
    await supabase.from("onboarding_session_summaries").upsert(
      {
        user_id: user.id,
        session_number: sessionNumber,
        summary: sessionSummary,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,session_number" }
    );

    const isLastSession = sessionNumber === MENTOR_SESSIONS.length;
    const profileUpdate: Record<string, unknown> = {
      onboarding_step: Math.min(sessionNumber + 1, MENTOR_SESSIONS.length + 1),
    };
    if (isLastSession) {
      profileUpdate.onboarding_completed = true;
      profileUpdate.cycle_start_date = new Date().toISOString().slice(0, 10);
    }
    await supabase.from("profiles").update(profileUpdate).eq("id", user.id);

    nextPath = isLastSession ? "/dashboard" : `/onboarding/sessao-${sessionNumber + 1}`;
  }

  return NextResponse.json({ reply: replyText, sessionCompleted, nextPath });
}
