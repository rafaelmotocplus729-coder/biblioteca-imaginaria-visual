import {
  CadernoVolume,
  CheckinSemanal,
  DiaLog,
  CheckoutSemanal,
  PaginaLivreCaderno
} from '../types';

export const CADERNO_VOLUME_INICIAL: CadernoVolume = {
  id: 'vol-1',
  titulo: 'Caderno Real — Vol. I (2026)',
  dataInicio: '2026-11-09',
  dataFim: null,
  ativo: true,
  descricao: 'Primeiro volume do sistema de organização pessoal minimalista. Foco em leitura, reflexão e sobrevivência ao caos.',
  criadoEm: '2026-11-09T08:00:00.000Z'
};

export const CHECKIN_SEMANAL_INICIAL: CheckinSemanal = {
  id: 'semana-2026-W46',
  semanaId: '2026-W46',
  cadernoId: 'vol-1',
  dataInicio: '2026-11-09',
  dataFim: '2026-11-15',
  paginaNumero: 3,
  paragrafoIntencao:
    'Nesta semana quero manter a constância de leitura silenciosa matinal (30 minutos) e descarregar todas as fricções mentais no caderno sem buscar perfeccionismo estético. Foco em avançar em Platão e registrar sínteses rápidas no Zettelkasten sem quebrar o ritmo.',
  focoTarefas: [
    'Ler Livro VII de A República (Alegoria da Caverna e a Linha Dividida)',
    'Completar notas permanentes de epistemologia no Zettelkasten',
    'Revisar fichas acumuladas na Caixa de Entrada (Inbox 48h)'
  ],
  focoCompromissos: [
    'Quinta-feira 19:00 — Sessão de estudos e debate dialético',
    'Domingo 20:00 — Checkout da semana e planejamento do próximo ciclo'
  ],
  focoMetas: [
    'Não abandonar o diário mesmo em dias turbulentos (ao menos 1 linha no termômetro)',
    'Realizar o fechamento diário todas as noites antes de dormir'
  ],
  concluido: true,
  criadoEm: '2026-11-09T08:30:00.000Z'
};

