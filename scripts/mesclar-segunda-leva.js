import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
const publicCapasDir = path.resolve(__dirname, '../public/capas');

const livrosPath = path.join(dataDir, 'livros.json');
const relacoesPath = path.join(dataDir, 'relacoes.json');
const enriquecidoPath = path.join(dataDir, 'enriquecido.json');
const pendenciasPath = path.join(dataDir, 'pendencias.json');

const NOVOS_LIVROS = [
  {"id": 61, "nivel": 1, "ordem_no_nivel": 1, "autor": "C. Wright Mills", "titulo": "A Imaginação Sociológica", "ano": "1959", "area": "Sociologia", "classe": "PORTA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Os problemas pessoais só se entendem ligando biografia e história: o que parece drama privado costuma ser questão pública.",
   "acrescenta": "A ‘imaginação sociológica’ como hábito mental, uma entrada na sociologia sem jargão.",
   "por_que_antes_do_proximo": "Vem antes de Harris porque dá a pergunta que ele responde com materialismo: por que as pessoas vivem como vivem?"},
  {"id": 62, "nivel": 1, "ordem_no_nivel": 2, "autor": "Marvin Harris", "titulo": "Vacas, Porcos, Guerras e Bruxas", "ano": "1974", "area": "Antropologia", "classe": "PORTA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Costumes que parecem irracionais, como a vaca sagrada ou o tabu do porco, têm razões ecológicas e materiais.",
   "acrescenta": "Materialismo cultural, em oposição às leituras simbólicas da cultura (como a de Geertz, adiante).",
   "por_que_antes_do_proximo": "Antes de Carr porque ambos buscam causas; Carr pergunta o que conta como causa em história."},
  {"id": 63, "nivel": 1, "ordem_no_nivel": 3, "autor": "E. H. Carr", "titulo": "Que é História?", "ano": "1961", "area": "História", "classe": "PORTA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O fato histórico só existe quando o historiador o seleciona; a história é um diálogo sem fim entre presente e passado.",
   "acrescenta": "Visão construtivista da história, contraponto parcial ao método de Bloch.",
   "por_que_antes_do_proximo": "Antes de Carvalho para você ver a teoria aplicada a um caso brasileiro."},
  {"id": 64, "nivel": 1, "ordem_no_nivel": 4, "autor": "José Murilo de Carvalho", "titulo": "Cidadania no Brasil: o longo caminho", "ano": "2001", "area": "História", "classe": "PORTA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "No Brasil os direitos chegaram em ordem diferente da inglesa: os sociais vieram antes dos políticos, e os civis seguem incompletos.",
   "acrescenta": "Cidadania como processo histórico, não conceito abstrato; entrada fácil na política brasileira.",
   "por_que_antes_do_proximo": "Antes de Maquiavel porque leva do cidadão ao governante."},
  {"id": 65, "nivel": 1, "ordem_no_nivel": 5, "autor": "Nicolau Maquiavel", "titulo": "O Príncipe", "ano": "1532", "area": "Política", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O governante deve julgar a política pela eficácia e pela virtù, não pela moral privada.",
   "acrescenta": "O realismo político fundador, contraponto à política das virtudes de Platão e Aristóteles.",
   "por_que_antes_do_proximo": "Antes de Giannetti porque a pergunta passa do poder para o dinheiro."},
  {"id": 66, "nivel": 1, "ordem_no_nivel": 6, "autor": "Eduardo Giannetti", "titulo": "Vícios Privados, Benefícios Públicos? A Ética na Riqueza das Nações", "ano": "1993", "area": "Economia", "classe": "PORTA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Pergunta se o interesse próprio gera bem comum, rastreando a questão de Mandeville a Smith sem tirar a ética do centro.",
   "acrescenta": "Ponte entre ética e economia, por autor brasileiro; prepara a leitura de Smith.",
   "por_que_antes_do_proximo": "Antes de Marco Aurélio porque, depois de poder e dinheiro, vem a pergunta de como viver."},
  {"id": 67, "nivel": 1, "ordem_no_nivel": 7, "autor": "Marco Aurélio", "titulo": "Meditações", "ano": "c. 170–180", "area": "Filosofia", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": true, "idioma_leitura": "pt",
   "tese": "Só controlamos nossos juízos e atos; o resto é natureza a ser aceita com serenidade.",
   "acrescenta": "Filosofia como prática diária: notas de um imperador para si mesmo.",
   "por_que_antes_do_proximo": "Antes da Imitação de Cristo porque contrasta virtude pela vontade com humildade e graça."},
  {"id": 68, "nivel": 1, "ordem_no_nivel": 8, "autor": "Tomás de Kempis", "titulo": "Imitação de Cristo", "ano": "c. 1418–27", "area": "Catolicismo", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A vida cristã é desapego do mundo e imitação interior de Cristo.",
   "acrescenta": "Um dos devocionais mais lidos da tradição cristã: piedade em primeira pessoa.",
   "por_que_antes_do_proximo": "Antes de Sacks para trocar a alma contemplativa pelo paciente concreto."},
  {"id": 69, "nivel": 1, "ordem_no_nivel": 9, "autor": "Oliver Sacks", "titulo": "O Homem que Confundiu sua Mulher com um Chapéu", "ano": "1985", "area": "Psicologia", "classe": "PORTA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Distúrbios neurológicos revelam o que é ser pessoa; o paciente não se reduz ao seu déficit.",
   "acrescenta": "Psicologia e neurologia como narrativa de casos, contraponto humano ao reducionismo comportamental.",
   "por_que_antes_do_proximo": "Antes de Morte e Vida Severina porque mostra o humano concreto, caso a caso, antes da poesia do coletivo."},
  {"id": 70, "nivel": 1, "ordem_no_nivel": 10, "autor": "João Cabral de Melo Neto", "titulo": "Morte e Vida Severina", "ano": "1955", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A vida do retirante nordestino oscila entre a morte e a teimosia em continuar nascendo.",
   "acrescenta": "Poesia dramática curta, par de Vidas Secas: o Nordeste pela forma.",
   "por_que_antes_do_proximo": "Antes do Auto da Compadecida porque o mesmo sertão aparece depois pelo humor e pela fé popular."},
  {"id": 71, "nivel": 1, "ordem_no_nivel": 11, "autor": "Ariano Suassuna", "titulo": "Auto da Compadecida", "ano": "1955", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A misericórdia divina é mais generosa e mais popular do que a justiça dos poderosos.",
   "acrescenta": "Catolicismo popular, humor e crítica social em teatro: fé sem solenidade.",
   "por_que_antes_do_proximo": "Antes de Strunk porque fecha o bloco literário e abre a trilha de inglês, que corre em paralelo."},
  {"id": 72, "nivel": 1, "ordem_no_nivel": 12, "autor": "William Strunk Jr. & E. B. White", "titulo": "The Elements of Style", "ano": "1918; ed. 1959", "area": "Inglês", "classe": "PORTA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "en",
   "tese": "Escrever bem é cortar o desnecessário e preferir a forma direta.",
   "acrescenta": "Trilha de inglês escrito: texto curto, em inglês, para treinar o olho.",
   "por_que_antes_do_proximo": "Trilho paralelo: pode ser lido em qualquer momento do nível e prepara Lewis, no nível 3."},

  {"id": 73, "nivel": 2, "ordem_no_nivel": 1, "autor": "René Descartes", "titulo": "Meditações Metafísicas", "ano": "1641", "area": "Filosofia", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Só se pode partir da certeza do próprio pensar; todo o resto precisa de fundamento.",
   "acrescenta": "Dúvida metódica e mente separada do corpo: origem da filosofia moderna.",
   "por_que_antes_do_proximo": "Antes de Pinker porque Pinker ataca o ‘fantasma na máquina’ cartesiano."},
  {"id": 74, "nivel": 2, "ordem_no_nivel": 2, "autor": "Steven Pinker", "titulo": "Tábula Rasa", "ano": "2002", "area": "Psicologia", "classe": "MAPA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A mente não é folha em branco: há natureza humana moldada pela evolução.",
   "acrescenta": "Contraponto à ideia de que tudo é cultura ou condicionamento (Skinner, Rousseau).",
   "por_que_antes_do_proximo": "Antes de Rogers porque a natureza humana fixa contrasta com a ideia de crescimento pessoal."},
  {"id": 75, "nivel": 2, "ordem_no_nivel": 3, "autor": "Carl Rogers", "titulo": "Tornar-se Pessoa", "ano": "1961", "area": "Psicologia", "classe": "MAPA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "As pessoas crescem quando recebem aceitação incondicional e empatia; a terapia deve seguir o cliente.",
   "acrescenta": "Psicologia humanista, em oposição ao behaviorismo e à psicanálise.",
   "por_que_antes_do_proximo": "Antes de Schopenhauer porque Rogers é otimista sobre a natureza humana e Schopenhauer é o contraponto pessimista."},
  {"id": 76, "nivel": 2, "ordem_no_nivel": 4, "autor": "Arthur Schopenhauer", "titulo": "Aforismos para a Sabedoria de Vida", "ano": "1851", "area": "Filosofia", "classe": "PORTA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A vida oscila entre dor e tédio; a sabedoria prática é reduzir expectativas.",
   "acrescenta": "O pessimismo filosófico em prosa de conselhos; a forma aforística é parte do argumento.",
   "por_que_antes_do_proximo": "Antes de Antígona porque leva do cálculo da felicidade ao dilema trágico."},
  {"id": 77, "nivel": 2, "ordem_no_nivel": 5, "autor": "Sófocles", "titulo": "Antígona", "ano": "c. 441 a.C.", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A lei não escrita da consciência e da família pode se opor à lei da cidade.",
   "acrescenta": "O conflito entre lei e consciência em forma trágica.",
   "por_que_antes_do_proximo": "Antes de Huxley porque, da lei contra a consciência, passa-se a um mundo em que a consciência foi dissolvida."},
  {"id": 78, "nivel": 2, "ordem_no_nivel": 6, "autor": "Aldous Huxley", "titulo": "Admirável Mundo Novo", "ano": "1932", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O controle mais eficaz usa o prazer e o condicionamento, não a dor.",
   "acrescenta": "Contraponto a Orwell: dominação pelo consentimento prazeroso.",
   "por_que_antes_do_proximo": "Antes de Achebe porque, depois do controle imaginado, vem uma sociedade real desfeita pelo contato colonial."},
  {"id": 79, "nivel": 2, "ordem_no_nivel": 7, "autor": "Chinua Achebe", "titulo": "O Mundo se Despedaça", "ano": "1958", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O mundo igbo tinha ordem e dignidade próprias, desfeitas pelo colonialismo e pela missão cristã.",
   "acrescenta": "Cultura africana vista por dentro, contraponto às narrativas coloniais.",
   "por_que_antes_do_proximo": "Antes de Lima Barreto porque outra sociedade é ridicularizada por um projeto de nação, agora no Brasil."},
  {"id": 80, "nivel": 2, "ordem_no_nivel": 8, "autor": "Lima Barreto", "titulo": "Triste Fim de Policarpo Quaresma", "ano": "1915", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O nacionalismo ingênuo e a burocracia republicana esmagam o idealista Policarpo Quaresma.",
   "acrescenta": "O Brasil republicano visto com sátira amarga, perspectiva distinta da de Machado.",
   "por_que_antes_do_proximo": "Antes de Eliade porque, depois da sátira social, vem o conceito de sagrado."},
  {"id": 81, "nivel": 2, "ordem_no_nivel": 9, "autor": "Mircea Eliade", "titulo": "O Sagrado e o Profano", "ano": "1957", "area": "Antropologia", "classe": "PORTA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O homem religioso vive num espaço e num tempo sagrados, e o homem moderno os dessacraliza.",
   "acrescenta": "Fenomenologia da religião: vocabulário para ler catolicismo e antropologia.",
   "por_que_antes_do_proximo": "Antes de Merton porque dá o conceito para ler uma conversão vivida."},
  {"id": 82, "nivel": 2, "ordem_no_nivel": 10, "autor": "Thomas Merton", "titulo": "A Montanha dos Sete Patamares", "ano": "1948", "area": "Catolicismo", "classe": "PORTA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A conversão é um caminho de inquietação que termina na vida monástica.",
   "acrescenta": "Conversão no século XX, de intelectual moderno a monge trapista; companheiro de Agostinho.",
   "por_que_antes_do_proximo": "Antes de Stark porque passa da conversão individual ao crescimento do cristianismo como movimento."},
  {"id": 83, "nivel": 2, "ordem_no_nivel": 11, "autor": "Rodney Stark", "titulo": "O Crescimento do Cristianismo", "ano": "1996", "area": "História da Igreja", "classe": "MAPA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O cristianismo cresceu por redes sociais, cuidado com os doentes e fertilidade, e não por conversões em massa.",
   "acrescenta": "Sociologia da religião aplicada à Igreja primitiva, contraponto a leituras puramente teológicas.",
   "por_que_antes_do_proximo": "Antes de Sowell porque a pergunta passa de como as crenças se espalham para como as visões de mundo se enfrentam."},
  {"id": 84, "nivel": 2, "ordem_no_nivel": 12, "autor": "Thomas Sowell", "titulo": "Conflito de Visões", "ano": "1987", "area": "Política", "classe": "MAPA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Os conflitos políticos persistem porque nascem de visões opostas e pré-analíticas da natureza humana: restrita e irrestrita.",
   "acrescenta": "Tipologia de visões de mundo, útil para ler Burke e Rousseau, Hayek e Polanyi.",
   "por_que_antes_do_proximo": "Fecha o nível dando vocabulário para as discussões políticas dos níveis seguintes."},

  {"id": 85, "nivel": 3, "ordem_no_nivel": 1, "autor": "Michel de Montaigne", "titulo": "Ensaios", "ano": "1580", "area": "Filosofia", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": true, "idioma_leitura": "pt",
   "tese": "Examinar a própria experiência e duvidar de certezas fáceis é a forma mais honesta de pensar.",
   "acrescenta": "O ensaio como gênero e o ceticismo pessoal, contraponto a Descartes.",
   "por_que_antes_do_proximo": "Antes de Hume porque ambos duvidam, Montaigne pela experiência, Hume pela análise."},
  {"id": 86, "nivel": 3, "ordem_no_nivel": 2, "autor": "David Hume", "titulo": "Investigação sobre o Entendimento Humano", "ano": "1748", "area": "Filosofia", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Todo conhecimento vem da experiência, e a causalidade é hábito, não necessidade demonstrada.",
   "acrescenta": "O problema da indução e o empirismo cético, que Kant dirá tê-lo despertado.",
   "por_que_antes_do_proximo": "Antes de Popper porque Popper responde ao problema da indução."},
  {"id": 87, "nivel": 3, "ordem_no_nivel": 3, "autor": "Karl Popper", "titulo": "Conjecturas e Refutações", "ano": "1963", "area": "Filosofia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Uma teoria é científica se pode, em princípio, ser refutada.",
   "acrescenta": "A falseabilidade como critério, usada por Popper para criticar o marxismo e a psicanálise.",
   "por_que_antes_do_proximo": "Antes de Kuhn porque Kuhn contesta a imagem de ciência de Popper."},
  {"id": 88, "nivel": 3, "ordem_no_nivel": 4, "autor": "Thomas S. Kuhn", "titulo": "A Estrutura das Revoluções Científicas", "ano": "1962", "area": "Filosofia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A ciência avança por revoluções entre paradigmas, e não por acúmulo contínuo.",
   "acrescenta": "Sociologia e história da ciência, contraponto a Popper.",
   "por_que_antes_do_proximo": "Antes de Mill porque, se a ciência depende de comunidades, importa a liberdade de discussão que Mill defende."},
  {"id": 89, "nivel": 3, "ordem_no_nivel": 5, "autor": "John Stuart Mill", "titulo": "Sobre a Liberdade", "ano": "1859", "area": "Política", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A sociedade só pode limitar a liberdade individual para evitar dano a outros, e a discussão livre protege a verdade.",
   "acrescenta": "O liberalismo clássico da liberdade de expressão, contraponto a Burke e Hobbes.",
   "por_que_antes_do_proximo": "Antes de Ginzburg porque Ginzburg mostra o preço de pensar diferente, pago por um moleiro."},
  {"id": 90, "nivel": 3, "ordem_no_nivel": 6, "autor": "Carlo Ginzburg", "titulo": "O Queijo e os Vermes", "ano": "1976", "area": "História", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Os processos da Inquisição revelam o pensamento de um moleiro, Menocchio, que recria a cosmologia a seu modo.",
   "acrescenta": "Micro-história: a visão de um homem comum, contra a história só de elites.",
   "por_que_antes_do_proximo": "Antes de Caio Prado porque passa da escala de um homem para a de uma colônia."},
  {"id": 91, "nivel": 3, "ordem_no_nivel": 7, "autor": "Caio Prado Júnior", "titulo": "Formação do Brasil Contemporâneo", "ano": "1942", "area": "História", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A colônia se organizou como empresa de exportação para o mercado europeu, e essa origem marca o país.",
   "acrescenta": "Interpretação marxista da formação do Brasil; contraponto a Freyre e par de Furtado.",
   "por_que_antes_do_proximo": "Antes de Eusébio porque sai do Brasil e volta às origens da Igreja."},
  {"id": 92, "nivel": 3, "ordem_no_nivel": 8, "autor": "Eusébio de Cesareia", "titulo": "História Eclesiástica", "ano": "c. 324–325", "area": "História da Igreja", "classe": "MAPA", "resumo_permitido": "sim", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A história da Igreja é a sucessão apostólica e a resistência dos mártires.",
   "acrescenta": "A fonte mais antiga da história da Igreja, escrita por um bispo; leia com o olhar crítico de Stark e Duffy.",
   "por_que_antes_do_proximo": "Antes de Lewis porque, da Igreja que nasce, passa-se à defesa moderna dos valores objetivos."},
  {"id": 93, "nivel": 3, "ordem_no_nivel": 9, "autor": "C. S. Lewis", "titulo": "The Abolition of Man", "ano": "1943", "area": "Catolicismo", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "en",
   "tese": "Se os valores são mera convenção, a educação os destrói e deixa o homem sem direção; existe uma lei moral comum às culturas.",
   "acrescenta": "Argumento contra o relativismo, curto e em inglês; contraponto a Nietzsche. Lewis é anglicano, não católico, mas útil como leitura de contraste.",
   "por_que_antes_do_proximo": "Antes de Kafka porque, depois dos valores objetivos, vem o mundo em que a lei se tornou opaca."},
  {"id": 94, "nivel": 3, "ordem_no_nivel": 10, "autor": "Franz Kafka", "titulo": "O Processo", "ano": "1925", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Um homem é processado por um tribunal que nunca revela a acusação, e a culpa é ao mesmo tempo existencial e burocrática.",
   "acrescenta": "Alegoria do poder e da culpa impessoais; par de Orwell e Foucault.",
   "por_que_antes_do_proximo": "Antes de Borges porque o labirinto de Kafka vira jogo intelectual em Borges."},
  {"id": 95, "nivel": 3, "ordem_no_nivel": 11, "autor": "Jorge Luis Borges", "titulo": "Ficções", "ano": "1944", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A realidade, o tempo e o conhecimento são labirintos construídos por livros e ideias.",
   "acrescenta": "Literatura como filosofia em forma curta; metafísica fantástica.",
   "por_que_antes_do_proximo": "Antes de Greene porque, depois do labirinto abstrato, vem o drama moral concreto de um padre."},
  {"id": 96, "nivel": 3, "ordem_no_nivel": 12, "autor": "Graham Greene", "titulo": "O Poder e a Glória", "ano": "1940", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Um padre fraco e perseguido conserva, em seu pecado, uma fidelidade que a ortodoxia não mede.",
   "acrescenta": "Catolicismo e falibilidade em ficção, par de Endō.",
   "por_que_antes_do_proximo": "Fecha o nível voltando ao catolicismo vivido, e prepara a discussão sobre fé e democracia de Tocqueville e Newman."},

  {"id": 97, "nivel": 4, "ordem_no_nivel": 1, "autor": "Alexis de Tocqueville", "titulo": "A Democracia na América", "ano": "1835–40", "area": "Política", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A igualdade de condições molda a democracia e traz o risco de conformismo e despotismo brando.",
   "acrescenta": "A democracia vista por um aristocrata; mesmo tema de Burke.",
   "por_que_antes_do_proximo": "Antes de Said porque Tocqueville observa a América de fora, e Said examina o olhar europeu sobre o outro."},
  {"id": 98, "nivel": 4, "ordem_no_nivel": 2, "autor": "Edward Said", "titulo": "Orientalismo", "ano": "1978", "area": "Sociologia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O Ocidente construiu o ‘Oriente’ como o outro inferior para poder dominá-lo.",
   "acrescenta": "Crítica pós-colonial do discurso; contraponto ao olhar eurocêntrico de boa parte da lista.",
   "por_que_antes_do_proximo": "Antes de Fanon porque passa da crítica do discurso à luta anticolonial."},
  {"id": 99, "nivel": 4, "ordem_no_nivel": 3, "autor": "Frantz Fanon", "titulo": "Os Condenados da Terra", "ano": "1961", "area": "Política", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A descolonização é um processo violento que desfaz o mundo dividido entre colono e colonizado.",
   "acrescenta": "O anticolonialismo radical, contraponto à ética da responsabilidade de Weber.",
   "por_que_antes_do_proximo": "Antes de Elias porque Fanon trata da violência política, e Elias, de como a civilização a monopolizou."},
  {"id": 100, "nivel": 4, "ordem_no_nivel": 4, "autor": "Norbert Elias", "titulo": "O Processo Civilizador", "ano": "1939", "area": "Sociologia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A civilização é um processo longo de autocontrole individual e monopolização estatal da violência.",
   "acrescenta": "Sociologia histórica da psicologia e dos costumes, contraponto a Rousseau.",
   "por_que_antes_do_proximo": "Antes de Mauss porque, depois da ordem do Estado, vem a ordem anterior da dádiva."},
  {"id": 101, "nivel": 4, "ordem_no_nivel": 5, "autor": "Marcel Mauss", "titulo": "Ensaio sobre a Dádiva", "ano": "1925", "area": "Antropologia", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A troca arcaica é dádiva obrigatória que cria laços, não mercado.",
   "acrescenta": "A origem social da economia; contraponto a Smith e Hazlitt.",
   "por_que_antes_do_proximo": "Antes de Schumpeter porque da dádiva passa-se ao capitalismo como destruição criadora."},
  {"id": 102, "nivel": 4, "ordem_no_nivel": 6, "autor": "Joseph Schumpeter", "titulo": "Capitalismo, Socialismo e Democracia", "ano": "1942", "area": "Economia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O capitalismo se move por inovação que destrói estruturas e, ao ter êxito, corrói seus próprios fundamentos sociais.",
   "acrescenta": "Posição intermediária entre Hayek e Marx: admiração pelo capitalismo e previsão de seu declínio.",
   "por_que_antes_do_proximo": "Antes de James porque da economia a leitura volta ao interior religioso."},
  {"id": 103, "nivel": 4, "ordem_no_nivel": 7, "autor": "William James", "titulo": "As Variedades da Experiência Religiosa", "ano": "1902", "area": "Psicologia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A religião deve ser estudada como experiência pessoal, e sua verdade se mede também por seus frutos.",
   "acrescenta": "Psicologia da religião, contraponto à crítica de Freud.",
   "por_que_antes_do_proximo": "Antes de Weil porque James analisa a experiência de fora, e Weil a vive pela atenção."},
  {"id": 104, "nivel": 4, "ordem_no_nivel": 8, "autor": "Simone Weil", "titulo": "A Gravidade e a Graça", "ano": "1947", "area": "Filosofia", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A graça só entra onde o eu se esvazia; o desprendimento e a atenção são o caminho.",
   "acrescenta": "Mística filosófica fragmentária, entre Pascal e Kierkegaard.",
   "por_que_antes_do_proximo": "Antes de Newman porque passa da experiência mística à reflexão sobre como a fé amadurece."},
  {"id": 105, "nivel": 4, "ordem_no_nivel": 9, "autor": "John Henry Newman", "titulo": "Apologia Pro Vita Sua", "ano": "1864", "area": "Catolicismo", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Sua conversão ao catolicismo foi um desenvolvimento honesto e racional da própria consciência.",
   "acrescenta": "Autobiografia intelectual de um convertido; par de Agostinho e Merton.",
   "por_que_antes_do_proximo": "Antes de Ratzinger porque, da fé de um convertido do século XIX, vai-se à fé explicada ao homem moderno."},
  {"id": 106, "nivel": 4, "ordem_no_nivel": 10, "autor": "Joseph Ratzinger", "titulo": "Introdução ao Cristianismo", "ano": "1968", "area": "Catolicismo", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A fé cristã é uma escolha razoável pelo sentido, e o Credo responde ao ‘eu’ moderno.",
   "acrescenta": "Teologia sistemática de um futuro papa; contraponto a Boff.",
   "por_que_antes_do_proximo": "Antes de Dom Quixote porque dá a fé em forma de argumento, e Cervantes a testa em forma de ironia."},
  {"id": 107, "nivel": 4, "ordem_no_nivel": 11, "autor": "Miguel de Cervantes", "titulo": "Dom Quixote", "ano": "1605/1615", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": true, "idioma_leitura": "pt",
   "tese": "O idealista louco e o escudeiro prático mostram a grandeza e o ridículo de viver segundo livros.",
   "acrescenta": "O romance como choque entre ideal e realidade; ironia que prepara Machado.",
   "por_que_antes_do_proximo": "Antes de Os Sertões porque, depois do ideal individual que se choca com o real, vem um ideal coletivo que se choca com o Estado."},
  {"id": 108, "nivel": 4, "ordem_no_nivel": 12, "autor": "Euclides da Cunha", "titulo": "Os Sertões", "ano": "1902", "area": "Literatura", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A guerra de Canudos revela um Brasil dividido entre o litoral e o sertão, e a violência do Estado que o ignora.",
   "acrescenta": "Ciência, literatura e denúncia na mesma prosa; par de Rosa.",
   "por_que_antes_do_proximo": "Fecha o nível e prepara a densidade teórica do nível 5."},

  {"id": 109, "nivel": 5, "ordem_no_nivel": 1, "autor": "Antonio Gramsci", "titulo": "Cadernos do Cárcere (seleção)", "ano": "1929–35", "area": "Política", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O poder se mantém por hegemonia, isto é, por consentimento cultural, e não só pela força.",
   "acrescenta": "Marxismo que valoriza cultura e intelectuais, contraponto ao economicismo.",
   "por_que_antes_do_proximo": "Antes de Schmitt porque Gramsci vê o poder como consentimento, e Schmitt, como decisão."},
  {"id": 110, "nivel": 5, "ordem_no_nivel": 2, "autor": "Carl Schmitt", "titulo": "O Conceito do Político", "ano": "1932", "area": "Política", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O político se define pela distinção entre amigo e inimigo, e soberano é quem decide o estado de exceção.",
   "acrescenta": "Crítica do liberalismo por um autor ligado ao regime nazista; leitura difícil e necessária para entender o poder.",
   "por_que_antes_do_proximo": "Antes de Rawls porque Schmitt nega o que Rawls tenta fundar: justiça sem inimigo."},
  {"id": 111, "nivel": 5, "ordem_no_nivel": 3, "autor": "John Rawls", "titulo": "Uma Teoria da Justiça", "ano": "1971", "area": "Política", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Os princípios de justiça são os que escolheríamos sem saber nossa posição social (véu da ignorância).",
   "acrescenta": "Liberalismo igualitário, contraponto a Hayek e Hobbes.",
   "por_que_antes_do_proximo": "Antes de Ostrom porque, depois da justiça distributiva, vê-se comunidades que gerem recursos sem Estado nem mercado."},
  {"id": 112, "nivel": 5, "ordem_no_nivel": 4, "autor": "Elinor Ostrom", "titulo": "O Governo dos Bens Comuns", "ano": "1990", "area": "Economia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Comunidades podem gerir bens comuns com regras próprias, evitando tanto a privatização quanto o controle estatal.",
   "acrescenta": "Terceira via empírica; contraponto à ‘tragédia dos comuns’.",
   "por_que_antes_do_proximo": "Antes de Mises porque da gestão coletiva passa-se à lógica do indivíduo."},
  {"id": 113, "nivel": 5, "ordem_no_nivel": 5, "autor": "Ludwig von Mises", "titulo": "Ação Humana", "ano": "1949", "area": "Economia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A economia deriva por dedução da ação humana intencional, e sem preços de mercado o cálculo econômico é impossível.",
   "acrescenta": "Fundamento da escola austríaca; contraponto a Keynes e Marx.",
   "por_que_antes_do_proximo": "Antes de Keynes porque do indivíduo dedutivo passa-se aos agregados e à incerteza."},
  {"id": 114, "nivel": 5, "ordem_no_nivel": 6, "autor": "John Maynard Keynes", "titulo": "Teoria Geral do Emprego, do Juro e da Moeda", "ano": "1936", "area": "Economia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O desemprego pode persistir por demanda insuficiente, e o Estado deve estimular a economia.",
   "acrescenta": "Macroeconomia moderna; contraponto a Hayek e Mises.",
   "por_que_antes_do_proximo": "Antes de Bourdieu porque da economia monetária passa-se ao capital simbólico."},
  {"id": 115, "nivel": 5, "ordem_no_nivel": 7, "autor": "Pierre Bourdieu", "titulo": "O Poder Simbólico", "ano": "1989", "area": "Sociologia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O poder simbólico funciona quando é reconhecido como legítimo por quem o sofre.",
   "acrescenta": "Sociologia da dominação cultural, ponte entre Marx e Weber.",
   "por_que_antes_do_proximo": "Antes de Geertz porque dá a estrutura social do simbólico, e Geertz dá a leitura da cultura como texto."},
  {"id": 116, "nivel": 5, "ordem_no_nivel": 8, "autor": "Clifford Geertz", "titulo": "A Interpretação das Culturas", "ano": "1973", "area": "Antropologia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Cultura é uma teia de significados que o antropólogo interpreta, como se lê um texto.",
   "acrescenta": "Antropologia interpretativa, contraponto a Harris.",
   "por_que_antes_do_proximo": "Antes de Viveiros de Castro porque Geertz interpreta o outro, e Viveiros leva a sério o ponto de vista do outro como metafísica."},
  {"id": 117, "nivel": 5, "ordem_no_nivel": 9, "autor": "Eduardo Viveiros de Castro", "titulo": "Metafísicas Canibais", "ano": "2009", "area": "Antropologia", "classe": "OBRA", "resumo_permitido": "nao", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Povos ameríndios pensam o mundo pelo perspectivismo: humanos e não humanos se veem como pessoas.",
   "acrescenta": "Antropologia brasileira de ponta, que desafia a divisão entre natureza e cultura.",
   "por_que_antes_do_proximo": "Antes de Ibn Khaldun porque, depois do outro como pensador, vem um pensador de fora do Ocidente."},
  {"id": 118, "nivel": 5, "ordem_no_nivel": 10, "autor": "Ibn Khaldun", "titulo": "Os Prolegômenos (Al-Muqaddima)", "ano": "1377", "area": "História", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "Os impérios sobem e caem em ciclos movidos pela coesão do grupo (asabiyya).",
   "acrescenta": "Filosofia da história fora do Ocidente, séculos antes de Vico e Marx.",
   "por_que_antes_do_proximo": "Antes de Crary porque dos ciclos de poder vai-se ao tempo do corpo sob o capitalismo."},
  {"id": 119, "nivel": 5, "ordem_no_nivel": 11, "autor": "Jonathan Crary", "titulo": "24/7: Capitalismo Tardio e os Fins do Sono", "ano": "2013", "area": "Psicologia", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "O capitalismo tardio tende a eliminar o tempo de sono, um dos últimos intervalos não mercantilizados.",
   "acrescenta": "O sono como questão política, em diálogo com Foucault e com seu interesse por sono e comportamento.",
   "por_que_antes_do_proximo": "Antes de Boff porque do corpo disciplinado vai-se à instituição que disciplina almas."},
  {"id": 120, "nivel": 5, "ordem_no_nivel": 12, "autor": "Leonardo Boff", "titulo": "Igreja: Carisma e Poder", "ano": "1981", "area": "Catolicismo", "classe": "MAPA", "resumo_permitido": "estrutura", "obra_de_vida": false, "idioma_leitura": "pt",
   "tese": "A Igreja deve se reformar em direção a estruturas mais participativas, denunciando o poder clerical que se afasta do Evangelho.",
   "acrescenta": "Teologia da libertação; livro que motivou um processo doutrinário no Vaticano e contraponto direto a Ratzinger.",
   "por_que_antes_do_proximo": "Fecha a lista voltando à Igreja como instituição de poder e ao conflito entre fé e estrutura."}
];

