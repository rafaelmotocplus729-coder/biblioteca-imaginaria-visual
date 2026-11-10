import { NotaZettel, NotaTemporaria, CanvasZettel } from '../types';

export const NOTAS_ZETTEL_INICIAIS: NotaZettel[] = [
  // -------------------------------------------------------------
  // 01 ÍNDICE (Macrotemas organizadores conforme Obsidian)
  // -------------------------------------------------------------
  {
    id: '1-LITERATURA',
    titulo: '1 - LITERATURA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- [[1 - 261220251138 - O estrangeiro]]
- [[1 - 202608191430 - Dom Casmurro]]
- [[1 - 310720251003 - Noite Brancas]]
- [[1-202501152223 - 100 anos de solidão]]

# Notas Relacionadas
- [[1 - 202528122325 - O que acontece quando o mundo deixa de ter o sentido que esperamos dele]]
- [[1 - 202531071144 - Ela nunca perdoou o ciúme que destruiu a verdade dos fatos]]
- [[1 - 310720251134 - A solidão mesmo acompanhada no devaneio romântico]]
- [[1-202501152230 - Tempo circular como prisão da repetição histórica]]
- [[1-202501152240 - Solidão como incapacidade de amar e comunicar]]
- [[1-202501152250 - Realismo mágico como lente de revelação da realidade]]`,
    dataCriacao: '2025-01-15T22:00:00.000Z',
    dataAtualizacao: '2025-01-15T22:00:00.000Z'
  },
  {
    id: '2-HISTORIA',
    titulo: '2 - HISTÓRIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- [[2 - 131020261827 - História Concisa do Brasil]]

# Notas Relacionadas
- [[1-202501152230 - Tempo circular como prisão da repetição histórica]]
- [[2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão]]`,
    dataCriacao: '2025-01-16T09:00:00.000Z',
    dataAtualizacao: '2025-01-16T09:00:00.000Z'
  },
  {
    id: '3-PSICOLOGIA',
    titulo: '3 - PSICOLOGIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- [[3 - 280920252153 - Emoções]]

# Notas Relacionadas
- [[3 - 280920252156 - Chantagem emocional e a corrosão da autonomia moral]]
- [[1 - 202531071144 - Ela nunca perdoou o ciúme que destruiu a verdade dos fatos]]`,
    dataCriacao: '2025-01-16T09:30:00.000Z',
    dataAtualizacao: '2025-01-16T09:30:00.000Z'
  },
  {
    id: '4-RELIGIAO',
    titulo: '4 - RELIGIÃO',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- [[2-202501161015 - O Mito de Sísifo]]

# Notas Relacionadas
- [[2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo]]`,
    dataCriacao: '2025-01-16T09:45:00.000Z',
    dataAtualizacao: '2025-01-16T09:45:00.000Z'
  },
  {
    id: '5-FILOSOFIA',
    titulo: '5 - FILOSOFIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- [[2-202501161015 - O Mito de Sísifo]]
- [[3-202501161110 - How to Take Smart Notes]]

# Notas Relacionadas
- [[2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo]]
- [[2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão]]
- [[2-202501161045 - A criação artística como afirmação máxima da consciência absurda]]`,
    dataCriacao: '2025-01-16T10:00:00.000Z',
    dataAtualizacao: '2025-01-16T10:00:00.000Z'
  },
  {
    id: 'ATALHOS',
    titulo: 'ATALHOS',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Atalhos do Cofre
- [[1 - 261220251138 - O estrangeiro]]
- [[1 - 202528122325 - O que acontece quando o mundo deixa de ter o sentido que esperamos dele]]
- [[3-202501161110 - How to Take Smart Notes]]
- [[Canvas de Articulação]]`,
    dataCriacao: '2025-01-16T10:10:00.000Z',
    dataAtualizacao: '2025-01-16T10:10:00.000Z'
  },

  // -------------------------------------------------------------
  // 02 REFERÊNCIAS (Fontes Fichadas com ABNT e Sínteses)
  // -------------------------------------------------------------
  {
    id: '1-261220251138',
    titulo: '1 - 261220251138 - O estrangeiro',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[1 - LITERATURA]]',
    livroId: 13,
    conteudo: `## REFERÊNCIAS
CAMUS, Albert. O estrangeiro. Trad. Valerie Rumjanek. Rio de janeiro, RJ: Editora Record, 2021.

## RELEVÂNCIAS
Obra seminal sobre o sentimento do absurdo e a ruptura com as convenções sociais hipócritas. Mersault encarna a recusa absoluta à teatralização moral do luto e dos sentimentos pré-fabricados.

## NOTAS RELACIONADAS
- [[1 - 202528122325 - O que acontece quando o mundo deixa de ter o sentido que esperamos dele]]
- [[2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo]]
- [[2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão]]

## RESUMO
O romance narra a trajetória de Meursault, um homem comum em Argel que recebe a notícia da morte da mãe sem demonstrar a dor convencional exigida pela sociedade. Ao assassinar um árabe em uma praia sob o sol ofuscante, é julgado e condenado à guilhotina não pelo homicídio em si, mas pela sua incapacidade de fingir arrependimento e de chorar no enterro de sua mãe.

## CITAÇÕES E COMENTÁRIOS
- #síntese p. 9: "Hoje, a mãe morreu. Ou talvez ontem, não sei bem." A frase inaugural elimina qualquer sentimentalismo protocolar e instaura o absurdo como fato bruto.
- #síntese p. 48: Meursault recusa a mentira das formalidades burguesas; prefere o silêncio verdadeiro ao conforto da hipocrisia.
- #comentário p. 84: O sol ardente do meio-dia funciona quase como um carrasco sensorial que precipita o disparo, anulando a vontade deliberada.
- #citação p. 118: "Para que tudo seja consumado, para que eu me sinta menos só, restava-me desejar que haja muitos espectadores no dia da minha execução e que me acolham com gritos de ódio."`,
    dataCriacao: '2025-12-26T11:38:00.000Z',
    dataAtualizacao: '2025-12-26T11:38:00.000Z'
  },
  {
    id: '1-202608191430',
    titulo: '1 - 202608191430 - Dom Casmurro',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[1 - LITERATURA]]',
    livroId: 1,
    conteudo: `## REFERÊNCIAS
ASSIS, Machado de. Dom Casmurro. Rio de Janeiro: Garnier, 1899.

## RELEVÂNCIAS
Obra-prima do realismo psicológico brasileiro e estudo definitivo sobre o ciúme retrospectivo, o narrador não-confiável e a construção paranoica da culpa.

## NOTAS RELACIONADAS
- [[1 - 202531071144 - Ela nunca perdoou o ciúme que destruiu a verdade dos fatos]]
- [[3 - 280920252156 - Chantagem emocional e a corrosão da autonomia moral]]

## RESUMO
Bento Santiago escreve suas memórias na velhice tentando atar as duas pontas da vida: o idílio amoroso da adolescência com Capitu e o desmoronamento solitário no casarão de Engenho Novo, convencido da traição da esposa com o melhor amigo Escobar através dos olhos do filho Ezequiel.

## CITAÇÕES E COMENTÁRIOS
- #síntese p. 32: Olhos de cigana oblíqua e dissimulada: a caracterização de Capitu diz muito mais sobre as inseguranças de Bentinho do que sobre a jovem.
- #síntese p. 145: A memória de Casmurro não é um registro imparcial, mas um tribunal montado para justificar o próprio ressentimento e o abandono da família.
- #citação p. 210: "Capitu, apesar daqueles olhos que o diabo lhe deu... você já reparou nos olhos dela? São assim de cigana oblíqua e dissimulada."`,
    dataCriacao: '2025-08-19T14:30:00.000Z',
    dataAtualizacao: '2025-08-19T14:30:00.000Z'
  },
  {
    id: '1-310720251003',
    titulo: '1 - 310720251003 - Noite Brancas',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[1 - LITERATURA]]',
    livroId: 2,
    conteudo: `## REFERÊNCIAS
DOSTOIÉVSKI, Fiódor. Noites Brancas: romance sentimental das memórias de um sonhador. São Paulo: Editora 34, 2005.

## RELEVÂNCIAS
Exame lírico sobre o tipo psicológico do "sonhador" petersburguês, o contraste entre a fantasia solitária e o amor vivo, e a brevidade da plenitude afetiva.

## NOTAS RELACIONADAS
- [[1 - 310720251134 - A solidão mesmo acompanhada no devaneio romântico]]
- [[1-202501152240 - Solidão como incapacidade de amar e comunicar]]

## RESUMO
Durante quatro noites de verão em São Petersburgo, quando a noite nunca escurece de todo, um jovem solitário conhece Nástenka chorando em uma ponte. Estabelece-se entre eles uma cumplicidade profunda enquanto ela aguarda o retorno do seu noivo, culminando em uma efêmera esperança de amor que se desfaz diante do retorno do amado.

## CITAÇÕES E COMENTÁRIOS
- #síntese p. 18: O sonhador vive em castelos mentais porque o mundo real exige atrito e riscos que a imaginação poupa.
- #síntese p. 74: Bastou um instante de encontro autêntico para justificar toda uma vida de isolamento.
- #citação p. 95: "Um minuto inteiro de beatitude! Mas isso não é o bastante para toda a vida de um homem?"`,
    dataCriacao: '2025-07-31T10:03:00.000Z',
    dataAtualizacao: '2025-07-31T10:03:00.000Z'
  },
  {
    id: '2-131020261827',
    titulo: '2 - 131020261827 - História Concisa do Brasil',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[2 - HISTÓRIA]]',
    conteudo: `## REFERÊNCIAS
FAUSTO, Boris. História Concisa do Brasil. São Paulo: Edusp, 2018.

## RELEVÂNCIAS
Síntese crítica e rigorosa dos ciclos políticos, sociais e econômicos do Brasil, essencial para o mapa histórico da formação nacional.

## NOTAS RELACIONADAS
- [[1-202501152230 - Tempo circular como prisão da repetição histórica]]

## RESUMO
Fausto percorre desde a colonização portuguesa, passando pelo Império e a República Velha, até a redemocratização recente, destacando a conciliação de elites e a persistência de desigualdades estruturais.`,
    dataCriacao: '2025-10-13T18:27:00.000Z',
    dataAtualizacao: '2025-10-13T18:27:00.000Z'
  },
  {
    id: '3-280920252153',
    titulo: '3 - 280920252153 - Emoções',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[3 - PSICOLOGIA]]',
    conteudo: `## REFERÊNCIAS
GOLEMAN, Daniel. Inteligência Emocional: a teoria revolucionária que redefine o que é ser inteligente. Rio de Janeiro: Objetiva, 2012.

## RELEVÂNCIAS
Fundamentação da neurociência afetiva e do papel da regulação emocional na autonomia pessoal e nos relacionamentos sociais.

## NOTAS RELACIONADAS
- [[3 - 280920252156 - Chantagem emocional e a corrosão da autonomia moral]]

## RESUMO
O livro demonstra que o quociente intelectual (QI) contribui com apenas uma fração do sucesso e equilíbrio na vida; a autoconsciência, a gestão das emoções e a empatia são as forças determinantes do comportamento humano.`,
    dataCriacao: '2025-09-28T21:53:00.000Z',
    dataAtualizacao: '2025-09-28T21:53:00.000Z'
  },
  {
    id: '1-202501152223',
    titulo: '1-202501152223 - 100 anos de solidão',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[1 - LITERATURA]]',
    conteudo: `## REFERÊNCIAS
GARCÍA MÁRQUEZ, Gabriel. Cem anos de solidão. Tradução de Eric Nepomuceno. Rio de Janeiro: Record, 1995.

## RELEVÂNCIAS
Obra máxima do realismo mágico latino-americano. Fundamental para analisar a circularidade temporal na tragédia histórica e a solidão como incapacidade de comunhão humana.

## NOTAS RELACIONADAS
- [[1-202501152230 - Tempo circular como prisão da repetição histórica]]
- [[1-202501152240 - Solidão como incapacidade de amar e comunicar]]
- [[1-202501152250 - Realismo mágico como lente de revelação da realidade]]

## RESUMO
A saga da família Buendía na aldeia fictícia de Macondo narra sete gerações marcadas por um destino inescapável de isolamento, repetição de nomes e tragédias, incestos e prodígios cotidianos, até a aniquilação final pelo vento apocalíptico ao ser decifrado o pergaminho de Melquíades.`,
    dataCriacao: '2025-01-15T22:23:00.000Z',
    dataAtualizacao: '2025-01-15T22:23:00.000Z'
  },
  {
    id: '2-202501161015',
    titulo: '2-202501161015 - O Mito de Sísifo',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[5 - FILOSOFIA]]',
    livroId: 13,
    conteudo: `## REFERÊNCIAS
CAMUS, Albert. O mito de Sísifo: ensaio sobre o absurdo. Tradução de Ari Roitman. Rio de Janeiro: Record, 2010.

## RELEVÂNCIAS
Obra-chave da filosofia existencialista e do pensamento sobre a condição humana. Essencial para compreender o enfrentamento lúcido da falta de sentido da existência sem recorrer ao suicídio físico ou filosófico.

## NOTAS RELACIONADAS
- [[2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo]]
- [[2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão]]
- [[2-202501161045 - A criação artística como afirmação máxima da consciência absurda]]

## RESUMO
Camus parte da premissa de que a única questão filosófica verdadeiramente séria é o suicídio. Ao examinar a ruptura entre o anseio humano por clareza e razão e a opacidade silenciosa do universo, postula que o absurdo só existe enquanto houver uma consciência lúcida que se recusa tanto à autodestruição quanto ao salto da fé, transformando o próprio esforço contínuo de viver e criar (como o suplício de Sísifo) na vitória da liberdade humana.`,
    dataCriacao: '2025-01-16T10:15:00.000Z',
    dataAtualizacao: '2025-01-16T10:15:00.000Z'
  },
  {
    id: '3-202501161110',
    titulo: '3-202501161110 - How to Take Smart Notes',
    tipo: 'referencia',
    pasta: '02 referências',
    tags: ['nota de referência'],
    tema: '[[3 - PSICOLOGIA]]',
    conteudo: `## REFERÊNCIAS
AHRENS, Sönke. How to Take Smart Notes: One Simple Technique to Boost Writing, Learning and Thinking. North Charleston: CreateSpace, 2017.

## RELEVÂNCIAS
Fundamento teórico e prático do método Zettelkasten contemporâneo. Explica como desacoplar a captura da organização em rede e como a escrita com as próprias palavras é a principal ferramenta de compreensão.

## NOTAS RELACIONADAS
- [[3-202501161120 - A escrita como meio de pensamento e não apenas registro]]
- [[3-202501161130 - Conexões em rede superam a hierarquia de pastas]]

## RESUMO
Ahrens desconstrói a ilusão de que pensar precede a escrita. Ao separar notas fugazes, notas de literatura e notas permanentes autônomas com conexões explícitas, o Zettelkasten cria um segundo cérebro que pensa em diálogo com o pesquisador.`,
    dataCriacao: '2025-01-16T11:10:00.000Z',
    dataAtualizacao: '2025-01-16T11:10:00.000Z'
  },

  // -------------------------------------------------------------
  // 03 PERMANENTES (Ideias Atômicas Originais com Realce Amarelo)
  // -------------------------------------------------------------
  {
    id: '1-202528122325',
    titulo: '1 - 202528122325 - O que acontece quando o mundo deixa de ter o sentido que esperamos dele',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1 - 261220251138 - O estrangeiro]]',
    pagina: 9,
    relacao: '[[2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo]]',
    tema: '[[1 - LITERATURA]]',
    conteudo: `Camus começa O Estrangeiro quebrando uma expectativa básica: ==a de que a morte da mãe seja narrada com emoção, luto ou, ao menos, solenidade.== Em vez disso, o narrador inicia com uma frase quase administrativa: "Hoje, a mãe morreu. Ou talvez ontem, não sei bem." Não há metáfora, não há explicação psicológica, não há dor explícita. Há apenas um fato — e a incerteza da data. Isso já nos coloca imediatamente diante do **absurdo**, não como teoria, mas como experiência direta.

O que chama atenção não é só a possível indiferença, mas a **naturalidade** com que essa indiferença aparece. O narrador não se justifica. Ele não tenta parecer frio nem sensível. Ele simplesmente constata. ==Quando diz "isto não quer dizer nada", referindo-se ao telegrama, ele não está fazendo uma provocação moral; ele está dizendo, literalmente, que aquela informação não carrega sentido além do que é: um comunicado. A linguagem é funcional, quase burocrática.==

Em seguida, o texto passa rapidamente para dados práticos: a distância do asilo, o horário do ônibus, a chegada à tarde. Aqui, Camus faz algo decisivo: ele coloca **o cotidiano e a morte no mesmo plano**. Não há hierarquia entre o evento existencial (a morte da mãe) e o evento logístico (pegar o ônibus das duas). Ambos são narrados com o mesmo peso — ou, melhor, com a mesma ausência de peso.

Isso não significa, necessariamente, que o personagem "não se importe". Esse é um ponto importante para evitar uma leitura moral apressada. O que o texto mostra não é desprezo consciente, mas uma forma de estar no mundo em que os acontecimentos **não são organizados por valores emocionais tradicionais**. O narrador não dramatiza, não simboliza, não espiritualiza. Ele apenas descreve.`,
    dataCriacao: '2025-12-28T23:25:00.000Z',
    dataAtualizacao: '2025-12-28T23:25:00.000Z'
  },
  {
    id: '1-202531071144',
    titulo: '1 - 202531071144 - Ela nunca perdoou o ciúme que destruiu a verdade dos fatos',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1 - 202608191430 - Dom Casmurro]]',
    pagina: 145,
    relacao: '[[3 - 280920252156 - Chantagem emocional e a corrosão da autonomia moral]]',
    tema: '[[1 - LITERATURA]]',
    conteudo: `# Ela nunca perdoou o ciúme que destruiu a verdade dos fatos

O ciúme obsessivo opera como uma profecia autorrealizável: ele projeta a traição sobre o outro até forçar a ruptura real da convivência.

==Em Dom Casmurro, Bento Santiago não julga Capitu com base em evidências materiais, mas com base no espelho de suas próprias inseguranças doentias.== Quando o ciúme substitui a confiança, qualquer olhar ou gesto torna-se prova cabal na mente do acusador. Capitu aceita o exílio na Suíça com dignidade silenciosa não por culpa, mas porque compreende que é impossível provar inocência a quem já decidiu condenar por necessidade psicológica de se vitimizar.`,
    dataCriacao: '2025-07-31T11:44:00.000Z',
    dataAtualizacao: '2025-07-31T11:44:00.000Z'
  },
  {
    id: '1-310720251134',
    titulo: '1 - 310720251134 - A solidão mesmo acompanhada no devaneio romântico',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1 - 310720251003 - Noite Brancas]]',
    pagina: 18,
    relacao: '[[1-202501152240 - Solidão como incapacidade de amar e comunicar]]',
    tema: '[[1 - LITERATURA]]',
    conteudo: `# A solidão mesmo acompanhada no devaneio romântico

O refúgio na fantasia idealizada cria uma armadilha afetiva: o indivíduo acostuma-se tanto à perfeição indolor dos seus sonhos que o encontro com uma pessoa real provoca medo e desajuste.

==O sonhador dostoievskiano caminha pelas ruas de São Petersburgo conversando com os edifícios e inventando paixões completas em silêncio.== Quando a oportunidade de um amor de carne e osso se apresenta, ele oscila entre o deslumbramento absoluto e a impotência prática de agir, revelando que a idealização romântica extrema é, no fundo, uma defesa contra os riscos do afeto autêntico.`,
    dataCriacao: '2025-07-31T11:34:00.000Z',
    dataAtualizacao: '2025-07-31T11:34:00.000Z'
  },
  {
    id: '3-280920252156',
    titulo: '3 - 280920252156 - Chantagem emocional e a corrosão da autonomia moral',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[3 - 280920252153 - Emoções]]',
    pagina: 112,
    relacao: '[[1 - 202531071144 - Ela nunca perdoou o ciúme que destruiu a verdade dos fatos]]',
    tema: '[[3 - PSICOLOGIA]]',
    conteudo: `# Chantagem emocional e a corrosão da autonomia moral

A chantagem emocional baseia-se na exploração sistemática do medo, da culpa e do senso de obrigação da vítima para impor controle e conformidade.

==Quem manipula emocionalmente não precisa usar de violência aberta; basta ameaçar retirar o afeto, cultivar o silêncio punitivo ou se colocar como vítima das ações do outro.== A resistência a esse padrão exige clareza lúcida sobre onde terminam as nossas responsabilidades morais e onde começam as projeções e expectativas indevidas alheias.`,
    dataCriacao: '2025-09-28T21:56:00.000Z',
    dataAtualizacao: '2025-09-28T21:56:00.000Z'
  },
  {
    id: '1-202501152230',
    titulo: '1-202501152230 - Tempo circular como prisão da repetição histórica',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1-202501152223 - 100 anos de solidão]]',
    pagina: 84,
    relacao: '[[1-202501152240 - Solidão como incapacidade de amar e comunicar]]',
    tema: '[[1 - LITERATURA]]',
    conteudo: `# Tempo circular como prisão da repetição histórica

Quando uma comunidade ou indivíduo perde a capacidade de elaborar criticamente o seu passado, o tempo deixa de ser uma linha de progresso e converte-se em um círculo vicioso de erros repetidos. 

==Nessa dinâmica, as novas gerações não inauguram novos caminhos: elas apenas reencenam sob nova roupagem os mesmos vícios, paixões cegas e desastres daqueles que as antecederam.== A amnésia voluntária ou forçada condena o homem a girar eternamente na mesma órbita trágica, acreditando falsamente que está avançando quando está apenas repetindo.`,
    dataCriacao: '2025-01-15T22:30:00.000Z',
    dataAtualizacao: '2025-01-15T22:30:00.000Z'
  },
  {
    id: '1-202501152240',
    titulo: '1-202501152240 - Solidão como incapacidade de amar e comunicar',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1-202501152223 - 100 anos de solidão]]',
    pagina: 332,
    relacao: '[[1-202501152230 - Tempo circular como prisão da repetição histórica]]',
    tema: '[[1 - LITERATURA]]',
    conteudo: `# Solidão como incapacidade de amar e comunicar

A solidão mais profunda não decorre do isolamento geográfico ou da falta de companhia física, mas da incapacidade congênita ou adquirida de entrega mútua e vulnerabilidade emocional.

==Quando o indivíduo se fecha em torno do próprio orgulho, de mágoas fossilizadas ou de projetos megalomaníacos egoístas, todos os vínculos com os outros tornam-se instrumentais ou ilusórios.== A convivência sob o mesmo teto passa a ser apenas a soma de vários confinamentos individuais.`,
    dataCriacao: '2025-01-15T22:40:00.000Z',
    dataAtualizacao: '2025-01-15T22:40:00.000Z'
  },
  {
    id: '1-202501152250',
    titulo: '1-202501152250 - Realismo mágico como lente de revelação da realidade',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[1-202501152223 - 100 anos de solidão]]',
    pagina: 11,
    relacao: '[[2-202501161045 - A criação artística como afirmação máxima da consciência absurda]]',
    tema: '[[1 - LITERATURA]]',
    conteudo: `# Realismo mágico como lente de revelação da realidade

A introdução de elementos fantásticos na narrativa não serve para escapar da realidade concreta, mas para capturar dimensões da experiência humana que a racionalidade empírica estrita é incapaz de descrever.

==Ao tratar o extraordinário com naturalidade documental e o banal com estupefação mítica, a arte desnaturaliza o conformismo e força a percepção a enxergar a densidade poética e violenta do mundo real.==`,
    dataCriacao: '2025-01-15T22:50:00.000Z',
    dataAtualizacao: '2025-01-15T22:50:00.000Z'
  },
  {
    id: '2-202501161025',
    titulo: '2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[2-202501161015 - O Mito de Sísifo]]',
    pagina: 43,
    relacao: '[[2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão]]',
    tema: '[[5 - FILOSOFIA]]',
    conteudo: `# O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo

O absurdo não é uma propriedade intrínseca das coisas nem uma fraqueza psicológica do indivíduo, mas o atrito inevitável gerado pela colisão entre duas forças opostas: a sede humana irredutível por clareza, razão e propósito e o silêncio opaco e irracional do cosmos.

==Eliminar qualquer um dos dois polos destrói a própria condição de consciência. Manter o absurdo vivo exige preservar essa tensão insolúvel a cada instante, sem concessões nem consolo artificial.==`,
    dataCriacao: '2025-01-16T10:25:00.000Z',
    dataAtualizacao: '2025-01-16T10:25:00.000Z'
  },
  {
    id: '2-202501161035',
    titulo: '2-202501161035 - A revolta como resposta lúcida ao absurdo sem apelo à ilusão',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[2-202501161015 - O Mito de Sísifo]]',
    pagina: 88,
    relacao: '[[2-202501161025 - O absurdo como divórcio entre o desejo de sentido e a indiferença do mundo]]',
    tema: '[[5 - FILOSOFIA]]',
    conteudo: `# A revolta como resposta lúcida ao absurdo sem apelo à ilusão

A revolta autêntica não consiste na rebeldia cega contra a realidade, mas na aceitação corajosa da finitude sem ceder à resignação ou à fuga mística.

==Sísifo empurrando eternamente a pedra até o cume da montanha representa o ápice da dignidade humana quando tem plena consciência de sua sina e ainda assim recusa o desespero.== Sua vitória sobre os deuses reside precisamente na ausência de ilusões: ao assumir o peso da rocha como coisa sua, ele transforma a punição em afirmação existencial.`,
    dataCriacao: '2025-01-16T10:35:00.000Z',
    dataAtualizacao: '2025-01-16T10:35:00.000Z'
  },
  {
    id: '3-202501161120',
    titulo: '3-202501161120 - A escrita como meio de pensamento e não apenas registro',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[3-202501161110 - How to Take Smart Notes]]',
    pagina: 23,
    relacao: '[[3-202501161130 - Conexões em rede superam a hierarquia de pastas]]',
    tema: '[[3 - PSICOLOGIA]]',
    conteudo: `# A escrita como meio de pensamento e não apenas registro

Escrever não é a etapa final que documenta um pensamento previamente acabado na mente, mas o próprio instrumento material através do qual o pensamento ganha consistência, clareza e rigor.

==Ao tentar traduzir uma ideia para as próprias palavras em uma nota atômica, somos confrontados imediatamente com as lacunas do nosso entendimento.== A folha em branco atua como um parceiro de diálogo implacável que desmascara a falsa sensação de fluência que temos durante a leitura passiva.`,
    dataCriacao: '2025-01-16T11:20:00.000Z',
    dataAtualizacao: '2025-01-16T11:20:00.000Z'
  },
  {
    id: '3-202501161130',
    titulo: '3-202501161130 - Conexões em rede superam a hierarquia de pastas',
    tipo: 'permanente',
    pasta: '03 permanentes',
    tags: ['nota permanente'],
    referencia: '[[3-202501161110 - How to Take Smart Notes]]',
    pagina: 45,
    relacao: '[[3-202501161120 - A escrita como meio de pensamento e não apenas registro]]',
    tema: '[[3 - PSICOLOGIA]]',
    conteudo: `# Conexões em rede superam a hierarquia de pastas

Estruturar o conhecimento em pastas rígidas por assunto força o cérebro a classificar previamente uma nota em um único compartimento fechado, esterilizando o surgimento de conexões interdisciplinares inesperadas.

==Em um sistema hipertextual como o Zettelkasten, as notas permanecem livres e adquirem significado pelas pontes que constroem com ideias afins.== O acervo deixa de ser um arquivo morto e passa a comportar-se como um grafo orgânico em constante reorganização.`,
    dataCriacao: '2025-01-16T11:30:00.000Z',
    dataAtualizacao: '2025-01-16T11:30:00.000Z'
  }
];

