import Anthropic from "@anthropic-ai/sdk";

// Uso exclusivamente server-side: nunca importe este arquivo de um Client Component.
export function createAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

export const MENTOR_MODEL = "claude-opus-5";