const NOVAS_RELACOES_USUARIO = [
  {"de": 74, "para": 31, "tipo": "contraponto", "nota": "Natureza humana inata contra comportamento moldado por reforços."},
  {"de": 74, "para": 33, "tipo": "contraponto", "nota": "Natureza humana evoluída contra o bom selvagem corrompido pela sociedade."},
  {"de": 75, "para": 31, "tipo": "contraponto", "nota": "Psicologia humanista contra behaviorismo."},
  {"de": 75, "para": 76, "tipo": "contraponto", "nota": "Otimismo sobre o crescimento pessoal contra pessimismo filosófico."},
  {"de": 62, "para": 116, "tipo": "contraponto", "nota": "Explicação material da cultura contra interpretação de significados."},
  {"de": 65, "para": 25, "tipo": "contraponto", "nota": "Política pela eficácia contra política pelo conhecimento do Bem."},
  {"de": 65, "para": 49, "tipo": "mesmo_tema", "nota": "Realismo político, em tratado e em história."},
  {"de": 89, "para": 44, "tipo": "contraponto", "nota": "Liberdade individual e crítica da tradição contra a herança de gerações."},
  {"de": 110, "para": 111, "tipo": "contraponto", "nota": "Política como amigo-inimigo contra justiça fundada em acordo."},
  {"de": 110, "para": 32, "tipo": "mesmo_tema", "nota": "O soberano como quem decide."},
  {"de": 111, "para": 42, "tipo": "contraponto", "nota": "Liberalismo igualitário contra o argumento antidirigista."},
  {"de": 112, "para": 113, "tipo": "contraponto", "nota": "Gestão comunitária contra individualismo metodológico."},
  {"de": 112, "para": 43, "tipo": "mesmo_tema", "nota": "Mercado e comunidade como instituições socialmente enraizadas."},
  {"de": 113, "para": 114, "tipo": "contraponto", "nota": "Dedução da ação individual contra análise de agregados e incerteza."},
  {"de": 113, "para": 42, "tipo": "mesmo_tema", "nota": "Escola austríaca e crítica do planejamento central."},
  {"de": 114, "para": 42, "tipo": "contraponto", "nota": "Intervenção estatal contra liberdade de mercado."},
  {"de": 109, "para": 55, "tipo": "mesmo_tema", "nota": "Desenvolvimento do marxismo para a cultura."},
  {"de": 109, "para": 110, "tipo": "contraponto", "nota": "Hegemonia por consentimento contra poder como decisão."},
  {"de": 102, "para": 55, "tipo": "mesmo_tema", "nota": "Dinâmica interna do capitalismo e seu possível fim."},
  {"de": 99, "para": 98, "tipo": "mesmo_tema", "nota": "Pensamento anticolonial, na ação e no discurso."},
  {"de": 99, "para": 22, "tipo": "contraponto", "nota": "Violência como libertação contra ética da responsabilidade."},
  {"de": 97, "para": 44, "tipo": "mesmo_tema", "nota": "Reflexão conservadora-liberal sobre revolução e democracia."},
  {"de": 100, "para": 33, "tipo": "contraponto", "nota": "Civilização como autocontrole contra civilização como corrupção."},
  {"de": 100, "para": 32, "tipo": "mesmo_tema", "nota": "Estado e monopólio da violência."},
  {"de": 101, "para": 41, "tipo": "contraponto", "nota": "Dádiva e laço social contra troca de mercado."},
  {"de": 103, "para": 30, "tipo": "contraponto", "nota": "Religião como experiência com frutos contra religião como ilusão."},
  {"de": 104, "para": 37, "tipo": "mesmo_tema", "nota": "Fé como angústia e graça."},
  {"de": 106, "para": 120, "tipo": "contraponto", "nota": "Ortodoxia sistemática contra teologia da libertação."},
  {"de": 120, "para": 40, "tipo": "mesmo_tema", "nota": "Doutrina social e a pergunta pelo poder na Igreja."},
  {"de": 93, "para": 52, "tipo": "contraponto", "nota": "Lei moral objetiva contra genealogia da moral."},
  {"de": 87, "para": 88, "tipo": "contraponto", "nota": "Refutação como critério contra revoluções de paradigma."},
  {"de": 87, "para": 30, "tipo": "contraponto", "nota": "Falseabilidade como crítica à psicanálise."},
  {"de": 86, "para": 73, "tipo": "contraponto", "nota": "Empirismo cético contra racionalismo."},
  {"de": 86, "para": 50, "tipo": "mesmo_tema", "nota": "Kant responde a Hume."},
  {"de": 85, "para": 73, "tipo": "contraponto", "nota": "Dúvida pessoal e ensaio contra dúvida sistemática."},
  {"de": 67, "para": 68, "tipo": "contraponto", "nota": "Virtude pela vontade contra humildade e graça."},
  {"de": 67, "para": 13, "tipo": "mesmo_tema", "nota": "Como viver diante da finitude."},
  {"de": 68, "para": 27, "tipo": "mesmo_tema", "nota": "Interioridade cristã."},
  {"de": 118, "para": 32, "tipo": "mesmo_tema", "nota": "Teoria do Estado e da coesão política."},
  {"de": 118, "para": 57, "tipo": "mesmo_tema", "nota": "Pensar a política fora do modelo ocidental."},
  {"de": 119, "para": 60, "tipo": "mesmo_tema", "nota": "Sono e sonho como objeto de teoria."},
  {"de": 119, "para": 47, "tipo": "mesmo_tema", "nota": "Precarização da vida contemporânea."},
  {"de": 115, "para": 29, "tipo": "mesmo_tema", "nota": "Fatos sociais e legitimidade simbólica."},
  {"de": 116, "para": 117, "tipo": "mesmo_tema", "nota": "Do interpretar a cultura ao levar a sério o pensamento do outro."},
  {"de": 117, "para": 57, "tipo": "mesmo_tema", "nota": "Etnologia indígena e crítica da separação Estado-sociedade."},
  {"de": 91, "para": 46, "tipo": "mesmo_tema", "nota": "Interpretação estrutural da formação econômica do Brasil."},
  {"de": 91, "para": 34, "tipo": "contraponto", "nota": "Colônia como empresa mercantil contra colônia como intimidade patriarcal."},
  {"de": 90, "para": 19, "tipo": "mesmo_tema", "nota": "Método histórico aplicado a fontes concretas."},
  {"de": 64, "para": 58, "tipo": "mesmo_tema", "nota": "Estado e cidadania no Brasil."},
  {"de": 66, "para": 41, "tipo": "mesmo_tema", "nota": "A ética na origem da economia clássica."},
  {"de": 84, "para": 23, "tipo": "contraponto", "nota": "Visão restrita contra crítica heterodoxa do capitalismo."},
  {"de": 78, "para": 3, "tipo": "contraponto", "nota": "Controle pelo prazer contra controle pelo medo."},
  {"de": 79, "para": 99, "tipo": "mesmo_tema", "nota": "O mundo colonial, na ficção e no ensaio."},
  {"de": 80, "para": 16, "tipo": "mesmo_tema", "nota": "Sátira do Brasil por dois autores distintos."},
  {"de": 94, "para": 3, "tipo": "mesmo_tema", "nota": "Poder impessoal e culpa."},
  {"de": 94, "para": 56, "tipo": "mesmo_tema", "nota": "Vigilância e instituição que julga."},
  {"de": 96, "para": 39, "tipo": "mesmo_tema", "nota": "O padre fraco e a fidelidade."},
  {"de": 107, "para": 16, "tipo": "mesmo_tema", "nota": "Ironia sobre ideais e realidade."},
  {"de": 108, "para": 59, "tipo": "mesmo_tema", "nota": "O sertão por ciência e por romance."},
  {"de": 70, "para": 4, "tipo": "mesmo_tema", "nota": "A vida severina e a vida seca."},
  {"de": 71, "para": 70, "tipo": "mesmo_tema", "nota": "O Nordeste por fé e humor e por poesia."},
  {"de": 81, "para": 21, "tipo": "mesmo_tema", "nota": "Mito e símbolo na experiência religiosa."},
  {"de": 82, "para": 27, "tipo": "mesmo_tema", "nota": "Narrativas de conversão."},
  {"de": 105, "para": 27, "tipo": "mesmo_tema", "nota": "Narrativas de conversão intelectual."},
  {"de": 83, "para": 28, "tipo": "mesmo_tema", "nota": "A Igreja vista por historiadores e sociólogos."},
  {"de": 83, "para": 92, "tipo": "mesmo_tema", "nota": "Igreja primitiva em duas leituras."},
  {"de": 63, "para": 19, "tipo": "mesmo_tema", "nota": "Teoria e método da história."}
];

