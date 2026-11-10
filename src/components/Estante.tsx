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

  return (
    <div className="space-y-12 pb-16">
      {niveisParaExibir.map((nivel) => {
        const livrosDoNivel = livros
          .filter((l) => l.nivel === nivel)
          .sort((a, b) => a.ordem_no_nivel - b.ordem_no_nivel);

        if (livrosDoNivel.length === 0) return null;

        const info = NOMES_NIVEIS[nivel];
        const concluidos = livrosDoNivel.filter((l) => progressos[l.id]?.estado === 'lido').length;
        const emCurso = livrosDoNivel.filter((l) => progressos[l.id]?.estado === 'lendo').length;

        return (
          <section
            key={nivel}
            className="relative bg-library-paper/60 dark:bg-library-darkPaper/60 rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-library-darkBorder backdrop-blur-sm shadow-sm transition-all"
          >
            {/* Cabeçalho da Prateleira */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-slate-800 gap-2">
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
                  {info.titulo}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-sans">
                  {info.descricao}
                </p>
              </div>

              {/* Rótulo de Leitura Sóbrio (sem barra gamificada) */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono shrink-0">
                {emCurso > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {emCurso} em curso
                  </span>
                )}
                <span>
                  {concluidos} de {livrosDoNivel.length} lidos
                </span>
              </div>
            </div>

            {/* Prateleira de Livros */}
            <div
              className={
                modoVisualizacao === 'capa'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5'
                  : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'
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

            {/* Suporte de Madeira Estilizado (Metáfora Sóbria de Biblioteca) */}
            <div className="mt-6 h-3 bg-gradient-to-r from-library-woodDark via-library-wood to-library-woodDark rounded-full shadow-inner opacity-80"></div>
          </section>
        );
      })}
    </div>
  );
};
