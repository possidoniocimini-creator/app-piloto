-- ============================================================================
-- Migração 004: pacote de expansão do piloto
-- Rode este arquivo no SQL Editor do seu projeto Supabase (uma vez só).
-- Só adiciona coisas novas — não apaga nada do que já existe.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES: novos campos
-- ----------------------------------------------------------------------------
alter table public.profiles add column if not exists goal_duration_days int not null default 180;
alter table public.profiles add column if not exists vision_image_url text;
alter table public.profiles add column if not exists is_demo boolean not null default false;
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- ----------------------------------------------------------------------------
-- JOURNAL_ENTRIES: diário diário (o que deu certo/errado/difícil) + aula recomendada
-- ----------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null default current_date,
  went_well text not null default '',
  went_wrong text not null default '',
  difficulty text not null default '',
  recommended_lesson_slug text,
  recommended_note text,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table public.journal_entries enable row level security;

drop policy if exists "Usuario gerencia o proprio diario" on public.journal_entries;
create policy "Usuario gerencia o proprio diario"
  on public.journal_entries for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- USER_ACHIEVEMENTS: conquistas (ex: hábito formado em 21 dias)
-- ----------------------------------------------------------------------------
create table if not exists public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_key text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_key)
);

alter table public.user_achievements enable row level security;

drop policy if exists "Usuario gerencia as proprias conquistas" on public.user_achievements;
create policy "Usuario gerencia as proprias conquistas"
  on public.user_achievements for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- MENTOR_QA_MESSAGES: assistente 24h pra dúvidas (fora das sessões de onboarding)
-- ----------------------------------------------------------------------------
create table if not exists public.mentor_qa_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.mentor_qa_messages enable row level security;

drop policy if exists "Usuario gerencia as proprias mensagens de duvida" on public.mentor_qa_messages;
create policy "Usuario gerencia as proprias mensagens de duvida"
  on public.mentor_qa_messages for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists mentor_qa_messages_user_idx
  on public.mentor_qa_messages (user_id, created_at);

-- ----------------------------------------------------------------------------
-- STORAGE: bucket pra imagem de visão (avatar escolhido pela pessoa)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vision-images', 'vision-images', true)
on conflict (id) do nothing;

drop policy if exists "Usuario envia a propria imagem de visao" on storage.objects;
create policy "Usuario envia a propria imagem de visao"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'vision-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Qualquer pessoa autenticada ve as imagens de visao" on storage.objects;
create policy "Qualquer pessoa autenticada ve as imagens de visao"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'vision-images');

drop policy if exists "Usuario atualiza a propria imagem de visao" on storage.objects;
create policy "Usuario atualiza a propria imagem de visao"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'vision-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Usuario remove a propria imagem de visao" on storage.objects;
create policy "Usuario remove a propria imagem de visao"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'vision-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- LEADERBOARD: agora exclui contas de demonstração do ranking real
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
  where not p.is_demo
  group by p.id, p.full_name
  order by completed_last_30_days desc;
$$;

grant execute on function public.get_leaderboard() to authenticated;

-- ----------------------------------------------------------------------------
-- ADMIN: funções restritas a quem tem is_admin = true (verificado dentro da função)
-- ----------------------------------------------------------------------------
create or replace function public.get_admin_profiles()
returns setof public.profiles
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Acesso restrito ao administrador.';
  end if;
  return query select * from public.profiles order by is_demo, full_name;
end;
$$;

create or replace function public.get_admin_habits()
returns setof public.habits
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Acesso restrito ao administrador.';
  end if;
  return query select * from public.habits;
end;
$$;

create or replace function public.get_admin_checklist_entries()
returns setof public.checklist_entries
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Acesso restrito ao administrador.';
  end if;
  return query select * from public.checklist_entries;
end;
$$;

grant execute on function public.get_admin_profiles() to authenticated;
grant execute on function public.get_admin_habits() to authenticated;
grant execute on function public.get_admin_checklist_entries() to authenticated;

-- ----------------------------------------------------------------------------
-- Torne sua própria conta administradora (troque o e-mail abaixo pelo seu)
-- ----------------------------------------------------------------------------
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'SEU-EMAIL-AQUI@exemplo.com');

