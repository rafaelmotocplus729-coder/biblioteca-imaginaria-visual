import React, { useState } from 'react';
import { Livro, Progresso } from '../types';
import { LivroCard } from './LivroCard';
import { EX_LIBRIS_NIVEIS } from '../constants/theme';
import { Layers, CheckCircle2 } from 'lucide-react';

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
    descricao: 'Método de estudo, proficiência linguística, reflexão existencial básica e introdução ao debate ideológico.'
  },
  2: {
    titulo: 'Nível 2 — Consciência Crítica & Psicologia Humana',
    descricao: 'O confronto com o absurdo, a literatura realista, a identidade nacional e a arquitetura das condutas.'
  },
  3: {
    titulo: 'Nível 3 — Fundamentos Clássicos & Origens do Conflito',
    descricao: 'A metafísica grega, a introspecção cristã, as forças da sociologia e a gênese do poder político moderno.'
  },
  4: {
    titulo: 'Nível 4 — Maturidade Dialética & Dilemas da Liberdade',
    descricao: 'A mística do sofrimento, a economia política em choque de sistemas, a tradição e o declínio dos laços sólidos.'
  },
  5: {
    titulo: 'Nível 5 — Cume Intelectual & Travessias do Espírito',
    descricao: 'A tragédia das nações, a lei moral incondicional, a genealogia do ressentimento e os abismos do inconsciente.'
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

  return (
    <div className="space-y-12 pb-20">
      {/* Seletor de Níveis em Abas Nobres (Ideal para navegação rápida em mobile e desktop) */}
      {!filtroNivel && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setTabNivelMobile('todos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
              tabNivelMobile === 'todos'
                ? 'bg-amber-900 text-amber-100 border-amber-700 shadow-sm'
                : 'bg-library-paper/90 dark:bg-library-darkPaper text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos os Níveis</span>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-amber-900 text-amber-100 border-amber-700 shadow-sm'
                    : 'bg-library-paper/90 dark:bg-library-darkPaper text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-500'
                }`}
              >
                <span>Nível {algarismosRomanos[lvl]}</span>
                {completo ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="text-[10px] opacity-75 font-mono">
                    ({lidos}/{livrosNivel.length})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {niveisParaExibir.map((nivel) => {
        const livrosDoNivel = livros
          .filter((l) => l.nivel === nivel)
          .sort((a, b) => a.ordem_no_nivel - b.ordem_no_nivel);

        if (livrosDoNivel.length === 0) return null;

        const info = NOMES_NIVEIS[nivel];
        const concluidos = livrosDoNivel.filter((l) => progressos[l.id]?.estado === 'lido').length;
        const emCurso = livrosDoNivel.filter((l) => progressos[l.id]?.estado === 'lendo').length;
        const romano = algarismosRomanos[nivel] || `${nivel}`;
        const nivelCompletado = concluidos === livrosDoNivel.length && livrosDoNivel.length > 0;
        const exLibris = EX_LIBRIS_NIVEIS[nivel];
        const porcentagem = Math.round((concluidos / livrosDoNivel.length) * 100);

        return (
          <section
            key={nivel}
            className="relative bg-library-paper/90 dark:bg-library-darkPaper/90 rounded-2xl p-4 sm:p-7 border border-stone-300/80 dark:border-stone-800/90 backdrop-blur-md shadow-sm transition-all"
          >
            {/* Cabeçalho Editorial da Prateleira com Placa de Metal Nobre */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-200 dark:border-stone-800/80 gap-3">
              <div className="flex items-start gap-3.5">
                {/* Placa de Latão / Bronze Envelhecido */}
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
                {/* Micro barra de progresso em ouro envelhecido */}
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
              <div className="mb-6 p-4 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-amber-950/40 text-stone-800 dark:text-stone-200 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{exLibris.icon}</span>
                  <div>
                    <h4 className="font-cinzel font-bold text-sm text-amber-900 dark:text-amber-200">
                      {exLibris.titulo}
                    </h4>
                    <p className="text-xs font-serif italic text-amber-800/80 dark:text-amber-300/80">
                      "{exLibris.lema}" — Todas as {livrosDoNivel.length} obras absorvidas.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-cinzel font-bold uppercase tracking-wider rounded bg-amber-700 text-white shadow-xs">
                  Nível Conquistado
                </span>
              </div>
            )}

            {/* Visualização de Livros na Estante */}
            {modoVisualizacao === 'lombada' ? (
              /* MODO LOMBADA: Livros em pé sobre a prateleira com alinhamento na base e scroll suave */
              <div className="overflow-x-auto pb-1 scrollbar-thin">
                <div className="min-w-max flex items-end justify-start gap-1 sm:gap-2 px-1 pt-6 pb-0">
                  {livrosDoNivel.map((livro) => (
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
            ) : (
              /* MODO CAPA: Grid responsivo com carrossel horizontal snap no mobile */
              <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 overflow-x-auto sm:overflow-visible gap-4 sm:gap-6 pb-2 sm:pb-0 snap-x scrollbar-thin">
                {livrosDoNivel.map((livro) => (
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
            )}

            {/* Prateleira Maciça de Biblioteca 3D (Madeira Nobre com Moldura e Luz) */}
            <div className="mt-2 relative select-none">
              <div className="shelf-wood h-4 rounded-t-xs relative flex items-center justify-between px-4">
                {/* Parafusos/rebites de latão decorativo nos extremos da tábua */}
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 shadow-inner" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 shadow-inner" />
              </div>
              <div className="shelf-wood-lip rounded-b-sm" />
            </div>
          </section>
        );
      })}
    </div>
  );
};
