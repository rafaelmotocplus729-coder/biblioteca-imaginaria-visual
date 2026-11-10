import React, { useState, useMemo } from 'react';
import { Livro, Relacao, Progresso } from '../types';
import { CORES_AREAS, LEGENDA_RESUMO, obterPaginasLivro } from '../constants/theme';
import {
  Scale,
  X,
  Swords,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  Save,
  Check,
  BookOpen,
  Quote,
  Compass
} from 'lucide-react';

interface ComparadorDialeticoProps {
  isOpen: boolean;
  onClose: () => void;
  livros: Livro[];
  relacoes: Relacao[];
  progressos: Record<number, Progresso>;
  livroInicialAId?: number;
  livroInicialBId?: number;
  onAtualizarNotas: (livroId: number, notas: string) => void;
  onSelecionarLivro: (id: number) => void;
}

export const ComparadorDialetico: React.FC<ComparadorDialeticoProps> = ({
  isOpen,
  onClose,
  livros,
  relacoes,
  progressos,
  livroInicialAId,
  livroInicialBId,
  onAtualizarNotas,
  onSelecionarLivro
}) => {
  // Lista de contrapontos canônicos da biblioteca
  const contrapontosDisponiveis = useMemo(() => {
    return relacoes.filter((r) => r.tipo === 'contraponto');
  }, [relacoes]);

  // Livros selecionados para comparação
  const [livroAId, setLivroAId] = useState<number>(livroInicialAId || 42); // Hayek
  const [livroBId, setLivroBId] = useState<number>(livroInicialBId || 43); // Polanyi
  const [sintesePessoal, setSintesePessoal] = useState('');
  const [sinteseSalva, setSinteseSalva] = useState(false);
  const [imgErroA, setImgErroA] = useState(false);
  const [imgErroB, setImgErroB] = useState(false);

  // Sincronizar com props se fornecidas
  React.useEffect(() => {
    if (livroInicialAId) setLivroAId(livroInicialAId);
    if (livroInicialBId) setLivroBId(livroInicialBId);
  }, [livroInicialAId, livroInicialBId]);

  // Resetar erro de imagem ao trocar de livro
  React.useEffect(() => {
    setImgErroA(false);
  }, [livroAId]);

  React.useEffect(() => {
    setImgErroB(false);
  }, [livroBId]);

  const livroA = useMemo(() => livros.find((l) => l.id === livroAId) || livros[0], [livros, livroAId]);
  const livroB = useMemo(() => livros.find((l) => l.id === livroBId) || livros[1], [livros, livroBId]);

  const coresA = CORES_AREAS[livroA.area] || CORES_AREAS['Filosofia'];
  const coresB = CORES_AREAS[livroB.area] || CORES_AREAS['Filosofia'];

  // Encontrar se existe relação direta catalogada entre A e B
  const relacaoDireta = useMemo(() => {
    return relacoes.find(
      (r) =>
        (r.de === livroA.id && r.para === livroB.id) ||
        (r.de === livroB.id && r.para === livroA.id)
    );
  }, [relacoes, livroA, livroB]);

  const handleInverter = () => {
    const tempA = livroAId;
    setLivroAId(livroBId);
    setLivroBId(tempA);
  };

  const handleSalvarSintese = () => {
    if (!sintesePessoal.trim()) return;
    const notaExistenteA = progressos[livroA.id]?.notas || '';
    const novaNotaA = notaExistenteA
      ? `${notaExistenteA}\n\n[Confronto com #${livroB.id} ${livroB.titulo}]: ${sintesePessoal}`
      : `[Confronto com #${livroB.id} ${livroB.titulo}]: ${sintesePessoal}`;
    onAtualizarNotas(livroA.id, novaNotaA);
    setSinteseSalva(true);
    setTimeout(() => setSinteseSalva(false), 3000);
  };

  const handleInserirTag = (tag: string) => {
    setSintesePessoal((prev) => (prev ? `${prev}\n${tag}: ` : `${tag}: `));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex justify-center items-start sm:items-center p-2 sm:p-5 md:p-8 animate-fadeIn">
      <div
        className="relative bg-[#FAF7F2] dark:bg-[#16171B] w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-100 flex flex-col scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bloco Unificado de Cabeçalho Fixo (Sticky) - Impede sobreposição ao rolar */}
        <div className="sticky top-0 z-30 bg-[#FAF7F2]/98 dark:bg-[#16171B]/98 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800/90 shadow-xs">
          {/* Barra Superior de Título */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-stone-200/70 dark:border-stone-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-800 via-rose-900 to-amber-950 flex items-center justify-center text-amber-200 shadow-md ring-1 ring-rose-700/50">
                <Scale className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base sm:text-xl text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
                  Confronto Dialético & Contrapontos
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-sans tracking-wide">
                  Exame comparativo de teses filosóficas, epistemológicas e políticas
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Fechar (Esc)"
              className="p-2 rounded-full hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Carrossel de Debates Clássicos */}
          <div className="px-5 sm:px-8 py-2.5 bg-stone-100/70 dark:bg-stone-900/60 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="font-cinzel font-bold text-stone-600 dark:text-stone-400 shrink-0 flex items-center gap-1.5 uppercase text-[11px] tracking-wider pr-1">
              <Swords className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Debates Clássicos:
            </span>
            <div className="flex items-center gap-2">
              {contrapontosDisponiveis.map((contra) => {
                const deLivro = livros.find((l) => l.id === contra.de);
                const paraLivro = livros.find((l) => l.id === contra.para);
                if (!deLivro || !paraLivro) return null;
                const isSelected =
                  (livroA.id === deLivro.id && livroB.id === paraLivro.id) ||
                  (livroA.id === paraLivro.id && livroB.id === deLivro.id);

                return (
                  <button
                    key={contra.id}
                    onClick={() => {
                      setLivroAId(deLivro.id);
                      setLivroBId(paraLivro.id);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-serif whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-900 to-rose-950 text-amber-100 border-amber-600/70 shadow-sm ring-1 ring-amber-500/30 font-semibold scale-[1.02]'
                        : 'bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 border-stone-200/90 dark:border-stone-700/80 hover:border-amber-500/70 hover:text-stone-950 dark:hover:text-white'
                    }`}
                  >
                    <span>{deLivro.autor.split(' ').pop()}</span>
                    <span className="text-[10px] opacity-70 font-sans uppercase">vs</span>
                    <span>{paraLivro.autor.split(' ').pop()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Corpo Principal da Disputa */}
        <div className="p-5 sm:p-8 space-y-7">
          {/* Seletor Customizado Lado a Lado com Botão Central de Inversão */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 sm:gap-4 items-end bg-stone-100/60 dark:bg-stone-900/40 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800/80">
            {/* Seletor Livro A */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-cinzel font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: coresA.hex }} />
                  Tese Inicial (Livro A)
                </label>
                <span className="text-[11px] font-sans text-stone-500">#{livroA.id} · Nível {livroA.nivel}</span>
              </div>
              <select
                value={livroAId}
                onChange={(e) => setLivroAId(Number(e.target.value))}
                className="w-full p-2.5 sm:p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-serif font-medium text-stone-900 dark:text-stone-100 shadow-2xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
              >
                {livros.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} {l.titulo} — {l.autor} ({l.ano})
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Central de Inversão A <-> B */}
            <div className="flex justify-center pb-0.5">
              <button
                type="button"
                onClick={handleInverter}
                title="Inverter Obras (A ↔ B)"
                className="p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-500/80 hover:bg-amber-50/50 dark:hover:bg-stone-800 transition-all shadow-2xs group flex items-center gap-1 text-xs font-cinzel font-semibold"
              >
                <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300 text-amber-600" />
                <span className="md:hidden">Inverter</span>
              </button>
            </div>

            {/* Seletor Livro B */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-cinzel font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: coresB.hex }} />
                  Antítese / Contraponto (Livro B)
                </label>
                <span className="text-[11px] font-sans text-stone-500">#{livroB.id} · Nível {livroB.nivel}</span>
              </div>
              <select
                value={livroBId}
                onChange={(e) => setLivroBId(Number(e.target.value))}
                className="w-full p-2.5 sm:p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-serif font-medium text-stone-900 dark:text-stone-100 shadow-2xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
              >
                {livros.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} {l.titulo} — {l.autor} ({l.ano})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cartouche Editorial do Eixo de Tensão Dialética */}
          <div className="relative p-5 sm:p-6 rounded-2xl border border-amber-600/30 dark:border-amber-600/20 bg-gradient-to-br from-amber-500/5 via-stone-500/5 to-rose-500/5 dark:from-amber-950/20 dark:via-stone-900/40 dark:to-rose-950/20 shadow-xs text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-stone-900/90 border border-amber-600/30 text-[10px] font-cinzel font-bold tracking-widest text-amber-800 dark:text-amber-300 uppercase shadow-2xs">
              {relacaoDireta?.tipo === 'contraponto' ? (
                <>
                  <Swords className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  Contraponto Canônico do Grafo
                </>
              ) : relacaoDireta ? (
                <>
                  <Compass className="w-3 h-3 text-amber-600" />
                  Diálogo Direto do Grafo ({relacaoDireta.tipo})
                </>
              ) : (
                <>
                  <Scale className="w-3 h-3 text-amber-600" />
                  Exploração Hermenêutica Aberta
                </>
              )}
            </div>

            <p className="mt-3 text-base sm:text-lg font-serif italic text-stone-900 dark:text-stone-100 font-medium max-w-3xl mx-auto leading-relaxed">
              &ldquo;{relacaoDireta?.nota || `Exame comparativo entre a tese de ${livroA.titulo} (${livroA.autor}) e a resposta articulada em ${livroB.titulo} (${livroB.autor}).`}&rdquo;
            </p>
          </div>

          {/* Painel Duplo Lado a Lado com Capas Reais e Teses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Medallion Central VS (Desktop) */}
            <div className="hidden md:flex absolute left-1/2 top-28 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#FAF7F2] dark:bg-[#16171B] border-2 border-amber-600/70 shadow-lg items-center justify-center text-amber-700 dark:text-amber-400 z-10 font-cinzel font-bold text-xs">
              <Swords className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>

            {/* Cartão Livro A */}
            <div
              className="rounded-2xl p-5 sm:p-6 border border-stone-300/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/50 space-y-5 shadow-xs relative flex flex-col justify-between"
              style={{ borderTop: `4px solid ${coresA.hex}` }}
            >
              {/* Cabeçalho da Obra A: Capa Real + Metadados */}
              <div className="flex gap-4 sm:gap-5 items-start">
                {/* Mini Capa Real 3D */}
                <div className="relative w-24 sm:w-28 h-36 sm:h-40 shrink-0 rounded-lg shadow-book overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 group">
                  {/* Vinco de dobra de capa */}
                  <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none z-10" />
                  {livroA.capa_url && !imgErroA ? (
                    <img
                      src={livroA.capa_url}
                      alt={livroA.titulo}
                      onError={() => setImgErroA(true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col justify-between p-2 text-white text-[10px] font-serif"
                      style={{ backgroundColor: coresA.hex }}
                    >
                      <span className="font-cinzel text-[9px] uppercase tracking-wider">{livroA.area}</span>
                      <p className="font-bold leading-tight">{livroA.titulo}</p>
                      <span className="text-[9px] opacity-80">{livroA.autor}</span>
                    </div>
                  )}
                </div>

                {/* Detalhes da Obra A */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 text-[9px] font-cinzel font-bold uppercase rounded-md text-white shadow-2xs"
                      style={{ backgroundColor: coresA.hex }}
                    >
                      Nível {livroA.nivel} · #{livroA.id}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-sans font-medium uppercase rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {livroA.classe}
                    </span>
                    {LEGENDA_RESUMO[livroA.resumo_permitido] && (
                      <span
                        title={LEGENDA_RESUMO[livroA.resumo_permitido].descricao}
                        className="px-1.5 py-0.5 text-[9px] font-sans font-medium rounded bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/40"
                      >
                        {LEGENDA_RESUMO[livroA.resumo_permitido].simbolo} {LEGENDA_RESUMO[livroA.resumo_permitido].rotulo}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 leading-snug">
                    {livroA.titulo}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-serif italic">
                    {livroA.autor} ({livroA.ano})
                  </p>

                  <p className="text-[11px] text-stone-500 font-sans">
                    ~{obterPaginasLivro(livroA.id, livroA.classe)} págs · {livroA.area}
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        onSelecionarLivro(livroA.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-cinzel font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 hover:underline transition-colors"
                    >
                      Ver Ficha Completa <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tese Central de A */}
              <div className="space-y-1.5 bg-[#FAF7F2] dark:bg-stone-950/70 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                  <Quote className="w-3 h-3 text-amber-600" />
                  <span>Tese Central</span>
                </div>
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-stone-900 dark:text-stone-100 font-medium">
                  {livroA.tese}
                </p>
              </div>

              {/* O que acrescenta de A */}
              <div className="space-y-1.5 bg-[#FAF7F2] dark:bg-stone-950/70 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                  <BookOpen className="w-3 h-3 text-stone-500" />
                  <span>O que Acrescenta à sua Formação</span>
                </div>
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-stone-700 dark:text-stone-300">
                  {livroA.acrescenta}
                </p>
              </div>

              {/* Sequência no Grafo */}
              <div className="text-[11px] font-sans text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-800/60">
                <span className="font-semibold text-stone-600 dark:text-stone-300">Sequência Pedagógica: </span>
                {livroA.por_que_antes_do_proximo}
              </div>
            </div>

            {/* Cartão Livro B */}
            <div
              className="rounded-2xl p-5 sm:p-6 border border-stone-300/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/50 space-y-5 shadow-xs relative flex flex-col justify-between"
              style={{ borderTop: `4px solid ${coresB.hex}` }}
            >
              {/* Cabeçalho da Obra B: Capa Real + Metadados */}
              <div className="flex gap-4 sm:gap-5 items-start">
                {/* Mini Capa Real 3D */}
                <div className="relative w-24 sm:w-28 h-36 sm:h-40 shrink-0 rounded-lg shadow-book overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 group">
                  {/* Vinco de dobra de capa */}
                  <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none z-10" />
                  {livroB.capa_url && !imgErroB ? (
                    <img
                      src={livroB.capa_url}
                      alt={livroB.titulo}
                      onError={() => setImgErroB(true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col justify-between p-2 text-white text-[10px] font-serif"
                      style={{ backgroundColor: coresB.hex }}
                    >
                      <span className="font-cinzel text-[9px] uppercase tracking-wider">{livroB.area}</span>
                      <p className="font-bold leading-tight">{livroB.titulo}</p>
                      <span className="text-[9px] opacity-80">{livroB.autor}</span>
                    </div>
                  )}
                </div>

                {/* Detalhes da Obra B */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 text-[9px] font-cinzel font-bold uppercase rounded-md text-white shadow-2xs"
                      style={{ backgroundColor: coresB.hex }}
                    >
                      Nível {livroB.nivel} · #{livroB.id}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-sans font-medium uppercase rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {livroB.classe}
                    </span>
                    {LEGENDA_RESUMO[livroB.resumo_permitido] && (
                      <span
                        title={LEGENDA_RESUMO[livroB.resumo_permitido].descricao}
                        className="px-1.5 py-0.5 text-[9px] font-sans font-medium rounded bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/40"
                      >
                        {LEGENDA_RESUMO[livroB.resumo_permitido].simbolo} {LEGENDA_RESUMO[livroB.resumo_permitido].rotulo}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 leading-snug">
                    {livroB.titulo}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-serif italic">
                    {livroB.autor} ({livroB.ano})
                  </p>

                  <p className="text-[11px] text-stone-500 font-sans">
                    ~{obterPaginasLivro(livroB.id, livroB.classe)} págs · {livroB.area}
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        onSelecionarLivro(livroB.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-cinzel font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 hover:underline transition-colors"
                    >
                      Ver Ficha Completa <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tese Central de B */}
              <div className="space-y-1.5 bg-[#FAF7F2] dark:bg-stone-950/70 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                  <Quote className="w-3 h-3 text-amber-600" />
                  <span>Tese Central</span>
                </div>
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-stone-900 dark:text-stone-100 font-medium">
                  {livroB.tese}
                </p>
              </div>

              {/* O que acrescenta de B */}
              <div className="space-y-1.5 bg-[#FAF7F2] dark:bg-stone-950/70 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                  <BookOpen className="w-3 h-3 text-stone-500" />
                  <span>O que Acrescenta à sua Formação</span>
                </div>
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-stone-700 dark:text-stone-300">
                  {livroB.acrescenta}
                </p>
              </div>

              {/* Sequência no Grafo */}
              <div className="text-[11px] font-sans text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-800/60">
                <span className="font-semibold text-stone-600 dark:text-stone-300">Sequência Pedagógica: </span>
                {livroB.por_que_antes_do_proximo}
              </div>
            </div>
          </div>

          {/* Área de Síntese Pessoal do Leitor (Caderno de Disputas) */}
          <div className="p-5 sm:p-6 rounded-2xl border border-stone-300 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/50 space-y-3.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Minha Síntese Pessoal deste Conflito
                  </label>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                    Registre a resolução dialética entre #{livroA.id} {livroA.autor.split(' ').pop()} e #{livroB.id} {livroB.autor.split(' ').pop()}
                  </p>
                </div>
              </div>

              {/* Tags de apoio rápido */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleInserirTag('[Convergência]')}
                  className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-400 text-[11px]"
                >
                  + Convergência
                </button>
                <button
                  type="button"
                  onClick={() => handleInserirTag('[Divergência Irredutível]')}
                  className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-400 text-[11px]"
                >
                  + Divergência
                </button>
              </div>
            </div>

            <textarea
              value={sintesePessoal}
              onChange={(e) => setSintesePessoal(e.target.value)}
              placeholder="Como você articula a tensão entre esses dois autores? Quem possui o diagnóstico mais acurado e quais são os limites de cada tese? Registre aqui a sua síntese pessoal..."
              rows={3}
              className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-serif text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400/80 outline-hidden leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <div>
                {sinteseSalva && (
                  <span className="text-xs font-serif font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                    <Check className="w-4 h-4" /> Síntese gravada com sucesso nas notas de #{livroA.id}!
                  </span>
                )}
              </div>

              <button
                onClick={handleSalvarSintese}
                disabled={!sintesePessoal.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-cinzel font-bold tracking-wider uppercase bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Gravar Síntese nas Notas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