-- ----------------------------------------------------------------------------
-- Seed: as 5 sessões da mentoria também como aulas revisitáveis
-- ----------------------------------------------------------------------------
insert into public.lessons (slug, title, category, summary, content, order_index) values
(
  'sessao-1',
  'Sessão 1 — Diagnóstico e Visão',
  'Sessões da mentoria',
  'Diagnóstico da vida atual, desapego do eu antigo e a visão de longo prazo.',
  $$Toda mudança de verdade começa com um diagnóstico honesto de onde você está hoje. Sem isso, não dá pra medir a distância entre onde você está e onde quer chegar — e sem medir essa distância, qualquer plano vira chute.

Por isso o primeiro passo é simples e direto: o que incomoda na sua vida profissional hoje? Pode ser algo que falta, ou algo que você tem e te incomoda. E na sua vida pessoal, o que é?

O segundo passo é sobre desapego. Parte de virar quem você decidiu ser é se desfazer de bens materiais do "eu antigo" que não pertencem mais a essa nova identidade — roupas, acessórios, eletrônicos, hábitos de consumo que representam quem você já não é. Como eu costumo dizer: assim como um dia pleno de realizações traz consigo um sono abençoado, também uma vida bem vivida culmina em uma morte bem aventurada.

Agora, o exercício mais importante desta sessão: a Visão de Longo Prazo. Imagine uma pessoa que tem tudo que você quer ter na vida — é você no futuro. Pense no que você ama fazer, aquilo que faria de olho brilhando mesmo sabendo que não iria falhar. Pode ter um foco principal, mas também pode ter mais de uma área. Agora imagine um dia inteiro dessa pessoa: o que ela pensa ao acordar, o que sente, quais ações toma, quais compromissos tem. Essa é a sua visão final — é para lá que toda essa mentoria está construindo o caminho.

Por fim, o Necrológio. É um exercício poderoso: um texto como se você tivesse morrido e alguém estivesse lendo sobre a sua vida num funeral — a última homenagem, destacando quem você foi, como viveu, o que realizou, que legado deixou. Serve pra três coisas: conecta você com sua essência (do que eu me orgulharia? do que eu me arrependeria? como quero ser lembrado?); dá clareza do seu objetivo final, sem máscara, sem ego, sem pressão externa; e ajuda a alinhar suas ações de hoje com o que você quer deixar como legado.$$,
  10
),
(
  'sessao-2',
  'Sessão 2 — Objetivo de curto/médio prazo',
  'Sessões da mentoria',
  'O próximo degrau em direção à sua visão, com o método BFO da PNL.',
  $$Sabendo de onde você está hoje, qual é o próximo degrau em direção à sua visão de longo prazo? Pense num período de 6 meses a 1 ano — parecido com a visão final, mas o resultado mais próximo que o "eu do futuro" já tem e você ainda não tem.

Pra formar esse objetivo direito, eu uso um método da PNL chamado triângulo de objetivos (BFO), com 4 critérios: expresso no positivo (o que você quer especificamente, evitando os "nãos"); iniciado e mantido pelo próprio indivíduo (precisa depender só de você); definido e avaliado com base em evidências sensoriais (métricas concretas pra saber que está no caminho certo); e ecológico (precisa preservar seus outros valores — família, amigos, saúde).

E tem também o triângulo de recursos: motivação (prazer de alcançar ou dor de não alcançar), crença (de que você consegue e de que merece), e recursos internos e externos.$$,
  11
),
(
  'sessao-3',
  'Sessão 3 — Habilidades e o Personagem',
  'Sessões da mentoria',
  'O que desenvolver pra chegar no objetivo, e a técnica do Personagem Ruim.',
  $$Pra chegar no seu objetivo, você precisa identificar quais habilidades, competências e hábitos a pessoa que já tem esse resultado possui — recursos internos (mentalidade, conhecimento, disciplina) e externos (ferramentas, rede de contatos, dinheiro).

O mais importante é o como: pra cada habilidade, o que exatamente você vai fazer pra desenvolvê-la, por quanto tempo, quando.

E uma das ferramentas que eu mais gosto: o Personagem Ruim. Crie um personagem pelo qual você sente repulsa de ser, com detalhes da vida pessoal e profissional dele. Toda vez que for fazer algo, pergunte "quem faria isso — meu eu ideal ou esse personagem ruim?". Lembre-se: ou você está crescendo, ou está decaindo — não existe estabilidade.$$,
  12
),
(
  'sessao-4',
  'Sessão 4 — Hábitos dos 21 dias',
  'Sessões da mentoria',
  'Sua agenda semanal completa, a regra dos 21 dias e a clareza insana.',
  $$O objetivo desta sessão é sair com uma agenda semanal completa, cobrindo os 7 dias, com tarefas concretas e o como exato de executar cada uma.

A regra dos 21 dias: seus hábitos são instalados em ciclos de 21 dias, começando pequenos e progredindo aos poucos. Se você errar 2 dias, o ciclo reinicia do dia 1 — isso mantém a seriedade do processo. E clareza insana: seu cérebro só ajuda a executar quando está muito claro e específico o que fazer.

Pense nos obstáculos previsíveis e já tenha uma solução pronta pra cada um. E use o método 333 pro dia a dia: 3 coisas indispensáveis, 3 que incomodam e precisam ser resolvidas, 3 bônus se sobrar energia.$$,
  13
),
(
  'sessao-5',
  'Sessão 5 — Mentalidade e compromisso',
  'Sessões da mentoria',
  'Reprogramação mental, visualização, diário noturno e o compromisso final.',
  $$O que você sente e acredita no inconsciente tende a se tornar realidade mais cedo ou mais tarde. Por isso a meditação importa, e também a troca ativa de pensamentos negativos.

Desde pequenos somos programados pelo ambiente ao redor. Pra reprogramar: treine ativamente o comportamento do seu alter ego com emoção e repetição, e filtre o que você consome (músicas, pessoas, filmes, vídeos).

Visualização do eu ideal: antes de dormir ou ao acordar, passe 5-10 minutos imaginando seu eu ideal de curto prazo como se já fosse real, sentindo a emoção como se já tivesse acontecido.

Todas as noites, faça um diário: reflita se cumpriu os hábitos, onde errou, como vai corrigir, e planeje o dia seguinte com o método 333. E não idolatre a fase de preparação — quem mais tem resultado é quem é mais desapegado do processo.$$,
  14
)
on conflict (slug) do nothing;