// Capas confirmadas em Português (e inglês para #72 e #93)
const CAPAS_CONFIRMADAS_LEVA_2 = {
  65: 'https://covers.openlibrary.org/b/isbn/9788528601893-L.jpg', // O Príncipe (Bertrand Brasil)
  66: 'https://covers.openlibrary.org/b/isbn/9788535911190-L.jpg', // Vícios Privados (Companhia das Letras)
  67: 'https://covers.openlibrary.org/b/id/13264786-L.jpg',         // Meditações (Marco Aurélio em Português)
  68: 'https://covers.openlibrary.org/b/isbn/9788532667120-L.jpg', // Imitação de Cristo (Vozes)
  70: 'https://covers.openlibrary.org/b/isbn/9788560281329-L.jpg', // Morte e Vida Severina (Alfaguara)
  71: 'https://covers.openlibrary.org/b/isbn/9788520938393-L.jpg', // Auto da Compadecida (Nova Fronteira)
  72: 'https://covers.openlibrary.org/b/isbn/9780205309023-L.jpg', // The Elements of Style [EN] (Pearson/Longman)
  73: 'https://covers.openlibrary.org/b/isbn/9788533621183-L.jpg', // Meditações Metafísicas (Martins Fontes)
  74: 'https://covers.openlibrary.org/b/isbn/9788535905069-L.jpg', // Tábula Rasa (Companhia das Letras)
  75: 'https://covers.openlibrary.org/b/isbn/9788533624023-L.jpg', // Tornar-se Pessoa (Martins Fontes)
  76: 'https://covers.openlibrary.org/b/isbn/9788533616073-L.jpg', // Aforismos para a Sabedoria de Vida (Martins Fontes)
  80: 'https://covers.openlibrary.org/b/isbn/9788563560247-L.jpg', // Triste Fim de Policarpo Quaresma (Penguin-Companhia)
  81: 'https://covers.openlibrary.org/b/isbn/9788533600539-L.jpg', // O Sagrado e o Profano (Martins Fontes)
  85: 'https://covers.openlibrary.org/b/isbn/9788563560063-L.jpg', // Ensaios (Companhia das Letras)
  86: 'https://covers.openlibrary.org/b/isbn/9788571392601-L.jpg', // Investigação sobre o Entendimento Humano (Editora Unesp)
  88: 'https://covers.openlibrary.org/b/isbn/9788527301114-L.jpg', // A Estrutura das Revoluções Científicas (Perspectiva)
  89: 'https://covers.openlibrary.org/b/isbn/9788582850466-L.jpg', // Sobre a Liberdade (Penguin-Companhia)
  90: 'https://covers.openlibrary.org/b/isbn/9788535908107-L.jpg', // O Queijo e os Vermes (Companhia das Letras)
  91: 'https://covers.openlibrary.org/b/isbn/9788535919615-L.jpg', // Formação do Brasil Contemporâneo (Companhia das Letras)
  93: 'https://covers.openlibrary.org/b/isbn/9780060652944-L.jpg', // The Abolition of Man [EN] (HarperOne)
  94: 'https://covers.openlibrary.org/b/isbn/9788573262605-L.jpg', // O Processo (Editora 34)
  95: 'https://covers.openlibrary.org/b/isbn/9788535910902-L.jpg', // Ficções (Companhia das Letras)
  99: 'https://covers.openlibrary.org/b/isbn/9788537819128-L.jpg', // Os Condenados da Terra (Zahar)
  100: 'https://covers.openlibrary.org/b/isbn/9788571101913-L.jpg', // O Processo Civilizador (Zahar)
  108: 'https://covers.openlibrary.org/b/id/12746439-L.jpg',        // Os Sertões (Euclides da Cunha em Português)
  109: 'https://covers.openlibrary.org/b/id/13736927-L.jpg',        // Cadernos do Cárcere (Civilização Brasileira em Português)
  111: 'https://covers.openlibrary.org/b/id/8730434-L.jpg',         // Uma Teoria da Justiça (Martins Fontes em Português)
  113: 'https://covers.openlibrary.org/b/isbn/9788585054151-L.jpg', // Ação Humana (Instituto Mises Brasil)
  114: 'https://covers.openlibrary.org/b/id/9387695-L.jpg',         // Teoria Geral do Emprego (Nova Cultural em Português)
  115: 'https://covers.openlibrary.org/b/isbn/9788530803933-L.jpg', // O Poder Simbólico (Bertrand Brasil)
  117: 'https://covers.openlibrary.org/b/isbn/9788592886066-L.jpg', // Metafísicas Canibais (Ubu Editora)
  120: 'https://covers.openlibrary.org/b/id/4732326-L.jpg'          // Igreja: Carisma e Poder (Vozes em Português)
};

