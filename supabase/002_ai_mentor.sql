-- ============================================================================
-- Migração: mentor IA conversacional (substitui o onboarding em formulário)
-- Rode este arquivo no SQL Editor do seu projeto Supabase (uma vez só).
-- É seguro rodar mesmo com dados existentes: só adiciona tabelas novas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- MENTOR_MESSAGES: histórico da conversa de cada sessão do mentor IA
-- ----------------------------------------------------------------------------
create table if not exists public.mentor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_number int not null check (session_number between 1 and 5),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.mentor_messages enable row level security;

create policy "Usuário gerencia as próprias mensagens do mentor"
  on public.mentor_messages for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists mentor_messages_user_session_idx
  on public.mentor_messages (user_id, session_number, created_at);

-- ----------------------------------------------------------------------------
-- ONBOARDING_SESSION_SUMMARIES: status e resumo de cada uma das 5 sessões
-- ----------------------------------------------------------------------------
create table if not exists public.onboarding_session_summaries (
  user_id uuid not null references auth.users (id) on delete cascade,
  session_number int not null check (session_number between 1 and 5),
  summary text,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, session_number)
);

alter table public.onboarding_session_summaries enable row level security;

create policy "Usuário gerencia o próprio progresso nas sessões"
  on public.onboarding_session_summaries for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
