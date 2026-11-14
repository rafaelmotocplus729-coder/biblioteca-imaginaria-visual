import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Livro, Relacao, TipoRelacao } from '../types';
import { CORES_AREAS } from '../constants/theme';
import {
  Share2,
  Plus,
  Trash2,
  Edit3,
  X,
  Zap,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Sparkles,
  Layers,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Target,
  ArrowRight,
  ArrowLeft,
  Scale,
  Star,
  Compass
} from 'lucide-react';

interface GrafoVisualizacaoProps {
  livros: Livro[];
  relacoes: Relacao[];
  modoConflitos: boolean;
  onToggleModoConflitos: () => void;
  onAdicionarRelacao: (relacao: Omit<Relacao, 'id'>) => void;
  onEditarRelacao: (id: string, nota: string, tipo: TipoRelacao) => void;
  onRemoverRelacao: (id: string) => void;
  onSelecionarLivro: (id: number) => void;
}

interface GrafoNode extends d3.SimulationNodeDatum {
  id: number;
  livro: Livro;
}

interface GrafoLink extends d3.SimulationLinkDatum<GrafoNode> {
  id: string;
  tipo: TipoRelacao;
  nota: string;
}

const NUMEROS_ROMANOS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V'
};

export const GrafoVisualizacao: React.FC<GrafoVisualizacaoProps> = ({
  livros,
  relacoes,
  modoConflitos,
  onToggleModoConflitos,
  onAdicionarRelacao,
  onEditarRelacao,
  onRemoverRelacao,
  onSelecionarLivro
}) => {
  // Modo de exibição: 'foco' (Ego-Network / Padrão) ou 'macro' (Constelação Geral D3)
  const [modoExibicao, setModoExibicao] = useState<'foco' | 'macro'>('foco');

  // Livro ativo para o Modo Foco (Hayek #42 por padrão para contrapontos marcantes, ou o primeiro disponível)
  const [focoLivroId, setFocoLivroId] = useState<number>(42);

  // Filtro de tipos de relação no Modo Foco
  const [filtroTipoFoco, setFiltroTipoFoco] = useState<'todas' | 'contraponto' | 'prepara' | 'mesmo_tema'>('todas');

  // Busca textual para troca rápida de livro no Modo Foco
  const [buscaLivroFoco, setBuscaLivroFoco] = useState('');
  const [dropdownBuscaAberto, setDropdownBuscaAberto] = useState(false);

  // Filtros para a Constelação Geral (Macro)
  const [macroFiltroNivel, setMacroFiltroNivel] = useState<number | null>(null);
  const [macroFiltroArea, setMacroFiltroArea] = useState<string>('todas');
  const [macroBusca, setMacroBusca] = useState<string>('');
  const [macroNoSelecionadoId, setMacroNoSelecionadoId] = useState<number | null>(null);

  // Modais de Relação
  const [modalNovaRelacao, setModalNovaRelacao] = useState(false);
  const [novoDe, setNovoDe] = useState<number>(focoLivroId);
  const [novoPara, setNovoPara] = useState<number>(livros.find((l) => l.id !== focoLivroId)?.id || 1);
  const [novoTipo, setNovoTipo] = useState<TipoRelacao>('contraponto');
  const [novaNota, setNovaNota] = useState('');

  // Edição rápida de relação
  const [editandoRelId, setEditandoRelId] = useState<string | null>(null);
  const [editNota, setEditNota] = useState('');
  const [editTipo, setEditTipo] = useState<TipoRelacao>('contraponto');

  // Referências para o SVG do D3 (Macro)
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Livro central do Modo Foco
  const livroCentral = useMemo(() => {
    return livros.find((l) => l.id === focoLivroId) || livros[0] || null;
  }, [livros, focoLivroId]);

  // Lista única de todas as áreas
  const todasAreas = useMemo(() => {
    return Array.from(new Set(livros.map((l) => l.area))).sort();
  }, [livros]);

  // Relações conectadas ao livro central
  const conexoesDoFoco = useMemo(() => {
    if (!livroCentral) return [];
    return relacoes.filter((r) => r.de === livroCentral.id || r.para === livroCentral.id);
  }, [relacoes, livroCentral]);

  // Conexões filtradas pelo tipo no Modo Foco
  const conexoesFiltradasFoco = useMemo(() => {
    let base = conexoesDoFoco;
    if (modoConflitos) {
      base = base.filter((r) => r.tipo === 'contraponto');
    }
    if (filtroTipoFoco !== 'todas') {
      base = base.filter((r) => r.tipo === filtroTipoFoco);
    }
    return base;
  }, [conexoesDoFoco, modoConflitos, filtroTipoFoco]);

  // Contagens por categoria e direção no livro em foco
  const contagensFoco = useMemo(() => {
    if (!livroCentral) {
      return {
        todas: 0,
        contraponto: 0,
        prepara: 0,
        mesmo_tema: 0,
        preparaEntrada: 0,
        aprofundamentoSaida: 0
      };
    }
    const contrapontos = conexoesDoFoco.filter((r) => r.tipo === 'contraponto').length;
    const preparas = conexoesDoFoco.filter((r) => r.tipo === 'prepara').length;
    const mesmoTema = conexoesDoFoco.filter((r) => r.tipo === 'mesmo_tema').length;
    const preparaEntrada = conexoesDoFoco.filter((r) => r.tipo === 'prepara' && r.para === livroCentral.id).length;
    const aprofundamentoSaida = conexoesDoFoco.filter((r) => r.tipo === 'prepara' && r.de === livroCentral.id).length;
    return {
      todas: conexoesDoFoco.length,
      contraponto: contrapontos,
      prepara: preparas,
      mesmo_tema: mesmoTema,
      preparaEntrada,
      aprofundamentoSaida
    };
  }, [conexoesDoFoco, livroCentral]);

  // 4 Colunas Direcionais para a Matriz Ego-Network (Prepara, Contextualiza, Aprofunda, Contrasta)
  const colunasDirecionais = useMemo(() => {
    if (!livroCentral) return [];
    const preparamEsta = conexoesFiltradasFoco.filter(
      (r) => r.tipo === 'prepara' && r.para === livroCentral.id
    );
    const contextualizam = conexoesFiltradasFoco.filter(
      (r) => r.tipo === 'mesmo_tema'
    );
    const aprofundam = conexoesFiltradasFoco.filter(
      (r) => r.tipo === 'prepara' && r.de === livroCentral.id
    );
    const contrastam = conexoesFiltradasFoco.filter(
      (r) => r.tipo === 'contraponto'
    );

    return [
      {
        id: 'prepara',
        titulo: 'Prepara',
        subtitulo: 'Base Prévia & Fundamento',
        descricao: 'Obras anteriores que fornecem vocabulário ou premissas para esta leitura.',
        icone: ArrowLeft,
        corHeader: 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/25 text-emerald-900 dark:text-emerald-200',
        corBadge: 'bg-emerald-700 dark:bg-emerald-600 text-white',
        corCard: 'bg-emerald-50/25 dark:bg-emerald-950/15 border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-500/70',
        itens: preparamEsta
      },
      {
        id: 'contextualiza',
        titulo: 'Contextualiza',
        subtitulo: 'Mesmo Tema & Horizonte',
        descricao: 'Obras irmãs que iluminam o mesmo problema sob ângulos complementares.',
        icone: Compass,
        corHeader: 'border-sky-500/50 bg-sky-50/50 dark:bg-sky-950/25 text-sky-900 dark:text-sky-200',
        corBadge: 'bg-sky-600 text-white',
        corCard: 'bg-sky-50/25 dark:bg-sky-950/15 border-sky-200/80 dark:border-sky-900/50 hover:border-sky-500/70',
        itens: contextualizam
      },
      {
        id: 'aprofunda',
        titulo: 'Aprofunda',
        subtitulo: 'Sequência & Desdobramento',
        descricao: 'Obras posteriores que exigem ou expandem diretamente as teses desta obra.',
        icone: ArrowRight,
        corHeader: 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/25 text-amber-900 dark:text-amber-200',
        corBadge: 'bg-amber-700 dark:bg-amber-600 text-white',
        corCard: 'bg-amber-50/25 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/50 hover:border-amber-500/70',
        itens: aprofundam
      },
      {
        id: 'contrasta',
        titulo: 'Contrasta',
        subtitulo: 'Contraponto Dialético',
        descricao: 'Teses rivais, críticas diretas e tensões filosóficas fundamentais.',
        icone: Scale,
        corHeader: 'border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/25 text-rose-900 dark:text-rose-200',
        corBadge: 'bg-rose-600 text-white',
        corCard: 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/60 hover:border-rose-500/80',
        itens: contrastam
      }
    ];
  }, [conexoesFiltradasFoco, livroCentral]);

  // Relações ativas globais (para o modo macro)
  const relacoesAtivasMacro = useMemo(() => {
    let base = relacoes;
    if (modoConflitos) {
      base = base.filter((r) => r.tipo === 'contraponto');
    }
    return base;
  }, [relacoes, modoConflitos]);

  // Nós ativos para o modo macro com base nos filtros
  const nosAtivosMacro = useMemo(() => {
    return livros.filter((l) => {
      if (modoConflitos) {
        const temConflito = relacoesAtivasMacro.some((r) => r.de === l.id || r.para === l.id);
        if (!temConflito) return false;
      }
      if (macroFiltroNivel !== null && l.nivel !== macroFiltroNivel) {
        return false;
      }
      if (macroFiltroArea !== 'todas' && l.area !== macroFiltroArea) {
        return false;
      }
      return true;
    });
  }, [livros, modoConflitos, relacoesAtivasMacro, macroFiltroNivel, macroFiltroArea]);

  // Navegar para livro anterior ou próximo
  const handleNavegarFoco = (delta: number) => {
    if (!livroCentral) return;
    const indexAtual = livros.findIndex((l) => l.id === livroCentral.id);
    if (indexAtual === -1) return;
    const novoIndex = (indexAtual + delta + livros.length) % livros.length;
    setFocoLivroId(livros[novoIndex].id);
  };

  // Abrir modal de nova relação pré-preenchendo a origem
  const handleAbrirNovaRelacao = (deId?: number) => {
    const origem = deId || focoLivroId;
    setNovoDe(origem);
    const destinoSugerido = livros.find((l) => l.id !== origem)?.id || 1;
    setNovoPara(destinoSugerido);
    setNovaNota('');
    setNovoTipo('contraponto');
    setModalNovaRelacao(true);
  };

  // Submeter nova relação
  const handleCriarRelacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoDe === novoPara) {
      alert('Selecione livros distintos para conectar!');
      return;
    }
    if (!novaNota.trim()) {
      alert('Escreva uma nota de uma linha explicando a relação.');
      return;
    }
    onAdicionarRelacao({
      de: novoDe,
      para: novoPara,
      tipo: novoTipo,
      nota: novaNota.trim()
    });
    setModalNovaRelacao(false);
    setNovaNota('');
  };

  // Salvar edição de nota de relação
  const handleSalvarEdicao = (id: string) => {
    onEditarRelacao(id, editNota.trim(), editTipo);
    setEditandoRelId(null);
  };

  // Inicialização e atualização do D3 no modo macro
  useEffect(() => {
    if (modoExibicao !== 'macro' || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = Math.max(containerRef.current.clientHeight || 650, 600);

    // Limpar SVG antes de renderizar
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%');

    // Container com zoom e pan
    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Preparar dados do D3
    const nodes: GrafoNode[] = nosAtivosMacro.map((l) => ({
      id: l.id,
      livro: l
    }));

    const links: GrafoLink[] = relacoesAtivasMacro
      .filter((r) => nodes.some((n) => n.id === r.de) && nodes.some((n) => n.id === r.para))
      .map((r) => ({
        id: r.id,
        source: r.de,
        target: r.para,
        tipo: r.tipo,
        nota: r.nota
      }));

    // Simulação de forças equilibrada e suave
    const simulation = d3
      .forceSimulation<GrafoNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GrafoNode, GrafoLink>(links)
          .id((d) => d.id)
          .distance((d) => (d.tipo === 'contraponto' ? 160 : d.tipo === 'mesmo_tema' ? 130 : 110))
      )
      .force('charge', d3.forceManyBody().strength(modoConflitos ? -400 : -280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(38));

    // Definição de marcadores de seta para arestas
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'seta-prepara-macro')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94A3B8');

    // Desenhar Arestas (Links)
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.tipo === 'contraponto') return '#E11D48'; // Rosa/Vermelho vibrante
        if (d.tipo === 'mesmo_tema') return '#2563EB'; // Azul Cobalto
        return '#94A3B8'; // Cinza ardósia
      })
      .attr('stroke-width', (d) => (d.tipo === 'contraponto' ? 2.5 : 1.8))
      .attr('stroke-dasharray', (d) => {
        if (d.tipo === 'contraponto') return '6,4';
        if (d.tipo === 'mesmo_tema') return '2,3';
        return 'none';
      })
      .attr('marker-end', (d) => (d.tipo === 'prepara' ? 'url(#seta-prepara-macro)' : 'none'))
      .attr('opacity', 0.7);

    // Desenhar Nós
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GrafoNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Círculo externo / halo do nó
    node
      .append('circle')
      .attr('r', (d) => (d.livro.classe === 'OBRA' ? 24 : d.livro.classe === 'MAPA' ? 19 : 15))
      .attr('fill', (d) => CORES_AREAS[d.livro.area]?.hex || '#475569')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2.5)
      .attr('class', 'transition-all duration-200 drop-shadow-md');

    // Número do livro dentro do nó
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#FFFFFF')
      .attr('pointer-events', 'none')
      .text((d) => `#${d.id}`);

    // Pílula com o nome do livro e autor logo abaixo
    const labelGroup = node
      .append('g')
      .attr('transform', (d) => `translate(0, ${d.livro.classe === 'OBRA' ? 34 : 28})`)
      .attr('pointer-events', 'none');

    labelGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10.5px')
      .attr('font-weight', '600')
      .attr('class', 'fill-slate-800 dark:fill-slate-100 drop-shadow-sm')
      .text((d) => {
        const tituloBreve = d.livro.titulo.length > 18 ? d.livro.titulo.slice(0, 16) + '…' : d.livro.titulo;
        return `${tituloBreve} (${d.livro.autor.split(' ').pop()})`;
      });

    // Interatividade ao Clicar em um Nó na Visão Macro
    node.on('click', (event, d) => {
      event.stopPropagation();
      setMacroNoSelecionadoId(d.id);
    });

    // Clicar fora para desselecionar
    svg.on('click', () => {
      setMacroNoSelecionadoId(null);
    });

    // Atualização da simulação
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GrafoNode).x || 0)
        .attr('y1', (d) => (d.source as GrafoNode).y || 0)
        .attr('x2', (d) => (d.target as GrafoNode).x || 0)
        .attr('y2', (d) => (d.target as GrafoNode).y || 0);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Destaque visual quando há busca ou nó selecionado na visão macro
    const idDestaque = macroNoSelecionadoId;
    const termoBusca = macroBusca.trim().toLowerCase();

    if (idDestaque || termoBusca) {
      const vizinhosIds = new Set<number>();
      if (idDestaque) {
        vizinhosIds.add(idDestaque);
        links.forEach((l) => {
          const srcId = typeof l.source === 'object' ? (l.source as GrafoNode).id : (l.source as number);
          const tgtId = typeof l.target === 'object' ? (l.target as GrafoNode).id : (l.target as number);
          if (srcId === idDestaque) vizinhosIds.add(tgtId);
          if (tgtId === idDestaque) vizinhosIds.add(srcId);
        });
      }

      node.style('opacity', (d) => {
        if (termoBusca) {
          const match =
            d.livro.titulo.toLowerCase().includes(termoBusca) ||
            d.livro.autor.toLowerCase().includes(termoBusca) ||
            String(d.id) === termoBusca;
          return match ? 1 : 0.15;
        }
        return vizinhosIds.has(d.id) ? 1 : 0.18;
      });

      node.selectAll('circle').attr('stroke', (d: any) => {
        if (d.id === idDestaque) return '#F59E0B'; // Ouro envelhecido
        return '#FFFFFF';
      });

      node.selectAll('circle').attr('stroke-width', (d: any) => {
        if (d.id === idDestaque) return 4;
        return 2.5;
      });

      link.style('opacity', (d) => {
        if (termoBusca) return 0.2;
        const srcId = typeof d.source === 'object' ? (d.source as GrafoNode).id : (d.source as number);
        const tgtId = typeof d.target === 'object' ? (d.target as GrafoNode).id : (d.target as number);
        return srcId === idDestaque || tgtId === idDestaque ? 1 : 0.08;
      });
    } else {
      node.style('opacity', 1);
      link.style('opacity', 0.7);
    }

    return () => {
      simulation.stop();
    };
  }, [modoExibicao, nosAtivosMacro, relacoesAtivasMacro, modoConflitos, macroNoSelecionadoId, macroBusca]);

  // Controles de Zoom do D3 na Constelação Geral
  const handleZoom = (tipo: 'in' | 'out' | 'reset') => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    if (tipo === 'in') {
      svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    } else if (tipo === 'out') {
      svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    } else {
      svg.transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // Transição do modo macro para o modo foco do livro selecionado
  const handleFocarObra = (livroId: number) => {
    setFocoLivroId(livroId);
    setModoExibicao('foco');
  };

  // Livro selecionado no modo macro
  const livroSelecionadoMacro = livros.find((l) => l.id === macroNoSelecionadoId);

  return (
    <div className="relative flex flex-col w-full bg-library-paper dark:bg-library-darkPaper rounded-2xl border border-stone-200/90 dark:border-library-darkBorder overflow-hidden shadow-sm transition-all duration-300">
      {/* Barra de Ferramentas Superior Unificada */}
      <div className="px-5 py-4 border-b border-stone-200/90 dark:border-library-darkBorder bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Alternador Principal: Foco na Obra (Ego-Network) vs Constelação Geral */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/80 dark:bg-stone-800/90 rounded-xl border border-stone-300/70 dark:border-stone-700/80 shadow-inner">
          <button
            onClick={() => setModoExibicao('foco')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              modoExibicao === 'foco'
                ? 'bg-amber-800 text-amber-50 shadow-sm font-bold ring-1 ring-amber-600/40'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-300" />
            <span>Foco na Obra</span>
            <span
              className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                modoExibicao === 'foco'
                  ? 'bg-black/25 text-amber-200'
                  : 'bg-stone-300/70 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              Ego-Network
            </span>
          </button>

          <button
            onClick={() => setModoExibicao('macro')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              modoExibicao === 'macro'
                ? 'bg-amber-800 text-amber-50 shadow-sm font-bold ring-1 ring-amber-600/40'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Constelação Geral</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                modoExibicao === 'macro'
                  ? 'bg-black/25 text-amber-200'
                  : 'bg-stone-300/70 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              {livros.length} Obras
            </span>
          </button>
        </div>

        {/* Controles de Ação do Grafo */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Alternador de Conflitos Dialéticos */}
          <button
            onClick={onToggleModoConflitos}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              modoConflitos
                ? 'bg-rose-700 text-white shadow-sm ring-1 ring-rose-500'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30'
            }`}
            title="Destaca apenas obras que possuem contrapontos dialéticos ou teses em tensão"
          >
            <Zap className={`w-3.5 h-3.5 ${modoConflitos ? 'fill-current text-amber-200' : 'text-rose-600 dark:text-rose-400'}`} />
            <span>{modoConflitos ? 'Conflitos Ativos' : 'Filtrar Conflitos'}</span>
          </button>

          {/* Botão de Adicionar Nova Conexão */}
          <button
            onClick={() => handleAbrirNovaRelacao(modoExibicao === 'foco' ? focoLivroId : undefined)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-cinzel font-bold bg-amber-800 hover:bg-amber-900 text-amber-50 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Conectar Livros</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODO FOCO (EGO-NETWORK RADIAL / EDITORIAL CARDS) - VISÃO PADRÃO
         ========================================================================= */}
      {modoExibicao === 'foco' && livroCentral && (
        <div className="p-5 md:p-7 space-y-6">
          {/* Seletor & Navegador Rápido de Obra Central */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-white/90 dark:bg-stone-900/90 p-3.5 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
            {/* Controles de navegação anterior / próximo + Seletor Direto */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavegarFoco(-1)}
                className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                title="Livro anterior da biblioteca"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative">
                <select
                  value={livroCentral.id}
                  onChange={(e) => setFocoLivroId(Number(e.target.value))}
                  aria-label="Selecionar obra em foco"
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-serif font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                >
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      Obra #{l.id} de {livros.length} — {l.titulo} ({l.autor.split(' ').pop()})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={() => handleNavegarFoco(1)}
                className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                title="Próximo livro da biblioteca"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown com Busca Instantânea de Livro */}
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar obra para focar (ex: Hayek, Hobbes, Platão...)"
                  value={buscaLivroFoco}
                  onChange={(e) => {
                    setBuscaLivroFoco(e.target.value);
                    setDropdownBuscaAberto(true);
                  }}
                  onFocus={() => setDropdownBuscaAberto(true)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-serif"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                {buscaLivroFoco ? (
                  <button
                    onClick={() => {
                      setBuscaLivroFoco('');
                      setDropdownBuscaAberto(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                )}
              </div>

              {/* Lista suspensa de resultados */}
              {dropdownBuscaAberto && buscaLivroFoco.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-60 overflow-y-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl py-1 text-xs">
                  {livros
                    .filter(
                      (l) =>
                        l.titulo.toLowerCase().includes(buscaLivroFoco.toLowerCase()) ||
                        l.autor.toLowerCase().includes(buscaLivroFoco.toLowerCase()) ||
                        String(l.id) === buscaLivroFoco.trim()
                    )
                    .map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setFocoLivroId(l.id);
                          setBuscaLivroFoco('');
                          setDropdownBuscaAberto(false);
                        }}
                        className="px-3 py-2 hover:bg-amber-50 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between border-b border-stone-100 dark:border-stone-800 last:border-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: CORES_AREAS[l.area]?.hex }}
                          />
                          <span className="font-bold text-stone-800 dark:text-stone-200 truncate">
                            #{l.id} {l.titulo}
                          </span>
                          <span className="text-stone-400 truncate">· {l.autor}</span>
                        </div>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-cinzel font-bold shrink-0 ml-2">
                          Nível {NUMEROS_ROMANOS[l.nivel]}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Pílulas de Contagem de Conexões com Numerais Tabulares e Hierarquia Clara */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setFiltroTipoFoco('todas')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-cinzel font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  filtroTipoFoco === 'todas'
                    ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 bg-stone-100/80 dark:bg-stone-800/70 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
              >
                <span>Todas</span>
                <span className="font-mono tabular-nums px-1.5 py-0.2 rounded bg-black/15 dark:bg-black/20 text-[10px]">
                  {contagensFoco.todas}
                </span>
              </button>
              <button
                onClick={() => setFiltroTipoFoco('prepara')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-cinzel font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  filtroTipoFoco === 'prepara'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/50'
                }`}
                title="Relações de preparação (Base Prévia) e aprofundamento (Sequência)"
              >
                <ArrowRight className="w-3 h-3" />
                <span>Prepara & Aprofunda</span>
                <span className="font-mono tabular-nums px-1.5 py-0.2 rounded bg-amber-900/15 dark:bg-black/30 text-[10px]">
                  {contagensFoco.prepara}
                </span>
              </button>
              <button
                onClick={() => setFiltroTipoFoco('mesmo_tema')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-cinzel font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  filtroTipoFoco === 'mesmo_tema'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-sky-700 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/30 hover:bg-sky-100/70 dark:hover:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/50'
                }`}
                title="Obras que contextualizam e dialogam no mesmo eixo temático"
              >
                <Compass className="w-3 h-3" />
                <span>Contextualiza</span>
                <span className="font-mono tabular-nums px-1.5 py-0.2 rounded bg-sky-900/15 dark:bg-black/30 text-[10px]">
                  {contagensFoco.mesmo_tema}
                </span>
              </button>
              <button
                onClick={() => setFiltroTipoFoco('contraponto')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-cinzel font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  filtroTipoFoco === 'contraponto'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/50'
                }`}
                title="Obras em tensão dialética ou contraponto direto"
              >
                <Scale className="w-3 h-3" />
                <span>Contrasta</span>
                <span className="font-mono tabular-nums px-1.5 py-0.2 rounded bg-rose-900/15 dark:bg-black/30 text-[10px]">
                  {contagensFoco.contraponto}
                </span>
              </button>
            </div>
          </div>

          {/* PALCO CENTRAL: Card Pedestal da Obra em Foco com Design Editorial */}
          <div className="relative bg-gradient-to-br from-stone-50 via-[#FAF7F2] to-amber-50/40 dark:from-stone-900 dark:via-stone-900/95 dark:to-stone-950 p-6 md:p-8 rounded-2xl border border-amber-300/80 dark:border-amber-800/50 shadow-md">
            {/* Moldura dupla sutil de cantos clássicos */}
            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-amber-600/40 pointer-events-none rounded-tl-xs" />
            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-amber-600/40 pointer-events-none rounded-tr-xs" />
            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-amber-600/40 pointer-events-none rounded-bl-xs" />
            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-amber-600/40 pointer-events-none rounded-br-xs" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Miniatura do Livro Central com Relevo Nobre */}
              <div
                onClick={() => onSelecionarLivro(livroCentral.id)}
                className="w-20 h-28 sm:w-24 sm:h-34 shrink-0 rounded-xl overflow-hidden shadow-book border border-black/15 dark:border-stone-700/60 relative bg-stone-200 dark:bg-stone-800 cursor-pointer group"
                title="Clique para abrir a ficha completa da obra"
              >
                <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />
                {livroCentral.capa_url ? (
                  <img
                    src={livroCentral.capa_url}
                    alt={livroCentral.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div
                    className="w-full h-full text-[9px] p-2.5 text-white font-cinzel font-bold flex flex-col justify-between"
                    style={{ backgroundColor: CORES_AREAS[livroCentral.area]?.hex }}
                  >
                    <span>#{livroCentral.id}</span>
                    <span className="truncate">{livroCentral.classe}</span>
                  </div>
                )}
              </div>

              {/* Informações Principais da Obra no Pedestal */}
              <div className="space-y-3 flex-1 min-w-0">
                {/* Badges de Nível, Área e Classe */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 text-xs font-cinzel font-bold rounded-md text-white shadow-2xs tabular-nums"
                    style={{ backgroundColor: CORES_AREAS[livroCentral.area]?.hex }}
                  >
                    #{livroCentral.id} · {livroCentral.area}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-cinzel font-bold rounded-md bg-stone-200/90 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300/70 dark:border-stone-700">
                    Nível {NUMEROS_ROMANOS[livroCentral.nivel]}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400">
                    {livroCentral.classe}
                  </span>
                  {livroCentral.obra_de_vida && (
                    <span className="px-2.5 py-0.5 text-[10px] font-cinzel font-bold rounded-md bg-amber-100/90 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-current" />
                      <span>Obra de Vida</span>
                    </span>
                  )}
                </div>

                {/* Título & Autor */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-amber-50 leading-tight tracking-tight">
                    {livroCentral.titulo}
                  </h3>
                  <p className="text-sm font-serif italic text-stone-600 dark:text-stone-400 mt-1">
                    {livroCentral.autor} <span className="not-italic font-mono text-xs opacity-80">({livroCentral.ano})</span>
                  </p>
                </div>

                {/* Tese Central em Destaque */}
                <div className="relative pl-4 border-l-2 border-amber-600/80 dark:border-amber-400/70 py-1.5 bg-amber-50/60 dark:bg-stone-800/50 rounded-r-xl pr-4">
                  <p className="text-xs md:text-sm font-serif italic text-stone-800 dark:text-stone-200 leading-relaxed">
                    &ldquo;{livroCentral.tese}&rdquo;
                  </p>
                </div>

                {/* Indicadores Direcionais de Conexões do Foco (4 Dimensões) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono tabular-nums px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 inline-flex items-center gap-1.5 font-semibold">
                    <ArrowLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{contagensFoco.preparaEntrada} Prepara</span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums px-2.5 py-1 rounded-lg bg-sky-50/80 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-900/60 inline-flex items-center gap-1.5 font-semibold">
                    <Compass className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    <span>{contagensFoco.mesmo_tema} Contextualiza</span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums px-2.5 py-1 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 inline-flex items-center gap-1.5 font-semibold">
                    <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>{contagensFoco.aprofundamentoSaida} Aprofunda</span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums px-2.5 py-1 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 inline-flex items-center gap-1.5 font-semibold">
                    <Scale className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    <span>{contagensFoco.contraponto} Contrasta</span>
                  </span>
                </div>
              </div>

              {/* Ações do Livro Central */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => onSelecionarLivro(livroCentral.id)}
                  className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  <span>Abrir Obra Completa</span>
                </button>

                <button
                  onClick={() => handleAbrirNovaRelacao(livroCentral.id)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Nova Conexão</span>
                </button>
              </div>
            </div>
          </div>

          {/* SESSÃO: 4 COLUNAS DIRECIONAIS DE FICHAS DE ÍNDICE EDITORIAL (PREPARA, CONTEXTUALIZA, APROFUNDA, CONTRASTA) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200 dark:border-library-darkBorder">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Matriz de Conexões Intelectuais
                </h4>
                <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                  {conexoesFiltradasFoco.length}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-serif">
                Use <strong className="text-amber-800 dark:text-amber-300">Focar no Grafo</strong> para deslocar o centro da rede ou <strong className="text-stone-700 dark:text-stone-200">Abrir Obra</strong> para ler a ficha.
              </p>
            </div>

            {/* Estado Vazio se não houver conexões para o filtro */}
            {conexoesFiltradasFoco.length === 0 ? (
              <div className="text-center py-12 px-4 bg-stone-50/70 dark:bg-stone-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
                <Sparkles className="w-8 h-8 text-amber-600 mx-auto opacity-70" />
                <h5 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">
                  Nenhuma conexão para o filtro selecionado
                </h5>
                <p className="text-xs text-stone-500 max-w-md mx-auto font-serif">
                  {filtroTipoFoco === 'contraponto'
                    ? 'Esta obra ainda não possui contrapontos dialéticos registrados.'
                    : 'Não foram encontradas relações correspondentes para este livro.'}
                </p>
                <button
                  onClick={() => handleAbrirNovaRelacao(livroCentral.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-cinzel font-bold bg-amber-800 hover:bg-amber-900 text-amber-50 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Conexão para este Livro</span>
                </button>
              </div>
            ) : (
              /* 4 Colunas Direcionais de Fichas Editoriais */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                {colunasDirecionais.map((coluna) => {
                  const IconeColuna = coluna.icone;
                  return (
                    <div
                      key={coluna.id}
                      className="flex flex-col rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-stone-50/60 dark:bg-stone-900/40 overflow-hidden shadow-2xs"
                    >
                      {/* Cabeçalho da Coluna Direcional */}
                      <div className={`p-3.5 border-b ${coluna.corHeader} flex items-center justify-between gap-2`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg ${coluna.corBadge} flex items-center justify-center shrink-0 shadow-2xs`}>
                            <IconeColuna className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-cinzel font-bold text-xs uppercase tracking-wider truncate">
                              {coluna.titulo}
                            </h5>
                            <p className="text-[10px] font-serif opacity-80 truncate">
                              {coluna.subtitulo}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums bg-white/80 dark:bg-stone-900/80 border border-black/10 dark:border-white/10 shrink-0">
                          {coluna.itens.length}
                        </span>
                      </div>

                      {/* Lista de Cartões de Índice da Coluna */}
                      <div className="p-3 space-y-3">
                        {coluna.itens.length === 0 ? (
                          <div className="py-8 px-3 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800/80 text-stone-400 dark:text-stone-500 text-xs font-serif italic">
                            Nenhuma obra nesta direção
                          </div>
                        ) : (
                          coluna.itens.map((rel) => {
                            const ehOrigem = rel.de === livroCentral.id;
                            const outroLivroId = ehOrigem ? rel.para : rel.de;
                            const outroLivro = livros.find((l) => l.id === outroLivroId);
                            const estaEditando = editandoRelId === rel.id;

                            if (!outroLivro) return null;

                            return (
                              <div
                                key={rel.id}
                                className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 bg-white dark:bg-stone-900 ${coluna.corCard}`}
                              >
                                <div className="space-y-2.5">
                                  {/* Barra Superior da Ficha de Índice */}
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[9.5px] font-cinzel font-bold uppercase tracking-wider inline-flex items-center gap-1 ${coluna.corBadge}`}
                                    >
                                      <IconeColuna className="w-2.5 h-2.5" />
                                      <span>{coluna.titulo}</span>
                                    </span>

                                    <div className="flex items-center gap-0.5 opacity-75 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          setEditandoRelId(rel.id);
                                          setEditNota(rel.nota);
                                          setEditTipo(rel.tipo);
                                        }}
                                        className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                                        title="Editar nota da relação"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => onRemoverRelacao(rel.id)}
                                        className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                        title="Excluir relação"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Dados da Obra Conectada com Miniatura */}
                                  <div className="flex items-start gap-2.5">
                                    <div
                                      onClick={() => onSelecionarLivro(outroLivro.id)}
                                      className="w-11 h-16 shrink-0 rounded-md overflow-hidden shadow-book border border-black/15 dark:border-stone-700/60 relative bg-stone-200 dark:bg-stone-800 cursor-pointer"
                                    >
                                      <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />
                                      {outroLivro.capa_url ? (
                                        <img src={outroLivro.capa_url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div
                                          className="w-full h-full text-[8px] p-1 text-white font-cinzel font-bold flex flex-col justify-between"
                                          style={{ backgroundColor: CORES_AREAS[outroLivro.area]?.hex }}
                                        >
                                          <span>#{outroLivro.id}</span>
                                          <span className="truncate">{outroLivro.classe}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
                                        <span
                                          className="w-2 h-2 rounded-full inline-block shrink-0"
                                          style={{ backgroundColor: CORES_AREAS[outroLivro.area]?.hex }}
                                        />
                                        <span className="font-semibold truncate">{outroLivro.area}</span>
                                        <span>·</span>
                                        <span className="font-cinzel font-bold shrink-0">
                                          Nível {NUMEROS_ROMANOS[outroLivro.nivel]}
                                        </span>
                                      </div>

                                      <h6
                                        onClick={() => onSelecionarLivro(outroLivro.id)}
                                        className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug mt-0.5 line-clamp-2 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer transition-colors"
                                        title={`#${outroLivro.id} ${outroLivro.titulo}`}
                                      >
                                        <span className="font-mono text-xs text-stone-500 dark:text-stone-400 mr-1">
                                          #{outroLivro.id}
                                        </span>
                                        {outroLivro.titulo}
                                      </h6>
                                      <p className="text-[11px] text-stone-600 dark:text-stone-400 font-serif italic truncate">
                                        {outroLivro.autor} ({outroLivro.ano})
                                      </p>
                                    </div>
                                  </div>

                                  {/* Justificativa Editorial da Relação */}
                                  {estaEditando ? (
                                    <div className="pt-1.5 space-y-2 bg-stone-50 dark:bg-stone-950 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700">
                                      <label className="text-[10px] font-cinzel font-bold text-stone-500 uppercase">
                                        Editar Justificativa:
                                      </label>
                                      <input
                                        type="text"
                                        value={editNota}
                                        onChange={(e) => setEditNota(e.target.value)}
                                        className="w-full p-1.5 text-xs border rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700"
                                      />
                                      <div className="flex justify-between items-center gap-2">
                                        <select
                                          value={editTipo}
                                          onChange={(e) => setEditTipo(e.target.value as TipoRelacao)}
                                          className="p-1 text-[11px] border rounded bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700"
                                        >
                                          <option value="contraponto">Contrasta (Contraponto)</option>
                                          <option value="prepara">Prepara / Aprofunda</option>
                                          <option value="mesmo_tema">Contextualiza (Mesmo Tema)</option>
                                        </select>
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => setEditandoRelId(null)}
                                            className="px-2 py-0.5 text-[10px] rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                                          >
                                            Cancelar
                                          </button>
                                          <button
                                            onClick={() => handleSalvarEdicao(rel.id)}
                                            className="px-2.5 py-0.5 text-[10px] bg-amber-700 text-white rounded font-bold"
                                          >
                                            Salvar
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2.5 rounded-lg bg-stone-50/90 dark:bg-stone-950/70 border border-stone-200/70 dark:border-stone-800/80 text-xs">
                                      <p className="font-serif italic text-stone-700 dark:text-stone-300 leading-relaxed">
                                        &ldquo;{rel.nota}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Ações Claras da Ficha de Índice: Focar no Grafo vs Abrir Obra */}
                                <div className="flex items-center gap-1.5 pt-2.5 mt-2.5 border-t border-stone-200/60 dark:border-stone-800/70">
                                  <button
                                    onClick={() => setFocoLivroId(outroLivro.id)}
                                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-amber-50 text-[11px] font-cinzel font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                    title={`Focar o grafo na Obra #${outroLivro.id}`}
                                  >
                                    <Target className="w-3 h-3 text-amber-300 shrink-0" />
                                    <span className="truncate">Focar no Grafo</span>
                                  </button>

                                  <button
                                    onClick={() => onSelecionarLivro(outroLivro.id)}
                                    className="py-1.5 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-[11px] font-cinzel font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                                    title="Abrir modal completo da obra"
                                  >
                                    <BookOpen className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                    <span>Abrir Obra</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODO CONSTELAÇÃO GERAL (MACRO D3 FORCE SIMULATION COM {livros.length} OBRAS)
         ========================================================================= */}
      {modoExibicao === 'macro' && (
        <div className="relative flex-1 w-full h-[650px] lg:h-[750px] 2xl:h-[840px]">
          {/* Barra de Filtros e Legenda Flutuante do Modo Macro */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-md max-w-[92%]">
            {/* Filtro por Nível */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-stone-500 font-cinzel font-bold uppercase text-[10px] tracking-wider pl-1 pr-1">
                Nível:
              </span>
              <button
                onClick={() => setMacroFiltroNivel(null)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-cinzel font-semibold cursor-pointer transition-colors ${
                  macroFiltroNivel === null
                    ? 'bg-amber-800 text-amber-50 font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Todos
              </button>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setMacroFiltroNivel(macroFiltroNivel === lvl ? null : lvl)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-cinzel font-bold cursor-pointer transition-colors ${
                    macroFiltroNivel === lvl
                      ? 'bg-amber-800 text-amber-50'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {NUMEROS_ROMANOS[lvl]}
                </button>
              ))}
            </div>

            {/* Filtro por Área */}
            <div className="relative flex items-center pl-2.5 border-l border-stone-200 dark:border-stone-800">
              <select
                value={macroFiltroArea}
                onChange={(e) => setMacroFiltroArea(e.target.value)}
                className="appearance-none pl-2.5 pr-7 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-serif font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="todas">Todas as Áreas</option>
                {todasAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>

            {/* Busca textual rápida no macro */}
            <div className="relative pl-2.5 border-l border-stone-200 dark:border-stone-800">
              <input
                type="text"
                placeholder="Destacar obra..."
                value={macroBusca}
                onChange={(e) => setMacroBusca(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 w-36 focus:w-48 transition-all font-serif focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 absolute left-4.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>

            {/* Legenda Editorial de Tipos de Linha */}
            <div className="hidden xl:flex items-center gap-3.5 text-[11px] text-stone-600 dark:text-stone-400 pl-3 border-l border-stone-200 dark:border-stone-800 font-serif">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-slate-400 inline-block rounded-full"></span>
                <span>Prepara / Aprofunda</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-600 inline-block"></span>
                <span>Contrasta</span>
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold">
                <span className="w-4 h-0.5 border-t-2 border-dotted border-sky-600 inline-block"></span>
                <span>Contextualiza</span>
              </span>
            </div>
          </div>

          {/* Controles de Zoom Flutuantes no Canto Direito com Dimensionamento Uniforme e Tooltips */}
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-1.5 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-lg">
            <button
              onClick={() => handleZoom('in')}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
              title="Aproximar visualização (Zoom In)"
              aria-label="Aproximar visualização"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
              title="Afastar visualização (Zoom Out)"
              aria-label="Afastar visualização"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('reset')}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
              title="Centralizar e ajustar constelação na tela (Resetar Zoom)"
              aria-label="Centralizar e ajustar constelação na tela"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Banner de Ação Rápida para o Nó Selecionado no Modo Macro */}
          {livroSelecionadoMacro && (
            <div className="absolute bottom-6 left-6 z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-4 rounded-xl border-2 border-amber-600/80 shadow-xl max-w-md animate-fadeIn">
              <div className="flex-1 min-w-0">
                <span
                  className="px-2 py-0.5 text-[10px] font-cinzel font-bold rounded text-white tabular-nums"
                  style={{ backgroundColor: CORES_AREAS[livroSelecionadoMacro.area]?.hex }}
                >
                  #{livroSelecionadoMacro.id} · {livroSelecionadoMacro.area}
                </span>
                <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white mt-1 truncate">
                  {livroSelecionadoMacro.titulo}
                </h4>
                <p className="text-xs text-stone-500 font-serif italic truncate">
                  {livroSelecionadoMacro.autor} ({livroSelecionadoMacro.ano})
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleFocarObra(livroSelecionadoMacro.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-cinzel font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-amber-300" />
                  <span>Focar no Grafo</span>
                </button>
                <button
                  onClick={() => onSelecionarLivro(livroSelecionadoMacro.id)}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-cinzel font-semibold cursor-pointer"
                >
                  Abrir Obra
                </button>
                <button
                  onClick={() => setMacroNoSelecionadoId(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  title="Fechar seleção"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Canvas SVG do D3 */}
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing">
            <svg ref={svgRef} className="w-full h-full"></svg>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL PARA CRIAR NOVA RELAÇÃO NO GRAFO
         ========================================================================= */}
      {modalNovaRelacao && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 animate-fadeIn">
          <form
            onSubmit={handleCriarRelacao}
            className="bg-library-paper dark:bg-library-darkPaper rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-300 dark:border-stone-800 space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3 border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Criar Nova Conexão no Grafo</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalNovaRelacao(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-cinzel font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider text-[11px]">
                  De (Obra de Origem):
                </label>
                <select
                  value={novoDe}
                  onChange={(e) => setNovoDe(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 font-serif"
                >
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id} {l.titulo} ({l.autor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-cinzel font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider text-[11px]">
                  Para (Obra de Destino):
                </label>
                <select
                  value={novoPara}
                  onChange={(e) => setNovoPara(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 font-serif"
                >
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id} {l.titulo} ({l.autor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-cinzel font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider text-[11px]">
                  Natureza Dialética da Conexão:
                </label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value as TipoRelacao)}
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 font-serif font-semibold"
                >
                  <option value="contraponto">Contrasta — Contraponto Dialético (Teses em conflito)</option>
                  <option value="prepara">Prepara / Aprofunda — Sequência Intelectual de Leitura</option>
                  <option value="mesmo_tema">Contextualiza — Mesmo Tema (Diálogo afim)</option>
                </select>
              </div>

              <div>
                <label className="block font-cinzel font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wider text-[11px]">
                  Justificativa Intelectual (Por que essas duas obras dialogam?):
                </label>
                <input
                  type="text"
                  required
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="Ex: Hayek defende a ordem espontânea; Polanyi alerta contra a mercantilização do trabalho e da terra."
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 font-serif"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setModalNovaRelacao(false)}
                className="px-4 py-2 text-xs font-cinzel font-semibold rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-cinzel font-bold rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 shadow-sm"
              >
                Salvar Conexão
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