const SINOPSES_EDITORIAL_LEVA_2 = {
  61: "Clássico fundador da sociologia crítica que convida o leitor a cultivar a imaginação sociológica: a capacidade de discernir a intrincada conexão entre as biografias individuais e as grandes estruturas históricas, transformando inquietações privadas em questões públicas conscientes.",
  62: "Investigação antropológica provocadora sobre os enigmas da cultura humana, demonstrando pelo prisma do materialismo cultural que costumes aparentemente bizarros ou irracionais — como a vaca sagrada na Índia ou os tabus alimentares — possuem causas ecológicas e materiais concretas de sobrevivência.",
  63: "Reflexão indispensável sobre a epistemologia do ofício do historiador, demolindo o mito da objetividade pura dos fatos e definindo a história como um diálogo contínuo e sem fim entre o historiador no presente e os acontecimentos do passado.",
  64: "Exame histórico lúcido sobre a trajetória peculiar e invertida dos direitos no Brasil, onde a concessão precoce de direitos sociais precedeu a conquista dos direitos políticos e deixou os direitos civis cronicamente incompletos, forjando a figura do 'estadania'.",
  65: "O tratado fundador do realismo político moderno, que rompe em definitivo com as utopias morais clássicas para dissecar as engrenagens cruas do poder, da virtù e da fortuna na conquista e manutenção da estabilidade do Estado.",
  66: "Ensaio límpido e rigoroso sobre as raízes morais do pensamento econômico moderno, rastreando desde o paradoxo de Mandeville até a teoria dos sentimentos morais de Adam Smith a difícil conciliação entre o autointeresse individual e o bem comum.",
  67: "Diário espiritual íntimo do imperador filósofo de Roma, redigido nas campanhas militares do Danúbio, consagrado como a expressão máxima do estoicismo prático: a serenidade inabalável frente à impermanência da vida e o domínio vigilante sobre os próprios juízos.",
  68: "O mais influente clássico da mística cristã tardo-medieval (Devotio Moderna), exortando o crente ao desapego das vaidades transitórias do mundo, ao recolhimento interior da alma e à conformação filial da vontade pessoal à vida de Cristo.",
  69: "Coletânea memorável de relatos clínicos humanistas pelo célebre neurologista britânico, explorando as fronteiras enigmáticas do cérebro e da identidade humana através de pacientes que enfrentam perdas perceptivas extraordinárias sem perder sua dignidade de pessoas.",
  70: "Auto de Natal pernambucano de rigor formal geométrico e contundente força social, acompanhando a marcha fúnebre do retirante Severino da caatinga ao litoral, até o milagre silencioso da renovação da vida na beira do mangue.",
  71: "Obra-prima teatral do Movimento Armorial que entrelaça o auto medieval ibérico à literatura de cordel sertaneja, colocando as trapaças e a miséria de João Grilo e Chicó no tribunal celeste da misericórdia popular de Nossa Senhora.",
  72: "Guia conciso e canônico da prosa da língua inglesa, ensinando os preceitos clássicos da precisão estilística, da clareza sintática e da economia verbal — omit needless words — fundamental para a fluência e a leitura direta no idioma original.",
  73: "Marco inaugural da filosofia moderna ocidental, no qual Descartes implementa a dúvida metódica radical sobre o testemunho dos sentidos, erige a certeza irrefutável do cogito e reconstrói as bases do conhecimento, de Deus e da distinção mente-corpo.",
  74: "Defesa vigorosa da psicologia evolucionista e da existência de uma natureza humana inata, desferindo um ataque articulado aos dogmas da tábula rasa, do bom selvagem e do fantasma na máquina nas ciências humanas modernas.",
  75: "Trabalho seminal da psicologia humanista e da abordagem centrada na pessoa, sustentando que os seres humanos possuem uma tendência realizadora inata que floresce quando encontram empatia autêntica, congruência e consideração positiva incondicional.",
  76: "Destilação prática e desiludida da filosofia schopenhaueriana, orientando o indivíduo sobre como navegar pela existência entre o sofrimento e o tédio por meio da moderação de expectativas, da solidão criativa e do cultivo do espírito interior.",
  77: "Tragédia grega imortal sobre a colisão inexorável entre a lei sagrada da família e da consciência moral pessoal, encarnada por Antígona, e a razão de Estado e a ordem cívica imposta pelo tirano Creonte.",
  78: "Distopia clássica e profética sobre uma sociedade totalitária tecnologicamente perfeita, na qual os seres humanos são clonados em castas biológicas, condicionados ao prazer artificial e sedados pelo soma, aniquilando a liberdade e o sofrimento que definem a alma.",
  79: "Romance magistral da literatura pós-colonial africana, recriando com profundidade e dignidade a complexa ordem social e os ritos do povo igbo na Nigéria antes e durante o impacto desestabilizador do domínio imperial britânico.",
  80: "Sátira pungente e trágica sobre o nacionalismo ingênuo do major Policarpo Quaresma, confrontado com a burocracia insensível, o autoritarismo militar florianista e o descompasso crônico da Primeira República brasileira.",
  81: "Ensaio fundamental da história das religiões que distingue a experiência do 'homo religiosus' — que habita um cosmos ordenado e permeado por hierofanias — da dessacralização existencial característica do homem secularizado moderno.",
  82: "Autobiografia espiritual extraordinária narrando o percurso de Merton desde a juventude boêmia e intelectual secular até sua conversão ao catolicismo e entrada na ordem contemplativa dos monges trapistas no mosteiro de Gethsemani.",
  83: "Análise sociológica inovadora que desmistifica a expansão da fé cristã no Império Romano, demonstrando como redes sociais densas, cuidados médicos aos enfermos em epidemias e valorização familiar impulsionaram o movimento de forma exponencial.",
  84: "Estudo magistral da filosofia política comparada que elucida a cisão perene do debate público em torno de duas visões premissais sobre a natureza humana: a visão restrita (trágica/prudencial) e a visão irrestrita (utópica/racionalista).",
  85: "Obra seminal que fundou o ensaio moderno, onde Montaigne faz de si mesmo a matéria viva de seu livro, navegando com ceticismo tolerante e ironia sutil pelos costumes, pela vaidade do saber dogmático e pela arte de viver.",
  86: "Cume do empirismo britânico e demolidor de pretensões metafísicas, demonstrando que a relação de causa e efeito não é dedutível pela razão pura, mas fundamentada no hábito psicológico e na experiência acumulada.",
  87: "Trabalho axial da epistemologia contemporânea, formulando a falseabilidade como critério de demarcação científica genuína: o conhecimento progride não por acumulação indutiva, mas pela formulação de hipóteses ousadas e severas tentativas de refutação.",
  88: "Um dos textos mais influentes do século XX, demonstrando que o desenvolvimento científico não é linear e cumulativo, mas intercalado por períodos de ciência normal e rupturas revolucionárias onde paradigmas inconciliáveis competem entre si.",
  89: "Manifesto clássico do liberalismo democrático e da liberdade de expressão, formulando o 'princípio do dano' como único limite legítimo à coerção social sobre o indivíduo e sustentando que o debate livre é vital para a vitalidade da verdade.",
  90: "Marco sublime da micro-história italiana, reconstruindo minuciosamente através das atas inquisitoriais o universo cosmológico singular do moleiro Menocchio, ilustrando a vitalidade criativa e autônoma da cultura popular subalterna.",
  91: "Interpretação materialista e estrutural imprescindível da colonização brasileira, definindo o 'sentido da colonização' como a montagem de uma empresa agroexportadora subordinada às demandas mercantis da Europa, cujas sequelas moldaram o país.",
  92: "A primeira crônica histórica abrangente dos três séculos inaugurais da Igreja cristã, registrando com preciosidade documental as sucessões episcopais, os conflitos doutrinários e os atos heroicos dos mártires até a paz de Constantino.",
  93: "Defesa brilhante e cortante dos valores morais objetivos e do 'Tao' perene da humanidade, advertindo que o descarte do sentimento objetivo e o relativismo tecnocrático na educação culminarão inevitavelmente no descarte do próprio humano.",
  94: "Romance enigmático e opressor sobre Josef K., detido numa manhã sem que tenha feito qualquer mal, enredado numa maquinaria judicial labiríntica e inacessível que dramatiza o absurdo, a culpa e a fragilidade do indivíduo perante o poder impessoal.",
  95: "Coletânea canônica de contos que reinventou a literatura mundial, combinando erudição labiríntica, metafísica fantástica e jogos conceituais em torno do infinito, da memória, de livros infinitos e espelhos que multiplicam os universos.",
  96: "Drama moral profundo ambientado no México revolucionário anticlerical, seguindo a fuga desesperada do último padre católico clandestino — homem pecador e alcoólatra que, em meio a suas fraquezas, guarda uma santidade trágica e relutante.",
  97: "Análise insuperável das instituições republicanas e da sociedade civil norte-americana, investigando as consequências da igualdade de condições para a liberdade política e alertando com lucidez sobre os riscos do individualismo e do despotismo brando.",
  98: "Texto seminal da crítica pós-colonial que demonstra como o Ocidente produziu uma imagem discursiva, homogênea e exótica do 'Oriente' a serviço da hegemonia colonial europeia, entrelaçando literatura, filologia e poder geopolítico.",
  99: "Manifesto incisivo da libertação anticolonial, prefaciado por Sartre, analisando a violência estrutural imposta pelo colonizador e propondo a descolonização como processo desalienador pelo qual o povo oprimido recupera sua própria humanidade.",
  100: "Obra monumental da sociologia histórica examinando a evolução dos costumes, do pudor e do autocontrole emocional na Europa ocidental, vinculando as transformações da estrutura psíquica à monopolização estatal da violência física.",
  101: "Estudo antropológico fundacional sobre as formas arcaicas de troca nas sociedades tradicionais, demonstrando que a circulação de bens assenta-se na tríplice obrigação de dar, receber e retribuir, constituindo um 'fato social total' que tece o laço comunitário.",
  102: "Trabalho célebre da economia política que cunhou o conceito de 'destruição criadora' como motor vital do capitalismo, prevendo ao mesmo tempo que o próprio triunfo do sistema geraria uma burocratização e uma hostilidade intelectual capazes de erodi-lo.",
  103: "Estudo pioneiro da psicologia e do pragmatismo filosófico sobre os fenômenos da fé, da conversão e do misticismo, analisando a religião não pelas doutrinas eclesiásticas, mas pelos seus frutos e pela sua ressonância vital na consciência individual.",
  104: "Aforismos e meditações místicas de uma das mentes mais fulgurantes do século XX, refletindo sobre a gravidade que arrasta o mundo para o egoísmo e a força e a necessidade do esvaziamento do eu (décréation) para acolher a luz da graça divina.",
  105: "Defesa autobiográfica vibrante e honesta da evolução de sua consciência religiosa, documentando a trajetória espiritual e teológica que levou Newman a abandonar a Igreja da Inglaterra e ingressar no seio da Igreja Católica Romana.",
  106: "Conferências de Tubinga nas quais o futuro Papa Bento XVI interpreta o Credo apostólico para a mentalidade contemporânea, apresentando a fé cristã não como conjunto de normas frias, mas como acolhimento razoável do sentido e do amor que fundam o cosmos.",
  107: "O marco inaugural da narrativa moderna ocidental, encenando o embate sublime e cômico entre os nobres ideais de cavalaria do engenhoso fidalgo Dom Quixote e a rude realidade cotidiana corporificada em seu fiel escudeiro Sancho Pança.",
  108: "Monumento épico e dramático da literatura brasileira, conjugando ensaio sociogeográfico e reportagem de guerra para denunciar a carnificina militar republicana contra os sertanejos de Canudos liderados por Antônio Conselheiro.",
  109: "Reflexões capitais redigidas nos cárceres fascistas italianos, refundando o marxismo pela análise da hegemonia cultural, do consenso social, do papel dos intelectuais orgânicos e da guerra de posição no Estado ampliado moderno.",
  110: "Texto polêmico e denso que define a especificidade do político pelo critério irredutível da distinção entre amigo e inimigo, criticando o liberalismo despolitizante e estabelecendo as bases de sua teoria da decisão soberana.",
  111: "O mais importante tratado de filosofia moral e política do século XX, revitalizando a tradição do contrato social através dos conceitos de 'posição original' e 'véu da ignorância' para fundamentar princípios universalizáveis de justiça distributiva e liberdade.",
  112: "Obra laureada com o Prêmio Nobel de Economia que desafia os dogmas da intervenção estatal imperativa e da privatização forçada, demonstrando como comunidades locais ao redor do mundo gerenciam com êxito recursos de uso comum mediante regras autônomas.",
  113: "Tratado monumental da Escola Austríaca de Economia, deduzindo os fenômenos de mercado a partir do axioma irrefutável da ação humana intencional (praxeologia) e demonstrando a impossibilidade do cálculo econômico racional no socialismo.",
  114: "Trabalho revolucionário que refundou a macroeconomia no século XX, refutando a Lei de Say e demonstrando que as economias de mercado podem se estabilizar em equilíbrio com desemprego involuntário crônico sem intervenção fiscal deliberada do Estado.",
  115: "Conjunto seminal de ensaios articulando a sociologia da cultura e da dominação social, elucidando os conceitos fundamentais de 'campo', 'habitus' e 'violência simbólica', onde as hierarquias sociais se perpetuam com o consentimento tácito dos dominados.",
  116: "Manifesto da antropologia interpretativa propondo que o conceito de cultura é essencialmente semiótico: o homem vive amarrado em teias de significados que ele mesmo teceu, cabendo ao antropólogo realizar uma 'descrição densa' de sua tessitura simbólica.",
  117: "Obra fulcral da antropologia contemporânea formulando o perspectivismo ameríndio e o multinaturalismo, desestabilizando as certezas ontológicas do pensamento ocidental ao demonstrar como os povos indígenas concebem não-humanos como sujeitos de perspectiva.",
  118: "Monumento intelectual do pensamento islâmico medieval, pioneiro da sociologia e da filosofia da história, elaborando a teoria cíclica de ascensão e decadência dos impérios e dinastias movida pela coesão social solidária (asabiyya).",
  119: "Crítica filosófica contundente sobre a colonização do tempo humano pelo capitalismo ininterrupto e pelas redes globais 24/7, apontando o sono biológico como o último refúgio e barreira insubmissa contra a mercantilização absoluta da vida.",
  120: "Texto histórico da Teologia da Libertação que motivou o célebre processo doutrinário movido pela Congregação para a Doutrina da Fé no Vaticano, denunciando a concentração clerical de poder e conclamando a Igreja a estruturas eclesiais mais participativas e fraternas."
};

