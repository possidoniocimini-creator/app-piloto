import type Anthropic from "@anthropic-ai/sdk";

export const MENTOR_TOOLS: Anthropic.Tool[] = [
  {
    name: "log_habit",
    description:
      "Registra ou atualiza um item específico da agenda semanal do mentorado (um hábito/tarefa em dias específicos da semana). Chame sempre que um hábito concreto for definido na conversa, com o horário, duração e forma de execução já claros. Pode ser chamada várias vezes na mesma sessão, uma vez por hábito.",
    input_schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "Nome curto e específico do hábito/tarefa, ex: 'Treino de força 40min' ou 'Diário noturno'.",
        },
        description: {
          type: "string",
          description:
            "O COMO executar, sempre específico: horário sugerido, duração, técnica, quantidade, e a solução prática para obstáculos previsíveis (nunca genérico).",
        },
        weekdays: {
          type: "array",
          items: { type: "integer", minimum: 0, maximum: 6 },
          description:
            "Dias da semana em que o hábito será praticado: 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado. Se for todo dia, use [0,1,2,3,4,5,6].",
        },
      },
      required: ["title", "description", "weekdays"],
    },
  },
  {
    name: "finish_session",
    description:
      "Chame SOMENTE quando todos os pontos obrigatórios do roteiro desta sessão já tiverem sido ensinados e cobertos em profundidade, e o mentorado confirmar que não tem mais dúvidas. Encerra a sessão e avança para a próxima etapa da mentoria.",
    input_schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description:
            "Resumo em 3-6 frases do que foi definido e ensinado nesta sessão, escrito para o mentorado reler depois.",
        },
      },
      required: ["summary"],
    },
  },
];
