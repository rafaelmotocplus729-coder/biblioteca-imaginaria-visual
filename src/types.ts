export type ClasseLivro = 'OBRA' | 'MAPA' | 'PORTA';
export type ResumoPermitido = 'nao' | 'sim' | 'estrutura';
export type IdiomaLeitura = 'pt' | 'en';
export type StatusBusca = 'ok' | 'parcial' | 'pendente';

export interface EdicaoPT {
  editora: string;
  ano?: string | number;
  isbn?: string;
  capa_url?: string;
  link?: string;
}

export interface Livro {
  id: number;
  nivel: number; // 1..5
  ordem_no_nivel: number;
  autor: string;
  titulo: string;
  ano: string;
  area: string;
  classe: ClasseLivro;
  resumo_permitido: ResumoPermitido;
  obra_de_vida: boolean;
  tese: string;
  acrescenta: string;
  por_que_antes_do_proximo: string;
  idioma_leitura: IdiomaLeitura;
  
  // Enriquecimento
  capa_url?: string;
  isbn?: string;
  edicoes_pt?: EdicaoPT[];
  sinopse_editorial?: string;
  status_busca?: StatusBusca;
  paginas?: number;
}

export type EstadoLeitura = 'nao_iniciado' | 'lendo' | 'lido' | 'abandonado' | 'reler_5_anos';

export interface Progresso {
  livro_id: number;
  estado: EstadoLeitura;
  data_inicio?: string;
  data_fim?: string;
  tentativas: number;
  mudou_meu_juizo?: boolean;
  pergunta_aberta?: string;
  notas: string;
  guia_leitura?: string;
  edicao_escolhida?: string;
  data_reler_prevista?: string;
}

export type TipoRelacao = 'prepara' | 'contraponto' | 'mesmo_tema';

export interface Relacao {
  id: string;
  de: number;
  para: number;
  tipo: TipoRelacao;
  nota: string;
}

export interface ItemRevisao {
  livro_id: number;
  mudou_juizo: boolean;
  tem_pergunta_aberta: boolean;
  pegou_ultimos_30_dias: boolean;
  entendeu_pouco_mas_valia: boolean;
  decisao: 'manter' | 'abandonar' | 'reler_5_anos';
  data_prevista_reler?: string;
  reflexao?: string;
}

export interface SessaoRevisao {
  id: string;
  data: string;
  itens: ItemRevisao[];
}

export interface Filtros {
  textoBusca: string;
  area?: string;
  classe?: ClasseLivro;
  nivel?: number;
  estado?: EstadoLeitura;
  apenasObraDeVida?: boolean;
  idioma?: IdiomaLeitura;
}

// ==========================================
// ESTRUTURA ZETTELKASTEN (MÉTODO OBSIDIAN)
// ==========================================
export type TipoNotaZettel = 'indice' | 'referencia' | 'permanente';

export type TipoRelacaoDialetica =
  | 'desenvolve'    // 🌲 Desenvolve / Aprofunda a ideia
  | 'contraponto'   // ⚡ Contrapõe / Objeção / Tensão dialética
  | 'complementa'   // 🧩 Complementa / Visão afim
  | 'aplica'        // 💡 Aplica / Exemplo concreto
  | 'origem';       // 📜 Origem histórica / Genealogia

export interface NotaZettel {
  id: string; // Ex: "202501152223"
  titulo: string; // Nome da nota (sem extensão .md)
  tipo: TipoNotaZettel;
  pasta: '01 índice' | '02 referências' | '03 permanentes';
  tags: string[]; // ['nota índice'], ['nota de referência'], ['nota permanente'], ['revisar']
  
  // Metadados do frontmatter
  tema?: string; // Link [[Nome da Nota Índice]]
  referencia?: string; // Link [[Nome da Nota de Referência]]
  livroId?: number; // Vínculo com um dos 120 livros da Biblioteca Imaginária
  pagina?: number | string;
  relacao?: string; // Link [[Outra Nota Permanente]]
  tipoRelacao?: TipoRelacaoDialetica; // Classificação dialética da conexão
  justificativaRelacao?: string; // Por que as duas ideias se conectam
  citacaoOriginal?: string; // Trecho literal que originou a nota permanente
  
  conteudo: string; // Texto Markdown com #síntese, #comentário, #citação e [[Wikilinks]]
  dataCriacao: string;
  dataAtualizacao: string;
  revisar?: boolean;
}

export interface NotaTemporaria {
  id: string;
  pensamento: string;
  fonte: string;
  livroId?: number;
  pagina?: string | number;
  dataCriacao: string;
  processada: boolean;
}

export interface NodeCanvasZettel {
  id: string;
  tipo: 'nota' | 'texto';
  notaId?: string;
  texto?: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
  cor?: string;
}

export interface EdgeCanvasZettel {
  id: string;
  de: string;
  para: string;
  label?: string;
}

export interface CanvasZettel {
  id: string;
  titulo: string;
  descricao?: string;
  nodes: NodeCanvasZettel[];
  edges: EdgeCanvasZettel[];
}

// ==========================================
// CADERNO REAL (SISTEMA DIGITAL DE ORGANIZAÇÃO PESSOAL)
// ==========================================

export interface CadernoVolume {
  id: string;
  titulo: string;
  dataInicio: string; // ISO ou YYYY-MM-DD
  dataFim?: string | null; // null enquanto aberto / ativo
  ativo: boolean;
  descricao?: string;
  criadoEm: string;
}

export type TipoItemDaily = 'tarefa' | 'compromisso' | 'nota';
export type EstadoItemDaily = 'pendente' | 'concluido' | 'migrado' | 'cancelado';

export interface ItemDailyLog {
  id: string;
  tipo: TipoItemDaily; // '•' (tarefa) | '○' (compromisso) | '-' (nota/ideia)
  texto: string;
  hora?: string; // ex: "14:30" para compromissos
  estado: EstadoItemDaily; // 'pendente' | 'concluido' (X) | 'migrado' (→) | 'cancelado' (—)
  urgente: boolean; // '*' prioridade alta
  migradoPara?: string; // Data ISO YYYY-MM-DD para onde foi transferido
  criadoEm: string;
}

export interface TermometroDia {
  texto: string; // Bloco ≡
  humor?: string;
  atualizadoEm?: string;
}

export interface DiaLog {
  id: string; // YYYY-MM-DD
  data: string; // YYYY-MM-DD
  semanaId: string; // ex: '2026-W46'
  cadernoId: string;
  paginaNumero: number;
  revisado: boolean; // Selo de Revisado
  dataRevisao?: string | null;
  itens: ItemDailyLog[];
  termometro: TermometroDia;
}

export interface CheckinSemanal {
  id: string; // ex: '2026-W46'
  semanaId: string;
  cadernoId: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  paginaNumero: number;
  paragrafoIntencao: string;
  focoTarefas: string[];
  focoCompromissos: string[];
  focoMetas: string[];
  concluido: boolean;
  criadoEm: string;
}

export interface CheckoutSemanal {
  id: string;
  semanaId: string;
  cadernoId: string;
  paginaNumero: number;
  balancoBom: string; // O que funcionou bem?
  balancoRuim: string; // O que deu errado / precisa melhorar?
  concluido: boolean;
  dataFechamento?: string;
}

export interface PaginaLivreCaderno {
  id: string;
  cadernoId: string;
  paginaNumero: number;
  titulo: string;
  conteudo: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