const EDICOES_CONFIRMADAS_LEVA_2 = {
  61: [{ editora: "Zahar", ano: 1982, isbn: "9788571101852" }],
  62: [{ editora: "Civilização Brasileira", ano: 1978, isbn: "8520000452" }],
  63: [{ editora: "Paz e Terra", ano: 2001, isbn: "9788521904151" }],
  64: [{ editora: "Civilização Brasileira", ano: 2001, isbn: "9788520005606" }],
  65: [{ editora: "Bertrand Brasil", ano: 1993, isbn: "9788528601893", capa_url: "https://covers.openlibrary.org/b/isbn/9788528601893-L.jpg" }],
  66: [{ editora: "Companhia das Letras", ano: 1993, isbn: "9788535911190", capa_url: "https://covers.openlibrary.org/b/isbn/9788535911190-L.jpg" }],
  67: [{ editora: "Edipro", ano: 2019, isbn: "9788577534173", capa_url: "https://covers.openlibrary.org/b/id/13264786-L.jpg" }],
  68: [{ editora: "Editora Vozes", ano: 2021, isbn: "9788532667120", capa_url: "https://covers.openlibrary.org/b/isbn/9788532667120-L.jpg" }],
  69: [{ editora: "Companhia das Letras", ano: 2006, isbn: "9788535907407" }],
  70: [{ editora: "Alfaguara", ano: 2007, isbn: "9788560281329", capa_url: "https://covers.openlibrary.org/b/isbn/9788560281329-L.jpg" }],
  71: [{ editora: "Nova Fronteira", ano: 2014, isbn: "9788520938393", capa_url: "https://covers.openlibrary.org/b/isbn/9788520938393-L.jpg" }],
  72: [{ editora: "Pearson / Longman", ano: 1999, isbn: "9780205309023", capa_url: "https://covers.openlibrary.org/b/isbn/9780205309023-L.jpg" }],
  73: [{ editora: "Martins Fontes", ano: 2005, isbn: "9788533621183", capa_url: "https://covers.openlibrary.org/b/isbn/9788533621183-L.jpg" }],
  74: [{ editora: "Companhia das Letras", ano: 2004, isbn: "9788535905069", capa_url: "https://covers.openlibrary.org/b/isbn/9788535905069-L.jpg" }],
  75: [{ editora: "Martins Fontes", ano: 2009, isbn: "9788533624023", capa_url: "https://covers.openlibrary.org/b/isbn/9788533624023-L.jpg" }],
  76: [{ editora: "Martins Fontes", ano: 2002, isbn: "9788533616073", capa_url: "https://covers.openlibrary.org/b/isbn/9788533616073-L.jpg" }],
  77: [{ editora: "Zahar", ano: 2008, isbn: "9788537803370" }],
  78: [{ editora: "Biblioteca Azul / Globo", ano: 2014, isbn: "9788525056009" }],
  79: [{ editora: "Companhia das Letras", ano: 2009, isbn: "9788535914108" }],
  80: [{ editora: "Penguin-Companhia", ano: 2011, isbn: "9788563560247", capa_url: "https://covers.openlibrary.org/b/isbn/9788563560247-L.jpg" }],
  81: [{ editora: "Martins Fontes", ano: 2001, isbn: "9788533600539", capa_url: "https://covers.openlibrary.org/b/isbn/9788533600539-L.jpg" }],
  82: [{ editora: "Editora Vozes", ano: 1998, isbn: "9788532619730" }],
  83: [{ editora: "Paulus Editora", ano: 2008, isbn: "9788534928236" }],
  84: [{ editora: "É Realizações", ano: 2011, isbn: "9788580330366" }],
  85: [{ editora: "Companhia das Letras", ano: 2010, isbn: "9788563560063", capa_url: "https://covers.openlibrary.org/b/isbn/9788563560063-L.jpg" }],
  86: [{ editora: "Editora Unesp", ano: 1999, isbn: "9788571392601", capa_url: "https://covers.openlibrary.org/b/isbn/9788571392601-L.jpg" }],
  87: [{ editora: "Editora UnB", ano: 1982, isbn: "9788523000561" }],
  88: [{ editora: "Editora Perspectiva", ano: 2006, isbn: "9788527301114", capa_url: "https://covers.openlibrary.org/b/isbn/9788527301114-L.jpg" }],
  89: [{ editora: "Penguin-Companhia", ano: 2011, isbn: "9788582850466", capa_url: "https://covers.openlibrary.org/b/isbn/9788582850466-L.jpg" }],
  90: [{ editora: "Companhia das Letras", ano: 2006, isbn: "9788535908107", capa_url: "https://covers.openlibrary.org/b/isbn/9788535908107-L.jpg" }],
  91: [{ editora: "Companhia das Letras", ano: 2011, isbn: "9788535919615", capa_url: "https://covers.openlibrary.org/b/isbn/9788535919615-L.jpg" }],
  92: [{ editora: "Paulus Editora", ano: 2000, isbn: "9788534915113" }],
  93: [{ editora: "HarperOne", ano: 2001, isbn: "9780060652944", capa_url: "https://covers.openlibrary.org/b/isbn/9780060652944-L.jpg" }],
  94: [{ editora: "Editora 34", ano: 2005, isbn: "9788573262605", capa_url: "https://covers.openlibrary.org/b/isbn/9788573262605-L.jpg" }],
  95: [{ editora: "Companhia das Letras", ano: 2007, isbn: "9788535910902", capa_url: "https://covers.openlibrary.org/b/isbn/9788535910902-L.jpg" }],
  96: [{ editora: "Editora Record", ano: 2002, isbn: "9788501062635" }],
  97: [{ editora: "WMF Martins Fontes", ano: 2005, isbn: "9788533620940" }],
  98: [{ editora: "Companhia das Letras", ano: 2007, isbn: "9788535910797" }],
  99: [{ editora: "Zahar", ano: 2022, isbn: "9788537819128", capa_url: "https://covers.openlibrary.org/b/isbn/9788537819128-L.jpg" }],
  100: [{ editora: "Zahar", ano: 1994, isbn: "9788571101913", capa_url: "https://covers.openlibrary.org/b/isbn/9788571101913-L.jpg" }],
  101: [{ editora: "Ubu Editora / Cosac Naify", ano: 2013, isbn: "9788540504783" }],
  102: [{ editora: "Editora Unesp", ano: 2017, isbn: "9788539307227" }],
  103: [{ editora: "Editora Cultrix", ano: 1991, isbn: "9788531604102" }],
  104: [{ editora: "Martins Fontes", ano: 1993, isbn: "9788533618824" }],
  105: [{ editora: "Editora Vozes", ano: 2015, isbn: "9788532655554" }],
  106: [{ editora: "Loyola", ano: 2005, isbn: "9788515031405" }],
  107: [{ editora: "Editora 34", ano: 2002, isbn: "9788573262582" }],
  108: [{ editora: "Ubu Editora", ano: 2016, isbn: "9788569020479", capa_url: "https://covers.openlibrary.org/b/id/12746439-L.jpg" }],
  109: [{ editora: "Civilização Brasileira", ano: 2001, isbn: "9788520005187", capa_url: "https://covers.openlibrary.org/b/id/13736927-L.jpg" }],
  110: [{ editora: "Editora Vozes", ano: 2014, isbn: "9788532647719" }],
  111: [{ editora: "Martins Fontes", ano: 2002, isbn: "9788533616455", capa_url: "https://covers.openlibrary.org/b/id/8730434-L.jpg" }],
  112: [{ editora: "Editora Unesp", ano: 2015, isbn: "9788539306060" }],
  113: [{ editora: "Instituto Ludwig von Mises Brasil", ano: 2010, isbn: "9788585054151", capa_url: "https://covers.openlibrary.org/b/isbn/9788585054151-L.jpg" }],
  114: [{ editora: "Nova Cultural", ano: 1996, isbn: "9788502021150", capa_url: "https://covers.openlibrary.org/b/id/9387695-L.jpg" }],
  115: [{ editora: "Bertrand Brasil", ano: 1989, isbn: "9788530803933", capa_url: "https://covers.openlibrary.org/b/isbn/9788530803933-L.jpg" }],
  116: [{ editora: "LTC", ano: 2008, isbn: "9788521616450" }],
  117: [{ editora: "Ubu Editora", ano: 2015, isbn: "9788592886066", capa_url: "https://covers.openlibrary.org/b/isbn/9788592886066-L.jpg" }],
  118: [{ editora: "Editora Unesp", ano: 2013, isbn: "9788539305179" }],
  119: [{ editora: "Ubu Editora", ano: 2016, isbn: "9788592886059" }],
  120: [{ editora: "Editora Vozes", ano: 1981, isbn: "9788532608468", capa_url: "https://covers.openlibrary.org/b/id/4732326-L.jpg" }]
};

