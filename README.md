# Mentoria — Piloto

Plataforma web do piloto da mentoria: onboarding conduzido por um mentor IA em 5 sessões,
checklist diário automático, avatar de progresso, ranking da comunidade e aulas de mentalidade.

Este guia assume que você **nunca usou nada disso**. Siga na ordem.

## 1. O que você precisa criar (gratuito)

### 1.1 Conta no Supabase (banco de dados + login)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta grátis.
2. Clique em **New project**. Escolha um nome (ex: `mentoria-piloto`) e uma senha forte pro
   banco (guarde essa senha em algum lugar, mas você não vai precisar dela no dia a dia).
3. Espere o projeto terminar de ser criado (leva ~2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste projeto, copie **tudo**
   e cole no editor do Supabase. Clique em **Run**. Isso cria todas as tabelas, as regras de
   segurança e as 4 aulas iniciais.
6. Se você já vinha rodando uma versão anterior do piloto, também rode, nesta ordem:
   [`supabase/002_ai_mentor.sql`](./supabase/002_ai_mentor.sql) e
   [`supabase/003_lesson_mode.sql`](./supabase/003_lesson_mode.sql) — só adicionam tabelas
   novas, sem apagar nada do que já existe.
7. Vá em **Project Settings** (ícone de engrenagem) → **API**. Você vai ver duas informações
   que precisa copiar:
   - **Project URL**
   - **anon public key** (ou, nas contas novas, a **Chave publicável** `sb_publishable_...`)

### 1.2 Conta na Anthropic (o mentor IA)

O onboarding é conduzido por um mentor IA (Claude) que ensina os conceitos da mentoria e
conversa com o mentorado em cada sessão — por isso precisa de uma chave de API da Anthropic.

1. Acesse [console.anthropic.com](https://console.anthropic.com) e crie uma conta.
2. Adicione um método de pagamento em **Billing** (o uso é cobrado por uso — veja a nota de
   custo abaixo; não tem plano gratuito ilimitado como o Supabase).
3. Vá em **Settings → API Keys** → **Create Key**. Copie a chave (começa com `sk-ant-...`) —
   ela só aparece uma vez, guarde num lugar seguro.

**Sobre custo:** cada sessão de mentoria consome créditos da API (a conversa inteira, sessão a
sessão, é reenviada a cada mensagem). Para um piloto com ~20 pessoas passando pelas 5 sessões
uma vez, o custo total esperado é da ordem de poucos dólares — mas acompanhe o uso em
**console.anthropic.com → Usage** nos primeiros testes pra ter uma noção real antes de abrir
pra mais gente.

### 1.3 (Recomendado pro piloto) Desativar confirmação de e-mail

Como você vai testar com poucas pessoas de confiança, pode simplificar o cadastro:

1. No Supabase, vá em **Authentication** → **Providers** → **Email**.
2. Desligue a opção **Confirm email**.

Isso faz a pessoa já entrar direto após se cadastrar, sem precisar clicar em link de e-mail.
Se preferir manter a confirmação por e-mail (mais seguro), pode deixar ligado — o app já lida
com os dois casos.

## 2. Configurar o projeto na sua máquina

1. Instale o [Node.js](https://nodejs.org) (versão 20 ou mais recente), se ainda não tiver.
2. Na pasta do projeto, copie o arquivo de exemplo de variáveis de ambiente:

   ```bash
   cp .env.example .env.local
   ```

3. Abra `.env.local` e cole a URL e as chaves que você copiou nos passos 1.1 e 1.2:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
   ```

4. Instale as dependências:

   ```bash
   npm install
   ```

5. Rode o projeto localmente:

   ```bash
   npm run dev
   ```

6. Abra [http://localhost:3000](http://localhost:3000) no navegador. Crie sua conta e teste o
   fluxo completo: cadastro → 5 sessões do onboarding → checklist diário → ranking → aulas.

## 3. Publicar na internet (pra testar com outras pessoas)

A forma mais simples é usar a [Vercel](https://vercel.com) (grátis pra esse volume de uso):

1. Suba este projeto pra um repositório no GitHub (se ainda não estiver).
2. Crie uma conta na Vercel e clique em **Add New → Project**, escolhendo esse repositório.
3. Na tela de configuração, adicione as mesmas variáveis de ambiente do `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `ANTHROPIC_API_KEY`).
4. Clique em **Deploy**. Em ~1 minuto você recebe um link público (tipo
   `https://mentoria-piloto.vercel.app`) pra mandar pros seus mentorados testarem.

## Como o produto funciona (resumo técnico)

- **Onboarding** (`/onboarding`): a pessoa escolhe entre dois modos antes de começar a sessão 1
  (fica salvo por conta, não muda mais depois):
  - **Mentor IA em chat**: conversa em tempo real, o mentor ensina cada conceito antes de
    perguntar e só avança quando cobre tudo. Tem custo de API (Anthropic) a cada mensagem.
  - **Aula + respostas**: mostra o conteúdo escrito (e o vídeo, quando você gravar) de cada
    sessão, com um formulário de perguntas abaixo. **Sem custo de IA** — na sessão 4, os
    hábitos são criados diretamente pelo formulário conforme a pessoa preenche.
  Nos dois modos, a **sessão 4** termina com a agenda semanal completa (todos os dias, com o
  "como executar" de cada tarefa) alimentando o checklist diário.
- **Checklist diário** (`/dashboard`): gerado automaticamente todo dia a partir dos hábitos
  ativos agendados pro dia da semana atual (a agenda que o mentor montou na sessão 4).
- **Avatar / progresso**: segue a mesma regra do seu método — um "dia perfeito" é quando todos
  os hábitos daquele dia foram concluídos; errar 2 dias reinicia o ciclo de 21 dias do zero. O
  avatar enche conforme os dias perfeitos consecutivos se acumulam.
- **Ranking** (`/ranking`): soma os check-ins de cada pessoa nos últimos 30 dias.
- **Aulas** (`/aulas`): módulo de conteúdo (dopamina, disciplina, persistência, fazer o
  difícil). Edite os textos direto na tabela `lessons` pelo **Table Editor** do Supabase, ou
  adicione novas aulas ali mesmo.

## Editar o conteúdo das aulas, do onboarding ou os vídeos das sessões

- **Aulas do módulo de mentalidade**: Supabase → **Table Editor** → tabela `lessons`. Dá pra
  editar texto, adicionar ou remover aulas direto pela interface, sem mexer em código.
- **Link do vídeo de cada sessão do onboarding** (modo "aula + respostas"): Supabase →
  **Table Editor** → tabela `onboarding_session_videos`. Cole o link do YouTube ou Vimeo na
  linha da sessão (1 a 5) assim que gravar — aparece automaticamente no site, sem precisar
  mexer em código nem publicar de novo.
- **Texto/roteiro de cada sessão** (os dois modos): arquivo
  [`src/lib/mentor/sessions.ts`](./src/lib/mentor/sessions.ts). `teachingContent` e
  `questions` são o texto e as perguntas do modo "aula"; `script` é o roteiro que guia o
  mentor IA no modo chat.

## Limitações conhecidas deste piloto

- O mentor IA depende da API da Anthropic estar no ar e da chave configurada — se faltar a
  `ANTHROPIC_API_KEY`, o onboarding não funciona (o resto do app continua normal).
- Não tem app mobile nativo — funciona no navegador do celular também (é responsivo).
- Pensado pra dezenas de pessoas, não milhares — o plano grátis do Supabase dá conta tranquilo
  do piloto; o custo da Anthropic escala com uso, então acompanhe.
