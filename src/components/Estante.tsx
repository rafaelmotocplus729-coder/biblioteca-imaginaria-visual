import React, { useState } from 'react';
import { Livro, Progresso } from '../types';
import { LivroCard } from './LivroCard';
import { EX_LIBRIS_NIVEIS } from '../constants/theme';
import { Layers, CheckCircle2, SplitSquareVertical, ArrowRightLeft, Compass } from 'lucide-react';

interface EstanteProps {
  livros: Livro[];
  progressos: Record<number, Progresso>;
  modoVisualizacao: 'capa' | 'lombada';
  onSelecionarLivro: (id: number) => void;
  filtroNivel?: number;
}

const NOMES_NIVEIS: Record<number, { titulo: string; descricao: string }> = {
  1: {
    titulo: 'Nível 1 — Propedêutica & Instrumental',
    descricao: 'Método de estudo, proficiência linguística, reflexão existencial básica, imaginação sociológica e introdução ao debate ideológico.'
  },
  2: {
    titulo: 'Nível 2 — Consciência Crítica & Psicologia Humana',
    descricao: 'O confronto com o absurdo, a literatura realista, a identidade nacional, a arquitetura das condutas e a sabedoria trágica.'
  },
  3: {
    titulo: 'Nível 3 — Fundamentos Clássicos & Origens do Conflito',
    descricao: 'A metafísica grega, a introspecção cristã, as revoluções científicas, o ceticismo epistemológico e a gênese do poder moderno.'
  },
  4: {
    titulo: 'Nível 4 — Maturidade Dialética & Dilemas da Liberdade',
    descricao: 'A mística do sofrimento, a economia política em choque de sistemas, a tradição, o processo civilizador e o declínio dos laços sólidos.'
  },
  5: {
    titulo: 'Nível 5 — Cume Intelectual & Travessias do Espírito',
    descricao: 'A tragédia das nações, a lei moral incondicional, a hegemonia cultural, a ação humana e os abismos do inconsciente e do sono.'
  }
};

