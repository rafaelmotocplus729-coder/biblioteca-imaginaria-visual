import { create } from 'zustand';
import {
  Livro,
  Progresso,
  Relacao,
  Filtros,
  EstadoLeitura,
  SessaoRevisao,
  NotaZettel,
  NotaTemporaria,
  CanvasZettel,
  TipoRelacaoDialetica,
  CadernoVolume,
  ItemDailyLog,
  DiaLog,
  CheckinSemanal,
  CheckoutSemanal,
  PaginaLivreCaderno,
  TipoItemDaily
} from '../types';
import livrosEnriquecidos from '../../data/enriquecido.json';
import relacoesPadrao from '../../data/relacoes.json';
import {
  NOTAS_ZETTEL_INICIAIS,
  NOTAS_TEMPORARIAS_INICIAIS,
  CANVAS_ZETTEL_INICIAL
} from '../data/zettelkastenPadrao';
import {
  CADERNO_VOLUME_INICIAL,
  CHECKIN_SEMANAL_INICIAL,
  DIAS_LOGS_INICIAIS,
  CHECKOUT_SEMANAL_INICIAL,
  PAGINAS_LIVRES_INICIAIS
} from '../data/diarioPadrao';
import {
  isSupabaseConfigured,
  sincronizarDoSupabase,
  salvarNotaNoSupabase,
  removerNotaDoSupabase,
  salvarTemporariaNoSupabase,
  removerTemporariaDoSupabase,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testarConexaoSupabase
} from '../lib/supabase';

interface BibliotecaState {
  livros: Livro[];
  relacoes: Relacao[];
  progressos: Record<number, Progresso>;
  sessoesRevisao: SessaoRevisao[];
  
  // Zettelkasten
  notasZettel: NotaZettel[];
  notasTemporarias: NotaTemporaria[];
  canvasZettel: CanvasZettel[];
  notaZettelSelecionadaId: string | null;

  // Caderno Real / Diário Intelectual (PRD)
  cadernosVolumes: CadernoVolume[];
  cadernoAtivoId: string;
  checkinsSemanais: CheckinSemanal[];
  diasLogs: Record<string, DiaLog>;
  checkoutsSemanais: CheckoutSemanal[];
  paginasLivresCaderno: PaginaLivreCaderno[];
  legendaSimbolosVisivel: boolean;
  estiloDotGridAtivo: boolean;
  
  // Supabase Backend de Dados
  supabaseStatus: 'conectado' | 'desconectado' | 'sincronizando' | 'erro';
  supabaseMensagem: string;
  sincronizarSupabase: () => Promise<boolean>;
  conectarSupabase: (url: string, anonKey: string) => Promise<{ ok: boolean; mensagem: string }>;
  desconectarSupabase: () => void;
  limparMockupsZettelkasten: () => void;
  
  // UI & Filtros
  filtros: Filtros;
  modoVisualizacao: 'capa' | 'lombada';
  modoEscuro: boolean;
  modoConflitos: boolean;
  livroSelecionadoId: number | null;
  horasPorSemana: number;
  avisoLeituraSimultanea: string | null;

  // Ações de Progresso
  setEstadoLeitura: (livroId: number, estado: EstadoLeitura, mudouJuizo?: boolean, perguntaAberta?: string) => void;
  setNotas: (livroId: number, notas: string) => void;
  setGuiaLeitura: (livroId: number, guia: string) => void;
  setEdicaoEscolhida: (livroId: number, edicao: string) => void;
  incrementarTentativas: (livroId: number) => void;
  
  // Ações de Relações
  adicionarRelacao: (relacao: Omit<Relacao, 'id'>) => void;
  editarRelacao: (id: string, nota: string, tipo: Relacao['tipo']) => void;
  removerRelacao: (id: string) => void;

  // Ações de Livros
  adicionarLivro: (livro: Livro) => void;
  atualizarLivro: (livro: Livro) => void;
  removerLivro: (id: number) => void;

  // UI & Filtros
  setFiltros: (novosFiltros: Partial<Filtros>) => void;
  limparFiltros: () => void;
  setModoVisualizacao: (modo: 'capa' | 'lombada') => void;
  toggleModoEscuro: () => void;
  toggleModoConflitos: () => void;
  selecionarLivro: (id: number | null) => void;
  setHorasPorSemana: (horas: number) => void;

  // Revisão Semestral
  salvarSessaoRevisao: (sessao: SessaoRevisao) => void;

  // Ações do Zettelkasten
  adicionarNotaZettel: (nota: NotaZettel) => void;
  atualizarNotaZettel: (id: string, atualizacao: Partial<NotaZettel>) => void;
  removerNotaZettel: (id: string) => void;
  selecionarNotaZettel: (id: string | null) => void;
  adicionarNotaTemporaria: (nota: Omit<NotaTemporaria, 'id' | 'dataCriacao' | 'processada'>) => void;
  marcarNotaTemporariaProcessada: (id: string) => void;
  removerNotaTemporaria: (id: string) => void;
  criarNotaReferenciaDeLivro: (livroId: number) => NotaZettel;
  criarNotaPermanenteRapida: (
    numTema: number,
    titulo: string,
    referencia: string,
    pagina?: number | string,
    relacao?: string,
    conteudoInicial?: string,
    tipoRelacao?: TipoRelacaoDialetica,
    citacaoOriginal?: string,
    justificativaRelacao?: string
  ) => NotaZettel;
  salvarCanvasZettel: (canvas: CanvasZettel) => void;
  exportarZettelkastenMarkdown: () => string;

  // Ações do Caderno Real (Diário Intelectual)
  criarCadernoVolume: (titulo?: string, dataInicio?: string) => string;
  concluirCadernoVolume: (cadernoId: string) => void;
  setCadernoAtivoId: (cadernoId: string) => void;
  salvarCheckinSemanal: (checkin: CheckinSemanal) => void;
  salvarCheckoutSemanal: (checkout: CheckoutSemanal) => void;
  adicionarItemDiaLog: (dataStr: string, item: Omit<ItemDailyLog, 'id' | 'criadoEm'>) => void;
  atualizarItemDiaLog: (dataStr: string, itemId: string, patch: Partial<ItemDailyLog>) => void;
  removerItemDiaLog: (dataStr: string, itemId: string) => void;
  reordenarItensDiaLog: (dataStr: string, novosItens: ItemDailyLog[]) => void;
  atualizarTermometroDia: (dataStr: string, texto: string, humor?: string) => void;
  revisarFecharDia: (
    dataStr: string,
    acoesPendentes?: Record<string, { acao: 'concluir' | 'migrar' | 'cancelar'; dataDestino?: string }>
  ) => void;
  salvarPaginaLivre: (pagina: PaginaLivreCaderno) => void;
  removerPaginaLivre: (id: string) => void;
  toggleLegendaSimbolos: () => void;
  toggleEstiloDotGrid: () => void;
  converterNotaTemporariaParaDiario: (notaTempId: string, tipo: TipoItemDaily, dataStr?: string) => void;

  // Personalização visual do Zettelkasten (Fundo / Wallpaper)
  fundoZettelkasten: string;
  opacidadeFundoZettelkasten: number;
  desfoqueFundoZettelkasten: number;
  setFundoZettelkasten: (fundo: string) => void;
  setOpacidadeFundoZettelkasten: (opacidade: number) => void;
  setDesfoqueFundoZettelkasten: (desfoque: number) => void;

  // Exportar / Importar
  exportarJSON: () => string;
  importarJSON: (jsonString: string) => boolean;
  exportarMarkdown: () => string;
  exportarCSV: () => string;

  // Inicialização / Sincronização
  recarregarDadosComEnriquecidos: (enriquecidos: Livro[]) => void;
}

