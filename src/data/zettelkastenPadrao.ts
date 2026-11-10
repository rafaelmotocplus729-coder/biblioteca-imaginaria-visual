import { NotaZettel, NotaTemporaria, CanvasZettel } from '../types';

export const NOTAS_ZETTEL_INICIAIS: NotaZettel[] = [
  // -------------------------------------------------------------
  // 01 ÍNDICE
  // -------------------------------------------------------------
  {
    id: '202501152200',
    titulo: '1 Literatura',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- [[1-202501152223 - 100 anos de solidão]]

# Notas Relacionadas
- [[1-202501152230 - Tempo circular como prisão da repetição histórica]]
- [[1-202501152240 - Solidão como incapacidade de amar e comunicar]]
- [[1-202501152250 - Realismo mágico como lente de revelação da realidade]]
- [[1-202501161200 - Paralelo entre o eterno retorno e a condenação de Macondo]]`,
    dataCriacao: '2025-01-15T22:00:00.000Z',
    dataAtualizacao: '2025-01-15T22:00:00.000Z'
  },
  {
    id: '202501161000',
    titulo: '2 Filosofia',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- [[2-202501161015 - O Mito de Sísifo]]

# Notas Relacionadas
- [[2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo]]
- [[2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão]]
- [[2-202501161045 - A criação artística como afirmação máxima da consciência absurda]]`,
    dataCriacao: '2025-01-16T10:00:00.000Z',
    dataAtualizacao: '2025-01-16T10:00:00.000Z'
  },
  {
    id: '202501161100',
    titulo: '3 Método e Produtividade Intelectual',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- [[3-202501161110 - How to Take Smart Notes]]

# Notas Relacionadas
- [[3-202501161120 - A escrita como meio de pensamento e não apenas registro]]
- [[3-202501161130 - Conexões em rede superam a hierarquia de pastas]]`,
    dataCriacao: '2025-01-16T11:00:00.000Z',
    dataAtualizacao: '2025-01-16T11:00:00.000Z'
  },

  // -------------------------------------------------------------
  // 02 REFERÊNCIAS
  // -------------------------------------------------------------
  {
    id: '202501152223',
    titulo: '1-202501152223 - 100 anos de solidão',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[1 Literatura]]',
    conteudo: `## Referência
GARCÍA MÁRQUEZ, Gabriel. Cem anos de solidão. Tradução de Eric Nepomuceno. Rio de Janeiro: Record, 1995. ISBN 978-85-01-01229-6.

## Relevância
Obra máxima do realismo mágico latino-americano. Fundamental para analisar a circularidade temporal na tragédia histórica e a solidão como incapacidade de comunhão humana.

## Notas Relacionadas
- [[1-202501152230 - Tempo circular como prisão da repetição histórica]]
- [[1-202501152240 - Solidão como incapacidade de amar e comunicar]]
- [[1-202501152250 - Realismo mágico como lente de revelação da realidade]]
- [[1-202501161200 - Paralelo entre o eterno retorno e a condenação de Macondo]]

## Resumo
A saga da família Buendía na aldeia fictícia de Macondo narra sete gerações marcadas por um destino inescapável de isolamento, repetição de nomes e tragédias, incestos e prodígios cotidianos, até a aniquilação final pelo vento apocalíptico ao ser decifrado o pergaminho de Melquíades.

## Citações e Comentários
- #síntese p. 11: A fundação de Macondo nasce do esquecimento do mundo exterior e da necessidade de nomear as coisas que ainda não tinham nome.
- #síntese p. 84: A repetição contínua dos nomes Aureliano e José Arcadio molda o temperamento e os erros dos homens da família, tornando o tempo uma espiral viciosa.
- #síntese p. 195: A guerra interminável do Coronel Aureliano Buendía perde qualquer ideologia ou sentido e transforma-se em pura inércia mecânica de poder.
- #comentário p. 248: A peste da insônia e do esquecimento antecipa a amnésia histórica imposta após o massacre dos operários da companhia bananeira.
- #síntese p. 332: Amaranta tece e desmancha a própria mortalha, materializando a solidão como uma recusa voluntária e estéril de qualquer entrega afetiva.
- #citação p. 418: "porque as estirpes condenadas a cem anos de solidão não tinham uma segunda oportunidade sobre a terra."`,
    dataCriacao: '2025-01-15T22:23:00.000Z',
    dataAtualizacao: '2025-01-15T22:23:00.000Z'
  },
  {
    id: '202501161015',
    titulo: '2-202501161015 - O Mito de Sísifo',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[2 Filosofia]]',
    livroId: 13, // Albert Camus na biblioteca dos 60 livros!
    conteudo: `## Referência
CAMUS, Albert. O mito de Sísifo: ensaio sobre o absurdo. Tradução de Ari Roitman e Paulina Watch. Rio de Janeiro: Record, 2010. ISBN 978-85-01-08655-6.

## Relevância
Obra-chave da filosofia existencialista e do pensamento sobre a condição humana. Essencial para compreender o enfrentamento lúcido da falta de sentido da existência sem recorrer ao suicídio físico ou filosófico.

## Notas Relacionadas
- [[2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo]]
- [[2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão]]
- [[2-202501161045 - A criação artística como afirmação máxima da consciência absurda]]

## Resumo
Camus parte da premissa de que a única questão filosófica verdadeiramente séria é o suicídio. Ao examinar a ruptura entre o anseio humano por clareza e razão e a opacidade silenciosa do universo, postula que o absurdo só existe enquanto houver uma consciência lúcida que se recusa tanto à autodestruição quanto ao salto da fé, transformando o próprio esforço contínuo de viver e criar (como o suplício de Sísifo) na vitória da liberdade humana.

## Citações e Comentários
- #síntese p. 17: O sentimento do absurdo surge no colapso da rotina mecânica cotidiana («acordar, bonde, quatro horas no escritório...»), quando irrompe a pergunta: «Por quê?».
- #síntese p. 43: O absurdo não está no homem nem no mundo isolados, mas na colisão inevitável entre a demanda humana de unidade e o silêncio irracional das coisas.
- #comentário p. 61: O suicídio filosófico ocorre quando pensadores apelam a uma transcendência inexplicável para escapar da angústia da falta de respostas definitivas.
- #síntese p. 88: Viver o absurdo exige manter acesa a revolta permanente, a paixão pela quantidade de experiências e a recusa voluntária a qualquer esperança compensatória de pós-vida.
- #síntese p. 129: O criador absurdo escreve ou pinta sem a pretensão de explicar ou edificar um sistema totalizante; a obra é apenas a reprodução lúcida da experiência.
- #citação p. 142: "É preciso imaginar Sísifo feliz."`,
    dataCriacao: '2025-01-16T10:15:00.000Z',
    dataAtualizacao: '2025-01-16T10:15:00.000Z'
  },
  {
    id: '202501161110',
    titulo: '3-202501161110 - How to Take Smart Notes',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[3 Método e Produtividade Intelectual]]',
    conteudo: `## Referência
AHRENS, Sönke. How to Take Smart Notes: One Simple Technique to Boost Writing, Learning and Thinking. North Charleston: CreateSpace, 2017. ISBN 978-15-42-86650-7.

## Relevância
Fundamento teórico e prático do método Zettelkasten contemporâneo. Explica como desacoplar a captura da organização em rede e como a escrita com as próprias palavras é a principal ferramenta de compreensão.

## Notas Relacionadas
- [[3-202501161120 - A escrita como meio de pensamento e não apenas registro]]
- [[3-202501161130 - Conexões em rede superam a hierarquia de pastas]]

## Resumo
Ahrens desconstrói a ilusão de que pensar precede a escrita. Mostra que o cérebro humano é excelente para ter ideias imediatas e péssimo para armazená-las de forma confiável e estruturada. Ao separar notas fugazes, notas de literatura (referência) e notas permanentes autônomas com conexões explícitas, o Zettelkasten cria um segundo cérebro que pensa em diálogo com o pesquisador e faz o conhecimento acumular juros compostos.

## Citações e Comentários
- #síntese p. 23: Tentar aprender sem escrever é acreditar ingenuamente que compreendemos algo só porque reconhecemos o texto ao reler.
- #síntese p. 45: A organização por tópicos e pastas obriga a prever antecipadamente onde uma nota será útil, bloqueando descobertas inesperadas entre campos distintos.
- #comentário p. 72: A chave da produtividade não é força de vontade ou rotinas rígidas, mas um ambiente de trabalho que elimine o atrito entre ter uma ideia e integrá-la ao acervo.
- #síntese p. 91: Uma nota permanente precisa ter contexto suficiente para ser lida e compreendida daqui a dez anos sem que seja necessário consultar a fonte original.
- #citação p. 118: "Notes are not a record of my thinking process. They are my thinking process."`,
    dataCriacao: '2025-01-16T11:10:00.000Z',
    dataAtualizacao: '2025-01-16T11:10:00.000Z'
  },

  // -------------------------------------------------------------
  // 03 PERMANENTES
  // -------------------------------------------------------------
  {
    id: '202501152230',
    titulo: '1-202501152230 - Tempo circular como prisão da repetição histórica',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1-202501152223 - 100 anos de solidão]]',
    pagina: 84,
    relacao: '[[1-202501152240 - Solidão como incapacidade de amar e comunicar]]',
    tema: '[[1 Literatura]]',
    conteudo: `# Tempo circular como prisão da repetição histórica

Quando uma comunidade ou indivíduo perde a capacidade de elaborar criticamente o seu passado, o tempo deixa de ser uma linha de progresso e converte-se em um círculo vicioso de erros repetidos. 

Nessa dinâmica, as novas gerações não inauguram novos caminhos: elas apenas reencenam sob nova roupagem os mesmos vícios, paixões cegas e desastres daqueles que as antecederam. A amnésia voluntária ou forçada condena o homem a girar eternamente na mesma órbita trágica, acreditando falsamente que está avançando quando está apenas repetindo.`,
    dataCriacao: '2025-01-15T22:30:00.000Z',
    dataAtualizacao: '2025-01-15T22:30:00.000Z'
  },
  {
    id: '202501152240',
    titulo: '1-202501152240 - Solidão como incapacidade de amar e comunicar',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1-202501152223 - 100 anos de solidão]]',
    pagina: 332,
    relacao: '[[1-202501152230 - Tempo circular como prisão da repetição histórica]]',
    tema: '[[1 Literatura]]',
    conteudo: `# Solidão como incapacidade de amar e comunicar

A solidão mais profunda não decorre do isolamento geográfico ou da falta de companhia física, mas da incapacidade congênita ou adquirida de entrega mútua e vulnerabilidade emocional.

Quando o indivíduo se fecha em torno do próprio orgulho, de mágoas fossilizadas ou de projetos megalomaníacos egoístas, todos os vínculos com os outros tornam-se instrumentais ou ilusórios. A convivência sob o mesmo teto passa a ser apenas a soma de vários confinamentos individuais, onde cada um tece e desmancha a sua própria mortalha emocional em silêncio absoluto.`,
    dataCriacao: '2025-01-15T22:40:00.000Z',
    dataAtualizacao: '2025-01-15T22:40:00.000Z'
  },
  {
    id: '202501152250',
    titulo: '1-202501152250 - Realismo mágico como lente de revelação da realidade',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1-202501152223 - 100 anos de solidão]]',
    pagina: 11,
    relacao: '[[2-202501161045 - A criação artística como afirmação máxima da consciência absurda]]',
    tema: '[[1 Literatura]]',
    conteudo: `# Realismo mágico como lente de revelação da realidade

A introdução de elementos fantásticos na narrativa não serve para escapar da realidade concreta, mas para capturar dimensões da experiência humana que a racionalidade empírica estrita é incapaz de descrever.

O assombro, o milagre diário e a hipérbole operam como espelhos aumentados das contradições sociais e psicológicas. Ao tratar o extraordinário com naturalidade documental e o banal com estupefação mítica, a arte desnaturaliza o conformismo e força a percepção a enxergar a densidade poética e violenta do mundo real.`,
    dataCriacao: '2025-01-15T22:50:00.000Z',
    dataAtualizacao: '2025-01-15T22:50:00.000Z'
  },
  {
    id: '202501161200',
    titulo: '1-202501161200 - Paralelo entre o eterno retorno e a condenação de Macondo',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente', 'revisar'],
    referencia: '[[1-202501152223 - 100 anos de solidão]]',
    pagina: 418,
    relacao: '[[1-202501152230 - Tempo circular como prisão da repetição histórica]]',
    tema: '[[1 Literatura]]',
    revisar: true,
    conteudo: `# Paralelo entre o eterno retorno e a condenação de Macondo

Existe uma afinidade tensa entre a ideia nietzschiana de eterno retorno e a circularidade fatalista que assola a família Buendía até sua extinção. 

Contudo, enquanto em Nietzsche o eterno retorno funciona como a pedra de toque suprema para afirmar o amor fati (querer a repetição de cada dor e alegria com entusiasmo heroico), em García Márquez a circularidade surge como uma tragédia melancólica da qual os personagens não conseguem despertar, revelando a diferença entre a superação trágica e o destino inexorável.`,
    dataCriacao: '2025-01-16T12:00:00.000Z',
    dataAtualizacao: '2025-01-16T12:00:00.000Z'
  },
  {
    id: '202501161025',
    titulo: '2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[2-202501161015 - O Mito de Sísifo]]',
    pagina: 43,
    relacao: '[[2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão]]',
    tema: '[[2 Filosofia]]',
    conteudo: `# O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo

O absurdo não é uma propriedade intrínseca das coisas nem uma fraqueza psicológica do indivíduo, mas o atrito inevitável gerado pela colisão entre duas forças opostas: a sede humana irredutível por clareza, razão e propósito e o silêncio opaco e irracional do cosmos.

Eliminar qualquer um dos dois polos — seja pelo aniquilamento do sujeito (suicídio físico), seja pelo amortecimento da razão mediante saltos de fé transcendentes (suicídio filosófico) — destrói a própria condição de consciência. Manter o absurdo vivo exige preservar essa tensão insolúvel a cada instante, sem concessões nem consolo artificial.`,
    dataCriacao: '2025-01-16T10:25:00.000Z',
    dataAtualizacao: '2025-01-16T10:25:00.000Z'
  },
  {
    id: '202501161035',
    titulo: '2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[2-202501161015 - O Mito de Sísifo]]',
    pagina: 88,
    relacao: '[[2-202501161045 - A criação artística como afirmação máxima da consciência absurda]]',
    tema: '[[2 Filosofia]]',
    conteudo: `# A revolta como resposta lúcida ao absurdo sem apelo à ilusão

A revolta permanente é a recusa firme em render-se à resignação passiva ou à tentação de criar esperanças pós-morte compensatórias para justificar as dores do presente.

Revoltar-se contra a falta de sentido do universo confere ao homem o seu valor mais nobre. Ao aceitar o destino trágico com os olhos abertos e continuar agindo com intensidade e clareza, a própria ação consciente torna-se um triunfo diário contra a nulidade. Sísifo, ao descer a montanha para buscar sua rocha novamente, é superior ao castigo dos deuses justamente porque conhece plenamente a sua condição e ainda assim a assume.`,
    dataCriacao: '2025-01-16T10:35:00.000Z',
    dataAtualizacao: '2025-01-16T10:35:00.000Z'
  },
  {
    id: '202501161045',
    titulo: '2-202501161045 - A criação artística como afirmação máxima da consciência absurda',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[2-202501161015 - O Mito de Sísifo]]',
    pagina: 129,
    relacao: '[[1-202501152250 - Realismo mágico como lente de revelação da realidade]]',
    tema: '[[2 Filosofia]]',
    conteudo: `# A criação artística como afirmação máxima da consciência absurda

A arte autêntica no horizonte do absurdo não visa doutrinar, moralizar ou oferecer soluções salvíficas para os dilemas da existência, mas sim descrever a experiência do viver com rigor impiedoso e beleza formal.

Criar é multiplicar a própria consciência e dar forma ao efêmero. O artista não busca construir um refúgio seguro contra a morte, mas celebrar a intensidade de cada instante. Ao moldar sua obra sem ilusões de eternidade ou mensagens dogmáticas, o ato criador torna-se a manifestação mais plena da liberdade e dignidade humanas frente ao vazio.`,
    dataCriacao: '2025-01-16T10:45:00.000Z',
    dataAtualizacao: '2025-01-16T10:45:00.000Z'
  },
  {
    id: '202501161120',
    titulo: '3-202501161120 - A escrita como meio de pensamento e não apenas registro',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[3-202501161110 - How to Take Smart Notes]]',
    pagina: 23,
    relacao: '[[3-202501161130 - Conexões em rede superam a hierarquia de pastas]]',
    tema: '[[3 Método e Produtividade Intelectual]]',
    conteudo: `# A escrita como meio de pensamento e não apenas registro

Pensar com rigor e escrever não são dois atos sequenciais, mas o mesmo processo operando em sincronia. A tentativa de compreender profundamente um conceito sem colocá-lo em palavras próprias é uma ilusão cognitiva alimentada pela mera familiaridade de releitura.

Ao traduzir uma ideia de um autor em termos próprios e em uma nota atômica e autônoma, o estudante é forçado a confrontar lacunas de raciocínio, contradições e ambiguidades que passariam despercebidas na leitura passiva. A escrita atua como o laboratório onde o pensamento ganha contorno tangível e solidez.`,
    dataCriacao: '2025-01-16T11:20:00.000Z',
    dataAtualizacao: '2025-01-16T11:20:00.000Z'
  },
  {
    id: '202501161130',
    titulo: '3-202501161130 - Conexões em rede superam a hierarquia de pastas',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[3-202501161110 - How to Take Smart Notes]]',
    pagina: 45,
    relacao: '[[3-202501161120 - A escrita como meio de pensamento e não apenas registro]]',
    tema: '[[3 Método e Produtividade Intelectual]]',
    conteudo: `# Conexões em rede superam a hierarquia de pastas

Organizar notas em pastas rígidas por assunto força o pesquisador a decidir antecipadamente o único contexto em que aquela nota será relevante, bloqueando conexões laterais e descobertas fortuitas entre disciplinas.

Em contrapartida, uma estrutura em malha — baseada em IDs únicos, notas de índice e links bidirecionais diretos entre ideias — permite que o mesmo conceito participe simultaneamente de discussões literárias, filosóficas e práticas. A ordem deixa de ser imposta do topo para a base (top-down) e passa a emergir organicamente das relações acumuladas entre os nós da rede (bottom-up).`,
    dataCriacao: '2025-01-16T11:30:00.000Z',
    dataAtualizacao: '2025-01-16T11:30:00.000Z'
  }
];

