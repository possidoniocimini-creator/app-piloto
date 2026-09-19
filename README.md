# Mentoria — Piloto

Plataforma web do piloto da mentoria: onboarding em 5 sessões (aula + respostas), checklist
diário automático, avatar de progresso com imagem escolhida pela pessoa, diário pessoal,
ranking, aulas e um painel pra você acompanhar seus alunos. **100% gratuito de rodar** — não
depende de nenhuma API paga.

Este guia assume que você **nunca usou nada disso**. Siga na ordem.

## 1. Criar o projeto no Supabase (gratuito)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta grátis.
2. Clique em **New project**. Escolha um nome (ex: `mentoria-piloto`) e uma senha forte pro
   banco (guarde essa senha em algum lugar, mas você não vai precisar dela no dia a dia).
3. Espere o projeto terminar de ser criado (leva ~2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Rode, **nesta ordem**, colando o conteúdo de cada arquivo e clicando em **Run** antes de
   passar pro próximo:
   1. [`supabase/schema.sql`](./supabase/schema.sql) — cria as tabelas principais.
   2. [`supabase/002_ai_mentor.sql`](./supabase/002_ai_mentor.sql)
   3. [`supabase/003_lesson_mode.sql`](./supabase/003_lesson_mode.sql)
   4. [`supabase/004_expansion.sql`](./supabase/004_expansion.sql) — perfil com prazo do
      objetivo e imagem de visão, diário, conquistas, bucket de imagens e funções do painel
      de admin. **Antes de rodar este arquivo**, troque
      `'SEU-EMAIL-AQUI@exemplo.com'` (perto do final do arquivo) pelo seu e-mail de cadastro
      no app — é isso que te torna administrador.
   5. (Opcional, quando quiser) [`supabase/005_demo_seed.sql`](./supabase/005_demo_seed.sql) —
      cria 100 contas fictícias com progresso variado, só visíveis no seu painel `/admin`
      (nunca aparecem no ranking real). Pode rodar de novo quando quiser, ele substitui o
      lote anterior.
6. Vá em **Project Settings** (ícone de engrenagem) → **API**. Copie:
   - **Project URL**
   - **anon public key** (ou, nas contas novas, a **Chave publicável** `sb_publishable_...`)

### (Recomendado pro piloto) Desativar confirmação de e-mail

1. No Supabase, vá em **Authentication → Providers → Email**.
2. Desligue a opção **Confirm email**.

Isso faz a pessoa já entrar direto após se cadastrar. Se preferir manter a confirmação por
e-mail, pode deixar ligado — o app lida com os dois casos.

## 2. Configurar o projeto na sua máquina

1. Instale o [Node.js](https://nodejs.org) (versão 20+), se ainda não tiver.
2. Copie o arquivo de exemplo de variáveis de ambiente:

   ```bash
   cp .env.example .env.local
   ```

3. Abra `.env.local` e cole a URL e a chave do passo 1:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

4. Instale as dependências e rode localmente:

   ```bash
   npm install
   npm run dev
   ```

5. Abra [http://localhost:3000](http://localhost:3000), crie sua conta (use o e-mail que você
   colocou no passo 1.5.4 pra virar administrador) e teste o fluxo completo.

## 3. Publicar na internet

Use a [Vercel](https://vercel.com) (grátis pra esse volume):

1. Suba este projeto pro GitHub (se ainda não estiver).
2. Na Vercel, **Add New → Project**, escolha o repositório.
3. Adicione as 2 variáveis de ambiente do `.env.local`.
4. Clique em **Deploy**.

## Como o produto funciona

- **Onboarding** (`/onboarding`): 5 sessões de aula + formulário, baseadas no seu método. Cada
  sessão mostra o conteúdo (e o vídeo, quando você gravar) e um formulário de perguntas.
  - **Sessão 2**: a pessoa escolhe o prazo do objetivo dela (1 a 12 meses) — é isso que define
    o ritmo em que o avatar dela vai encher depois.
  - **Sessão 4**: a pessoa monta a agenda semanal (hábito, dias da semana, como executar) num
    formulário simples — cada hábito vira automaticamente uma tarefa no checklist diário.
- **Checklist diário** (`/dashboard`): gerado automaticamente a partir da agenda da sessão 4.
- **Avatar de progresso**: enche ao longo do prazo que a própria pessoa escolheu (não mais em
  21 dias fixos) — pode ser o boneco padrão ou uma **imagem escolhida por ela** (sobe uma foto
  da vida que quer ter, que vai ficando nítida e colorida conforme o progresso).
- **Hábito formado (21 dias)**: vira uma conquista separada, mostrada como selo no dashboard —
  segue a regra original (2 dias perdidos reiniciam a contagem de 21).
- **Calendário de check-ins**: grade dos últimos 35 dias no próprio dashboard.
- **Diário** (`/diario`): um bloco de notas simples — a pessoa escreve o que deu certo, o que
  deu errado e o que foi difícil no dia. O próprio ato de escrever já ajuda a refletir.
- **Ranking** (`/ranking`): check-ins dos últimos 30 dias — só de alunos reais.
- **Aulas** (`/aulas`): módulo de conteúdo, incluindo as 5 sessões da mentoria (revisitáveis a
  qualquer momento) e as aulas de mentalidade (dopamina, disciplina, etc).
- **Painel do mentor** (`/admin`): só pra quem tem `is_admin = true` no perfil — mostra o
  progresso de todos os alunos (reais e de demonstração) numa tabela só.

## Editar conteúdo sem mexer em código

- **Aulas** (mentalidade e as 5 sessões): Supabase → **Table Editor** → tabela `lessons`.
- **Vídeo de cada sessão do onboarding**: tabela `onboarding_session_videos` — cole o link do
  YouTube/Vimeo na linha da sessão (1 a 5).
- **Texto/perguntas de cada sessão**: arquivo
  [`src/lib/mentor/sessions.ts`](./src/lib/mentor/sessions.ts) (`teachingContent` e
  `questions`).

## Limitações conhecidas deste piloto

- Não tem app mobile nativo — funciona no navegador do celular também (é responsivo).
- Pensado pra dezenas de pessoas, não milhares.
