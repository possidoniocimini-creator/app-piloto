-- ============================================================================
-- Schema do piloto da plataforma de mentoria
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase (uma vez só)
-- ============================================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- PROFILES: dados públicos/leves do usuário (visíveis pra comunidade/ranking)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'Mentorado',
  onboarding_completed boolean not null default false,
  onboarding_step int not null default 1,
  onboarding_mode text check (onboarding_mode in ('chat', 'lesson')),
  cycle_start_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Qualquer pessoa autenticada pode ver perfis (ranking/comunidade)"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuário só edita o próprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Usuário cria o próprio perfil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Cria o profile automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Mentorado'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- MENTOR_MESSAGES: histórico de conversa de cada sessão do mentor IA
-- Dados sensíveis/pessoais -> só o dono acessa
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

-- ----------------------------------------------------------------------------
-- ONBOARDING_ANSWERS: respostas de reflexão do modo "aula" (sem IA em tempo real)
-- Dados sensíveis/pessoais -> só o dono acessa
-- ----------------------------------------------------------------------------
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

create policy "Usuário gerencia as próprias respostas"
  on public.onboarding_answers for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- ONBOARDING_SESSION_VIDEOS: link do vídeo de cada sessão (edite pelo Table Editor)
-- ----------------------------------------------------------------------------
create table if not exists public.onboarding_session_videos (
  session_number int primary key check (session_number between 1 and 5),
  video_url text
);

alter table public.onboarding_session_videos enable row level security;

create policy "Qualquer pessoa autenticada pode ler os vídeos"
  on public.onboarding_session_videos for select
  to authenticated
  using (true);

insert into public.onboarding_session_videos (session_number, video_url)
values (1, null), (2, null), (3, null), (4, null), (5, null)
on conflict (session_number) do nothing;

-- ----------------------------------------------------------------------------
-- HABITS: hábitos estruturados definidos na sessão 4 (viram o checklist diário)
-- ----------------------------------------------------------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  weekdays smallint[] not null default '{0,1,2,3,4,5,6}', -- 0=domingo ... 6=sábado
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Usuário gerencia os próprios hábitos"
  on public.habits for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- CHECKLIST_ENTRIES: check diário de cada hábito
-- ----------------------------------------------------------------------------
create table if not exists public.checklist_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  entry_date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (habit_id, entry_date)
);

alter table public.checklist_entries enable row level security;

create policy "Usuário gerencia o próprio checklist"
  on public.checklist_entries for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- LESSONS: aulas do módulo de mentalidade (conteúdo público pra quem tem login)
-- ----------------------------------------------------------------------------
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  summary text not null,
  content text not null,
  order_index int not null default 0
);

alter table public.lessons enable row level security;

create policy "Qualquer pessoa autenticada pode ler as aulas"
  on public.lessons for select
  to authenticated
  using (true);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Usuário gerencia o próprio progresso nas aulas"
  on public.lesson_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- LEADERBOARD: função que agrega o ranking sem expor dados sensíveis de ninguém
-- ----------------------------------------------------------------------------
create or replace function public.get_leaderboard()
returns table (
  user_id uuid,
  full_name text,
  completed_last_30_days bigint,
  current_streak_days int
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.full_name,
    coalesce(count(ce.*) filter (
      where ce.completed and ce.entry_date >= (current_date - interval '30 days')
    ), 0) as completed_last_30_days,
    0 as current_streak_days
  from public.profiles p
  left join public.checklist_entries ce on ce.user_id = p.id
  group by p.id, p.full_name
  order by completed_last_30_days desc;
$$;

grant execute on function public.get_leaderboard() to authenticated;

-- ----------------------------------------------------------------------------
-- Seed inicial das aulas (edite o conteúdo pelo Table Editor do Supabase)
-- ----------------------------------------------------------------------------
insert into public.lessons (slug, title, category, summary, content, order_index) values
  (
    'dopamina',
    'Dopamina: como sua motivação realmente funciona',
    'Mentalidade',
    'Entenda por que tarefas fáceis (celular, redes sociais) sequestram sua motivação e como recuperar o controle.',
    E'A dopamina não é o prazer em si — é a antecipação da recompensa. Toda vez que você rola o feed, abre uma notificação ou procrastina com algo fácil, você está gastando dopamina barata, disponível a qualquer momento, o que reduz sua motivação para fazer as coisas difíceis que realmente te levam ao seu objetivo.\n\nO que fazer:\n1. Identifique suas fontes de dopamina fácil (redes sociais, doces, jogos).\n2. Reduza o acesso fácil a elas (remova apps, deixe fora do quarto, etc).\n3. Troque por dopamina "cara": a que vem de completar hábitos difíceis, treinar, estudar. No começo dói mais, mas seu cérebro recalibra e passa a sentir prazer real nas tarefas que constroem seu eu ideal.\n\nEsse é o motivo de existir o checklist diário: cada check é uma dose de dopamina "cara" indo na direção certa.',
    1
  ),
  (
    'disciplina',
    'Disciplina > Motivação',
    'Mentalidade',
    'Motivação é uma emoção passageira. Disciplina é um sistema. Aprenda a construir o seu.',
    E'Motivação vai e vem com o seu estado emocional do dia. Quem depende só dela falha. Disciplina é fazer o que precisa ser feito mesmo sem vontade, porque virou identidade, não escolha.\n\nComo construir disciplina:\n1. Comece pequeno — hábitos mínimos que você não tem desculpa pra não fazer.\n2. Nunca falhe duas vezes seguidas (é literalmente a regra dos seus 21 dias: errar 2 dias reinicia o ciclo).\n3. Pergunte sempre: "o que o meu eu ideal faria agora?" e aja de acordo, mesmo sem vontade.\n\nDisciplina é o músculo que conecta quem você é hoje com quem você decidiu se tornar.',
    2
  ),
  (
    'persistencia',
    'Persistência: o jogo de longo prazo',
    'Mentalidade',
    'Por que desistir é sempre mais fácil e sempre a decisão errada.',
    E'Todo resultado que vale a pena tem um "vale da desistência": o período em que o esforço já é grande, mas o resultado ainda não apareceu. É exatamente aí que a maioria desiste — e é exatamente aí que quem persiste sai na frente.\n\nO segredo não é nunca ter vontade de desistir, é ter um sistema (hábitos, checklist, comunidade, ranking) que te carrega nos dias em que a vontade falha.\n\nLembre-se: você não precisa terminar hoje, precisa continuar hoje.',
    3
  ),
  (
    'fazer-o-dificil',
    'Fazer o que é difícil primeiro',
    'Mentalidade',
    'A técnica mais simples e mais poderosa para reprogramar sua mente todos os dias.',
    E'Toda vez que você escolhe fazer a coisa difícil (e não a fácil), você manda um sinal pro seu cérebro: "eu sou alguém que faz o que precisa ser feito". Repetido todo dia, isso vira identidade.\n\nRegra prática: se você tem duas tarefas no seu checklist hoje, uma fácil e uma difícil, faça a difícil primeiro. Isso evita que você use a fácil como forma de procrastinar a difícil, e ainda libera sua energia mental pro resto do dia.',
    4
  )
on conflict (slug) do nothing;
