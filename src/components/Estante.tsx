import React from 'react';
import { Livro, Progresso } from '../types';
import { LivroCard } from './LivroCard';

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
  const niveisParaExibir = filtroNivel ? [filtroNivel] : [1, 2, 3, 4, 5];

  const algarismosRomanos: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V'
  };

  return (
    <div className="space-y-14 pb-20">
      {niveisParaExibir.map((nivel) => {
        const livrosDoNivel = livros
          .filter((l) => l.nivel === nivel)
          .sort((a, b) => a.ordem_no_nivel - b.ordem_no_nivel);

        if (livrosDoNivel.length === 0) return null;

        const info = NOMES_NIVEIS[nivel];
        const concluidos = livrosDoNivel.filter((l) => progressos[l.id]?.estado === 'lido').length;
        const emCurso = livrosDoNivel.filter((l) => progressos[l.id]?.estado === 'lendo').length;
        const romano = algarismosRomanos[nivel] || `${nivel}`;

        return (
          <section
            key={nivel}
            className="relative bg-library-paper/85 dark:bg-library-darkPaper/85 rounded-xl p-5 sm:p-8 border border-stone-300/80 dark:border-stone-800 backdrop-blur-md shadow-sm transition-all"
          >
            {/* Cabeçalho Editorial da Prateleira */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-200 dark:border-stone-800/80 gap-3">
              <div className="flex items-start gap-3.5">
                {/* Placa Metálica / Bronze do Nível */}
                <div className="shrink-0 w-10 h-10 rounded-sm bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 border border-amber-400/40 shadow-sm flex items-center justify-center text-amber-100 font-cinzel font-bold text-base select-none">
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

              {/* Rótulo de Leitura Sóbrio e Clássico */}
              <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400 font-cinzel shrink-0 self-end sm:self-center bg-stone-100/80 dark:bg-stone-900/80 px-3 py-1.5 rounded border border-stone-200 dark:border-stone-800">
                {emCurso > 0 && (
                  <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {emCurso} em curso
                  </span>
                )}
                <span className="text-stone-700 dark:text-stone-300 font-semibold">
                  {concluidos} / {livrosDoNivel.length} lidos
                </span>
              </div>
            </div>

            {/* Prateleira de Livros */}
            <div
              className={
                modoVisualizacao === 'capa'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6'
                  : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5'
              }
            >
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

            {/* Prancha de Madeira Maciça de Biblioteca (Mogno/Nogueira com chanfro) */}
            <div className="mt-8 relative">
              {/* Chanfro de luz da borda superior da madeira */}
              <div className="h-[2px] bg-gradient-to-r from-amber-700/30 via-amber-400/50 to-amber-700/30 rounded-t-xs" />
              {/* Corpo da tábua de madeira nobre */}
              <div className="h-4 bg-gradient-to-r from-[#2a170f] via-[#4a2b1c] to-[#2a170f] rounded-b shadow-shelf border-t border-amber-950/60 relative flex items-center justify-center">
                {/* Detalhe sutil de ferragem/parafuso nas pontas */}
                <span className="absolute left-4 w-1.5 h-1.5 rounded-full bg-amber-600/60 shadow-inner" />
                <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-amber-600/60 shadow-inner" />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
