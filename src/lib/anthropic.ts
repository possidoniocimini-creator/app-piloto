import Anthropic from "@anthropic-ai/sdk";

// Uso exclusivamente server-side: nunca importe este arquivo de um Client Component.
export function createAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

// Sonnet em vez de Opus: reduz bastante o custo por sessão mantendo boa
// qualidade de conversa — decisão consciente de custo pro piloto.
export const MENTOR_MODEL = "claude-sonnet-5";
