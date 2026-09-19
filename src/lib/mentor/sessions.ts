export type SessionQuestion = {
  key: string;
  label: string;
  helper?: string;
};

export type MentorSession = {
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  teachingContent: string;
  questions: SessionQuestion[];
};

const SESSION_1_TEACHING = `Toda mudança de verdade começa com um diagnóstico honesto de onde você está hoje. Sem isso, não dá pra medir a distância entre onde você está e onde quer chegar — e sem medir essa distância, qualquer plano vira chute.

Por isso o primeiro passo é simples e direto: o que incomoda na sua vida profissional hoje? Pode ser algo que falta, ou algo que você tem e te incomoda. E na sua vida pessoal, o que é?

O segundo passo é sobre desapego. Parte de virar quem você decidiu ser é se desfazer de bens materiais do "eu antigo" que não pertencem mais a essa nova identidade — roupas, acessórios, eletrônicos, hábitos de consumo que representam quem você já não é. Como eu costumo dizer: assim como um dia pleno de realizações traz consigo um sono abençoado, também uma vida bem vivida culmina em uma morte bem aventurada.

Agora, o exercício mais importante desta sessão: a Visão de Longo Prazo. Imagine uma pessoa que tem tudo que você quer ter na vida — é você no futuro. Pense no que você ama fazer, aquilo que faria de olho brilhando mesmo sabendo que não iria falhar. Pode ter um foco principal, mas também pode ter mais de uma área. Agora imagine um dia inteiro dessa pessoa: o que ela pensa ao acordar, o que sente, quais ações toma, quais compromissos tem. Essa é a sua visão final — é para lá que toda essa mentoria está construindo o caminho.

Por fim, o Necrológio. É um exercício poderoso: um texto como se você tivesse morrido e alguém estivesse lendo sobre a sua vida num funeral — a última homenagem, destacando quem você foi, como viveu, o que realizou, que legado deixou. Serve pra três coisas: conecta você com sua essência (do que eu me orgulharia? do que eu me arrependeria? como quero ser lembrado?); dá clareza do seu objetivo final, sem máscara, sem ego, sem pressão externa; e ajuda a alinhar suas ações de hoje com o que você quer deixar como legado.

Feche os olhos (mentalmente) e imagine que hoje é o seu funeral. Você viveu até os 90, 100 anos, e realizou tudo o que queria. Alguém está lendo sobre a sua vida. Escreva com detalhes: quem você era como pessoa, o que acreditava, quais valores te guiavam, o que conquistou, como ajudou outras pessoas, e qual legado deixou.`;

const SESSION_1_QUESTIONS: SessionQuestion[] = [
  { key: "incomoda_profissional", label: "O que te incomoda na sua vida profissional hoje e que você quer mudar?" },
  { key: "incomoda_pessoal", label: "O que te incomoda na sua vida pessoal hoje e que você quer mudar?" },
  { key: "bens_antigo_eu", label: "Quais bens materiais do 'eu antigo' você vai se desfazer?" },
  {
    key: "visao_longo_prazo",
    label: "Qual é a sua visão de longo prazo? Descreva os resultados finais e um dia inteiro do seu eu ideal.",
    helper: "O que ele pensa, sente, faz, quais compromissos tem.",
  },
  { key: "necrologio", label: "Escreva seu necrológio: quem você foi, o que conquistou, que legado deixou." },
];

const SESSION_2_TEACHING = `Sabendo de onde você está hoje, qual é o próximo degrau em direção à sua visão de longo prazo? Pense num período de 6 meses a 1 ano — parecido com a visão final, mas o resultado mais próximo que o "eu do futuro" em 1 ano já tem e você ainda não tem.

Pra formar esse objetivo direito, eu uso um método da PNL chamado triângulo de objetivos (BFO), com 4 critérios:

Expresso no positivo: o que você quer especificamente, evitando os "nãos". Não é "parar de ser desorganizado", é "ser uma pessoa organizada que...".

Iniciado e mantido pelo próprio indivíduo: precisa depender só de você. Se depender de terceiros ou sorte, dificilmente vai se realizar.

Definido e avaliado com base em evidências sensoriais: métricas concretas pra você saber que está no caminho certo — o que vai ver, ouvir, sentir quando chegar lá.

Ecológico: precisa preservar a intenção positiva do seu estado presente e ser compatível com seus outros valores (família, amigos, saúde). Se seu objetivo é subir de nível no trabalho mas um valor central seu é família, você precisa achar um jeito de perseguir o objetivo sem sacrificar o que é inegociável pra você.

E tem também o triângulo de recursos, que garante que dá pra realizar o objetivo: motivação (vem do prazer de alcançar ou da dor de não alcançar), crença (de que você consegue e de que merece), e recursos internos e externos que você já tem ou vai precisar desenvolver.`;