const PAGINAS_LEVA_2 = {
  61: 256, 62: 240, 63: 208, 64: 224, 65: 160, 66: 352,
  67: 224, 68: 384, 69: 336, 70: 120, 71: 176, 72: 105,
  73: 160, 74: 672, 75: 464, 76: 256, 77: 128, 78: 312,
  79: 240, 80: 256, 81: 224, 82: 560, 83: 304, 84: 336,
  85: 840, 86: 224, 87: 624, 88: 264, 89: 176, 90: 304,
  91: 432, 92: 560, 93: 128, 94: 312, 95: 184, 96: 304,
  97: 704, 98: 432, 99: 304, 100: 592, 101: 256, 102: 560,
  103: 528, 104: 240, 105: 480, 106: 384, 107: 1056, 108: 656,
  109: 464, 110: 160, 111: 736, 112: 384, 113: 1040, 114: 448,
  115: 336, 116: 336, 117: 272, 118: 528, 119: 152, 120: 304
};

console.log('=== PROCESSANDO E MESCLANDO SEGUNDA LEVA (61 A 120) ===\n');

// 1. MESCLAR LIVROS.JSON
const livrosExistentes = JSON.parse(fs.readFileSync(livrosPath, 'utf8'));
const livrosMap = new Map(livrosExistentes.map(l => [l.id, l]));

