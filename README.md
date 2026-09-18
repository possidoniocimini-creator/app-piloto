# Mentoria — Piloto

Plataforma web do piloto da mentoria: onboarding em 5 sessões (aula + respostas, com IA
gerando a agenda semanal), checklist diário automático, avatar de progresso com imagem
escolhida pela pessoa, diário com recomendação de aula, ranking, aulas e um assistente de
dúvidas — mais um painel de administração pra você acompanhar seus alunos.

Este guia assume que você **nunca usou nada disso**. Siga na ordem.

## 1. O que você precisa criar (gratuito)

### 1.1 Conta no Supabase (banco de dados + login)

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
      objetivo e imagem de visão, diário, conquistas, assistente de dúvidas, bucket de
      imagens e funções do painel de admin. **Antes de rodar este arquivo**, troque
      `'SEU-EMAIL-AQUI@exemplo.com'` (perto do final do arquivo) pelo seu e-mail de cadastro
      no app — é isso que te torna administrador.
   5. (Opcional, quando quiser) [`supabase/005_demo_seed.sql`](./supabase/005_demo_seed.sql) —
      cria 100 contas fictícias com progresso variado, só visíveis no seu painel `/admin`
      (nunca aparecem no ranking real). Pode rodar de novo quando quiser, ele substitui o
      lote anterior.
6. Vá em **Project Settings** (ícone de engrenagem) → **API**. Copie:
   - **Project URL**
   - **anon public key** (ou, nas contas novas, a **Chave publicável** `sb_publishable_...`)

### 1.2 Conta na Anthropic (a IA que gera sua agenda, o diário e o assistente de dúvidas)

1. Acesse [console.anthropic.com](https://console.anthropic.com) e crie uma conta.
2. Adicione um método de pagamento em **Billing** (cobrado por uso — não tem plano grátis
   como o Supabase).
3. Vá em **Settings → API Keys → Create Key**. Copie a chave (`sk-ant-...`) — só aparece uma
   vez, guarde num lugar seguro.

**Sobre custo:** a IA é usada em 3 lugares, com modelos escolhidos pra manter isso barato:
- **Gerar a agenda na sessão 4** e **recomendar aula no diário**: 1 chamada rápida e barata
  (modelo Haiku) por pessoa/dia — custo praticamente irrelevante mesmo com muita gente usando.
- **Assistente de dúvidas** (`/duvidas`): conversa contínua (modelo Sonnet), então tem custo
  recorrente proporcional ao quanto cada pessoa usa. Acompanhe em
  **console.anthropic.com → Usage** nos primeiros dias pra ter uma noção real.

### 1.3 (Recomendado pro piloto) Desativar confirmação de e-mail

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

3. Abra `.env.local` e cole a URL e as chaves dos passos 1.1 e 1.2:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
   ```

4. Instale as dependências e rode localmente:

   ```bash
   npm install
   npm run dev
   ```

5. Abra [http://localhost:3000](http://localhost:3000), crie sua conta (use o e-mail que você
   colocou no passo 1.1.5.4 pra virar administrador) e teste o fluxo completo.

## 3. Publicar na internet

Use a [Vercel](https://vercel.com) (grátis pra esse volume):

1. Suba este projeto pro GitHub (se ainda não estiver).
2. Na Vercel, **Add New → Project**, escolha o repositório.
3. Adicione as mesmas 3 variáveis de ambiente do `.env.local`.
4. Clique em **Deploy**.

## Como o produto funciona

- **Onboarding** (`/onboarding`): 5 sessões de aula + formulário, baseadas no seu método. Cada
  sessão mostra o conteúdo (e o vídeo, quando você gravar) e um formulário de perguntas.
  - **Sessão 2**: a pessoa escolhe o prazo do objetivo dela (1 a 12 meses) — é isso que define
    o ritmo em que o avatar dela vai encher depois.
  - **Sessão 4**: um botão "Gerar minha agenda com IA" lê tudo que a pessoa já respondeu nas
    sessões 1 a 4 e propõe a agenda semanal completa (editável antes de salvar).
- **Checklist diário** (`/dashboard`): gerado automaticamente a partir da agenda da sessão 4.
- **Avatar de progresso**: enche ao longo do prazo que a própria pessoa escolheu (não mais em
  21 dias fixos) — pode ser o boneco padrão ou uma **imagem escolhida por ela** (sobe uma foto
  da vida que quer ter, que vai ficando nítida e colorida conforme o progresso).
- **Hábito formado (21 dias)**: vira uma conquista separada, mostrada como selo no dashboard —
  segue a regra original (2 dias perdidos reiniciam a contagem de 21).
- **Calendário de check-ins**: grade dos últimos 35 dias no próprio dashboard.
- **Diário** (`/diario`): a pessoa escreve o que deu certo/errado/difícil no dia; a IA
  recomenda automaticamente a aula certa da lista pra ajudar com aquilo.
- **Ranking** (`/ranking`): check-ins dos últimos 30 dias — só de alunos reais.
- **Aulas** (`/aulas`): módulo de conteúdo, incluindo as 5 sessões da mentoria (revisitáveis a
  qualquer momento) e as aulas de mentalidade (dopamina, disciplina, etc).
- **Dúvidas** (`/duvidas`): assistente sempre disponível baseado nos princípios da mentoria.
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

- A geração de agenda, o diário e o assistente de dúvidas dependem da `ANTHROPIC_API_KEY`
  estar configurada — sem ela, essas 3 partes mostram um erro, mas o resto do app (checklist,
  ranking, aulas) continua funcionando normal.
- Não tem app mobile nativo — funciona no navegador do celular também (é responsivo).
- Pensado pra dezenas de pessoas, não milhares.
