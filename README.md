# Mentoria — Piloto

Plataforma web do piloto da mentoria: onboarding guiado em 5 sessões, checklist diário
automático, avatar de progresso, ranking da comunidade e aulas de mentalidade.

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
6. Vá em **Project Settings** (ícone de engrenagem) → **API**. Você vai ver duas informações
   que precisa copiar:
   - **Project URL**
   - **anon public key**

### 1.2 (Recomendado pro piloto) Desativar confirmação de e-mail

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

3. Abra `.env.local` e cole a URL e a chave que você copiou no passo 1.1:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
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
   (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Clique em **Deploy**. Em ~1 minuto você recebe um link público (tipo
   `https://mentoria-piloto.vercel.app`) pra mandar pros seus mentorados testarem.

## Como o produto funciona (resumo técnico)

- **Onboarding** (`/onboarding`): 5 telas sequenciais baseadas no seu método (diagnóstico e
  visão, objetivo de curto prazo, habilidades e personagem, hábitos dos 21 dias, mentalidade).
  As respostas de reflexão ficam guardadas por sessão. Na **sessão 4**, a pessoa cadastra os
  hábitos que vai executar e em quais dias da semana — é isso que alimenta o checklist.
- **Checklist diário** (`/dashboard`): gerado automaticamente todo dia a partir dos hábitos
  ativos agendados pro dia da semana atual.
- **Avatar / progresso**: segue a mesma regra do seu método — um "dia perfeito" é quando todos
  os hábitos daquele dia foram concluídos; errar 2 dias reinicia o ciclo de 21 dias do zero. O
  avatar enche conforme os dias perfeitos consecutivos se acumulam.
- **Ranking** (`/ranking`): soma os check-ins de cada pessoa nos últimos 30 dias.
- **Aulas** (`/aulas`): módulo de conteúdo (dopamina, disciplina, persistência, fazer o
  difícil). Edite os textos direto na tabela `lessons` pelo **Table Editor** do Supabase, ou
  adicione novas aulas ali mesmo.

## Editar o conteúdo das aulas ou das perguntas do onboarding

- **Aulas**: Supabase → **Table Editor** → tabela `lessons`. Dá pra editar texto, adicionar ou
  remover aulas direto pela interface, sem mexer em código.
- **Perguntas do onboarding**: arquivo [`src/lib/onboarding-content.ts`](./src/lib/onboarding-content.ts).
  Cada pergunta é um item de uma lista — adicionar, remover ou editar o texto é só mexer nesse
  arquivo.

## Limitações conhecidas deste piloto

- O onboarding é só formulário (sem IA conduzindo a conversa) — planejado assim de propósito
  pra validar o produto rápido com pouca gente antes de investir em algo mais sofisticado.
- Não tem app mobile nativo — funciona no navegador do celular também (é responsivo).
- Pensado pra dezenas de pessoas, não milhares — o plano grátis do Supabase dá conta tranquilo
  do piloto.