const SESSION_2_QUESTIONS: SessionQuestion[] = [
  { key: "objetivo_curto_prazo", label: "Qual é o seu objetivo de 6 meses a 1 ano, expresso no positivo e específico?" },
  { key: "evidencias_objetivo", label: "Como você vai saber que chegou lá? Quais métricas, evidências e sensações confirmam isso?" },
  { key: "recursos_objetivo", label: "Esse objetivo depende só de você? Quais recursos você já tem, e quais vai precisar desenvolver?" },
  { key: "paixao_objetivo", label: "Você ama isso? Sente vontade genuína, ou é uma expectativa externa?" },
  {
    key: "ecologia_objetivo",
    label: "Como esse objetivo afeta sua família, amigos e outros valores importantes? O que precisa ser preservado no caminho?",
  },
  { key: "motivacao_crenca", label: "Isso vem mais do prazer de conquistar ou da dor de não conquistar? Você acredita que consegue e que merece?" },
];

const SESSION_3_TEACHING = `Pra chegar no objetivo que você definiu na sessão anterior, precisa identificar quais habilidades, competências e hábitos a pessoa que já tem esse resultado possui — tanto recursos internos (mentalidade, conhecimento, disciplina) quanto externos (ferramentas, rede de contatos, dinheiro).

Depois de listar, o mais importante é o como: pra cada habilidade, o que exatamente você vai fazer pra desenvolvê-la, por quanto tempo, quando. Quanto vai treinar, como vai saber o que treinar, quem pode te ajudar, quantas vezes por semana o seu eu ideal (já alinhado com a visão) estaria fazendo isso, e exatamente como ele estaria fazendo.

Agora uma das ferramentas que eu mais gosto de usar: o Personagem Ruim. A ideia é criar um personagem pelo qual você sente repulsa, nojo de ser — com detalhes da vida pessoal e profissional dele, um dia típico, que decisões toma, o que pensa de si e do mundo.

O uso prático é o seguinte: toda vez que você for fazer algo, pare e se pergunte "quem faria isso agora — meu eu ideal ou esse personagem ruim?". Se perceber que é o personagem ruim que faria, sinta essa repulsa (até ria da besteira) e não faça. Se for o eu ideal que faria, aja imediatamente.

E lembre-se sempre: ou você está crescendo, ou está decaindo e voltando degraus — não existe estabilidade.`;

const SESSION_3_QUESTIONS: SessionQuestion[] = [
  {
    key: "habilidades_necessarias",
    label: "Quais habilidades, competências e hábitos a pessoa que já tem esse resultado possui? Liste numerado (internos e externos).",
  },
  {
    key: "como_desenvolver",
    label: "Para cada habilidade acima: como você vai desenvolvê-la? O que vai fazer, por quanto tempo, quando?",
  },
  {
    key: "personagem_ruim",
    label: "Crie o 'personagem ruim': quem você tem repulsa de ser. Vida pessoal, profissional, decisões, o que pensa de si e do mundo.",
  },
];

const SESSION_4_TEACHING = `Esta é a sessão mais prática de todas: o objetivo é sair daqui com uma agenda semanal completa, cobrindo os 7 dias, com tarefas concretas e o como exato de executar cada uma. Essa agenda vira o seu checklist diário — por isso não pode ficar vago.

Antes de adicionar hábitos novos, vale identificar o que hoje rouba o seu foco e energia — os "pêndulos" da sua rotina (redes sociais, procrastinação, etc).

Agora, a regra dos 21 dias: seus hábitos vão ser instalados em ciclos de 21 dias, começando pequenos (mini hábitos que dá pra fazer sem falhar) e progredindo aos poucos. A regra é clara: se você errar 2 dias, o ciclo reinicia do dia 1, não importa o quanto já tinha avançado. Isso existe pra manter a seriedade do processo.

E aqui vai um princípio que eu chamo de clareza insana: seu cérebro só ajuda a executar quando está muito claro e específico o que fazer, porque ele naturalmente tenta economizar energia. "Vou treinar mais" não funciona — precisa ser "treino de força, 40 minutos, às 6h30, na academia do condomínio".

Pense também nos obstáculos previsíveis. Não tem carro pra ir na academia? Treine no condomínio. Sente fome à tarde e come besteira? Deixe fruta pronta em vez de doce em casa. Viaja muito? Corra na rua. Todo hábito precisa ter uma solução pronta pro que normalmente atrapalha.

Por fim, uso o método 333 pra estruturar o dia a dia: 3 coisas indispensáveis, 3 coisas que estão incomodando e precisam ser resolvidas logo, e 3 coisas bônus se sobrar energia. E lembre-se da ação imediata: toda vez que tiver uma ideia boa, anote na hora e aja — não deixe pra depois.

Preencha abaixo cada hábito da sua semana: o quê, quando (quais dias), e como exatamente vai executar. Cada um vira automaticamente uma tarefa no seu checklist diário.`;