for (const novo of NOVOS_LIVROS) {
  livrosMap.set(novo.id, novo);
}

const todosLivros = Array.from(livrosMap.values()).sort((a, b) => a.id - b.id);
fs.writeFileSync(livrosPath, JSON.stringify(todosLivros, null, 2), 'utf8');
console.log(`✓ data/livros.json atualizado: ${todosLivros.length} livros salvos.`);

// 2. MESCLAR RELACOES.JSON
const relacoesExistentes = JSON.parse(fs.readFileSync(relacoesPath, 'utf8'));
const relacoesMap = new Map();

for (const rel of relacoesExistentes) {
  const chave = rel.id || `${rel.tipo}-${rel.de}-${rel.para}`;
  relacoesMap.set(chave, { ...rel, id: chave });
}

// Relações do usuário (contrapontos e mesmo_tema)
for (const rel of NOVAS_RELACOES_USUARIO) {
  const prefixo = rel.tipo === 'contraponto' ? 'contra' : 'tema';
  const id = `${prefixo}-${rel.de}-${rel.para}`;
  relacoesMap.set(id, {
    id,
    de: rel.de,
    para: rel.para,
    tipo: rel.tipo,
    nota: rel.nota
  });
}

// Relações sequenciais "prepara" para a Trilha B de cada nível (61..72, 73..84, etc.)
for (let lvl = 1; lvl <= 5; lvl++) {
  const inicio = 60 + (lvl - 1) * 12 + 1; // 61, 73, 85, 97, 109
  for (let i = 0; i < 11; i++) {
    const deId = inicio + i;
    const paraId = deId + 1;
    const livroDe = NOVOS_LIVROS.find(l => l.id === deId);
    if (livroDe) {
      const id = `prep-${deId}-${paraId}`;
      relacoesMap.set(id, {
        id,
        de: deId,
        para: paraId,
        tipo: 'prepara',
        nota: livroDe.por_que_antes_do_proximo
      });
    }
  }
}

