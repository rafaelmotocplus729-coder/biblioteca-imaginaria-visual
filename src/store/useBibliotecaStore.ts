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
  CanvasZettel
} from '../types';
import livrosEnriquecidos from '../../data/enriquecido.json';
import relacoesPadrao from '../../data/relacoes.json';
import {
  NOTAS_ZETTEL_INICIAIS,
  NOTAS_TEMPORARIAS_INICIAIS,
  CANVAS_ZETTEL_INICIAL
} from '../data/zettelkastenPadrao';
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
  criarNotaPermanenteRapida: (numTema: number, titulo: string, referencia: string, pagina?: number | string, relacao?: string) => NotaZettel;
  salvarCanvasZettel: (canvas: CanvasZettel) => void;
  exportarZettelkastenMarkdown: () => string;

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
  for (let i = 1; i <= 60; i++) {
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

function filtrarMockupsZettel(salvas?: NotaZettel[]): NotaZettel[] {
  if (!salvas || salvas.length === 0) return NOTAS_ZETTEL_INICIAIS;
  const reais = salvas.filter((n) => !IDS_MOCKUPS.has(n.id));
  if (reais.length === 0) return NOTAS_ZETTEL_INICIAIS;
  // Garantir que os 5 índices fundamentais existam
  const indicesExistentes = new Set(reais.filter((n) => n.tipo === 'indice').map((n) => n.id));
  const faltantes = NOTAS_ZETTEL_INICIAIS.filter((idx) => !indicesExistentes.has(idx.id));
  return [...faltantes, ...reais];
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
      status_busca: enr.status_busca
    };
  });
}

export const useBibliotecaStore = create<BibliotecaState>((set, get) => ({
  livros: sincronizarLivrosComEnriquecidos(salvo?.livros),
  relacoes: salvo?.relacoes || (relacoesPadrao as Relacao[]),
  progressos: salvo?.progressos || getProgressosIniciais(),
  sessoesRevisao: salvo?.sessoesRevisao || [],
  
  // Zettelkasten Real (Sem mockups)
  notasZettel: filtrarMockupsZettel(salvo?.notasZettel),
  notasTemporarias: filtrarMockupsTemporarias(salvo?.notasTemporarias),
  canvasZettel: salvo?.canvasZettel || [CANVAS_ZETTEL_INICIAL],
  notaZettelSelecionadaId: null,

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
      versao: '0.1.0',
      data_exportacao: new Date().toISOString(),
      livros: get().livros,
      relacoes: get().relacoes,
      progressos: get().progressos,
      sessoesRevisao: get().sessoesRevisao,
      horasPorSemana: get().horasPorSemana
    };
    return JSON.stringify(backup, null, 2);
  },

  importarJSON: (jsonString) => {
    try {
      const backup = JSON.parse(jsonString);
      if (backup && Array.isArray(backup.livros)) {
        set({
          livros: backup.livros,
          relacoes: backup.relacoes || get().relacoes,
          progressos: backup.progressos || get().progressos,
          sessoesRevisao: backup.sessoesRevisao || [],
          horasPorSemana: backup.horasPorSemana || 6
        });
        salvarNoLocalStorage({
          livros: backup.livros,
          relacoes: backup.relacoes || get().relacoes,
          progressos: backup.progressos || get().progressos,
          sessoesRevisao: backup.sessoesRevisao || [],
          horasPorSemana: backup.horasPorSemana || 6,
          modoEscuro: get().modoEscuro
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
    const novasNotas = [nota, ...get().notasZettel];
    set({ notasZettel: novasNotas, notaZettelSelecionadaId: nota.id });
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
    // Persistência assíncrona no Supabase
    salvarNotaNoSupabase(nota).catch((e) => console.warn('Supabase offline/erro:', e));
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

    set({ notasZettel: novasNotas });
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
    let temaNome = '1 Literatura';
    if (['Filosofia', 'Metafísica', 'Moral'].includes(livro.area)) {
      temaNumero = '2';
      temaNome = '2 Filosofia';
    } else if (['Método', 'Gramática', 'Lógica', 'Psicologia'].includes(livro.area)) {
      temaNumero = '3';
      temaNome = '3 Método e Produtividade Intelectual';
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

  criarNotaPermanenteRapida: (numTema, titulo, referencia, pagina, relacao) => {
    const agora = new Date();
    const stamp = agora.getFullYear().toString() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0');

    const tituloNota = `${numTema}-${stamp} - ${titulo}`;
    const temaNome = numTema === 1 ? '1 Literatura' : (numTema === 2 ? '2 Filosofia' : '3 Método e Produtividade Intelectual');

    const novaNota: NotaZettel = {
      id: stamp,
      titulo: tituloNota,
      tipo: 'permanente',
      pasta: '03 permanentes',
      tags: ['nota permanente'],
      referencia: referencia ? (referencia.startsWith('[[') ? referencia : `[[${referencia}]]`) : undefined,
      pagina: pagina || undefined,
      relacao: relacao ? (relacao.startsWith('[[') ? relacao : `[[${relacao}]]`) : undefined,
      tema: `[[${temaNome}]]`,
      conteudo: `# ${titulo}\n\nTexto autônomo, claro e sintético, com minhas palavras. Uma única ideia.`,
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
  }
}));