export const Estante: React.FC<EstanteProps> = ({
  livros,
  progressos,
  modoVisualizacao,
  onSelecionarLivro,
  filtroNivel
}) => {
  const [tabNivelMobile, setTabNivelMobile] = useState<number | 'todos'>('todos');
  const [filtroTrilha, setFiltroTrilha] = useState<'todas' | 'a' | 'b'>('todas');
  const [modoAgrupamento, setModoAgrupamento] = useState<'subtrilhas' | 'intercalado'>('subtrilhas');

  // Determinar quais níveis exibir (considera filtro superior ou aba mobile ativa)
  const nivelAtivo = filtroNivel !== undefined ? filtroNivel : (tabNivelMobile === 'todos' ? undefined : tabNivelMobile);
  const niveisParaExibir = nivelAtivo !== undefined ? [nivelAtivo] : [1, 2, 3, 4, 5];

  const algarismosRomanos: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V'
  };

  const renderGradeLivros = (itens: Livro[]) => {
    if (modoVisualizacao === 'lombada') {
      return (
        <div className="overflow-x-auto pb-1 scrollbar-thin">
          <div className="min-w-max flex items-end justify-start gap-1 sm:gap-2 px-1 pt-6 pb-0">
            {itens.map((livro) => (
              <LivroCard
                key={livro.id}
                livro={livro}
                progresso={progressos[livro.id]}
                modoVisualizacao={modoVisualizacao}
                onClick={() => onSelecionarLivro(livro.id)}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 overflow-x-auto sm:overflow-visible gap-4 sm:gap-6 pb-2 sm:pb-0 snap-x scrollbar-thin">
        {itens.map((livro) => (
          <div key={livro.id} className="min-w-[150px] sm:min-w-0 snap-start shrink-0 sm:shrink">
            <LivroCard
              livro={livro}
              progresso={progressos[livro.id]}
              modoVisualizacao={modoVisualizacao}
              onClick={() => onSelecionarLivro(livro.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderTábuaPrateleira = () => (
    <div className="mt-2 relative select-none">
      <div className="shelf-wood h-4 rounded-t-xs relative flex items-center justify-between px-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 shadow-inner" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 shadow-inner" />
      </div>
      <div className="shelf-wood-lip rounded-b-sm" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Barra Nobre de Navegação: Níveis, Trilhas & Organização da Estante */}
      <div className="bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 shadow-sm space-y-3.5">
        {/* Tier 1: Seletor de Níveis em Abas Nobres */}
        {!filtroNivel && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-cinzel font-bold text-stone-500 dark:text-stone-400 px-0.5">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                Níveis do Plano de Estudos
              </span>
              <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 hidden sm:inline">
                Atalhos numéricos [1] a [5] no teclado
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setTabNivelMobile('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all shrink-0 flex items-center gap-2 border ${
                  tabNivelMobile === 'todos'
                    ? 'bg-amber-900 dark:bg-amber-800 text-amber-50 border-amber-700 shadow-xs'
                    : 'bg-stone-50/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 border-stone-200/90 dark:border-stone-800 hover:border-amber-500/60'
                }`}
              >
                <span>Todos os Níveis</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  tabNivelMobile === 'todos'
                    ? 'bg-amber-950/60 text-amber-200'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}>
                  120
                </span>
              </button>

              {[1, 2, 3, 4, 5].map((lvl) => {
                const livrosNivel = livros.filter((l) => l.nivel === lvl);
                const lidos = livrosNivel.filter((l) => progressos[l.id]?.estado === 'lido').length;
                const completo = livrosNivel.length > 0 && lidos === livrosNivel.length;
                const isActive = tabNivelMobile === lvl;

                return (
                  <button
                    key={lvl}
                    onClick={() => setTabNivelMobile(lvl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all shrink-0 flex items-center gap-2 border ${
                      isActive
                        ? 'bg-amber-900 dark:bg-amber-800 text-amber-50 border-amber-700 shadow-xs'
                        : 'bg-stone-50/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 border-stone-200/90 dark:border-stone-800 hover:border-amber-500/60'
                    }`}
                  >
                    <span>Nível {algarismosRomanos[lvl]}</span>
                    {completo ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-amber-950/60 text-amber-200'
                          : 'bg-stone-200/60 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}>
                        {lidos}/{livrosNivel.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tier 2: Alternador de Trilhas e Modos de Exibição da Estante */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-stone-200/70 dark:border-stone-800/70">
          {/* Alternador de Trilhas (Canônica A vs Expansão B vs Ambas) */}
          <div className="flex items-center gap-1.5 bg-stone-100/90 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs self-start sm:self-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFiltroTrilha('todas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                filtroTrilha === 'todas'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/60 dark:border-stone-700/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Exibir todas as 24 obras de cada nível (12 canônicas + 12 expansão)"
            >
              <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>✦ Todas as 24 Obras</span>
            </button>
            <button
              onClick={() => setFiltroTrilha('a')}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all shrink-0 ${
                filtroTrilha === 'a'
                  ? 'bg-amber-900 dark:bg-amber-800 text-amber-50 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Exibir apenas a Trilha A (Obras Canônicas originais 1 a 60)"
            >
              Trilha A (Canônica)
            </button>
            <button
              onClick={() => setFiltroTrilha('b')}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all shrink-0 ${
                filtroTrilha === 'b'
                  ? 'bg-amber-900 dark:bg-amber-800 text-amber-50 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Exibir apenas a Trilha B (Segunda leva de obras complementares 61 a 120)"
            >
              Trilha B (Expansão)
            </button>
          </div>

          {/* Quando 'todas' estiver ativo, permitir alternar entre Prateleiras Divididas ou Intercaladas */}
          {filtroTrilha === 'todas' && (
            <div className="flex items-center gap-1 bg-stone-100/90 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs self-start sm:self-auto shrink-0">
              <span className="text-[10px] font-cinzel text-stone-400 px-2 hidden md:inline uppercase">
                Exibição:
              </span>
              <button
                onClick={() => setModoAgrupamento('subtrilhas')}
                className={`px-2.5 py-1 rounded-lg text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 ${
                  modoAgrupamento === 'subtrilhas'
                    ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/60 dark:border-stone-700/60 font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="Separar visualmente em duas prateleiras por nível: Trilha A e Trilha B"
              >
                <SplitSquareVertical className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Por Trilha</span>
              </button>
              <button
                onClick={() => setModoAgrupamento('intercalado')}
                className={`px-2.5 py-1 rounded-lg text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 ${
                  modoAgrupamento === 'intercalado'
                    ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/60 dark:border-stone-700/60 font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="Intercalar os livros lado a lado (1A, 1B, 2A, 2B...)"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Intercaladas</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {niveisParaExibir.map((nivel) => {
        let livrosDoNivel = livros.filter((l) => l.nivel === nivel);

        if (filtroTrilha === 'a') {
          livrosDoNivel = livrosDoNivel.filter((l) => l.id <= 60);
        } else if (filtroTrilha === 'b') {
          livrosDoNivel = livrosDoNivel.filter((l) => l.id > 60);
        }

        if (livrosDoNivel.length === 0) return null;

        const info = NOMES_NIVEIS[nivel];
        const concluidos = livrosDoNivel.filter((l) => progressos[l.id]?.estado === 'lido').length;
        const emCurso = livrosDoNivel.filter((l) => progressos[l.id]?.estado === 'lendo').length;
        const romano = algarismosRomanos[nivel] || `${nivel}`;
        const nivelCompletado = concluidos === livrosDoNivel.length && livrosDoNivel.length > 0;
        const exLibris = EX_LIBRIS_NIVEIS[nivel];
        const porcentagem = Math.round((concluidos / livrosDoNivel.length) * 100);

        const trilhaA = livrosDoNivel.filter((l) => l.id <= 60).sort((a, b) => a.ordem_no_nivel - b.ordem_no_nivel);
        const trilhaB = livrosDoNivel.filter((l) => l.id > 60).sort((a, b) => a.ordem_no_nivel - b.ordem_no_nivel);

        const livrosIntercalados = [...livrosDoNivel].sort((a, b) => {
          if (a.ordem_no_nivel !== b.ordem_no_nivel) {
            return a.ordem_no_nivel - b.ordem_no_nivel;
          }
          return a.id <= 60 ? -1 : 1;
        });

        return (
          <section
            key={nivel}
            className="relative bg-library-paper/90 dark:bg-library-darkPaper/90 rounded-2xl p-4 sm:p-7 border border-stone-300/80 dark:border-stone-800/90 backdrop-blur-md shadow-sm transition-all space-y-6"
          >
            {/* Cabeçalho Editorial do Nível */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800/80 gap-3">
              <div className="flex items-start gap-3.5">
                <div className="shrink-0 w-11 h-11 rounded-sm brass-plaque flex items-center justify-center font-cinzel font-bold text-lg select-none">
                  {romano}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    {info.titulo}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-serif italic leading-relaxed">
                    {info.descricao}
                  </p>
                </div>
              </div>

              {/* Rótulo de Leitura com Barra de Progresso Clássica */}
              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400 font-cinzel bg-stone-100/80 dark:bg-stone-900/80 px-3 py-1.5 rounded-md border border-stone-200 dark:border-stone-800">
                  {emCurso > 0 && (
                    <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {emCurso} em curso
                    </span>
                  )}
                  <span className="text-stone-700 dark:text-stone-300 font-semibold">
                    {concluidos} / {livrosDoNivel.length} lidos ({porcentagem}%)
                  </span>
                </div>
                <div className="w-full sm:w-36 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                    style={{ width: `${porcentagem}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Selo Ex-Libris de Honra quando o nível for concluído */}
            {nivelCompletado && exLibris && (
              <div className="p-4 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-amber-950/40 text-stone-800 dark:text-stone-200 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{exLibris.icon}</span>
                  <div>
                    <h4 className="font-cinzel font-bold text-sm text-amber-900 dark:text-amber-200">
                      {exLibris.titulo}
                    </h4>
                    <p className="text-xs font-serif italic text-amber-800/80 dark:text-amber-300/80">
                      "{exLibris.lema}" — Todas as {livrosDoNivel.length} obras absorvidas neste nível.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-cinzel font-bold uppercase tracking-wider rounded bg-amber-700 text-white shadow-xs">
                  Nível Conquistado
                </span>
              </div>
            )}

            {/* Visualização das Prateleiras */}
            {filtroTrilha === 'todas' && modoAgrupamento === 'subtrilhas' && trilhaA.length > 0 && trilhaB.length > 0 ? (
              /* MODO DOIS TRILHOS DISTINTOS POR NÍVEL */
              <div className="space-y-8 pt-2">
                {/* PRATELEIRA TRILHA A: CANÔNICA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-cinzel font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-stone-700 dark:bg-stone-400" />
                      Trilha A — Obras Fundamentais / Canônicas (1 a 12)
                    </span>
                    <span className="text-[11px] text-stone-500 font-cinzel">
                      {trilhaA.filter(l => progressos[l.id]?.estado === 'lido').length} / {trilhaA.length} lidas
                    </span>
                  </div>
                  {renderGradeLivros(trilhaA)}
                  {renderTábuaPrateleira()}
                </div>

                {/* PRATELEIRA TRILHA B: EXPANSÃO DIALÉTICA */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-cinzel font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      Trilha B — Expansão Dialética & Diálogos (13 a 24 / IDs 61-120)
                    </span>
                    <span className="text-[11px] text-stone-500 font-cinzel">
                      {trilhaB.filter(l => progressos[l.id]?.estado === 'lido').length} / {trilhaB.length} lidas
                    </span>
                  </div>
                  {renderGradeLivros(trilhaB)}
                  {renderTábuaPrateleira()}
                </div>
              </div>
            ) : (
              /* MODO ÚNICA PRATELEIRA (SEJA INTERCALADA OU FILTRADA POR TRILHA A/B) */
              <div className="space-y-3">
                {filtroTrilha === 'todas' && modoAgrupamento === 'intercalado' && (
                  <div className="px-1 text-[11px] font-cinzel text-amber-800 dark:text-amber-400 italic">
                    Visão Intercalada: Obras de fundamentação e expansão emparelhadas sequencialmente (1A, 1B, 2A, 2B...).
                  </div>
                )}
                {renderGradeLivros(modoAgrupamento === 'intercalado' ? livrosIntercalados : livrosDoNivel)}
                {renderTábuaPrateleira()}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
