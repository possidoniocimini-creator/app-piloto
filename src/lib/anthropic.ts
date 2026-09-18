import Anthropic from "@anthropic-ai/sdk";

// Uso exclusivamente server-side: nunca importe este arquivo de um Client Component.
export function createAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

// Sonnet em vez de Opus: reduz bastante o custo por sessão mantendo boa
// qualidade de conversa — decisão consciente de custo pro piloto.
export const MENTOR_MODEL = "claude-sonnet-5";

// Modelo mais barato pra tarefas de 1 chamada só (extrair agenda, recomendar
// aula no diário) — não precisa de uma conversa inteira, só uma leitura boa.
export const FAST_MODEL = "claude-haiku-4-5";