export const NOTAS_TEMPORARIAS_INICIAIS: NotaTemporaria[] = [
  {
    id: 'temp-1',
    pensamento: 'A indiferença de Meursault é uma recusa da encenação moral e não falta de afeto.',
    fonte: 'O Estrangeiro',
    livroId: 13,
    pagina: 9,
    dataCriacao: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    processada: false
  },
  {
    id: 'temp-2',
    pensamento: 'O ciúme retrospectivo de Bentinho funciona como um tribunal paranoico que condena sem provas.',
    fonte: 'Dom Casmurro',
    livroId: 1,
    pagina: 145,
    dataCriacao: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    processada: false
  },
  {
    id: 'temp-3',
    pensamento: 'O tempo circular em Macondo aprisiona porque ninguém se lembra do passado criticamente.',
    fonte: 'Cem Anos de Solidão',
    pagina: 84,
    dataCriacao: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    processada: false
  }
];

export const CANVAS_ZETTEL_INICIAL: CanvasZettel = {
  id: 'canvas-1',
  titulo: 'Mesa de Articulação: O Absurdo e a Repetição Histórica',
  descricao: 'Conexão entre o estranhamento existencial de Camus e a circularidade trágica de García Márquez para composição de ensaio.',
  nodes: [
    {
      id: 'node-1',
      tipo: 'nota',
      notaId: '1-261220251138',
      x: 50,
      y: 50,
      largura: 260,
      altura: 160,
      cor: '#0284c7'
    },
    {
      id: 'node-2',
      tipo: 'nota',
      notaId: '1-202528122325',
      x: 360,
      y: 50,
      largura: 280,
      altura: 180,
      cor: '#059669'
    },
    {
      id: 'node-3',
      tipo: 'nota',
      notaId: '1-202501152230',
      x: 360,
      y: 260,
      largura: 280,
      altura: 180,
      cor: '#059669'
    },
    {
      id: 'node-4',
      tipo: 'texto',
      texto: 'Tese Central do Ensaio: Viver o absurdo com consciência lúcida é a única maneira de quebrar o ciclo mecânico da repetição histórica.',
      x: 680,
      y: 140,
      largura: 300,
      altura: 200,
      cor: '#d97706'
    }
  ],
  edges: [
    { id: 'edge-1', de: 'node-1', para: 'node-2', label: 'gera insight' },
    { id: 'edge-2', de: 'node-2', para: 'node-4', label: 'articula tese' },
    { id: 'edge-3', de: 'node-3', para: 'node-4', label: 'fundamenta' }
  ]
};
