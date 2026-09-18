-- ============================================================================
-- Migração: modo "aula + respostas" (alternativa gratuita ao chat com mentor IA)
-- Rode este arquivo no SQL Editor do seu projeto Supabase (uma vez só).
-- Só adiciona coisas novas — não apaga nada do que já existe.
-- ============================================================================

-- Escolha do mentorado: 'chat' (mentor IA) ou 'lesson' (aula + formulário)
alter table public.profiles
  add column if not exists onboarding_mode text check (onboarding_mode in ('chat', 'lesson'));

-- Tabela das respostas de reflexão do modo "aula" (a mesma ideia do onboarding_answers original)
create table if not exists public.onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_number int not null check (session_number between 1 and 5),
  question_key text not null,
  answer text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, session_number, question_key)
);

alter table public.onboarding_answers enable row level security;

drop policy if exists "Usuario gerencia as proprias respostas" on public.onboarding_answers;
create policy "Usuario gerencia as proprias respostas"
  on public.onboarding_answers for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Link do vídeo de cada sessão (edite pelo Table Editor quando gravar as aulas)
create table if not exists public.onboarding_session_videos (
  session_number int primary key check (session_number between 1 and 5),
  video_url text
);

alter table public.onboarding_session_videos enable row level security;

drop policy if exists "Qualquer pessoa autenticada pode ler os videos" on public.onboarding_session_videos;
create policy "Qualquer pessoa autenticada pode ler os videos"
  on public.onboarding_session_videos for select
  to authenticated
  using (true);

insert into public.onboarding_session_videos (session_number, video_url)
values (1, null), (2, null), (3, null), (4, null), (5, null)
on conflict (session_number) do nothing;