export const DIAS_LOGS_INICIAIS: Record<string, DiaLog> = {
  '2026-11-09': {
    id: '2026-11-09',
    data: '2026-11-09',
    semanaId: '2026-W46',
    cadernoId: 'vol-1',
    paginaNumero: 4,
    revisado: true,
    dataRevisao: '2026-11-09T22:15:00.000Z',
    itens: [
      {
        id: 'item-09-1',
        tipo: 'tarefa',
        texto: 'Abrir o Check-in Semanal e definir prioridades das leituras',
        estado: 'concluido',
        urgente: true,
        criadoEm: '2026-11-09T09:00:00.000Z'
      },
      {
        id: 'item-09-2',
        tipo: 'compromisso',
        hora: '10:30',
        texto: 'Alinhamento metodológico sobre o acervo de clássicos',
        estado: 'concluido',
        urgente: false,
        criadoEm: '2026-11-09T09:10:00.000Z'
      },
      {
        id: 'item-09-3',
        tipo: 'nota',
        texto: 'O método de Luhmann não é para acumular citações, mas para dialogar com o pensamento já amadurecido.',
        estado: 'pendente',
        urgente: false,
        criadoEm: '2026-11-09T14:40:00.000Z'
      }
    ],
    termometro: {
      texto: 'Dia de retomada com excelente clareza. Descarregar o ruído no papel logo cedo evitou a ansiedade típica de início de semana.',
      humor: 'sereno',
      atualizadoEm: '2026-11-09T22:10:00.000Z'
    }
  },
  '2026-11-10': {
    id: '2026-11-10',
    data: '2026-11-10',
    semanaId: '2026-W46',
    cadernoId: 'vol-1',
    paginaNumero: 5,
    revisado: true,
    dataRevisao: '2026-11-10T22:45:00.000Z',
    itens: [
      {
        id: 'item-10-1',
        tipo: 'tarefa',
        texto: 'Ler 25 páginas de A República (Livro VII)',
        estado: 'concluido',
        urgente: true,
        criadoEm: '2026-11-10T08:00:00.000Z'
      },
      {
        id: 'item-10-2',
        tipo: 'tarefa',
        texto: 'Fichar citação sobre a dialética ascendente',
        estado: 'migrado',
        migradoPara: '2026-11-11',
        urgente: false,
        criadoEm: '2026-11-10T08:15:00.000Z'
      },
      {
        id: 'item-10-3',
        tipo: 'nota',
        texto: 'Tensão dialética identificada entre Parmênides e Heráclito sobre a imutabilidade do Ser.',
        estado: 'pendente',
        urgente: false,
        criadoEm: '2026-11-10T16:20:00.000Z'
      }
    ],
    termometro: {
      texto: 'Cansaço físico no final da tarde, mas consegui manter a leitura principal. A regra de não exigir perfeição salvou o dia.',
      humor: 'resiliente',
      atualizadoEm: '2026-11-10T22:40:00.000Z'
    }
  },
  '2026-11-11': {
    id: '2026-11-11',
    data: '2026-11-11',
    semanaId: '2026-W46',
    cadernoId: 'vol-1',
    paginaNumero: 6,
    revisado: true,
    dataRevisao: '2026-11-11T23:00:00.000Z',
    itens: [
      {
        id: 'item-11-1',
        tipo: 'tarefa',
        texto: 'Fichar citação sobre a dialética ascendente (migrada da terça)',
        estado: 'concluido',
        urgente: true,
        criadoEm: '2026-11-11T08:00:00.000Z'
      },
      {
        id: 'item-11-2',
        tipo: 'compromisso',
        hora: '15:00',
        texto: 'Sessão de leitura concentrada no café',
        estado: 'concluido',
        urgente: false,
        criadoEm: '2026-11-11T08:10:00.000Z'
      },
      {
        id: 'item-11-3',
        tipo: 'tarefa',
        texto: 'Procurar edição comentada em sebo físico',
        estado: 'cancelado',
        urgente: false,
        criadoEm: '2026-11-11T08:20:00.000Z'
      },
      {
        id: 'item-11-4',
        tipo: 'nota',
        texto: 'Ideia para ensaio: a luz do sol fora da caverna como símbolo da verdade que cega antes de iluminar.',
        estado: 'pendente',
        urgente: false,
        criadoEm: '2026-11-11T17:10:00.000Z'
      }
    ],
    termometro: {
      texto: 'Dia muito produtivo. A rotina de fechamento antes de dormir dá uma sensação indescritível de paz mental.',
      humor: 'focado',
      atualizadoEm: '2026-11-11T22:55:00.000Z'
    }
  },
  '2026-11-12': {
    id: '2026-11-12',
    data: '2026-11-12',
    semanaId: '2026-W46',
    cadernoId: 'vol-1',
    paginaNumero: 7,
    revisado: false,
    dataRevisao: null,
    itens: [
      {
        id: 'item-12-1',
        tipo: 'tarefa',
        texto: 'Ler 20 páginas de Fedro e destacar a metáfora da parelha alada',
        estado: 'pendente',
        urgente: true,
        criadoEm: '2026-11-12T07:30:00.000Z'
      },
      {
        id: 'item-12-2',
        tipo: 'compromisso',
        hora: '19:00',
        texto: 'Sessão de estudos e debate dialético sobre os clássicos',
        estado: 'pendente',
        urgente: true,
        criadoEm: '2026-11-12T07:35:00.000Z'
      },
      {
        id: 'item-12-3',
        tipo: 'tarefa',
        texto: 'Revisar notas da Caixa de Entrada (&le; 48h) e converter em permanentes',
        estado: 'pendente',
        urgente: false,
        criadoEm: '2026-11-12T07:40:00.000Z'
      },
      {
        id: 'item-12-4',
        tipo: 'nota',
        texto: 'A virtude é uma harmonia ativa entre as partes da alma, não uma ausência de paixões.',
        estado: 'pendente',
        urgente: false,
        criadoEm: '2026-11-12T08:10:00.000Z'
      }
    ],
    termometro: {
      texto: 'Manhã lúcida e serena. Sentindo que a separação entre Caixa de Entrada e o Diário Intelectual trouxe uma ordem muito necessária.',
      humor: 'inspirado',
      atualizadoEm: '2026-11-12T08:15:00.000Z'
    }
  },
  '2026-11-13': {
    id: '2026-11-13',
    data: '2026-11-13',
    semanaId: '2026-W46',
    cadernoId: 'vol-1',
    paginaNumero: 8,
    revisado: false,
    dataRevisao: null,
    itens: [
      {
        id: 'item-13-1',
        tipo: 'tarefa',
        texto: 'Consolidar apontamentos no caderno e no grafo visual',
        estado: 'pendente',
        urgente: false,
        criadoEm: '2026-11-13T08:00:00.000Z'
      }
    ],
    termometro: {
      texto: '',
      humor: '',
      atualizadoEm: ''
    }
  },
  '2026-11-14': {
    id: '2026-11-14',
    data: '2026-11-14',
    semanaId: '2026-W46',
    cadernoId: 'vol-1',
    paginaNumero: 9,
    revisado: false,
    dataRevisao: null,
    itens: [
      {
        id: 'item-14-1',
        tipo: 'compromisso',
        hora: '16:00',
        texto: 'Leitura livre descompromissada de poesia clássica',
        estado: 'pendente',
        urgente: false,
        criadoEm: '2026-11-14T08:00:00.000Z'
      }
    ],
    termometro: {
      texto: '',
      humor: '',
      atualizadoEm: ''
    }
  },
  '2026-11-15': {
    id: '2026-11-15',
    data: '2026-11-15',
    semanaId: '2026-W46',
    cadernoId: 'vol-1',
    paginaNumero: 10,
    revisado: false,
    dataRevisao: null,
    itens: [
      {
        id: 'item-15-1',
        tipo: 'compromisso',
        hora: '20:00',
        texto: 'Realizar Checkout Semanal e abrir próximo Check-in',
        estado: 'pendente',
        urgente: true,
        criadoEm: '2026-11-15T08:00:00.000Z'
      }
    ],
    termometro: {
      texto: '',
      humor: '',
      atualizadoEm: ''
    }
  }
};