const todasRelacoes = Array.from(relacoesMap.values());
fs.writeFileSync(relacoesPath, JSON.stringify(todasRelacoes, null, 2), 'utf8');
console.log(`✓ data/relacoes.json atualizado: ${todasRelacoes.length} relações salvas.`);

// 3. ENRIQUECER TODOS OS LIVROS (DATA/ENRIQUECIDO.JSON)
const enriquecidosExistentes = fs.existsSync(enriquecidoPath)
  ? JSON.parse(fs.readFileSync(enriquecidoPath, 'utf8'))
  : [];
const enrMap = new Map(enriquecidosExistentes.map(l => [l.id, l]));

const pendencias = [];

for (const livro of todosLivros) {
  if (livro.id <= 60) {
    const atual = enrMap.get(livro.id) || { ...livro };
    enrMap.set(livro.id, atual);
  } else {
    // Livro 61..120
    const capaPt = CAPAS_CONFIRMADAS_LEVA_2[livro.id];
    const sinopse = SINOPSES_EDITORIAL_LEVA_2[livro.id] || livro.tese;
    const edicoes = EDICOES_CONFIRMADAS_LEVA_2[livro.id] || [];
    const paginas = PAGINAS_LEVA_2[livro.id] || 320;
    const statusBusca = capaPt ? 'ok' : 'parcial';

    if (!capaPt) {
      pendencias.push({
        id: livro.id,
        titulo: livro.titulo,
        autor: livro.autor,
        motivo: 'Capa da edição brasileira não encontrada nas APIs públicas com alta resolução. Ativada capa tipográfica clássica em português.'
      });
    }

    enrMap.set(livro.id, {
      ...livro,
      capa_url: capaPt || undefined,
      isbn: edicoes[0]?.isbn || undefined,
      edicoes_pt: edicoes,
      sinopse_editorial: sinopse,
      status_busca: statusBusca,
      paginas: paginas
    });
  }
}

const todosEnriquecidos = Array.from(enrMap.values()).sort((a, b) => a.id - b.id);
fs.writeFileSync(enriquecidoPath, JSON.stringify(todosEnriquecidos, null, 2), 'utf8');
fs.writeFileSync(pendenciasPath, JSON.stringify(pendencias, null, 2), 'utf8');
console.log(`✓ data/enriquecido.json atualizado: ${todosEnriquecidos.length} obras enriquecidas salvas.`);
console.log(`✓ data/pendencias.json atualizado: ${pendencias.length} pendências registradas.`);

console.log('\nProcessamento de dados concluído com sucesso!');
