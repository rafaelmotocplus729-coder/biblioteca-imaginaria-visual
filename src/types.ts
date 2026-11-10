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
