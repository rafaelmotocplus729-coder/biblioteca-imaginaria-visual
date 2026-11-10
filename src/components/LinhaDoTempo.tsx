import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Livro, Progresso, EstadoLeitura } from '../types';
import { CORES_AREAS } from '../constants/theme';
import {
  CheckCircle2,
  BookOpen,
  Clock,
  Sparkles,
  ArrowUpDown,
  Search,
  RotateCcw,
  Landmark,
  Compass,
  Scroll,
  Sun,
  Flame,
  Globe2,
  ChevronRight,
  ChevronLeft,
  BookMarked,
  MoveHorizontal,
  ListFilter,
  Maximize2,
  Minimize2,
  Navigation
} from 'lucide-react';

interface LinhaDoTempoProps {
  livros: Livro[];
  progressos: Record<number, Progresso>;
  onSelecionarLivro: (id: number) => void;
}

export interface PeriodoHistorico {
  id: string;
  nome: string;
  subtitulo: string;
  anoInicio: number;
  anoFim: number;
  rotuloAnos: string;
  descricao: string;
  corTag: string;
  corBorda: string;
  corFundoHeader: string;
  icone: React.ComponentType<{ className?: string }>;
}

export const PERIODOS_HISTORICOS: PeriodoHistorico[] = [
  {
    id: 'antiguidade',
    nome: 'Antiguidade Clássica',
    subtitulo: 'Grécia, Roma & Patrística',
    anoInicio: -1000,
    anoFim: 476,
    rotuloAnos: 'c. 450 a.C. — 476 d.C.',
    descricao: 'Os alicerces da razão dialética, tragédia clássica, pólis e a gênese do pensamento cristão.',
    corTag: 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300 dark:border-amber-800',
    corBorda: 'border-amber-500',
    corFundoHeader: 'from-amber-900/15 to-amber-700/5 dark:from-amber-950/40 dark:to-stone-900/30',
    icone: Landmark
  },
  {
    id: 'idade-media',
    nome: 'Idade Média & Escolástica',
    subtitulo: 'Síntese Filosófica & Cosmovisão',
    anoInicio: 476,
    anoFim: 1453,
    rotuloAnos: '476 — 1453 d.C.',
    descricao: 'Harmonia entre fé e intelecto, a Suma Teológica, alegoria da alma e filosofia da civilização.',
    corTag: 'bg-orange-100 text-orange-900 dark:bg-orange-950/70 dark:text-orange-200 border-orange-300 dark:border-orange-800',
    corBorda: 'border-orange-500',
    corFundoHeader: 'from-orange-900/15 to-orange-700/5 dark:from-orange-950/40 dark:to-stone-900/30',
    icone: Scroll
  },
  {
    id: 'renascimento',
    nome: 'Renascimento & Humanismo',
    subtitulo: 'Realismo Político & Ensaísmo Cético',
    anoInicio: 1453,
    anoFim: 1600,
    rotuloAnos: '1453 — 1600',
    descricao: 'A redescoberta do indivíduo, a virtù maquiavélica, o ensaísmo introspectivo e a sátira cavalheiresca.',
    corTag: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
    corBorda: 'border-emerald-500',
    corFundoHeader: 'from-emerald-900/15 to-emerald-700/5 dark:from-emerald-950/40 dark:to-stone-900/30',
    icone: Compass
  },
  {
    id: 'iluminismo',
    nome: 'Iluminismo & Idade da Razão',
    subtitulo: 'Racionalismo, Contrato & Luzes',
    anoInicio: 1600,
    anoFim: 1789,
    rotuloAnos: '1600 — 1789',
    descricao: 'Dúvida metódica, soberania política, fundamentos da economia política e a crítica da razão pura.',
    corTag: 'bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-200 border-blue-300 dark:border-blue-800',
    corBorda: 'border-blue-500',
    corFundoHeader: 'from-blue-900/15 to-blue-700/5 dark:from-blue-950/40 dark:to-stone-900/30',
    icone: Sun
  },
  {
    id: 'modernidade',
    nome: 'Modernidade & Século XIX',
    subtitulo: 'Dialética, Revoluções & Realismo',
    anoInicio: 1789,
    anoFim: 1914,
    rotuloAnos: '1789 — 1914',
    descricao: 'O choque de classes, o drama existencial, a tragédia moral, a crítica à modernidade e o nascimento da sociologia.',
    corTag: 'bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200 border-purple-300 dark:border-purple-800',
    corBorda: 'border-purple-500',
    corFundoHeader: 'from-purple-900/15 to-purple-700/5 dark:from-purple-950/40 dark:to-stone-900/30',
    icone: Flame
  },
  {
    id: 'contemporaneidade',
    nome: 'Contemporaneidade (Séc. XX & XXI)',
    subtitulo: 'Crise dos Sistemas & Liberdade',
    anoInicio: 1914,
    anoFim: 2100,
    rotuloAnos: '1914 — Dias de Hoje',
    descricao: 'As guerras mundiais, o totalitarismo, existencialismo, ordem espontânea vs mercado e modernidade líquida.',
    corTag: 'bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-200 border-rose-300 dark:border-rose-800',
    corBorda: 'border-rose-500',
    corFundoHeader: 'from-rose-900/15 to-rose-700/5 dark:from-rose-950/40 dark:to-stone-900/30',
    icone: Globe2
  }
];

