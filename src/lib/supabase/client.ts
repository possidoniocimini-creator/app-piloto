import { createBrowserClient } from "@supabase/ssr";

// Sem generic de <Database> de propósito: os tipos oficiais são gerados pelo
// Supabase CLI a partir do seu projeto real (veja README). Até lá, os retornos
// das queries são tipados de forma permissiva.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
