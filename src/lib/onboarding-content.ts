// Conteúdo das 5 sessões da mentoria, adaptado para formulário estruturado.
// As perguntas de reflexão profunda ficam como texto livre (salvas em onboarding_answers).
// As perguntas da Sessão 4 relacionadas a hábitos são estruturadas à parte (ver HabitBuilder)
// porque alimentam o checklist diário automaticamente.

export type OnboardingQuestion = {
  key: string;
  label: string;
  placeholder?: string;
  helper?: string;
  type: "text" | "textarea";
};

export type OnboardingSession = {
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  questions: OnboardingQuestion[];
};

export const ONBOARDING_SESSIONS: OnboardingSession[] = [
  {
    number: 1,
    title: "Sessão 1 — Diagnóstico e Visão",
    subtitle: "Onde você está hoje e pra onde quer ir no longo prazo.",
    questions: [
      {
        key: "incomoda_profissional",
        label: "O que te incomoda na sua vida profissional hoje e que você quer mudar?",
        type: "textarea",
      },
      {
        key: "incomoda_pessoal",
        label: "O que te incomoda na sua vida pessoal hoje e que você quer mudar?",
        type: "textarea",
      },
      {
        key: "bens_antigo_eu",
        label: "Quais bens materiais do 'eu antigo' você vai se desfazer (roupas, objetos, hábitos de consumo)?",
        type: "textarea",
      },
      {
        key: "visao_longo_prazo",
        label:
          "Imagine uma pessoa que tem tudo que você quer ter na vida — como se fosse você no futuro. Quais são os resultados finais que ela tem? (o foco principal da sua visão)",
        helper: "Pense no dia inteiro dessa pessoa: o que pensa, sente, faz, seus compromissos.",
        type: "textarea",
      },
      {
        key: "necrologio",
        label:
          "Necrológio: se você tivesse vivido até os 90-100 anos realizando tudo o que queria, o que diriam sobre você? Quem você foi, o que conquistou, que legado deixou?",
        type: "textarea",
      },
    ],
  },
  {
    number: 2,
    title: "Sessão 2 — Objetivo de curto/médio prazo",
    subtitle: "O próximo degrau: seu objetivo para os próximos 6 meses a 1 ano.",
    questions: [
      {
        key: "objetivo_curto_prazo",
        label:
          "Qual é o resultado que seu 'eu do futuro' (daqui 6 meses a 1 ano) tem, que você ainda não tem? Expresse no positivo e de forma específica.",
        type: "textarea",
      },
      {
        key: "evidencias_objetivo",
        label: "Como você vai saber que chegou lá? Quais métricas, evidências, sensações confirmam isso?",
        type: "textarea",
      },
      {
        key: "recursos_objetivo",
        label: "Esse objetivo depende só de você? Quais recursos você já tem pra realizá-lo?",
        type: "textarea",
      },
      {
        key: "paixao_objetivo",
        label: "Você ama isso? Sente vontade genuína de realizar, ou é uma expectativa externa?",
        type: "textarea",
      },
      {
        key: "ecologia_objetivo",
        label:
          "Como esse objetivo e os comportamentos pra alcançá-lo afetam sua família, amigos e outros valores importantes? O que precisa ser preservado no caminho?",
        type: "textarea",
      },
    ],
  },
  {
    number: 3,
    title: "Sessão 3 — Habilidades e o personagem",
    subtitle: "O que desenvolver para chegar lá, e quem você não quer mais ser.",
    questions: [
      {
        key: "habilidades_necessarias",
        label:
          "Quais habilidades, competências e hábitos a pessoa que já tem esse resultado possui? Liste (internos e externos).",
        type: "textarea",
      },
      {
        key: "como_desenvolver",
        label:
          "Para cada habilidade acima: como você vai desenvolvê-la? O quê, exatamente, vai fazer, por quanto tempo, quando?",
        type: "textarea",
      },
      {
        key: "personagem_ruim",
        label:
          "Crie o 'personagem ruim': a pessoa que você tem repulsa de ser. Como é a vida pessoal e profissional dele, o que ele pensa de si e do mundo, que decisões toma?",
        helper: "Vai usar esse personagem como alerta: 'é isso que o personagem ruim faria?'",
        type: "textarea",
      },
    ],
  },
  {
    number: 4,
    title: "Sessão 4 — Hábitos dos 21 dias",
    subtitle: "O que sai da rotina, o que entra, e seus hábitos diários estruturados.",
    questions: [
      {
        key: "distracoes_pendulos",
        label:
          "Quais hábitos, distrações ou 'pêndulos' você tem hoje que tiram seu foco e energia (redes sociais, procrastinação, etc)?",
        type: "textarea",
      },
      {
        key: "bloqueios_execucao",
        label:
          "O que pode te impedir de realizar seus hábitos (algo que já atrapalha ou costuma atrapalhar)? E qual sua solução prática pra cada obstáculo?",
        helper: "Ex: 'sinto fome à tarde e como besteira' → solução: 'deixar fruta pronta e não comprar doce'.",
        type: "textarea",
      },
    ],
  },
  {
    number: 5,
    title: "Sessão 5 — Mentalidade e compromisso",
    subtitle: "Meditação, diário e o que muda a partir de hoje.",
    questions: [
      {
        key: "bloqueios_internos",
        label:
          "O que ainda te impede por dentro — medo de errar, medo da crítica, ansiedade? Descreva a crença que quer substituir e por qual nova crença.",
        type: "textarea",
      },
      {
        key: "faz_mais",
        label: "A partir de hoje, o que você vai fazer MAIS?",
        type: "textarea",
      },
      {
        key: "faz_menos",
        label: "A partir de hoje, o que você vai fazer MENOS?",
        type: "textarea",
      },
      {
        key: "compromisso_final",
        label: "Escreva seu compromisso com você mesmo para os próximos 21 dias.",
        type: "textarea",
      },
    ],
  },
];

export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