const STORAGE_KEY = 'biblioteca_imaginaria_v1';

// Inicializa o progresso padrão
function getProgressosIniciais(): Record<number, Progresso> {
  const progs: Record<number, Progresso> = {};
  for (let i = 1; i <= 120; i++) {
    progs[i] = {
      livro_id: i,
      estado: 'nao_iniciado',
      tentativas: 0,
      notas: '',
      guia_leitura: ''
    };
  }
  // Em andamento no início: #13 O Mito de Sísifo
  progs[13] = {
    livro_id: 13,
    estado: 'lendo',
    data_inicio: new Date().toISOString().split('T')[0],
    tentativas: 1,
    notas: 'Iniciado como leitura central de filosofia do Nível 2.',
    guia_leitura: ''
  };
  return progs;
}

function carregarDoLocalStorage() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      return JSON.parse(salvo);
    }
  } catch (e) {
    console.warn('Erro ao ler do localStorage:', e);
  }
  return null;
}

function salvarNoLocalStorage(estado: {
  livros: Livro[];
  relacoes: Relacao[];
  progressos: Record<number, Progresso>;
  sessoesRevisao: SessaoRevisao[];
  horasPorSemana: number;
  modoEscuro: boolean;
  notasZettel?: NotaZettel[];
  notasTemporarias?: NotaTemporaria[];
  canvasZettel?: CanvasZettel[];
  fundoZettelkasten?: string;
  opacidadeFundoZettelkasten?: number;
  desfoqueFundoZettelkasten?: number;
  // Caderno Real / Diário Intelectual
  cadernosVolumes?: CadernoVolume[];
  cadernoAtivoId?: string;
  checkinsSemanais?: CheckinSemanal[];
  diasLogs?: Record<string, DiaLog>;
  checkoutsSemanais?: CheckoutSemanal[];
  paginasLivresCaderno?: PaginaLivreCaderno[];
  legendaSimbolosVisivel?: boolean;
  estiloDotGridAtivo?: boolean;
}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
}

const IDS_MOCKUPS = new Set([
  '1-261220251138', '1-202608191430', '1-310720251003', '2-131020261827',
  '3-280920252153', '1-202501152223', '2-202501161015', '3-202501161110',
  '1-202528122325', '1-202531071144', '1-310720251134', '3-280920252156',
  '1-202501152230', '1-202501152240', '1-202501152250', '2-202501161025',
  '2-202501161035', '3-202501161120', '3-202501161130', 'ATALHOS'
]);

/**
 * Identifica a qual nota índice uma nota de referência ou permanente pertence:
 * 1. Pelo metadado 'tema' (ex: [[2 - HISTÓRIA]])
 * 2. Pelo prefixo numérico do título (ex: "2-202611..." ou "2 - ...")
 * 3. Se for nota permanente, pelo índice da sua nota de referência vinculada
 */
export function encontrarIndiceParaNota(
  nota: NotaZettel,
  indices: NotaZettel[],
  referencias: NotaZettel[]
): NotaZettel | null {
  if (nota.tipo === 'indice' || nota.pasta === '01 índice') return null;

  // 1. Por metadado tema
  if (nota.tema) {
    const temaLimpo = nota.tema.replace(/\[\[|\]\]/g, '').trim().toLowerCase();
    const matchTema = indices.find((idx) => {
      const idxLimpo = idx.titulo.toLowerCase();
      const idxIdLimpo = idx.id.toLowerCase();
      if (idxLimpo === temaLimpo || idxIdLimpo === temaLimpo) return true;
      if (temaLimpo.startsWith('1') && (idxLimpo.includes('literatura') || idxIdLimpo.includes('literatura'))) return true;
      if (temaLimpo.startsWith('2') && (idxLimpo.includes('história') || idxLimpo.includes('historia') || idxIdLimpo.includes('historia'))) return true;
      if (temaLimpo.startsWith('3') && (idxLimpo.includes('psicologia') || idxIdLimpo.includes('psicologia'))) return true;
      if (temaLimpo.startsWith('4') && (idxLimpo.includes('religião') || idxLimpo.includes('religiao') || idxIdLimpo.includes('religiao'))) return true;
      if (temaLimpo.startsWith('5') && (idxLimpo.includes('filosofia') || idxIdLimpo.includes('filosofia'))) return true;
      return false;
    });
    if (matchTema) return matchTema;
  }

  // 2. Por prefixo numérico no título (ex: "2-202611..." ou "2 - ...") ou ID
  const matchNum = nota.titulo.match(/^(\d+)[\s-]/) || nota.id.match(/^(\d+)[\s-]/);
  if (matchNum) {
    const num = matchNum[1];
    const matchPrefixo = indices.find(
      (idx) =>
        idx.titulo.startsWith(`${num} `) ||
        idx.titulo.startsWith(`${num}-`) ||
        idx.titulo.startsWith(`${num} -`) ||
        idx.id.startsWith(`${num}-`) ||
        idx.id.startsWith(`${num}_`)
    );
    if (matchPrefixo) return matchPrefixo;
  }

  // 3. Se for permanente e tiver referência vinculada, busca o índice da referência
  if (nota.referencia) {
    const refNome = nota.referencia.replace(/\[\[|\]\]/g, '').trim().toLowerCase();
    const matchRef = referencias.find(
      (r) => r.titulo.toLowerCase() === refNome || r.id.toLowerCase() === refNome
    );
    if (matchRef) {
      return encontrarIndiceParaNota(matchRef, indices, referencias);
    }
  }

  return null;
}

/**
 * Atualiza o conteúdo markdown de um índice garantindo que todas as referências
 * e notas permanentes vinculadas constem com [[Wikilinks]] nas suas respectivas seções.
 */
function atualizarConteudoIndice(
  conteudoAtual: string,
  refs: NotaZettel[],
  perms: NotaZettel[]
): string {
  const listaRefsStr = refs.length > 0 ? refs.map((r) => `- [[${r.titulo}]]`).join('\n') : '- ';
  const listaPermsStr = perms.length > 0 ? perms.map((p) => `- [[${p.titulo}]]`).join('\n') : '- ';

  const indiceRef = conteudoAtual.indexOf('# Referências');
  const cabecalho = indiceRef > 0 ? conteudoAtual.slice(0, indiceRef).trim() + '\n\n' : '';

  return `${cabecalho}# Referências\n${listaRefsStr}\n\n# Notas Relacionadas\n${listaPermsStr}`;
}

/**
 * Atualiza o conteúdo markdown de uma nota de referência garantindo que
 * todas as notas permanentes que a utilizam como fonte constem em 'Notas Relacionadas'.
 */
