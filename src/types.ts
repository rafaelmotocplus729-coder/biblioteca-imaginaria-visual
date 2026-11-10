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

export interface NotaZettel {
  id: string; // Ex: "202501152223"
  titulo: string; // Nome da nota (sem extensão .md)
  tipo: TipoNotaZettel;
  pasta: '01 índice' | '02 referências' | '03 permanentes';
  tags: string[]; // ['nota índice'], ['nota de referência'], ['nota permanente'], ['revisar']
  
  // Metadados do frontmatter
  tema?: string; // Link [[Nome da Nota Índice]]
  referencia?: string; // Link [[Nome da Nota de Referência]]
  livroId?: number; // Vínculo com um dos 60 livros da Biblioteca Imaginária
  pagina?: number | string;
  relacao?: string; // Link [[Outra Nota Permanente]]
  
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

