import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Livro, Relacao, TipoRelacao } from '../types';
import { CORES_AREAS } from '../constants/theme';
import { Share2, Plus, Trash2, Edit3, X, Zap, ArrowRight, ExternalLink } from 'lucide-react';

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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [noSelecionadoId, setNoSelecionadoId] = useState<number | null>(42); // Hayek por padrão para o aceite da Fase 4
  const [modalNovaRelacao, setModalNovaRelacao] = useState(false);
  const [novoDe, setNovoDe] = useState<number>(livros[0]?.id || 1);
  const [novoPara, setNovoPara] = useState<number>(livros[1]?.id || 2);
  const [novoTipo, setNovoTipo] = useState<TipoRelacao>('contraponto');
  const [novaNota, setNovaNota] = useState('');

  // Edição rápida de relação
  const [editandoRelId, setEditandoRelId] = useState<string | null>(null);
  const [editNota, setEditNota] = useState('');
  const [editTipo, setEditTipo] = useState<TipoRelacao>('contraponto');

  // Filtrar relações se o modo conflito estiver ativo
  const relacoesAtivas = modoConflitos
    ? relacoes.filter((r) => r.tipo === 'contraponto')
    : relacoes;

  // Nós envolvidos no grafo
  const nosAtivos = modoConflitos
    ? livros.filter((l) => relacoesAtivas.some((r) => r.de === l.id || r.para === l.id))
    : livros;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

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

    // Preparar dados do D3
    const nodes: GrafoNode[] = nosAtivos.map((l) => ({
      id: l.id,
      livro: l
    }));

    const links: GrafoLink[] = relacoesAtivas
      .filter((r) => nodes.some((n) => n.id === r.de) && nodes.some((n) => n.id === r.para))
      .map((r) => ({
        id: r.id,
        source: r.de,
        target: r.para,
        tipo: r.tipo,
        nota: r.nota
      }));

    // Simulação de forças
    const simulation = d3
      .forceSimulation<GrafoNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GrafoNode, GrafoLink>(links)
          .id((d) => d.id)
          .distance((d) => (d.tipo === 'contraponto' ? 140 : (d.tipo === 'mesmo_tema' ? 110 : 90)))
      )
      .force('charge', d3.forceManyBody().strength(modoConflitos ? -350 : -220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(32));

    // Definição de marcadores de seta para arestas
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'seta-prepara')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#718096');

    // Desenhar Arestas (Links)
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.tipo === 'contraponto') return '#E53E3E'; // Vermelho / Terracota
        if (d.tipo === 'mesmo_tema') return '#3182CE'; // Azul
        return '#A0AEC0'; // Cinza prepara
      })
      .attr('stroke-width', (d) => (d.tipo === 'contraponto' ? 2.5 : 1.5))
      .attr('stroke-dasharray', (d) => {
        if (d.tipo === 'contraponto') return '6,4'; // Tracejada vermelha
        if (d.tipo === 'mesmo_tema') return '2,3'; // Pontilhada
        return 'none'; // Linha contínua
      })
      .attr('marker-end', (d) => (d.tipo === 'prepara' ? 'url(#seta-prepara)' : 'none'))
      .attr('cursor', 'pointer');

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

    // Círculos dos nós (tamanho conforme a classe)
    node
      .append('circle')
      .attr('r', (d) => {
        if (d.livro.classe === 'OBRA') return 22;
        if (d.livro.classe === 'MAPA') return 17;
        return 13; // PORTA
      })
      .attr('fill', (d) => CORES_AREAS[d.livro.area]?.hex || '#4A5568')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2.5)
      .attr('class', 'transition-all duration-200');

    // Rótulo com o número do livro
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#FFFFFF')
      .attr('pointer-events', 'none')
      .text((d) => `#${d.id}`);

    // Rótulo com o autor ou título abaixo do nó
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.livro.classe === 'OBRA' ? '34px' : '28px'))
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('class', 'fill-slate-800 dark:fill-slate-200 pointer-events-none drop-shadow-sm')
      .text((d) => d.livro.titulo.split(' ')[0] + ' (' + d.livro.autor.split(' ')[0] + ')');

    // Interatividade ao Clicar em um Nó
    node.on('click', (event, d) => {
      event.stopPropagation();
      setNoSelecionadoId(d.id);
    });

    // Clicar fora para desselecionar
    svg.on('click', () => {
      setNoSelecionadoId(null);
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

    // Destaque visual do nó selecionado e seus vizinhos
    if (noSelecionadoId) {
      const vizinhosIds = new Set<number>([noSelecionadoId]);
      links.forEach((l) => {
        const srcId = typeof l.source === 'object' ? (l.source as GrafoNode).id : (l.source as number);
        const tgtId = typeof l.target === 'object' ? (l.target as GrafoNode).id : (l.target as number);
        if (srcId === noSelecionadoId) vizinhosIds.add(tgtId);
        if (tgtId === noSelecionadoId) vizinhosIds.add(srcId);
      });

      node.style('opacity', (d) => (vizinhosIds.has(d.id) ? 1 : 0.2));
      node.selectAll('circle').attr('stroke', (d: any) => (d.id === noSelecionadoId ? '#F59E0B' : '#FFFFFF'));
      node.selectAll('circle').attr('stroke-width', (d: any) => (d.id === noSelecionadoId ? 4 : 2.5));

      link.style('opacity', (d) => {
        const srcId = typeof d.source === 'object' ? (d.source as GrafoNode).id : (d.source as number);
        const tgtId = typeof d.target === 'object' ? (d.target as GrafoNode).id : (d.target as number);
        return srcId === noSelecionadoId || tgtId === noSelecionadoId ? 1 : 0.1;
      });
    } else {
      node.style('opacity', 1);
      link.style('opacity', 0.85);
    }

    return () => {
      simulation.stop();
    };
  }, [nosAtivos, relacoesAtivas, modoConflitos, noSelecionadoId]);

  // Informações do livro selecionado e suas conexões
  const livroSelecionado = livros.find((l) => l.id === noSelecionadoId);
  const conexoesSelecionadas = relacoes.filter(
    (r) => r.de === noSelecionadoId || r.para === noSelecionadoId
  );

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

  const handleSalvarEdicao = (id: string) => {
    onEditarRelacao(id, editNota.trim(), editTipo);
    setEditandoRelId(null);
  };

  return (
    <div className="relative flex flex-col lg:flex-row gap-4 h-[750px] w-full bg-library-paper dark:bg-library-darkPaper rounded-2xl p-4 border border-slate-200 dark:border-library-darkBorder overflow-hidden shadow-sm">
      {/* Controles do Grafo no Topo */}
      <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2 items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
        {/* Alternador de Modo Mapa de Conflitos */}
        <button
          onClick={onToggleModoConflitos}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            modoConflitos
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          {modoConflitos ? 'Modo: Mapa de Conflitos (Ativo)' : 'Ver Mapa de Conflitos'}
        </button>

        {/* Botão para Nova Relação */}
        <button
          onClick={() => setModalNovaRelacao(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          Conectar Livros
        </button>

        {/* Legenda de Tipos de Aresta */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-slate-400 inline-block"></span> Prepara
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="w-3 h-0.5 border-t border-dashed border-rose-600 inline-block"></span> Contraponto
          </span>
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <span className="w-3 h-0.5 border-t border-dotted border-blue-600 inline-block"></span> Mesmo Tema
          </span>
        </div>
      </div>

      {/* Área do SVG (Canvas D3) */}
      <div ref={containerRef} className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>

      {/* Painel Lateral com Detalhes do Nó e Vizinhos (Seção 7.3) */}
      {livroSelecionado && (
        <div className="w-full lg:w-96 shrink-0 bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto animate-fadeIn shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span
                className="px-2 py-0.5 text-xs font-bold rounded text-white"
                style={{ backgroundColor: CORES_AREAS[livroSelecionado.area]?.hex }}
              >
                #{livroSelecionado.id} · {livroSelecionado.classe}
              </span>
              <button
                onClick={() => setNoSelecionadoId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3">
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 leading-snug">
                {livroSelecionado.titulo}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {livroSelecionado.autor} ({livroSelecionado.ano})
              </p>
              <p className="text-xs italic font-serif text-slate-700 dark:text-slate-300 mt-2 bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                "{livroSelecionado.tese}"
              </p>
            </div>

            {/* Relações Conectadas ao Nó Selecionado */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Conexões ({conexoesSelecionadas.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">Clique para editar/remover</span>
              </h4>

              <div className="space-y-2">
                {conexoesSelecionadas.map((r) => {
                  const ehOrigem = r.de === livroSelecionado.id;
                  const outroId = ehOrigem ? r.para : r.de;
                  const outroLivro = livros.find((l) => l.id === outroId);
                  const estaEditando = editandoRelId === r.id;

                  return (
                    <div
                      key={r.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                        r.tipo === 'contraponto'
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold uppercase text-[9px] px-1.5 py-0.2 rounded text-white ${
                            r.tipo === 'contraponto'
                              ? 'bg-rose-600'
                              : r.tipo === 'prepara'
                              ? 'bg-slate-700'
                              : 'bg-blue-600'
                          }`}
                        >
                          {r.tipo === 'contraponto' ? '⚡ Contraponto' : (ehOrigem ? '→ Prepara' : '← Vem de')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditandoRelId(r.id);
                              setEditNota(r.nota);
                              setEditTipo(r.tipo);
                            }}
                            className="text-slate-400 hover:text-slate-600"
                            title="Editar nota"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onRemoverRelacao(r.id)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Remover conexão"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div
                        onClick={() => setNoSelecionadoId(outroId)}
                        className="font-serif font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 cursor-pointer flex items-center justify-between"
                      >
                        <span>#{outroId} {outroLivro?.titulo}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>

                      {estaEditando ? (
                        <div className="pt-1.5 space-y-1.5">
                          <input
                            type="text"
                            value={editNota}
                            onChange={(e) => setEditNota(e.target.value)}
                            className="w-full p-1 text-xs border rounded bg-white dark:bg-slate-900"
                          />
                          <div className="flex justify-between items-center">
                            <select
                              value={editTipo}
                              onChange={(e) => setEditTipo(e.target.value as TipoRelacao)}
                              className="p-1 text-[11px] border rounded"
                            >
                              <option value="contraponto">Contraponto</option>
                              <option value="prepara">Prepara</option>
                              <option value="mesmo_tema">Mesmo Tema</option>
                            </select>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditandoRelId(null)}
                                className="px-2 py-0.5 text-[10px] rounded hover:bg-slate-200"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSalvarEdicao(r.id)}
                                className="px-2 py-0.5 text-[10px] bg-amber-600 text-white rounded font-bold"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                          "{r.nota}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Botão para Abrir Ficha do Livro */}
          <button
            onClick={() => onSelecionarLivro(livroSelecionado.id)}
            className="mt-4 w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver Ficha Completa da Obra
          </button>
        </div>
      )}

      {/* Modal para Criar Nova Relação */}
      {modalNovaRelacao && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <form
            onSubmit={handleCriarRelacao}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-600" />
                Criar Nova Relação no Grafo
              </h3>
              <button
                type="button"
                onClick={() => setModalNovaRelacao(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">De (Origem):</label>
                <select
                  value={novoDe}
                  onChange={(e) => setNovoDe(Number(e.target.value))}
                  className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id} {l.titulo} ({l.autor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Para (Destino):</label>
                <select
                  value={novoPara}
                  onChange={(e) => setNovoPara(Number(e.target.value))}
                  className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id} {l.titulo} ({l.autor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tipo de Conexão:</label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value as TipoRelacao)}
                  className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="contraponto">Contraponto (Teses em conflito / Linha vermelha tracejada)</option>
                  <option value="prepara">Prepara (Sequência metodológica / Linha contínua)</option>
                  <option value="mesmo_tema">Mesmo Tema (Diálogo afim / Linha pontilhada)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nota da Relação (Uma linha explicando):</label>
                <input
                  type="text"
                  required
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="Ex: Hayek defende o mercado como ordem espontânea; Polanyi alerta para a desumanização das trocas."
                  className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalNovaRelacao(false)}
                className="px-4 py-2 text-xs font-semibold rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded bg-amber-600 hover:bg-amber-700 text-white shadow"
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