function atualizarConteudoReferencia(conteudoAtual: string, perms: NotaZettel[]): string {
  if (perms.length === 0) return conteudoAtual;
  const listaPerms = perms.map((p) => `- [[${p.titulo}]]`).join('\n');

  const regexSecao = /(##\s*(?:Notas Relacionadas|NOTAS RELACIONADAS)[\r\n]+)([\s\S]*?)(?=[\r\n]+##|$)/i;
  if (regexSecao.test(conteudoAtual)) {
    return conteudoAtual.replace(regexSecao, `$1${listaPerms}\n`);
  } else {
    return `${conteudoAtual}\n\n## Notas Relacionadas\n${listaPerms}`;
  }
}

/**
 * Atualiza as conexões reversas de notas permanentes sob a seção ## Conexões.
 */
function atualizarConexoesPermanente(conteudoAtual: string, outrasPerms: NotaZettel[]): string {
  if (outrasPerms.length === 0) return conteudoAtual;

  const regexConexoes = /(##\s*(?:Conexões|CONEXÕES|Notas Relacionadas)[\r\n]+)([\s\S]*?)(?=[\r\n]+##|$)/i;
  if (regexConexoes.test(conteudoAtual)) {
    const trechoExistente = conteudoAtual.match(regexConexoes)?.[2] || '';
    const novasLinhas = outrasPerms
      .filter((op) => !trechoExistente.includes(`[[${op.titulo}]]`))
      .map((op) => `- [[${op.titulo}]]`);
    if (novasLinhas.length > 0) {
      const trechoLimpo = trechoExistente.trim() === '-' ? '' : trechoExistente.trim();
      const substituicao = trechoLimpo ? `${trechoLimpo}\n${novasLinhas.join('\n')}` : novasLinhas.join('\n');
      return conteudoAtual.replace(regexConexoes, `$1${substituicao}\n`);
    }
    return conteudoAtual;
  } else {
    const listaConexoes = outrasPerms.map((op) => `- [[${op.titulo}]]`).join('\n');
    return `${conteudoAtual}\n\n## Conexões\n${listaConexoes}`;
  }
}

/**
 * Motor central de sincronização automática entre Índices, Referências e Permanentes:
 * Atualiza automaticamente todas as listas de conexões mútuas em cascata.
 */
export function sincronizarConexoesZettel(todasNotas: NotaZettel[]): NotaZettel[] {
  const indices = todasNotas.filter((n) => n.tipo === 'indice' || n.pasta === '01 índice');
  const referencias = todasNotas.filter((n) => n.tipo === 'referencia' || n.pasta === '02 referências');
  const permanentes = todasNotas.filter((n) => n.tipo === 'permanente' || n.pasta === '03 permanentes');

  const mapaNotas = new Map<string, NotaZettel>(todasNotas.map((n) => [n.id, { ...n }]));

  // 1. Atualizar cada Índice com suas Referências e Notas Relacionadas
  for (const idx of indices) {
    const refsVinculadas = referencias.filter((r) => {
      const ind = encontrarIndiceParaNota(r, indices, referencias);
      return ind?.id === idx.id || ind?.titulo === idx.titulo;
    });
    const permsVinculadas = permanentes.filter((p) => {
      const ind = encontrarIndiceParaNota(p, indices, referencias);
      return ind?.id === idx.id || ind?.titulo === idx.titulo;
    });

    const notaExistente = mapaNotas.get(idx.id);
    if (notaExistente) {
      const novoConteudo = atualizarConteudoIndice(notaExistente.conteudo, refsVinculadas, permsVinculadas);
      if (novoConteudo !== notaExistente.conteudo) {
        notaExistente.conteudo = novoConteudo;
      }
    }
  }

  // 2. Atualizar cada Referência com as notas permanentes que a citam
  for (const ref of referencias) {
    const permsVinculadas = permanentes.filter((p) => {
      if (!p.referencia) return false;
      const refLimpo = p.referencia.replace(/\[\[|\]\]/g, '').trim().toLowerCase();
      return refLimpo === ref.titulo.toLowerCase() || refLimpo === ref.id.toLowerCase();
    });

    const notaExistente = mapaNotas.get(ref.id);
    if (notaExistente && permsVinculadas.length > 0) {
      const novoConteudo = atualizarConteudoReferencia(notaExistente.conteudo, permsVinculadas);
      if (novoConteudo !== notaExistente.conteudo) {
        notaExistente.conteudo = novoConteudo;
      }
    }
  }

  // 3. Atualizar conexões reversas entre permanentes
  for (const perm of permanentes) {
    if (perm.relacao) {
      const relNome = perm.relacao.replace(/\[\[|\]\]/g, '').trim().toLowerCase();
      const outraPerm = permanentes.find(
        (p) => p.titulo.toLowerCase() === relNome || p.id.toLowerCase() === relNome
      );
      if (outraPerm && outraPerm.id !== perm.id) {
        const notaAlvo = mapaNotas.get(outraPerm.id);
        if (notaAlvo) {
          const novoConteudo = atualizarConexoesPermanente(notaAlvo.conteudo, [perm]);
          if (novoConteudo !== notaAlvo.conteudo) {
            notaAlvo.conteudo = novoConteudo;
          }
        }
      }
    }
  }

  return Array.from(mapaNotas.values());
}

function filtrarMockupsZettel(salvas?: NotaZettel[]): NotaZettel[] {
  if (!salvas || salvas.length === 0) return sincronizarConexoesZettel(NOTAS_ZETTEL_INICIAIS);
  const reais = salvas.filter((n) => !IDS_MOCKUPS.has(n.id));
  if (reais.length === 0) return sincronizarConexoesZettel(NOTAS_ZETTEL_INICIAIS);
  // Garantir que os 5 índices fundamentais existam
  const indicesExistentes = new Set(reais.filter((n) => n.tipo === 'indice').map((n) => n.id));
  const faltantes = NOTAS_ZETTEL_INICIAIS.filter((idx) => !indicesExistentes.has(idx.id));
  return sincronizarConexoesZettel([...faltantes, ...reais]);
}

function filtrarMockupsTemporarias(salvas?: NotaTemporaria[]): NotaTemporaria[] {
  if (!salvas || salvas.length === 0) return NOTAS_TEMPORARIAS_INICIAIS;
  return salvas.filter((t) => !['temp-1', 'temp-2', 'temp-3'].includes(t.id));
}

const salvo = carregarDoLocalStorage();

// Sincronizar livros enriquecidos com capas atualizadas em português
function sincronizarLivrosComEnriquecidos(livrosSalvos?: Livro[]): Livro[] {
  if (!livrosSalvos || livrosSalvos.length === 0) {
    return livrosEnriquecidos as Livro[];
  }
  return (livrosEnriquecidos as Livro[]).map((enr) => {
    const salvo = livrosSalvos.find((s) => s.id === enr.id);
    return {
      ...enr,
      ...(salvo || {}),
      // Garantir sempre as capas e textos canônicos atualizados em português
      capa_url: enr.capa_url,
      titulo: enr.titulo,
      autor: enr.autor,
      tese: enr.tese,
      acrescenta: enr.acrescenta,
      por_que_antes_do_proximo: enr.por_que_antes_do_proximo,
      sinopse_editorial: enr.sinopse_editorial,
      edicoes_pt: enr.edicoes_pt,
      status_busca: enr.status_busca,
      paginas: enr.paginas
    };
  });
}

function mesclarRelacoesComPadrao(relacoesSalvas?: Relacao[]): Relacao[] {
  if (!relacoesSalvas || relacoesSalvas.length === 0) return relacoesPadrao as Relacao[];
  const salvasMap = new Map(relacoesSalvas.map((r) => [r.id || `${r.tipo}-${r.de}-${r.para}`, r]));
  for (const padrao of (relacoesPadrao as Relacao[])) {
    const key = padrao.id || `${padrao.tipo}-${padrao.de}-${padrao.para}`;
    if (!salvasMap.has(key)) {
      salvasMap.set(key, padrao);
    }
  }
  return Array.from(salvasMap.values());
}

export const useBibliotecaStore = create<BibliotecaState>((set, get) => ({
  livros: sincronizarLivrosComEnriquecidos(salvo?.livros),
  relacoes: mesclarRelacoesComPadrao(salvo?.relacoes),
  progressos: salvo?.progressos ? { ...getProgressosIniciais(), ...salvo.progressos } : getProgressosIniciais(),
  sessoesRevisao: salvo?.sessoesRevisao || [],
  
  // Zettelkasten Real (Sem mockups)
  notasZettel: filtrarMockupsZettel(salvo?.notasZettel),
  notasTemporarias: filtrarMockupsTemporarias(salvo?.notasTemporarias),
  canvasZettel: salvo?.canvasZettel || [CANVAS_ZETTEL_INICIAL],
  notaZettelSelecionadaId: null,

  // Caderno Real / Diário Intelectual (PRD)
  cadernosVolumes: salvo?.cadernosVolumes && salvo.cadernosVolumes.length > 0
    ? salvo.cadernosVolumes
    : [CADERNO_VOLUME_INICIAL],
  cadernoAtivoId: salvo?.cadernoAtivoId || CADERNO_VOLUME_INICIAL.id,
  checkinsSemanais: salvo?.checkinsSemanais && salvo.checkinsSemanais.length > 0
    ? salvo.checkinsSemanais
    : [CHECKIN_SEMANAL_INICIAL],
  diasLogs: salvo?.diasLogs && Object.keys(salvo.diasLogs).length > 0
    ? salvo.diasLogs
    : DIAS_LOGS_INICIAIS,
  checkoutsSemanais: salvo?.checkoutsSemanais && salvo.checkoutsSemanais.length > 0
    ? salvo.checkoutsSemanais
    : [CHECKOUT_SEMANAL_INICIAL],
  paginasLivresCaderno: salvo?.paginasLivresCaderno && salvo.paginasLivresCaderno.length > 0
    ? salvo.paginasLivresCaderno
    : PAGINAS_LIVRES_INICIAIS,
  legendaSimbolosVisivel: salvo?.legendaSimbolosVisivel ?? true,
  estiloDotGridAtivo: salvo?.estiloDotGridAtivo ?? true,

  // Supabase Backend de Dados
  supabaseStatus: isSupabaseConfigured() ? 'conectado' : 'desconectado',
  supabaseMensagem: isSupabaseConfigured() ? 'Supabase configurado e pronto para sincronizar.' : 'Modo local (armazenamento no navegador).',

  // Wallpaper / Fundo do Zettelkasten
  fundoZettelkasten: salvo?.fundoZettelkasten || 'caravaggio',
  opacidadeFundoZettelkasten: salvo?.opacidadeFundoZettelkasten ?? 25,
  desfoqueFundoZettelkasten: salvo?.desfoqueFundoZettelkasten ?? 1,

  filtros: {
    textoBusca: ''
  },
  modoVisualizacao: 'capa',
  modoEscuro: salvo?.modoEscuro ?? false,
  modoConflitos: false,
  livroSelecionadoId: null,
  horasPorSemana: salvo?.horasPorSemana || 6,
  avisoLeituraSimultanea: null,

  setEstadoLeitura: (livroId, estado, mudouJuizo, perguntaAberta) => {
    const hoje = new Date().toISOString().split('T')[0];
    const prevProgs = get().progressos;
    const progAtual = prevProgs[livroId] || {
      livro_id: livroId,
      estado: 'nao_iniciado',
      tentativas: 0,
      notas: ''
    };

    let novosDados: Partial<Progresso> = { estado };

    if (estado === 'lendo') {
      if (!progAtual.data_inicio) {
        novosDados.data_inicio = hoje;
      }
      novosDados.tentativas = Math.max(progAtual.tentativas, 1);
    } else if (estado === 'lido') {
      novosDados.data_fim = hoje;
      if (mudouJuizo !== undefined) novosDados.mudou_meu_juizo = mudouJuizo;
      if (perguntaAberta !== undefined) novosDados.pergunta_aberta = perguntaAberta;
    } else if (estado === 'abandonado') {
      novosDados.tentativas = (progAtual.tentativas || 0) + 1;
    } else if (estado === 'reler_5_anos') {
      const dataReler = new Date();
      dataReler.setFullYear(dataReler.getFullYear() + 5);
      novosDados.data_reler_prevista = dataReler.toISOString().split('T')[0];
    }

    const novosProgressos = {
      ...prevProgs,
      [livroId]: {
        ...progAtual,
        ...novosDados
      }
    };

    // Verificar limite de leituras simultâneas:
    // "aviso suave se houver mais de 1 OBRA e 1 MAPA em andamento"
    const livros = get().livros;
    let lendoObras = 0;
    let lendoMapas = 0;
    Object.values(novosProgressos).forEach((p) => {
      if (p.estado === 'lendo') {
        const l = livros.find((x) => x.id === p.livro_id);
        if (l?.classe === 'OBRA') lendoObras++;
        if (l?.classe === 'MAPA') lendoMapas++;
      }
    });

    let aviso: string | null = null;
    if (lendoObras > 1 || lendoMapas > 1) {
      aviso = `Atenção suave: você tem ${lendoObras} OBRA(s) e ${lendoMapas} MAPA(s) em andamento. O método sugere no máximo 1 OBRA e 1 MAPA simultâneos para absorção profunda.`;
    }

    set({ progressos: novosProgressos, avisoLeituraSimultanea: aviso });

    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: novosProgressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  setNotas: (livroId, notas) => {
    const novosProgressos = {
      ...get().progressos,
      [livroId]: {
        ...(get().progressos[livroId] || { livro_id: livroId, estado: 'nao_iniciado', tentativas: 0 }),
        notas
      }
    };
    set({ progressos: novosProgressos });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: novosProgressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  setGuiaLeitura: (livroId, guia) => {
    const novosProgressos = {
      ...get().progressos,
      [livroId]: {
        ...(get().progressos[livroId] || { livro_id: livroId, estado: 'nao_iniciado', tentativas: 0, notas: '' }),
        guia_leitura: guia
      }
    };
    set({ progressos: novosProgressos });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: novosProgressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  setEdicaoEscolhida: (livroId, edicao) => {
    const novosProgressos = {
      ...get().progressos,
      [livroId]: {
        ...(get().progressos[livroId] || { livro_id: livroId, estado: 'nao_iniciado', tentativas: 0, notas: '' }),
        edicao_escolhida: edicao
      }
    };
    set({ progressos: novosProgressos });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: novosProgressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  incrementarTentativas: (livroId) => {
    const prog = get().progressos[livroId] || { livro_id: livroId, estado: 'nao_iniciado', tentativas: 0, notas: '' };
    const novosProgressos = {
      ...get().progressos,
      [livroId]: {
        ...prog,
        tentativas: (prog.tentativas || 0) + 1
      }
    };
    set({ progressos: novosProgressos });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: novosProgressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  adicionarRelacao: (novaRel) => {
    const id = `rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const novasRelacoes = [...get().relacoes, { ...novaRel, id }];
    set({ relacoes: novasRelacoes });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: novasRelacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  editarRelacao: (id, nota, tipo) => {
    const novasRelacoes = get().relacoes.map((r) => (r.id === id ? { ...r, nota, tipo } : r));
    set({ relacoes: novasRelacoes });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: novasRelacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  removerRelacao: (id) => {
    const novasRelacoes = get().relacoes.filter((r) => r.id !== id);
    set({ relacoes: novasRelacoes });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: novasRelacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  adicionarLivro: (novoLivro) => {
    const novosLivros = [...get().livros, novoLivro];
    set({ livros: novosLivros });
    salvarNoLocalStorage({
      livros: novosLivros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  atualizarLivro: (livroAtualizado) => {
    const novosLivros = get().livros.map((l) => (l.id === livroAtualizado.id ? livroAtualizado : l));
    set({ livros: novosLivros });
    salvarNoLocalStorage({
      livros: novosLivros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  removerLivro: (id) => {
    const novosLivros = get().livros.filter((l) => l.id !== id);
    // Preservar ou limpar relações associadas
    const novasRelacoes = get().relacoes.filter((r) => r.de !== id && r.para !== id);
    set({ livros: novosLivros, relacoes: novasRelacoes });
    salvarNoLocalStorage({
      livros: novosLivros,
      relacoes: novasRelacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  setFiltros: (novosFiltros) => {
    set({ filtros: { ...get().filtros, ...novosFiltros } });
  },

  limparFiltros: () => {
    set({
      filtros: { textoBusca: '' }
    });
  },

  setModoVisualizacao: (modo) => {
    set({ modoVisualizacao: modo });
  },

  toggleModoEscuro: () => {
    const novoModo = !get().modoEscuro;
    if (novoModo) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ modoEscuro: novoModo });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: novoModo
    });
  },

  toggleModoConflitos: () => {
    set({ modoConflitos: !get().modoConflitos });
  },

  selecionarLivro: (id) => {
    set({ livroSelecionadoId: id });
  },

  setHorasPorSemana: (horas) => {
    set({ horasPorSemana: horas });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: horas,
      modoEscuro: get().modoEscuro
    });
  },

  salvarSessaoRevisao: (sessao) => {
    const novasSessoes = [sessao, ...get().sessoesRevisao];
    
    // Atualizar estados dos livros revisados
    const prevProgs = { ...get().progressos };
    sessao.itens.forEach((item) => {
      const p = prevProgs[item.livro_id] || { livro_id: item.livro_id, estado: 'nao_iniciado', tentativas: 0, notas: '' };
      if (item.decisao === 'abandonar') {
        p.estado = 'abandonado';
        p.tentativas = (p.tentativas || 0) + 1;
      } else if (item.decisao === 'reler_5_anos') {
        p.estado = 'reler_5_anos';
        p.data_reler_prevista = item.data_prevista_reler;
      }
      if (item.reflexao) {
        p.notas = p.notas ? `${p.notas}\n[Revisão Semestral]: ${item.reflexao}` : `[Revisão Semestral]: ${item.reflexao}`;
      }
      prevProgs[item.livro_id] = p;
    });

    set({ sessoesRevisao: novasSessoes, progressos: prevProgs });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: prevProgs,
      sessoesRevisao: novasSessoes,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  exportarJSON: () => {
    const backup = {
      versao: '0.2.0',
      data_exportacao: new Date().toISOString(),
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    };
    return JSON.stringify(backup, null, 2);
  },

  importarJSON: (jsonString) => {
    try {
      const backup = JSON.parse(jsonString);
      if (backup && Array.isArray(backup.livros)) {
        const novosDados = {
          livros: backup.livros,
          relacoes: backup.relacoes || get().relacoes,
          progressos: backup.progressos || get().progressos,
          sessoesRevisao: backup.sessoesRevisao || [],
          horasPorSemana: backup.horasPorSemana || 6,
          notasZettel: backup.notasZettel || get().notasZettel,
          notasTemporarias: backup.notasTemporarias || get().notasTemporarias,
          canvasZettel: backup.canvasZettel || get().canvasZettel,
          cadernosVolumes: backup.cadernosVolumes || get().cadernosVolumes,
          cadernoAtivoId: backup.cadernoAtivoId || get().cadernoAtivoId,
          checkinsSemanais: backup.checkinsSemanais || get().checkinsSemanais,
          diasLogs: backup.diasLogs || get().diasLogs,
          checkoutsSemanais: backup.checkoutsSemanais || get().checkoutsSemanais,
          paginasLivresCaderno: backup.paginasLivresCaderno || get().paginasLivresCaderno,
          legendaSimbolosVisivel: backup.legendaSimbolosVisivel ?? get().legendaSimbolosVisivel,
          estiloDotGridAtivo: backup.estiloDotGridAtivo ?? get().estiloDotGridAtivo
        };
        set(novosDados);
        salvarNoLocalStorage({
          ...novosDados,
          modoEscuro: get().modoEscuro,
          fundoZettelkasten: get().fundoZettelkasten,
          opacidadeFundoZettelkasten: get().opacidadeFundoZettelkasten,
          desfoqueFundoZettelkasten: get().desfoqueFundoZettelkasten
        });
        return true;
      }
    } catch (e) {
      console.error('Falha ao importar JSON:', e);
    }
    return false;
  },

  exportarMarkdown: () => {
    const { livros, progressos, relacoes } = get();
    let md = `# Biblioteca Imaginária Visual — Exportação de Leitura\n\n`;
    md += `*Exportado em: ${new Date().toLocaleDateString('pt-BR')}*\n\n`;
    
    for (let nivel = 1; nivel <= 5; nivel++) {
      md += `## Nível ${nivel}\n\n`;
      const livrosNivel = livros.filter((l) => l.nivel === nivel);
      for (const livro of livrosNivel) {
        const prog = progressos[livro.id];
        const statusIcon = prog?.estado === 'lido' ? '✓ [LIDO]' : (prog?.estado === 'lendo' ? '⏳ [LENDO]' : (prog?.estado === 'abandonado' ? '✕ [ABANDONADO]' : '○ [NÃO INICIADO]'));
        md += `### #${livro.id} ${livro.titulo} — ${livro.autor} (${livro.ano})\n`;
        md += `- **Área:** ${livro.area} | **Classe:** ${livro.classe} | **Estado:** ${statusIcon}\n`;
        md += `- **Tese:** ${livro.tese}\n`;
        md += `- **O que acrescenta:** ${livro.acrescenta}\n`;
        md += `- **Por que antes do próximo:** ${livro.por_que_antes_do_proximo}\n`;
        if (prog?.notas) {
          md += `- **Anotações pessoais:** ${prog.notas}\n`;
        }
        md += `\n`;
      }
    }

    md += `## Grafo de Relações e Contrapontos\n\n`;
    const contrapontos = relacoes.filter((r) => r.tipo === 'contraponto');
    md += `### Contrapontos (Teses em Conflito)\n`;
    for (const c of contrapontos) {
      const deLivro = livros.find((l) => l.id === c.de);
      const paraLivro = livros.find((l) => l.id === c.para);
      md += `- **#${c.de} ${deLivro?.titulo}** ↔ **#${c.para} ${paraLivro?.titulo}**: ${c.nota}\n`;
    }

    return md;
  },

  exportarCSV: () => {
    const { livros, progressos } = get();
    const headers = ['ID', 'Nivel', 'Titulo', 'Autor', 'Ano', 'Area', 'Classe', 'Estado', 'Tentativas', 'Mudou_Juizo', 'Notas'];
    const rows = livros.map((l) => {
      const p = progressos[l.id];
      return [
        l.id,
        l.nivel,
        `"${l.titulo.replace(/"/g, '""')}"`,
        `"${l.autor.replace(/"/g, '""')}"`,
        `"${l.ano}"`,
        `"${l.area}"`,
        l.classe,
        p?.estado || 'nao_iniciado',
        p?.tentativas || 0,
        p?.mudou_meu_juizo ? 'Sim' : 'Não',
        `"${(p?.notas || '').replace(/"/g, '""')}"`
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  },

  // Ações do Zettelkasten
  sincronizarSupabase: async () => {
    if (!isSupabaseConfigured()) {
      set({ supabaseStatus: 'desconectado', supabaseMensagem: 'Supabase não configurado. Dados salvos apenas localmente.' });
      return false;
    }

    set({ supabaseStatus: 'sincronizando', supabaseMensagem: 'Conectando ao Supabase e baixando notas...' });
    try {
      const dados = await sincronizarDoSupabase();
      if (dados && dados.notas.length > 0) {
        // Mesclar garantindo os 5 índices fundamentais
        const indicesExistentes = new Set(dados.notas.filter((n) => n.tipo === 'indice').map((n) => n.id));
        const faltantes = NOTAS_ZETTEL_INICIAIS.filter((idx) => !indicesExistentes.has(idx.id));
        const notasFinais = [...faltantes, ...dados.notas];

        set({
          notasZettel: notasFinais,
          notasTemporarias: dados.temporarias,
          supabaseStatus: 'conectado',
          supabaseMensagem: `Sincronizado com a nuvem às ${new Date().toLocaleTimeString('pt-BR')} (${notasFinais.length} notas).`
        });

        salvarNoLocalStorage({
          livros: get().livros,
          relacoes: get().relacoes,
          progressos: get().progressos,
          sessoesRevisao: get().sessoesRevisao,
          horasPorSemana: get().horasPorSemana,
          modoEscuro: get().modoEscuro,
          notasZettel: notasFinais,
          notasTemporarias: dados.temporarias,
          canvasZettel: get().canvasZettel
        });
        return true;
      } else {
        // Se a tabela do Supabase estiver vazia, sobe as notas locais
        const notasLocais = get().notasZettel;
        for (const nota of notasLocais) {
          await salvarNotaNoSupabase(nota);
        }
        set({
          supabaseStatus: 'conectado',
          supabaseMensagem: `Banco nuvem inicializado com sucesso (${notasLocais.length} notas enviadas).`
        });
        return true;
      }
    } catch (e: any) {
      set({
        supabaseStatus: 'erro',
        supabaseMensagem: `Erro de sincronização: ${e.message || 'Falha de rede'}`
      });
      return false;
    }
  },

  conectarSupabase: async (url: string, anonKey: string) => {
    set({ supabaseStatus: 'sincronizando', supabaseMensagem: 'Testando conexão com o Supabase...' });
    const teste = await testarConexaoSupabase(url, anonKey);
    if (!teste.ok) {
      set({ supabaseStatus: 'erro', supabaseMensagem: teste.mensagem });
      return teste;
    }

    saveSupabaseConfig(url, anonKey);
    set({ supabaseStatus: 'conectado', supabaseMensagem: 'Conectado ao Supabase com sucesso!' });
    await get().sincronizarSupabase();
    return teste;
  },

  desconectarSupabase: () => {
    clearSupabaseConfig();
    set({
      supabaseStatus: 'desconectado',
      supabaseMensagem: 'Supabase desconectado. O sistema está operando em modo local seguro.'
    });
  },

  limparMockupsZettelkasten: () => {
    const notasLimpos = NOTAS_ZETTEL_INICIAIS;
    const temporariasLimpos: NotaTemporaria[] = [];
    set({
      notasZettel: notasLimpos,
      notasTemporarias: temporariasLimpos,
      notaZettelSelecionadaId: null
    });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: notasLimpos,
      notasTemporarias: temporariasLimpos,
      canvasZettel: get().canvasZettel
    });
  },

  adicionarNotaZettel: (nota) => {
    const sincronizadas = sincronizarConexoesZettel([nota, ...get().notasZettel]);
    set({ notasZettel: sincronizadas, notaZettelSelecionadaId: nota.id });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: sincronizadas,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel
    });
    // Persistência assíncrona no Supabase
    salvarNotaNoSupabase(nota).catch((e) => console.warn('Supabase offline/erro:', e));
    // Sincroniza também as notas conectadas (ex: índice e referências)
    for (const n of sincronizadas) {
      if (n.id !== nota.id) {
        salvarNotaNoSupabase(n).catch(() => {});
      }
    }
  },

  atualizarNotaZettel: (id, atualizacao) => {
    const agora = new Date().toISOString();
    let notaAtualizada: NotaZettel | null = null;
    const novasNotas = get().notasZettel.map((n) => {
      if (n.id === id) {
        notaAtualizada = { ...n, ...atualizacao, dataAtualizacao: agora };
        return notaAtualizada;
      }
      return n;
    });

    const sincronizadas = sincronizarConexoesZettel(novasNotas);
    set({ notasZettel: sincronizadas });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: sincronizadas,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel
    });

    if (notaAtualizada) {
      salvarNotaNoSupabase(notaAtualizada).catch((e) => console.warn('Supabase offline/erro:', e));
    }
  },

  removerNotaZettel: (id) => {
    const novasNotas = get().notasZettel.filter((n) => n.id !== id);
    const novoSelecionado = get().notaZettelSelecionadaId === id ? null : get().notaZettelSelecionadaId;
    set({ notasZettel: novasNotas, notaZettelSelecionadaId: novoSelecionado });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: novasNotas,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel
    });
    removerNotaDoSupabase(id).catch((e) => console.warn('Supabase offline/erro:', e));
  },

  selecionarNotaZettel: (id) => {
    set({ notaZettelSelecionadaId: id });
  },

  adicionarNotaTemporaria: (nota) => {
    const nova: NotaTemporaria = {
      ...nota,
      id: `temp-${Date.now()}`,
      dataCriacao: new Date().toISOString(),
      processada: false
    };
    const novasTemporarias = [nova, ...get().notasTemporarias];
    set({ notasTemporarias: novasTemporarias });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: novasTemporarias,
      canvasZettel: get().canvasZettel
    });
    salvarTemporariaNoSupabase(nova).catch((e) => console.warn('Supabase offline/erro:', e));
  },

  marcarNotaTemporariaProcessada: (id) => {
    let tempProcessada: NotaTemporaria | null = null;
    const novas = get().notasTemporarias.map((t) => {
      if (t.id === id) {
        tempProcessada = { ...t, processada: true };
        return tempProcessada;
      }
      return t;
    });
    set({ notasTemporarias: novas });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: novas,
      canvasZettel: get().canvasZettel
    });
    if (tempProcessada) {
      salvarTemporariaNoSupabase(tempProcessada).catch((e) => console.warn('Supabase offline/erro:', e));
    }
  },

  removerNotaTemporaria: (id) => {
    const novas = get().notasTemporarias.filter((t) => t.id !== id);
    set({ notasTemporarias: novas });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: novas,
      canvasZettel: get().canvasZettel
    });
    removerTemporariaDoSupabase(id).catch((e) => console.warn('Supabase offline/erro:', e));
  },

  criarNotaReferenciaDeLivro: (livroId) => {
    const livro = get().livros.find((l) => l.id === livroId);
    if (!livro) throw new Error('Livro não encontrado');

    const agora = new Date();
    const stamp = agora.getFullYear().toString() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0');

    let temaNumero = '1';
    let temaNome = '1 - LITERATURA';
    if (['Filosofia', 'Metafísica', 'Moral'].includes(livro.area)) {
      temaNumero = '5';
      temaNome = '5 - FILOSOFIA';
    } else if (['História', 'História da Igreja', 'Antropologia', 'Política'].includes(livro.area)) {
      temaNumero = '2';
      temaNome = '2 - HISTÓRIA';
    } else if (['Psicologia', 'Método', 'Gramática', 'Lógica'].includes(livro.area)) {
      temaNumero = '3';
      temaNome = '3 - PSICOLOGIA';
    } else if (['Religião', 'Catolicismo'].includes(livro.area)) {
      temaNumero = '4';
      temaNome = '4 - RELIGIÃO';
    }

    const edicao = livro.edicoes_pt?.[0];
    const editora = edicao?.editora || 'Editora Nacional';
    const ano = edicao?.ano || livro.ano;
    const isbnStr = livro.isbn ? ` ISBN ${livro.isbn}.` : '';

    const tituloNota = `${temaNumero}-${stamp} - ${livro.titulo}`;
    const conteudo = `## Referência
${livro.autor.toUpperCase()}. ${livro.titulo}. ${editora}, ${ano}.${isbnStr}

## Relevância
Obra de Nível ${livro.nivel} (Área: ${livro.area}). ${livro.acrescenta}

## Notas Relacionadas
- 

## Resumo
${livro.sinopse_editorial || livro.tese}

## Citações e Comentários
- #síntese p. 1: ${livro.tese}`;

    const novaNota: NotaZettel = {
      id: stamp,
      titulo: tituloNota,
      tipo: 'referencia',
      pasta: '02 referências',
      tags: ['nota de referência'],
      tema: `[[${temaNome}]]`,
      livroId: livro.id,
      conteudo,
      dataCriacao: agora.toISOString(),
      dataAtualizacao: agora.toISOString()
    };

    get().adicionarNotaZettel(novaNota);
    return novaNota;
  },

  criarNotaPermanenteRapida: (numTema, titulo, referencia, pagina, relacao, conteudoInicial, tipoRelacao, citacaoOriginal, justificativaRelacao) => {
    const agora = new Date();
    const stamp = agora.getFullYear().toString() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0');

    const tituloNota = `${numTema}-${stamp} - ${titulo}`;
    const temaNome =
      numTema === 1
        ? '1 - LITERATURA'
        : numTema === 2
        ? '2 - HISTÓRIA'
        : numTema === 3
        ? '3 - PSICOLOGIA'
        : numTema === 4
        ? '4 - RELIGIÃO'
        : '5 - FILOSOFIA';

    // Monta o corpo com a citação de apoio clássica se fornecida
    let corpo = `# ${titulo}\n\n`;
    if (citacaoOriginal) {
      corpo += `> "${citacaoOriginal.trim()}"\n`;
      corpo += `> — ${referencia ? referencia.replace(/\[\[|\]\]/g, '') : 'Fonte'}${pagina ? `, p. ${pagina}` : ''}\n\n`;
    }
    corpo += `## Minha Ideia\n`;
    corpo += conteudoInicial && conteudoInicial.trim()
      ? conteudoInicial.trim()
      : 'Texto autônomo, claro e sintético, com minhas palavras. Uma única ideia.';

    if (relacao) {
      const relacaoNome = relacao.replace(/\[\[|\]\]/g, '');
      const rotuloRelacao = tipoRelacao ? ` (${tipoRelacao})` : '';
      corpo += `\n\n## Conexões\n- [[${relacaoNome}]]${rotuloRelacao}${justificativaRelacao ? `: ${justificativaRelacao}` : ''}`;
    }

    const tags = ['nota permanente'];
    if (tipoRelacao) {
      tags.push(`relacao:${tipoRelacao}`);
    }

    const novaNota: NotaZettel = {
      id: stamp,
      titulo: tituloNota,
      tipo: 'permanente',
      pasta: '03 permanentes',
      tags,
      referencia: referencia ? (referencia.startsWith('[[') ? referencia : `[[${referencia}]]`) : undefined,
      pagina: pagina || undefined,
      relacao: relacao ? (relacao.startsWith('[[') ? relacao : `[[${relacao}]]`) : undefined,
      tipoRelacao,
      justificativaRelacao,
      citacaoOriginal,
      tema: `[[${temaNome}]]`,
      conteudo: corpo,
      dataCriacao: agora.toISOString(),
      dataAtualizacao: agora.toISOString()
    };

    get().adicionarNotaZettel(novaNota);
    return novaNota;
  },

  salvarCanvasZettel: (canvas) => {
    const existentes = get().canvasZettel;
    const index = existentes.findIndex((c) => c.id === canvas.id);
    let novosCanvas: CanvasZettel[];
    if (index >= 0) {
      novosCanvas = existentes.map((c) => (c.id === canvas.id ? canvas : c));
    } else {
      novosCanvas = [...existentes, canvas];
    }
    set({ canvasZettel: novosCanvas });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: novosCanvas
    });
  },

  exportarZettelkastenMarkdown: () => {
    const { notasZettel } = get();
    let exportText = `# Exportação Zettelkasten — Formato Obsidian\n\n`;
    exportText += `*Gerado em ${new Date().toLocaleDateString('pt-BR')}*\n\n---\n\n`;

    notasZettel.forEach((nota) => {
      exportText += `### Arquivo: ${nota.pasta}/${nota.titulo}.md\n\n`;
      exportText += `\`\`\`markdown\n`;
      exportText += `---\n`;
      exportText += `id: ${nota.id}\n`;
      exportText += `tags:\n`;
      nota.tags.forEach((t) => {
        exportText += `  - ${t}\n`;
      });
      if (nota.tema) exportText += `tema: "${nota.tema}"\n`;
      if (nota.referencia) exportText += `referência: "${nota.referencia}"\n`;
      if (nota.pagina) exportText += `página: ${nota.pagina}\n`;
      if (nota.relacao) exportText += `relação: "${nota.relacao}"\n`;
      exportText += `---\n\n`;
      exportText += `${nota.conteudo}\n`;
      exportText += `\`\`\`\n\n---\n\n`;
    });

    return exportText;
  },

  setFundoZettelkasten: (fundo: string) => {
    set({ fundoZettelkasten: fundo });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      fundoZettelkasten: fundo,
      opacidadeFundoZettelkasten: get().opacidadeFundoZettelkasten,
      desfoqueFundoZettelkasten: get().desfoqueFundoZettelkasten
    });
  },

  setOpacidadeFundoZettelkasten: (opacidade: number) => {
    set({ opacidadeFundoZettelkasten: opacidade });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      fundoZettelkasten: get().fundoZettelkasten,
      opacidadeFundoZettelkasten: opacidade,
      desfoqueFundoZettelkasten: get().desfoqueFundoZettelkasten
    });
  },

  setDesfoqueFundoZettelkasten: (desfoque: number) => {
    set({ desfoqueFundoZettelkasten: desfoque });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      fundoZettelkasten: get().fundoZettelkasten,
      opacidadeFundoZettelkasten: get().opacidadeFundoZettelkasten,
      desfoqueFundoZettelkasten: desfoque
    });
  },

  recarregarDadosComEnriquecidos: (enriquecidos) => {
    set({ livros: enriquecidos });
    salvarNoLocalStorage({
      livros: enriquecidos,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro
    });
  },

  // ==========================================
  // AÇÕES DO CADERNO REAL (DIÁRIO INTELECTUAL)
  // ==========================================
  criarCadernoVolume: (titulo, dataInicio) => {
    const id = `vol-${Date.now()}`;
    const hoje = new Date().toISOString().split('T')[0];
    const novoVolume: CadernoVolume = {
      id,
      titulo: titulo?.trim() || `Caderno Real — Vol. ${get().cadernosVolumes.length + 1}`,
      dataInicio: dataInicio || hoje,
      dataFim: null,
      ativo: true,
      criadoEm: new Date().toISOString()
    };
    const novosVolumes = [
      ...get().cadernosVolumes.map((v) => ({ ...v, ativo: false })),
      novoVolume
    ];
    set({ cadernosVolumes: novosVolumes, cadernoAtivoId: id });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      fundoZettelkasten: get().fundoZettelkasten,
      opacidadeFundoZettelkasten: get().opacidadeFundoZettelkasten,
      desfoqueFundoZettelkasten: get().desfoqueFundoZettelkasten,
      cadernosVolumes: novosVolumes,
      cadernoAtivoId: id,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
    return id;
  },

  concluirCadernoVolume: (cadernoId) => {
    const hoje = new Date().toISOString().split('T')[0];
    const novosVolumes = get().cadernosVolumes.map((v) =>
      v.id === cadernoId ? { ...v, ativo: false, dataFim: hoje } : v
    );
    set({ cadernosVolumes: novosVolumes });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: novosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  setCadernoAtivoId: (cadernoId) => {
    set({ cadernoAtivoId: cadernoId });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: cadernoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  salvarCheckinSemanal: (checkin) => {
    const existentes = get().checkinsSemanais;
    const index = existentes.findIndex((c) => c.id === checkin.id);
    const novos = index >= 0
      ? existentes.map((c) => (c.id === checkin.id ? checkin : c))
      : [...existentes, checkin];
    set({ checkinsSemanais: novos });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: novos,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  salvarCheckoutSemanal: (checkout) => {
    const existentes = get().checkoutsSemanais;
    const index = existentes.findIndex((c) => c.id === checkout.id);
    const novos = index >= 0
      ? existentes.map((c) => (c.id === checkout.id ? checkout : c))
      : [...existentes, checkout];
    set({ checkoutsSemanais: novos });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: novos,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  adicionarItemDiaLog: (dataStr, item) => {
    const logs = { ...get().diasLogs };
    const diaAtual = logs[dataStr] || {
      id: dataStr,
      data: dataStr,
      semanaId: `semana-${dataStr.slice(0, 7)}`,
      cadernoId: get().cadernoAtivoId,
      paginaNumero: Object.keys(logs).length + 4,
      revisado: false,
      dataRevisao: null,
      itens: [],
      termometro: { texto: '', humor: '', atualizadoEm: '' }
    };

    const novoItem: ItemDailyLog = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      criadoEm: new Date().toISOString()
    };

    logs[dataStr] = {
      ...diaAtual,
      itens: [...diaAtual.itens, novoItem]
    };

    set({ diasLogs: logs });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: logs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  atualizarItemDiaLog: (dataStr, itemId, patch) => {
    const logs = { ...get().diasLogs };
    const dia = logs[dataStr];
    if (!dia) return;

    logs[dataStr] = {
      ...dia,
      itens: dia.itens.map((it) => (it.id === itemId ? { ...it, ...patch } : it))
    };

    set({ diasLogs: logs });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: logs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  removerItemDiaLog: (dataStr, itemId) => {
    const logs = { ...get().diasLogs };
    const dia = logs[dataStr];
    if (!dia) return;

    logs[dataStr] = {
      ...dia,
      itens: dia.itens.filter((it) => it.id !== itemId)
    };

    set({ diasLogs: logs });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: logs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  reordenarItensDiaLog: (dataStr, novosItens) => {
    const logs = { ...get().diasLogs };
    const dia = logs[dataStr];
    if (!dia) return;

    logs[dataStr] = {
      ...dia,
      itens: novosItens
    };

    set({ diasLogs: logs });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: logs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  atualizarTermometroDia: (dataStr, texto, humor) => {
    const logs = { ...get().diasLogs };
    const dia = logs[dataStr] || {
      id: dataStr,
      data: dataStr,
      semanaId: `semana-${dataStr.slice(0, 7)}`,
      cadernoId: get().cadernoAtivoId,
      paginaNumero: Object.keys(logs).length + 4,
      revisado: false,
      dataRevisao: null,
      itens: [],
      termometro: { texto: '', humor: '', atualizadoEm: '' }
    };

    logs[dataStr] = {
      ...dia,
      termometro: {
        texto,
        humor: humor ?? dia.termometro?.humor,
        atualizadoEm: new Date().toISOString()
      }
    };

    set({ diasLogs: logs });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: logs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  revisarFecharDia: (dataStr, acoesPendentes) => {
    const logs = { ...get().diasLogs };
    const dia = logs[dataStr];
    if (!dia) return;

    let itensAtualizados = [...dia.itens];

    if (acoesPendentes) {
      const dataObj = new Date(dataStr + 'T12:00:00');
      dataObj.setDate(dataObj.getDate() + 1);
      const dataAmanhaStr = dataObj.toISOString().split('T')[0];

      Object.entries(acoesPendentes).forEach(([itemId, decisao]) => {
        const itemIndex = itensAtualizados.findIndex((it) => it.id === itemId);
        if (itemIndex === -1) return;

        const itemOrig = itensAtualizados[itemIndex];
        if (decisao.acao === 'concluir') {
          itensAtualizados[itemIndex] = { ...itemOrig, estado: 'concluido' };
        } else if (decisao.acao === 'cancelar') {
          itensAtualizados[itemIndex] = { ...itemOrig, estado: 'cancelado' };
        } else if (decisao.acao === 'migrar') {
          const destino = decisao.dataDestino || dataAmanhaStr;
          itensAtualizados[itemIndex] = { ...itemOrig, estado: 'migrado', migradoPara: destino };

          const diaDestino = logs[destino] || {
            id: destino,
            data: destino,
            semanaId: dia.semanaId,
            cadernoId: dia.cadernoId,
            paginaNumero: Object.keys(logs).length + 4,
            revisado: false,
            dataRevisao: null,
            itens: [],
            termometro: { texto: '', humor: '', atualizadoEm: '' }
          };

          const novoItemMigrado: ItemDailyLog = {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            tipo: itemOrig.tipo,
            texto: `${itemOrig.texto} (migrado de ${dataStr.split('-').reverse().slice(0, 2).join('/')})`,
            hora: itemOrig.hora,
            estado: 'pendente',
            urgente: itemOrig.urgente,
            criadoEm: new Date().toISOString()
          };

          logs[destino] = {
            ...diaDestino,
            itens: [...diaDestino.itens, novoItemMigrado]
          };
        }
      });
    }

    logs[dataStr] = {
      ...dia,
      itens: itensAtualizados,
      revisado: true,
      dataRevisao: new Date().toISOString()
    };

    set({ diasLogs: logs });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: logs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  salvarPaginaLivre: (pagina) => {
    const existentes = get().paginasLivresCaderno;
    const index = existentes.findIndex((p) => p.id === pagina.id);
    const novas = index >= 0
      ? existentes.map((p) => (p.id === pagina.id ? pagina : p))
      : [...existentes, pagina];
    set({ paginasLivresCaderno: novas });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: novas,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  removerPaginaLivre: (id) => {
    const novas = get().paginasLivresCaderno.filter((p) => p.id !== id);
    set({ paginasLivresCaderno: novas });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: novas,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  toggleLegendaSimbolos: () => {
    const nova = !get().legendaSimbolosVisivel;
    set({ legendaSimbolosVisivel: nova });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: nova,
      estiloDotGridAtivo: get().estiloDotGridAtivo
    });
  },

  toggleEstiloDotGrid: () => {
    const novo = !get().estiloDotGridAtivo;
    set({ estiloDotGridAtivo: novo });
    salvarNoLocalStorage({
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana,
      modoEscuro: get().modoEscuro,
      notasZettel: get().notasZettel,
      notasTemporarias: get().notasTemporarias,
      canvasZettel: get().canvasZettel,
      cadernosVolumes: get().cadernosVolumes,
      cadernoAtivoId: get().cadernoAtivoId,
      checkinsSemanais: get().checkinsSemanais,
      diasLogs: get().diasLogs,
      checkoutsSemanais: get().checkoutsSemanais,
      paginasLivresCaderno: get().paginasLivresCaderno,
      legendaSimbolosVisivel: get().legendaSimbolosVisivel,
      estiloDotGridAtivo: novo
    });
  },

  converterNotaTemporariaParaDiario: (notaTempId, tipo, dataStr) => {
    const temp = get().notasTemporarias.find((t) => t.id === notaTempId);
    if (!temp) return;

    const hoje = dataStr || new Date().toISOString().split('T')[0];
    const textoItem = `${temp.pensamento} [Fonte: ${temp.fonte}${temp.pagina ? `, p. ${temp.pagina}` : ''}]`;

    get().adicionarItemDiaLog(hoje, {
      tipo,
      texto: textoItem,
      estado: 'pendente',
      urgente: false
    });

    get().marcarNotaTemporariaProcessada(notaTempId);
  }
}));