export function extrairAnoNumerico(anoStr: string): number {
  if (!anoStr) return 0;
  const s = String(anoStr).trim();
  const matchBC = s.match(/(\d+)\s*a\.C\./i);
  if (matchBC) return -parseInt(matchBC[1], 10);
  const match = s.match(/(\d{3,4})/);
  if (match) return parseInt(match[1], 10);
  return 0;
}

export function identificarPeriodo(anoNum: number): PeriodoHistorico {
  for (const p of PERIODOS_HISTORICOS) {
    if (anoNum >= p.anoInicio && anoNum < p.anoFim) {
      return p;
    }
  }
  return PERIODOS_HISTORICOS[PERIODOS_HISTORICOS.length - 1];
}

export const LinhaDoTempo: React.FC<LinhaDoTempoProps> = ({
  livros,
  progressos,
  onSelecionarLivro
}) => {
  // Modo de exibição: 'horizontal' (padrão panorâmico navegável) vs 'vertical' (lista)
  const [modoVisualizacao, setModoVisualizacao] = useState<'horizontal' | 'vertical'>('horizontal');
  const [densidade, setDensidade] = useState<'confortavel' | 'compacto'>('confortavel');

  const [periodoAtivo, setPeriodoAtivo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'lido' | 'lendo' | 'a_ler'>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('asc');

  // Controle de arrasto e rolagem lateral
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Todas as áreas presentes
  const areas = useMemo(() => {
    return Array.from(new Set(livros.map((l) => l.area))).sort();
  }, [livros]);

  // Livros com metadados cronológicos enriquecidos
  const livrosComPeriodo = useMemo(() => {
    return livros.map((livro) => {
      const anoNum = extrairAnoNumerico(livro.ano);
      const periodo = identificarPeriodo(anoNum);
      const estadoAtual: EstadoLeitura = progressos[livro.id]?.estado || 'nao_iniciado';
      return {
        ...livro,
        anoNum,
        periodo,
        estadoAtual
      };
    });
  }, [livros, progressos]);

  // Contadores globais
  const estatisticas = useMemo(() => {
    const total = livros.length;
    const lidos = livrosComPeriodo.filter((l) => l.estadoAtual === 'lido').length;
    const lendo = livrosComPeriodo.filter((l) => l.estadoAtual === 'lendo').length;
    const aLer = total - lidos - lendo;
    const porcentagem = total > 0 ? Math.round((lidos / total) * 100) : 0;
    return { total, lidos, lendo, aLer, porcentagem };
  }, [livros.length, livrosComPeriodo]);

  // Contadores por período
  const contagemPorPeriodo = useMemo(() => {
    const mapa: Record<string, { total: number; lidos: number }> = {};
    PERIODOS_HISTORICOS.forEach((p) => {
      const noPeriodo = livrosComPeriodo.filter((l) => l.periodo.id === p.id);
      mapa[p.id] = {
        total: noPeriodo.length,
        lidos: noPeriodo.filter((l) => l.estadoAtual === 'lido').length
      };
    });
    return mapa;
  }, [livrosComPeriodo]);

  // Filtragem e ordenação
  const livrosExibidos = useMemo(() => {
    return livrosComPeriodo
      .filter((livro) => {
        // Filtro de Período Histórico (apenas se não for 'todos')
        if (periodoAtivo !== 'todos' && livro.periodo.id !== periodoAtivo) {
          return false;
        }

        // Filtro de Estado de Leitura
        if (filtroEstado === 'lido' && livro.estadoAtual !== 'lido') return false;
        if (filtroEstado === 'lendo' && livro.estadoAtual !== 'lendo') return false;
        if (filtroEstado === 'a_ler' && (livro.estadoAtual === 'lido' || livro.estadoAtual === 'lendo')) return false;

        // Filtro de Área
        if (filtroArea && livro.area !== filtroArea) return false;

        // Busca Textual
        if (buscaTexto.trim()) {
          const termo = buscaTexto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const matchTitulo = livro.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(termo);
          const matchAutor = livro.autor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(termo);
          const matchAno = livro.ano.toLowerCase().includes(termo);
          const matchTese = livro.tese.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(termo);
          if (!matchTitulo && !matchAutor && !matchAno && !matchTese) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (ordem === 'asc') {
          return a.anoNum - b.anoNum || a.id - b.id;
        }
        return b.anoNum - a.anoNum || b.id - a.id;
      });
  }, [livrosComPeriodo, periodoAtivo, filtroEstado, filtroArea, buscaTexto, ordem]);

  // Agrupamento dos livros exibidos por período para renderização
  const gruposPorPeriodo = useMemo(() => {
    const periodosUsados = ordem === 'asc' ? PERIODOS_HISTORICOS : [...PERIODOS_HISTORICOS].reverse();
    return periodosUsados
      .map((periodo) => {
        const itens = livrosExibidos.filter((l) => l.periodo.id === periodo.id);
        return {
          periodo,
          itens
        };
      })
      .filter((grupo) => grupo.itens.length > 0);
  }, [livrosExibidos, ordem]);

  // Atualizador do progresso de rolagem
  const atualizarProgressoScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.round((scrollLeft / maxScroll) * 100));
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    atualizarProgressoScroll();
  }, [gruposPorPeriodo, modoVisualizacao]);

  // Handlers para arrastar lateralmente com o mouse (Drag to Pan)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    const target = e.target as HTMLElement;
    // Evitar iniciar drag se clicou em botões de ação ou links
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    setIsDraggingState(true);
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current);
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    atualizarProgressoScroll();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
  };

  // Suporte a rolagem horizontal via roda do mouse (Wheel)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (modoVisualizacao !== 'horizontal' || !scrollContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY * 1.3;
      atualizarProgressoScroll();
    }
  };

  // Botões de navegação lateral
  const rolarHorizontal = (delta: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: delta,
      behavior: 'smooth'
    });
    setTimeout(atualizarProgressoScroll, 350);
  };

  // Salto direto para uma Era na fita horizontal
  const navegarParaEra = (eraId: string) => {
    if (modoVisualizacao === 'horizontal') {
      const el = document.getElementById(`era-horizontal-${eraId}`);
      if (el && scrollContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        setTimeout(atualizarProgressoScroll, 400);
      }
    } else {
      const el = document.getElementById(`era-vertical-${eraId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleClickLivro = (id: number) => {
    // Se o usuário estava apenas arrastando a tela, não dispara abertura acidental
    if (hasMovedRef.current) return;
    onSelecionarLivro(id);
  };

  const limparFiltros = () => {
    setPeriodoAtivo('todos');
    setFiltroEstado('todos');
    setFiltroArea('');
    setBuscaTexto('');
    setOrdem('asc');
  };

  const temFiltroAtivo =
    periodoAtivo !== 'todos' ||
    filtroEstado !== 'todos' ||
    Boolean(filtroArea) ||
    Boolean(buscaTexto.trim()) ||
    ordem !== 'asc';

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* 1. CABEÇALHO EDITORIAL & ESTATÍSTICAS HISTÓRICAS */}
      <section className="bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -bottom-10 pointer-events-none opacity-5 dark:opacity-10 text-stone-900 dark:text-stone-100 select-none">
          <Landmark className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-bold tracking-wider uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                A Grande Conversação
              </span>
              <span className="text-xs text-stone-500 font-serif italic">
                De Sófocles (441 a.C.) ao Século XXI
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Linha do Tempo Cronológica das Obras
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
              A história do pensamento é uma fita contínua de 2.500 anos. Mova lateralmente para percorrer as eras,
              descobrir contrapontos e acompanhar seu progresso de leitura.
            </p>
          </div>

          {/* Cards de Métricas de Leitura */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[10px] uppercase font-cinzel text-stone-500 block">Total no Acervo</span>
              <strong className="text-lg sm:text-xl font-cinzel text-stone-900 dark:text-stone-100">
                {estatisticas.total}
              </strong>
              <span className="text-[10px] text-stone-500 block">120 Obras</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[10px] uppercase font-cinzel text-emerald-700 dark:text-emerald-400 block">Lidas</span>
              <strong className="text-lg sm:text-xl font-cinzel text-emerald-800 dark:text-emerald-200">
                {estatisticas.lidos}
              </strong>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono">
                {estatisticas.porcentagem}% concluído
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-[10px] uppercase font-cinzel text-amber-700 dark:text-amber-400 block">Lendo Agora</span>
              <strong className="text-lg sm:text-xl font-cinzel text-amber-800 dark:text-amber-200">
                {estatisticas.lendo}
              </strong>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block">em andamento</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[10px] uppercase font-cinzel text-stone-500 block">A Ler</span>
              <strong className="text-lg sm:text-xl font-cinzel text-stone-700 dark:text-stone-300">
                {estatisticas.aLer}
              </strong>
              <span className="text-[10px] text-stone-500 block">restantes</span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Global */}
        <div className="mt-5 pt-4 border-t border-stone-200/80 dark:border-stone-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-cinzel text-stone-600 dark:text-stone-400">
            <span>Progresso da Travessia Histórica</span>
            <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
              {estatisticas.lidos} de {estatisticas.total} obras lidas ({estatisticas.porcentagem}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-200/80 dark:bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${estatisticas.porcentagem}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. RÉGUA CRONOLÓGICA DAS 6 ERAS & NAVEGAÇÃO RÁPIDA */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-cinzel font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2">
            <Navigation className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            Navegador Rápido pelas Grandes Eras
          </h3>
          <span className="text-[11px] text-stone-500 font-serif italic hidden sm:inline">
            Clique em uma era para deslizar a linha do tempo diretamente até ela
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* Botão de Todos os Períodos */}
          <button
            onClick={() => {
              setPeriodoAtivo('todos');
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }
            }}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              periodoAtivo === 'todos'
                ? 'bg-amber-900 text-amber-50 border-amber-700 shadow-md ring-1 ring-amber-600/50'
                : 'bg-library-paper dark:bg-library-darkPaper text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-amber-200">
                  {estatisticas.total}
                </span>
              </div>
              <h4 className="font-cinzel font-bold text-xs mt-2">Visão Total</h4>
              <p className="text-[10px] opacity-80 mt-0.5 line-clamp-1">Todas as 6 Eras</p>
            </div>
            <div className="mt-3 pt-1.5 border-t border-white/10 text-[9.5px] font-mono opacity-80">
              {estatisticas.lidos}/{estatisticas.total} lidas
            </div>
          </button>

          {/* Cards das 6 Eras */}
          {PERIODOS_HISTORICOS.map((periodo) => {
            const IconeEra = periodo.icone;
            const dadosEra = contagemPorPeriodo[periodo.id] || { total: 0, lidos: 0 };
            const isActive = periodoAtivo === periodo.id;
            const percEra = dadosEra.total > 0 ? Math.round((dadosEra.lidos / dadosEra.total) * 100) : 0;

            return (
              <button
                key={periodo.id}
                onClick={() => {
                  if (periodoAtivo === periodo.id) {
                    setPeriodoAtivo('todos');
                  } else {
                    setPeriodoAtivo(periodo.id);
                  }
                  navegarParaEra(periodo.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                  isActive
                    ? 'bg-amber-900 text-amber-50 border-amber-700 shadow-md ring-1 ring-amber-600/50'
                    : 'bg-library-paper dark:bg-library-darkPaper text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <IconeEra className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform'}`} />
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-black/20 text-amber-200' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      {dadosEra.total}
                    </span>
                  </div>
                  <h4 className="font-cinzel font-bold text-xs mt-2 line-clamp-1" title={periodo.nome}>
                    {periodo.nome}
                  </h4>
                  <p className="text-[9.5px] opacity-75 font-mono line-clamp-1">
                    {periodo.rotuloAnos}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/50 dark:border-stone-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[9.5px] font-mono">
                    <span className="opacity-80">{dadosEra.lidos}/{dadosEra.total} lidas</span>
                    <span className="opacity-90 font-bold">{percEra}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isActive ? 'bg-amber-300' : 'bg-amber-600 dark:bg-amber-500'
                      }`}
                      style={{ width: `${percEra}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. BARRA DE CONTROLES: MODO HORIZONTAL / VERTICAL + FILTROS + ROLAGEM */}
      <section className="bg-library-paper/90 dark:bg-library-darkPaper/90 p-3.5 sm:p-4 rounded-xl border border-stone-200/90 dark:border-stone-800/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Seletor de Modo de Exibição (Horizontal Panorâmica vs Vertical Clássica) */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800 shrink-0">
            <button
              onClick={() => setModoVisualizacao('horizontal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 ${
                modoVisualizacao === 'horizontal'
                  ? 'bg-amber-900 text-amber-50 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Linha do tempo contínua horizontal com rolagem lateral"
            >
              <MoveHorizontal className="w-4 h-4 text-amber-400" />
              <span>Linha Horizontal (Rolagem Lateral)</span>
            </button>
            <button
              onClick={() => setModoVisualizacao('vertical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 ${
                modoVisualizacao === 'vertical'
                  ? 'bg-amber-900 text-amber-50 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Linha do tempo vertical em formato de lista cronológica"
            >
              <ListFilter className="w-4 h-4" />
              <span>Lista Vertical</span>
            </button>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Buscar obra, autor, ano ou conceito (ex: Platão, 1848, virtude)..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {buscaTexto && (
              <button
                onClick={() => setBuscaTexto('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro de Leitura */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-800 overflow-x-auto shrink-0">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-cinzel font-semibold transition-all shrink-0 ${
                filtroEstado === 'todos'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Todas ({livrosComPeriodo.length})
            </button>
            <button
              onClick={() => setFiltroEstado('lido')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-cinzel font-semibold transition-all shrink-0 flex items-center gap-1 ${
                filtroEstado === 'lido'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lidas ({estatisticas.lidos})</span>
            </button>
            <button
              onClick={() => setFiltroEstado('lendo')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-cinzel font-semibold transition-all shrink-0 flex items-center gap-1 ${
                filtroEstado === 'lendo'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-amber-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Lendo ({estatisticas.lendo})</span>
            </button>
            <button
              onClick={() => setFiltroEstado('a_ler')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-cinzel font-semibold transition-all shrink-0 flex items-center gap-1 ${
                filtroEstado === 'a_ler'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>A Ler ({estatisticas.aLer})</span>
            </button>
          </div>
        </div>

        {/* Linha Secundária: Filtro por Área, Ordenação, Densidade & Botões de Navegação Horizontal */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Área */}
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Todas as Áreas ({areas.length})</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            {/* Alternador de Ordenação */}
            <button
              onClick={() => setOrdem(ordem === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-amber-500 font-cinzel text-xs transition-colors"
              title="Inverter sentido cronológico"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>
                {ordem === 'asc' ? 'Antigos ➔ Recentes' : 'Recentes ➔ Antigos'}
              </span>
            </button>

            {/* Controle de Densidade de Cards no Modo Horizontal */}
            {modoVisualizacao === 'horizontal' && (
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => setDensidade('confortavel')}
                  className={`px-2 py-0.5 rounded text-[11px] font-cinzel ${
                    densidade === 'confortavel'
                      ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-200 shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Exibir capas maiores e resumo das teses"
                >
                  <Maximize2 className="w-3 h-3 inline mr-1" />
                  Confortável
                </button>
                <button
                  onClick={() => setDensidade('compacto')}
                  className={`px-2 py-0.5 rounded text-[11px] font-cinzel ${
                    densidade === 'compacto'
                      ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-200 shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Visão condensada para visualizar mais livros simultaneamente"
                >
                  <Minimize2 className="w-3 h-3 inline mr-1" />
                  Compacto
                </button>
              </div>
            )}

            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          {/* Controles de Navegação Horizontal e Contador */}
          <div className="flex items-center gap-3">
            {modoVisualizacao === 'horizontal' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-stone-500 font-mono hidden sm:inline">
                  Navegação Lateral:
                </span>
                <button
                  onClick={() => rolarHorizontal(-600)}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-amber-950 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-amber-900 transition-colors"
                  title="Deslocar lateralmente para a esquerda"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => rolarHorizontal(600)}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-amber-950 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-amber-900 transition-colors"
                  title="Deslocar lateralmente para a direita"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="text-stone-500 text-xs font-serif">
              <strong>{livrosExibidos.length}</strong> de {livros.length} obras
            </div>
          </div>
        </div>

        {/* Mini barra de indicador de posição lateral na fita horizontal */}
        {modoVisualizacao === 'horizontal' && (
          <div className="pt-1 flex items-center gap-3 text-[11px] font-mono text-stone-500 border-t border-stone-200/40 dark:border-stone-800/40">
            <span className="shrink-0 font-cinzel text-amber-800 dark:text-amber-300 font-bold">
              {ordem === 'asc' ? 'c. 450 a.C.' : 'Século XXI'}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden relative">
              <div
                className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-150"
                style={{ width: `${Math.max(5, scrollProgress)}%` }}
              />
            </div>
            <span className="shrink-0 font-cinzel text-amber-800 dark:text-amber-300 font-bold">
              {ordem === 'asc' ? 'Século XXI' : 'c. 450 a.C.'}
            </span>
            <span className="text-[10px] text-stone-400">
              ({scrollProgress}%)
            </span>
          </div>
        )}
      </section>

      {/* DICA DE INTERAÇÃO NO MODO HORIZONTAL */}
      {modoVisualizacao === 'horizontal' && (
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <span className="text-base">🧭</span>
            <span className="font-serif">
              <strong>Como navegar:</strong> Clique e arraste para os lados com o mouse, use a roda do mouse (scroll horizontal) ou as setas laterais para explorar toda a fita histórica.
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 hidden md:inline">
            {gruposPorPeriodo.length} {gruposPorPeriodo.length === 1 ? 'Era visível' : 'Eras visíveis'}
          </span>
        </div>
      )}

      {/* MENSAGEM SE NENHUM LIVRO BATER COM OS FILTROS */}
      {gruposPorPeriodo.length === 0 ? (
        <div className="p-12 text-center bg-library-paper/60 dark:bg-library-darkPaper/60 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
          <BookMarked className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-serif font-bold text-stone-700 dark:text-stone-300 text-base">
            Nenhuma obra encontrada para os filtros selecionados
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Tente remover os filtros de época, área ou termo de busca para visualizar as obras na linha do tempo.
          </p>
          <button
            onClick={limparFiltros}
            className="px-4 py-2 rounded-lg bg-amber-900 text-amber-100 text-xs font-cinzel font-semibold hover:bg-amber-800 transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Linha do Tempo Completa</span>
          </button>
        </div>
      ) : modoVisualizacao === 'horizontal' ? (
        /* ========================================================================= */
        /* 4. MODO HORIZONTAL PANORÂMICO CONTÍNUO (DRAG-TO-PAN / ROLAGEM LATERAL)   */
        /* ========================================================================= */
        <div className="relative group">
          {/* Botões Flutuantes Laterais de Avanço Rápido */}
          <button
            onClick={() => rolarHorizontal(-700)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-library-paper/90 dark:bg-library-darkPaper/90 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 shadow-xl backdrop-blur-md flex items-center justify-center hover:bg-amber-700 hover:text-white transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
            title="Mover para esquerda"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => rolarHorizontal(700)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-library-paper/90 dark:bg-library-darkPaper/90 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 shadow-xl backdrop-blur-md flex items-center justify-center hover:bg-amber-700 hover:text-white transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
            title="Mover para direita"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Contêiner de Rolagem Horizontal */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            onScroll={atualizarProgressoScroll}
            className={`w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-stone-100/60 dark:bg-stone-950/60 p-4 sm:p-6 transition-all ${
              isDraggingState ? 'cursor-grabbing select-none' : 'cursor-grab'
            } [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-stone-200/60 dark:[&::-webkit-scrollbar-track]:bg-stone-900/60 [&::-webkit-scrollbar-thumb]:bg-amber-600/70 dark:[&::-webkit-scrollbar-thumb]:bg-amber-500/70 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-amber-700`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(217 119 6) rgba(120, 113, 108, 0.2)'
            }}
          >
            {/* Fita Panorâmica Contínua */}
            <div className="inline-flex items-start gap-10 min-w-max pb-4 pt-2">
              {gruposPorPeriodo.map(({ periodo, itens }) => {
                const IconePeriodo = periodo.icone;
                const lidosNaEra = itens.filter((l) => l.estadoAtual === 'lido').length;

                return (
                  <div
                    key={periodo.id}
                    id={`era-horizontal-${periodo.id}`}
                    className="relative flex flex-col gap-4 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-library-paper/95 dark:bg-library-darkPaper/95 shadow-sm min-w-fit"
                  >
                    {/* Cabeçalho da Era Horizontal */}
                    <div className="flex items-center justify-between gap-6 pb-3 border-b border-stone-200/70 dark:border-stone-800/70">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-800 to-stone-900 text-amber-200 flex items-center justify-center shadow-sm shrink-0">
                          <IconePeriodo className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-cinzel font-bold text-base text-stone-900 dark:text-stone-100">
                              {periodo.nome}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                              {periodo.rotuloAnos}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 font-serif italic mt-0.5 max-w-md line-clamp-1">
                            {periodo.descricao}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
                          <strong>{lidosNaEra}</strong> de {itens.length} lidas
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800">
                          {itens.length} {itens.length === 1 ? 'obra' : 'obras'}
                        </span>
                      </div>
                    </div>

                    {/* EIXO HORIZONTAL & FILEIRA DE CARDS DAS OBRAS */}
                    <div className="relative pt-6">
                      {/* Eixo Central Dourado / Régua Contínua */}
                      <div className="absolute top-9 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-full shadow-xs" />

                      {/* Fileira Horizontal dos Livros */}
                      <div className="flex items-start gap-5 pt-7">
                        {itens.map((livro) => {
                          const coresArea = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
                          const isLido = livro.estadoAtual === 'lido';
                          const isLendo = livro.estadoAtual === 'lendo';

                          return (
                            <div
                              key={livro.id}
                              className={`relative flex flex-col items-center group/card transition-transform ${
                                densidade === 'confortavel' ? 'w-64 sm:w-72' : 'w-48 sm:w-52'
                              }`}
                            >
                              {/* Nó Luminoso sobre o Eixo Central */}
                              <div
                                className={`absolute -top-10 w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 group-hover/card:scale-135 ${
                                  isLido
                                    ? 'bg-emerald-600 border-white dark:border-stone-900 ring-2 ring-emerald-500/50 shadow-sm'
                                    : isLendo
                                    ? 'bg-amber-600 border-white dark:border-stone-900 ring-2 ring-amber-500/50 animate-pulse shadow-sm'
                                    : 'bg-stone-300 dark:bg-stone-700 border-stone-100 dark:border-stone-900'
                                }`}
                                title={`Ano: ${livro.ano} · #${livro.id} ${livro.titulo}`}
                              />

                              {/* Haste Conectora Vertical */}
                              <div className="absolute -top-7 h-7 w-0.5 border-l-2 border-dashed border-amber-700/40 dark:border-amber-500/30 group-hover/card:border-amber-500 transition-colors" />

                              {/* Card da Obra Histórica */}
                              <div
                                onClick={() => handleClickLivro(livro.id)}
                                className={`w-full rounded-xl border border-stone-200/90 dark:border-stone-800/90 bg-white dark:bg-stone-900 hover:border-amber-500 dark:hover:border-amber-500 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer group-hover/card:-translate-y-1.5 ${
                                  densidade === 'confortavel' ? 'p-4 gap-3' : 'p-3 gap-2'
                                }`}
                              >
                                {/* Topo: Ano & Badges */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="px-2 py-0.5 rounded font-cinzel font-bold text-xs bg-amber-900 text-amber-100 dark:bg-amber-800 shadow-2xs">
                                      {livro.ano}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold truncate max-w-[120px] ${coresArea.badge}`}>
                                      {livro.area}
                                    </span>
                                  </div>

                                  {/* Capa e Dados Básicos */}
                                  <div className="flex items-start gap-3 pt-1">
                                    {/* Capa */}
                                    <div
                                      className={`rounded-md overflow-hidden shadow-md shrink-0 border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 relative group-hover/card:scale-105 transition-transform ${
                                        densidade === 'confortavel'
                                          ? 'w-18 h-26 sm:w-20 sm:h-28'
                                          : 'w-14 h-20 sm:w-16 sm:h-22'
                                      }`}
                                    >
                                      {livro.capa_url ? (
                                        <img
                                          src={livro.capa_url}
                                          alt={livro.titulo}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col justify-between p-1 text-center bg-gradient-to-br from-stone-100 to-amber-50 dark:from-stone-900 dark:to-stone-800">
                                          <span className="text-[7.5px] font-cinzel text-amber-900 dark:text-amber-300 uppercase font-bold">
                                            {livro.ano}
                                          </span>
                                          <p className="text-[8.5px] font-serif font-bold text-stone-800 dark:text-stone-200 line-clamp-2">
                                            {livro.titulo}
                                          </p>
                                          <span className="text-[7px] text-stone-500 truncate">
                                            {livro.autor}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Título & Autor */}
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <div className="flex items-center gap-1 text-[9.5px] text-stone-500 font-mono">
                                        <span>#{livro.id}</span>
                                        <span>·</span>
                                        <span>Nível {livro.nivel}</span>
                                        {livro.id > 60 && (
                                          <span className="px-1 rounded text-[8.5px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-cinzel">
                                            Trilha B
                                          </span>
                                        )}
                                      </div>

                                      <h4
                                        className={`font-serif font-bold text-stone-900 dark:text-stone-100 leading-snug group-hover/card:text-amber-800 dark:group-hover/card:text-amber-300 transition-colors line-clamp-2 ${
                                          densidade === 'confortavel' ? 'text-sm' : 'text-xs'
                                        }`}
                                        title={livro.titulo}
                                      >
                                        {livro.titulo}
                                      </h4>

                                      <p className="text-xs text-stone-600 dark:text-stone-400 font-serif italic truncate">
                                        {livro.autor}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Tese Síntese (visível no modo confortável) */}
                                  {densidade === 'confortavel' && (
                                    <p className="text-[11px] text-stone-600 dark:text-stone-300 font-serif italic line-clamp-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                                      "{livro.tese}"
                                    </p>
                                  )}
                                </div>

                                {/* Rodapé: Status de Leitura & Botão */}
                                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
                                  {isLido ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Lido</span>
                                    </span>
                                  ) : isLendo ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                                      <BookOpen className="w-3 h-3 text-amber-600" />
                                      <span>Lendo</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10.5px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-stone-400" />
                                      <span>A Ler</span>
                                    </span>
                                  )}

                                  <span className="text-[11px] text-amber-800 dark:text-amber-400 font-cinzel font-semibold group-hover/card:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                                    Ver <ChevronRight className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 5. MODO VERTICAL CLÁSSICO (LISTA CRONOLÓGICA POR ERAS)                   */
        /* ========================================================================= */
        <div className="space-y-10">
          {gruposPorPeriodo.map(({ periodo, itens }) => {
            const IconePeriodo = periodo.icone;
            const lidosNaEra = itens.filter((l) => l.estadoAtual === 'lido').length;

            return (
              <div
                key={periodo.id}
                id={`era-vertical-${periodo.id}`}
                className="space-y-6"
              >
                {/* Cabeçalho da Era na Linha do Tempo */}
                <div className="sticky top-20 z-20 bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-800 to-stone-900 text-amber-200 flex items-center justify-center shadow-sm shrink-0">
                      <IconePeriodo className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-cinzel font-bold text-base text-stone-900 dark:text-stone-100">
                          {periodo.nome}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                          {periodo.rotuloAnos}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                        {periodo.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
                      <strong>{lidosNaEra}</strong> de {itens.length} lidas nesta era
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800">
                      {itens.length} {itens.length === 1 ? 'obra' : 'obras'}
                    </span>
                  </div>
                </div>

                {/* Trilha Cronológica Vertical */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-800/40 dark:border-amber-600/30 ml-3 sm:ml-4 space-y-6">
                  {itens.map((livro) => {
                    const coresArea = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
                    const isLido = livro.estadoAtual === 'lido';
                    const isLendo = livro.estadoAtual === 'lendo';

                    return (
                      <div key={livro.id} className="relative group">
                        {/* Marcador Nó na Linha do Tempo */}
                        <div
                          className={`absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full border-2 transition-all group-hover:scale-125 ${
                            isLido
                              ? 'bg-emerald-600 border-white dark:border-stone-900 ring-2 ring-emerald-500/50'
                              : isLendo
                              ? 'bg-amber-600 border-white dark:border-stone-900 ring-2 ring-amber-500/50 animate-pulse'
                              : 'bg-stone-300 dark:bg-stone-700 border-stone-100 dark:border-stone-900'
                          }`}
                        />

                        {/* Card da Obra Histórica */}
                        <div
                          onClick={() => onSelecionarLivro(livro.id)}
                          className="bg-library-paper dark:bg-library-darkPaper p-4 sm:p-5 rounded-xl border border-stone-200/90 dark:border-stone-800/90 hover:border-amber-500/70 dark:hover:border-amber-500/70 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                        >
                          {/* Lado Esquerdo: Capa + Identificação */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Miniatura da Capa Real */}
                            <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-md overflow-hidden shadow-md shrink-0 border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 relative group-hover:scale-105 transition-transform">
                              {livro.capa_url ? (
                                <img
                                  src={livro.capa_url}
                                  alt={livro.titulo}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col justify-between p-1.5 text-center bg-gradient-to-br from-stone-100 to-amber-50 dark:from-stone-900 dark:to-stone-800">
                                  <span className="text-[8px] font-cinzel text-amber-900 dark:text-amber-300 uppercase font-bold">
                                    {livro.ano}
                                  </span>
                                  <p className="text-[9px] font-serif font-bold text-stone-800 dark:text-stone-200 line-clamp-3">
                                    {livro.titulo}
                                  </p>
                                  <span className="text-[7.5px] text-stone-500 truncate">
                                    {livro.autor}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Detalhes Textuais & Teses */}
                            <div className="space-y-1.5 min-w-0 flex-1">
                              {/* Ano e Badges de Classificação */}
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="px-2 py-0.5 rounded font-cinzel font-bold text-xs bg-amber-900 text-amber-100 dark:bg-amber-800 shadow-2xs">
                                  {livro.ano}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${coresArea.badge}`}>
                                  {livro.area}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                                  Nível {livro.nivel} · {livro.classe}
                                </span>
                                {livro.id > 60 && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-cinzel bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                    Trilha B
                                  </span>
                                )}
                              </div>

                              {/* Título & Autor */}
                              <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                                #{livro.id} {livro.titulo}
                              </h4>
                              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-serif">
                                {livro.autor}
                              </p>

                              {/* Tese da Obra */}
                              <p className="text-xs text-stone-700 dark:text-stone-300 font-serif italic line-clamp-2 pt-0.5 border-t border-stone-100 dark:border-stone-800/80">
                                "{livro.tese}"
                              </p>
                            </div>
                          </div>

                          {/* Lado Direito: Status de Leitura & Ação */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-stone-200 dark:border-stone-800 gap-2 shrink-0">
                            {isLido ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Lido</span>
                              </span>
                            ) : isLendo ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                <span>Lendo Agora</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                <span>A Ler</span>
                              </span>
                            )}

                            <div className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-400 font-cinzel font-semibold group-hover:translate-x-1 transition-transform">
                              <span>Ver Obra</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