export const NOTAS_TEMPORARIAS_INICIAIS: NotaTemporaria[] = [
  {
    id: 'temp-1',
    pensamento: 'A analogia da rocha de Sísifo se aplica perfeitamente ao estudo: sem notas conectadas, empurramos a pedra até o topo e esquecemos tudo ao descer.',
    fonte: 'O Mito de Sísifo',
    livroId: 13,
    pagina: 122,
    dataCriacao: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 horas atrás
    processada: false
  },
  {
    id: 'temp-2',
    pensamento: 'A técnica de Adler sobre leitura sintópica exige um sistema onde teses de múltiplos livros se cruzem sobre o mesmo problema.',
    fonte: 'Como Ler Livros',
    livroId: 1,
    pagina: 312,
    dataCriacao: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 horas atrás
    processada: false
  }
];

export const CANVAS_ZETTEL_INICIAL: CanvasZettel = {
  id: 'canvas-1',
  titulo: 'Articulação Literatura e Absurdo',
  descricao: 'Demonstração de como ensaios e roteiros emergem da rede de notas permanentes sem precisar reler as fontes.',
  nodes: [
    {
      id: 'c-node-1',
      tipo: 'nota',
      notaId: '1-202501152223 - 100 anos de solidão',
      x: 50,
      y: 60,
      largura: 260,
      altura: 160,
      cor: '#38bdf8'
    },
    {
      id: 'c-node-2',
      tipo: 'nota',
      notaId: '2-202501161015 - O Mito de Sísifo',
      x: 50,
      y: 260,
      largura: 260,
      altura: 160,
      cor: '#38bdf8'
    },
    {
      id: 'c-node-3',
      tipo: 'nota',
      notaId: '1-202501152230 - Tempo circular como prisão da repetição histórica',
      x: 360,
      y: 60,
      largura: 280,
      altura: 150,
      cor: '#10b981'
    },
    {
      id: 'c-node-4',
      tipo: 'nota',
      notaId: '2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão',
      x: 360,
      y: 260,
      largura: 280,
      altura: 150,
      cor: '#10b981'
    },
    {
      id: 'c-node-5',
      tipo: 'texto',
      texto: '### Roteiro Emergente: A Consciência do Ciclo\n\n1. Em Macondo, o ciclo é inconsciente e aniquila o homem.\n2. Em Sísifo, o ciclo é assumido com lucidez e revolta.\n3. A arte é o único veículo que converte o absurdo em liberdade.',
      x: 690,
      y: 120,
      largura: 320,
      altura: 220,
      cor: '#f59e0b'
    }
  ],
  edges: [
    { id: 'c-edge-1', de: 'c-node-1', para: 'c-node-3', label: 'origina' },
    { id: 'c-edge-2', de: 'c-node-2', para: 'c-node-4', label: 'origina' },
    { id: 'c-edge-3', de: 'c-node-3', para: 'c-node-4', label: 'contraponto' },
    { id: 'c-edge-4', de: 'c-node-4', para: 'c-node-5', label: 'síntese do ensaio' }
  ]
};
