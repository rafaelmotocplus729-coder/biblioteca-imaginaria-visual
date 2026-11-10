import { create } from 'zustand';
import { Livro, Progresso, Relacao, Filtros, EstadoLeitura, SessaoRevisao } from '../types';
import livrosEnriquecidos from '../../data/enriquecido.json';
import relacoesPadrao from '../../data/relacoes.json';

interface BibliotecaState {
  livros: Livro[];
  relacoes: Relacao[];
  progressos: Record<number, Progresso>;
  sessoesRevisao: SessaoRevisao[];
  
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
}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
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
      por_que_antes_do_proximo: enr.por_que_antes_do_proximo
    };
  });
}

export const useBibliotecaStore = create<BibliotecaState>((set, get) => ({
  livros: sincronizarLivrosComEnriquecidos(salvo?.livros),
  relacoes: salvo?.relacoes || (relacoesPadrao as Relacao[]),
  progressos: salvo?.progressos || getProgressosIniciais(),
  sessoesRevisao: salvo?.sessoesRevisao || [],
  
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
