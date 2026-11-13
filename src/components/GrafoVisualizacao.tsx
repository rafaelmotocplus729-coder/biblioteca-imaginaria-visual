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
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Target
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

  // Contagens por categoria no livro em foco
  const contagensFoco = useMemo(() => {
    const contrapontos = conexoesDoFoco.filter((r) => r.tipo === 'contraponto').length;
    const preparas = conexoesDoFoco.filter((r) => r.tipo === 'prepara').length;
    const mesmoTema = conexoesDoFoco.filter((r) => r.tipo === 'mesmo_tema').length;
    return {
      todas: conexoesDoFoco.length,
      contraponto: contrapontos,
      prepara: preparas,
      mesmo_tema: mesmoTema
    };
  }, [conexoesDoFoco]);

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
    <div className="relative flex flex-col w-full bg-library-paper dark:bg-library-darkPaper rounded-2xl border border-stone-200 dark:border-library-darkBorder overflow-hidden shadow-sm transition-all duration-300">
      {/* Barra de Ferramentas Superior Unificada */}
      <div className="px-5 py-4 border-b border-stone-200 dark:border-library-darkBorder bg-stone-50/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Alternador Principal: Modo Foco (Padrão) vs Constelação Geral */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 dark:bg-slate-800 rounded-xl border border-stone-300/60 dark:border-slate-700">
          <button
            onClick={() => setModoExibicao('foco')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
              modoExibicao === 'foco'
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Modo Foco (Ego-Network)</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/20 text-white font-mono">
              Padrão
            </span>
          </button>

          <button
            onClick={() => setModoExibicao('macro')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
              modoExibicao === 'macro'
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Constelação Geral</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              60 Obras
            </span>
          </button>
        </div>

        {/* Controles de Ação do Grafo */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Alternador de Conflitos Dialéticos */}
          <button
            onClick={onToggleModoConflitos}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              modoConflitos
                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
            title="Destaca apenas obras que possuem contrapontos dialéticos ou teses em tensão"
          >
            <Zap className={`w-3.5 h-3.5 ${modoConflitos ? 'fill-current' : 'text-rose-500'}`} />
            <span>{modoConflitos ? 'Modo Conflitos (Ativo)' : 'Filtrar Conflitos'}</span>
          </button>

          {/* Botão de Adicionar Nova Conexão */}
          <button
            onClick={() => handleAbrirNovaRelacao(modoExibicao === 'foco' ? focoLivroId : undefined)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-stone-200 dark:border-slate-800 shadow-xs">
            {/* Controles de navegação anterior / próximo */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNavegarFoco(-1)}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Livro anterior da biblioteca"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-serif font-bold text-slate-700 dark:text-slate-300 px-1">
                Obra #{livroCentral.id} de {livros.length}
              </span>

              <button
                onClick={() => handleNavegarFoco(1)}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Próximo livro da biblioteca"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown com Busca Instantânea de Livro */}
            <div className="relative flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Trocar obra central (ex: Hayek, Hobbes, Platão...)"
                  value={buscaLivroFoco}
                  onChange={(e) => {
                    setBuscaLivroFoco(e.target.value);
                    setDropdownBuscaAberto(true);
                  }}
                  onFocus={() => setDropdownBuscaAberto(true)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                {buscaLivroFoco && (
                  <button
                    onClick={() => {
                      setBuscaLivroFoco('');
                      setDropdownBuscaAberto(false);
                    }}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Lista suspensa de resultados */}
              {dropdownBuscaAberto && buscaLivroFoco.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs">
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
                        className="px-3 py-2 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b border-stone-100 dark:border-slate-800 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: CORES_AREAS[l.area]?.hex }}
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            #{l.id} {l.titulo}
                          </span>
                          <span className="text-slate-400">· {l.autor}</span>
                        </div>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-serif">
                          Nível {NUMEROS_ROMANOS[l.nivel]}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Filtros rápidos de tipo de relação para a obra em foco */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFiltroTipoFoco('todas')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filtroTipoFoco === 'todas'
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                Todas ({contagensFoco.todas})
              </button>
              <button
                onClick={() => setFiltroTipoFoco('contraponto')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  filtroTipoFoco === 'contraponto'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                <Zap className="w-3 h-3 fill-current" />
                Contrapontos ({contagensFoco.contraponto})
              </button>
              <button
                onClick={() => setFiltroTipoFoco('prepara')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  filtroTipoFoco === 'prepara'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                }`}
              >
                <span>Sequência ({contagensFoco.prepara})</span>
              </button>
              <button
                onClick={() => setFiltroTipoFoco('mesmo_tema')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  filtroTipoFoco === 'mesmo_tema'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                }`}
              >
                <span>Mesmo Tema ({contagensFoco.mesmo_tema})</span>
              </button>
            </div>
          </div>

          {/* PALCO CENTRAL: Card Hero da Obra em Foco com Design Editorial */}
          <div className="relative bg-gradient-to-br from-stone-50 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 md:p-8 rounded-2xl border-2 border-amber-200/70 dark:border-amber-900/40 shadow-md">
            {/* Moldura dupla sutil de cantos clássicos */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/40 pointer-events-none rounded-tl-sm" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/40 pointer-events-none rounded-tr-sm" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/40 pointer-events-none rounded-bl-sm" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/40 pointer-events-none rounded-br-sm" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Miniatura do Livro Central com Relevo Nobre */}
              <div className="w-16 h-24 sm:w-20 sm:h-28 shrink-0 rounded-xl overflow-hidden shadow-book border border-black/15 dark:border-stone-700/60 relative bg-stone-200 dark:bg-stone-800">
                <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />
                {livroCentral.capa_url ? (
                  <img src={livroCentral.capa_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full text-[9px] p-2 text-white font-cinzel font-bold flex flex-col justify-between"
                    style={{ backgroundColor: CORES_AREAS[livroCentral.area]?.hex }}
                  >
                    <span>#{livroCentral.id}</span>
                    <span className="truncate">{livroCentral.classe}</span>
                  </div>
                )}
              </div>

              {/* Informações Principais da Obra */}
              <div className="space-y-3 flex-1 min-w-0">
                {/* Badges de Nível, Área e Classe */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 text-xs font-bold rounded-md text-white shadow-xs"
                    style={{ backgroundColor: CORES_AREAS[livroCentral.area]?.hex }}
                  >
                    #{livroCentral.id} · {livroCentral.area}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-serif font-bold rounded-md bg-stone-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    Nível {NUMEROS_ROMANOS[livroCentral.nivel]}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md border border-stone-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                    {livroCentral.classe}
                  </span>
                  {livroCentral.obra_de_vida && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                      ★ Obra de Vida
                    </span>
                  )}
                </div>

                {/* Título & Autor */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-amber-100 leading-tight">
                    {livroCentral.titulo}
                  </h3>
                  <p className="text-sm font-serif italic text-slate-600 dark:text-slate-400 mt-1">
                    {livroCentral.autor} ({livroCentral.ano})
                  </p>
                </div>

                {/* Tese Central em Destaque */}
                <div className="relative pl-4 border-l-2 border-amber-500/70 dark:border-amber-400/60 py-1 bg-amber-50/50 dark:bg-slate-800/40 rounded-r-lg pr-3">
                  <p className="text-xs md:text-sm font-serif italic text-slate-800 dark:text-slate-200">
                    "{livroCentral.tese}"
                  </p>
                </div>

                {/* Indicadores de Conexões do Foco */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1 font-semibold">
                    <Zap className="w-3 h-3 fill-current" />
                    {contagensFoco.contraponto} Contrapontos Dialéticos
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1 font-semibold">
                    → {contagensFoco.prepara} Relações de Sequência
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 font-semibold">
                    ≈ {contagensFoco.mesmo_tema} Mesma Temática
                  </span>
                </div>
              </div>

              {/* Ações do Livro Central */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => onSelecionarLivro(livroCentral.id)}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Ficha Completa</span>
                </button>

                <button
                  onClick={() => handleAbrirNovaRelacao(livroCentral.id)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-stone-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Adicionar Conexão</span>
                </button>
              </div>
            </div>
          </div>

          {/* SESSÃO: CONEXÕES DIRETAS DA OBRA CENTRAL (CARDS EXPLICATIVOS) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-library-darkBorder">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-600" />
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                  Rede de Conexões Intelectuais ({conexoesFiltradasFoco.length})
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clique em <strong className="text-amber-700 dark:text-amber-400">"Focar nesta obra"</strong> para navegar livro a livro pelas ideias
              </p>
            </div>

            {/* Estado Vazio se não houver conexões para o filtro */}
            {conexoesFiltradasFoco.length === 0 ? (
              <div className="text-center py-12 px-4 bg-stone-50/70 dark:bg-slate-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-slate-800 space-y-3">
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
                <h5 className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200">
                  Nenhuma conexão para o filtro selecionado
                </h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {filtroTipoFoco === 'contraponto'
                    ? 'Esta obra ainda não possui contrapontos dialéticos registrados.'
                    : 'Não foram encontradas relações correspondentes para este livro.'}
                </p>
                <button
                  onClick={() => handleAbrirNovaRelacao(livroCentral.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Criar Conexão para este Livro
                </button>
              </div>
            ) : (
              /* Grid Responsivo de Cards de Livros Conectados com Justificativa Visível */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conexoesFiltradasFoco.map((rel) => {
                  const ehOrigem = rel.de === livroCentral.id;
                  const outroLivroId = ehOrigem ? rel.para : rel.de;
                  const outroLivro = livros.find((l) => l.id === outroLivroId);
                  const estaEditando = editandoRelId === rel.id;

                  if (!outroLivro) return null;

                  return (
                    <div
                      key={rel.id}
                      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md ${
                        rel.tipo === 'contraponto'
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-900/60'
                          : rel.tipo === 'prepara'
                          ? 'bg-amber-50/30 dark:bg-amber-950/15 border-amber-300/70 dark:border-amber-900/50'
                          : 'bg-blue-50/30 dark:bg-blue-950/15 border-blue-300/70 dark:border-blue-900/50'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Cabeçalho da Conexão: Tipo e Ações */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-white ${
                              rel.tipo === 'contraponto'
                                ? 'bg-rose-600'
                                : rel.tipo === 'prepara'
                                ? ehOrigem
                                  ? 'bg-slate-700 dark:bg-slate-600'
                                  : 'bg-emerald-700 dark:bg-emerald-600'
                                : 'bg-blue-600'
                            }`}
                          >
                            {rel.tipo === 'contraponto' && <Zap className="w-2.5 h-2.5 fill-current" />}
                            {rel.tipo === 'contraponto'
                              ? '⚡ Contraponto Dialético'
                              : rel.tipo === 'prepara'
                              ? ehOrigem
                                ? '→ Prepara (Leia depois)'
                                : '← Vem de (Base prévia)'
                              : '≈ Mesmo Tema'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditandoRelId(rel.id);
                                setEditNota(rel.nota);
                                setEditTipo(rel.tipo);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                              title="Editar nota da relação"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onRemoverRelacao(rel.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Excluir relação"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Dados da Obra Conectada com Capa Miniatura */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden shadow-book border border-black/15 dark:border-stone-700/60 relative bg-stone-200 dark:bg-stone-800">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 pointer-events-none bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />
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
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: CORES_AREAS[outroLivro.area]?.hex }}
                              />
                              <span className="font-semibold">{outroLivro.area}</span>
                              <span>·</span>
                              <span className="font-serif">Nível {NUMEROS_ROMANOS[outroLivro.nivel]}</span>
                            </div>

                            <h5 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug mt-0.5 truncate">
                              #{outroLivro.id} {outroLivro.titulo}
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic truncate">
                              {outroLivro.autor} ({outroLivro.ano})
                            </p>
                          </div>
                        </div>

                        {/* Nota Explícita da Relação (Justificativa Intelectual) */}
                        {estaEditando ? (
                          <div className="pt-1.5 space-y-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-stone-200 dark:border-slate-700">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase">
                              Editar Justificativa:
                            </label>
                            <input
                              type="text"
                              value={editNota}
                              onChange={(e) => setEditNota(e.target.value)}
                              className="w-full p-1.5 text-xs border rounded bg-stone-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            />
                            <div className="flex justify-between items-center gap-2">
                              <select
                                value={editTipo}
                                onChange={(e) => setEditTipo(e.target.value as TipoRelacao)}
                                className="p-1 text-[11px] border rounded bg-stone-50 dark:bg-slate-800"
                              >
                                <option value="contraponto">Contraponto</option>
                                <option value="prepara">Prepara</option>
                                <option value="mesmo_tema">Mesmo Tema</option>
                              </select>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditandoRelId(null)}
                                  className="px-2 py-0.5 text-[10px] rounded hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleSalvarEdicao(rel.id)}
                                  className="px-2.5 py-0.5 text-[10px] bg-amber-600 text-white rounded font-bold"
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-stone-200/70 dark:border-slate-800 text-xs">
                            <p className="font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed">
                              "{rel.nota}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação na Base do Card Conectado */}
                      <div className="flex items-center gap-2 pt-3 mt-2 border-t border-stone-200/60 dark:border-slate-800/60">
                        <button
                          onClick={() => setFocoLivroId(outroLivro.id)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          title={`Tornar #${outroLivro.id} o novo livro central do foco`}
                        >
                          <Target className="w-3 h-3" />
                          <span>Focar nesta Obra</span>
                        </button>

                        <button
                          onClick={() => onSelecionarLivro(outroLivro.id)}
                          className="py-1.5 px-2.5 rounded-lg border border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          title="Abrir ficha detalhada"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Ficha</span>
                        </button>
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
          MODO CONSTELAÇÃO GERAL (MACRO D3 FORCE SIMULATION COM 60 OBRAS)
         ========================================================================= */}
      {modoExibicao === 'macro' && (
        <div className="relative flex-1 w-full h-[650px] lg:h-[750px] 2xl:h-[840px]">
          {/* Barra de Filtros Flutuante do Modo Macro */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 shadow-md max-w-[90%]">
            {/* Filtro por Nível */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-semibold pl-1">Nível:</span>
              <button
                onClick={() => setMacroFiltroNivel(null)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  macroFiltroNivel === null
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                Todos
              </button>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setMacroFiltroNivel(macroFiltroNivel === lvl ? null : lvl)}
                  className={`px-2 py-0.5 rounded text-[11px] font-serif font-bold ${
                    macroFiltroNivel === lvl
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {NUMEROS_ROMANOS[lvl]}
                </button>
              ))}
            </div>

            {/* Filtro por Área */}
            <div className="flex items-center gap-1 text-xs pl-2 border-l border-stone-200 dark:border-slate-800">
              <select
                value={macroFiltroArea}
                onChange={(e) => setMacroFiltroArea(e.target.value)}
                className="p-1 text-xs rounded border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="todas">Todas as Áreas</option>
                {todasAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Busca textual rápida no macro */}
            <div className="relative pl-2 border-l border-stone-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Destacar obra..."
                value={macroBusca}
                onChange={(e) => setMacroBusca(e.target.value)}
                className="pl-6 pr-2 py-0.5 text-xs rounded border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-32 focus:w-44 transition-all"
              />
              <Search className="w-3 h-3 absolute left-4 top-1.5 text-slate-400" />
            </div>

            {/* Legenda de Tipos de Linha */}
            <div className="hidden xl:flex items-center gap-3 text-[10px] text-slate-500 pl-2 border-l border-stone-200 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-slate-400 inline-block"></span> Prepara
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-bold">
                <span className="w-3 h-0.5 border-t border-dashed border-rose-600 inline-block"></span> Contraponto
              </span>
              <span className="flex items-center gap-1 text-blue-600 font-bold">
                <span className="w-3 h-0.5 border-t border-dotted border-blue-600 inline-block"></span> Mesmo Tema
              </span>
            </div>
          </div>

          {/* Controles de Zoom Flutuantes no Canto Direito */}
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-stone-200 dark:border-slate-800 shadow-md">
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Aproximar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Afastar zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('reset')}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Redefinir visualização"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Banner de Ação Rápida para o Nó Selecionado no Modo Macro */}
          {livroSelecionadoMacro && (
            <div className="absolute bottom-6 left-6 z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border-2 border-amber-500 shadow-xl max-w-md animate-fadeIn">
              <div className="flex-1">
                <span
                  className="px-2 py-0.5 text-[10px] font-bold rounded text-white"
                  style={{ backgroundColor: CORES_AREAS[livroSelecionadoMacro.area]?.hex }}
                >
                  #{livroSelecionadoMacro.id} · {livroSelecionadoMacro.area}
                </span>
                <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {livroSelecionadoMacro.titulo}
                </h4>
                <p className="text-xs text-slate-500 italic">
                  {livroSelecionadoMacro.autor} ({livroSelecionadoMacro.ano})
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleFocarObra(livroSelecionadoMacro.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Entrar em Foco</span>
                </button>
                <button
                  onClick={() => onSelecionarLivro(livroSelecionadoMacro.id)}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-stone-100 text-xs font-semibold"
                >
                  Ficha
                </button>
                <button
                  onClick={() => setMacroNoSelecionadoId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
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
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3 border-stone-200 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span>Criar Nova Conexão no Grafo</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalNovaRelacao(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  De (Origem):
                </label>
                <select
                  value={novoDe}
                  onChange={(e) => setNovoDe(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-stone-200 dark:border-slate-700"
                >
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id} {l.titulo} ({l.autor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Para (Destino):
                </label>
                <select
                  value={novoPara}
                  onChange={(e) => setNovoPara(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-stone-200 dark:border-slate-700"
                >
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id} {l.titulo} ({l.autor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Conexão:
                </label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value as TipoRelacao)}
                  className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-stone-200 dark:border-slate-700 font-semibold"
                >
                  <option value="contraponto">⚡ Contraponto (Teses em conflito / Debate dialético)</option>
                  <option value="prepara">→ Prepara (Sequência intelectual de leitura prévia)</option>
                  <option value="mesmo_tema">≈ Mesmo Tema (Diálogo afim sobre mesmo objeto)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nota Explicativa (Por que essas duas obras se conectam?):
                </label>
                <input
                  type="text"
                  required
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="Ex: Hayek defende mercado espontâneo; Polanyi alerta contra a mercantilização da sociedade."
                  className="w-full p-2.5 border rounded-lg bg-stone-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-stone-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalNovaRelacao(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
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