const SESSION_4_QUESTIONS: SessionQuestion[] = [
  { key: "distracoes_pendulos", label: "Quais distrações ou 'pêndulos' você tem hoje que tiram seu foco e energia?" },
  {
    key: "bloqueios_execucao",
    label: "O que pode te impedir de realizar seus hábitos? E qual sua solução prática para cada obstáculo?",
    helper: "Ex: 'sinto fome à tarde e como besteira' → solução: 'deixar fruta pronta e não comprar doce'.",
  },
];

const SESSION_5_TEACHING = `O que você sente e acredita no inconsciente tende a se tornar realidade mais cedo ou mais tarde. Por isso a meditação importa — perceber o momento presente — e também a troca ativa de pensamentos negativos por outros que sustentem sua visão.

Aqui vai algo essencial: desde pequenos somos programados pelo ambiente ao redor — crenças que outros colocam em nós. Se você não tomar as rédeas dessa programação, o ambiente continua te moldando por conta própria. O cérebro aprende por impacto emocional, química e repetição. Pra reprogramar, dois caminhos: treinar ativamente o comportamento do seu alter ego (eu ideal) com emoção e repetição, forçando a ação; e filtrar o que você consome — músicas, pessoas, filmes, vídeos — porque tudo isso também te programa.

Outra ferramenta poderosa: a visualização do eu ideal. Antes de dormir ou ao acordar, passe 5 a 10 minutos imaginando o seu eu ideal de curto prazo como se já fosse real agora, sentindo a emoção como se já tivesse acontecido — o sentimento é o mais importante. E o que acelera esse processo é a ação: quanto mais intenso e mais você repetir o que te leva pra essa visão, mais rápido ela se torna realidade.

Todas as noites, faça um diário: reflita se cumpriu os hábitos do dia, onde errou ou faltou, como vai corrigir, e já planeje o dia seguinte com o método 333.

Uma última coisa importante: não idolatre a fase de preparação. As pessoas que mais têm resultado são as mais desapegadas do processo, focadas em agir.

Agora, o que ainda te impede por dentro hoje — medo de errar, de não dar certo, ansiedade, medo da crítica? Vamos trabalhar nisso: pense num contra-exemplo (uma vez em que você agiu apesar do medo e deu certo) e use isso pra reformular a crença limitante numa nova crença mais útil.

E pra fechar: a partir de agora, o que você vai fazer MAIS? O que vai fazer MENOS? Escreva um compromisso final com os próximos 21 dias.`;

const SESSION_5_QUESTIONS: SessionQuestion[] = [
  {
    key: "bloqueios_internos",
    label: "O que ainda te impede por dentro — medo de errar, medo da crítica, ansiedade? Que crença nova você quer instalar no lugar, e por quê?",
  },
  { key: "faz_mais", label: "A partir de hoje, o que você vai fazer MAIS?" },
  { key: "faz_menos", label: "A partir de hoje, o que você vai fazer MENOS?" },
  { key: "compromisso_final", label: "Escreva seu compromisso com você mesmo para os próximos 21 dias." },
];

export const MENTOR_SESSIONS: MentorSession[] = [
  {
    number: 1,
    title: "Sessão 1 — Diagnóstico e Visão",
    subtitle: "Onde você está hoje e pra onde quer ir no longo prazo.",
    teachingContent: SESSION_1_TEACHING,
    questions: SESSION_1_QUESTIONS,
  },
  {
    number: 2,
    title: "Sessão 2 — Objetivo de curto/médio prazo",
    subtitle: "O próximo degrau, com o método BFO da PNL.",
    teachingContent: SESSION_2_TEACHING,
    questions: SESSION_2_QUESTIONS,
  },
  {
    number: 3,
    title: "Sessão 3 — Habilidades e o Personagem",
    subtitle: "O que desenvolver, e quem você não quer mais ser.",
    teachingContent: SESSION_3_TEACHING,
    questions: SESSION_3_QUESTIONS,
  },
  {
    number: 4,
    title: "Sessão 4 — Hábitos dos 21 dias",
    subtitle: "Sua agenda semanal completa, dia a dia.",
    teachingContent: SESSION_4_TEACHING,
    questions: SESSION_4_QUESTIONS,
  },
  {
    number: 5,
    title: "Sessão 5 — Mentalidade e compromisso",
    subtitle: "Reprogramação, diário e o compromisso final.",
    teachingContent: SESSION_5_TEACHING,
    questions: SESSION_5_QUESTIONS,
  },
];