export const CHECKOUT_SEMANAL_INICIAL: CheckoutSemanal = {
  id: 'checkout-2026-W46',
  semanaId: '2026-W46',
  cadernoId: 'vol-1',
  paginaNumero: 11,
  balancoBom:
    'A consistência no início das manhãs funcionou de forma brilhante. A migração rápida de tarefas pendentes à noite tirou o peso da culpa e manteve o fluxo em movimento.',
  balancoRuim:
    'Preciso evitar abrir abas demais de pesquisa paralela durante o tempo de leitura concentrada. Deixar as dúvidas para anotar como traço (-) e pesquisar depois.',
  concluido: false,
  dataFechamento: undefined
};

export const PAGINAS_LIVRES_INICIAIS: PaginaLivreCaderno[] = [
  {
    id: 'pag-livre-1',
    cadernoId: 'vol-1',
    paginaNumero: 12,
    titulo: 'Genealogia dos Conceitos Centrais de Filosofia Antiga',
    conteudo: `# Mapeamento Conceitual: Da Physis ao Lógos

1. **Os Pré-Socráticos**: A busca pelo princípio unificador (*arché*).
   - Tales: Água
   - Anaximandro: Ápeiron (o indeterminado)
   - Heráclito: O devir e o fogo perpétuo
   - Parmênides: O Ser eterno, uno e imóvel

2. **A Virada Socrática**: Da cosmologia para a ética e a conduta humana.
   - O método da maiêutica: dar à luz as ideias.
   - A ironia socrática como desnudamento da falsa certeza.

3. **Platão**: A síntese dialética do sensível e do inteligível.
   - A caverna como metáfora da libertação epistemológica.
   - O amor platônico como ascensão pela beleza até a Verdade.`,
    dataCriacao: '2026-11-10T11:00:00.000Z',
    dataAtualizacao: '2026-11-11T16:00:00.000Z'
  },
  {
    id: 'pag-livre-2',
    cadernoId: 'vol-1',
    paginaNumero: 13,
    titulo: 'Manifesto do Caderno Real: Sobrevivendo ao Caos',
    conteudo: `# O Princípio do Caderno Real

> *"O melhor sistema não é o mais bonito no Instagram; é aquele que sobrevive à pior semana da sua vida."*

- **Regra 1: Falhar não quebra o sistema.** Pulou três dias? Basta traçar uma linha e começar o dia de hoje.
- **Regra 2: Apenas uma caneta e pouca fricção.** Nada de dez canetas coloridas ou réguas complicadas.
- **Regra 3: O termômetro (≡) é sagrado.** Nem que seja uma única frase honesta sobre o cansaço do dia.
- **Regra 4: O ciclo semanal fecha o circuito.** Check-in no início, Diário no meio, Checkout no final.`,
    dataCriacao: '2026-11-11T18:00:00.000Z',
    dataAtualizacao: '2026-11-11T18:00:00.000Z'
  }
];
