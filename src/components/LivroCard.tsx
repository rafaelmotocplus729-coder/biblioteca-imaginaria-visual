import React, { useState, useEffect } from 'react';
import { Livro, Progresso } from '../types';
import { CORES_AREAS } from '../constants/theme';
import { BookOpen, CheckCircle, Clock, XCircle, Star } from 'lucide-react';

interface LivroCardProps {
  livro: Livro;
  progresso?: Progresso;
  modoVisualizacao: 'capa' | 'lombada';
  onClick: () => void;
}

export const LivroCard: React.FC<LivroCardProps> = ({
  livro,
  progresso,
  modoVisualizacao,
  onClick
}) => {
  const [imagemErro, setImagemErro] = useState(false);

  useEffect(() => {
    setImagemErro(false);
  }, [livro.capa_url]);

  const estado = progresso?.estado || 'nao_iniciado';
  const cores = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];

  // Estados visuais claros e nobres conforme Seção 7.1:
  let estadoClasses = 'border-stone-200/90 dark:border-library-darkBorder hover:shadow-book-hover shadow-book';
  let badgeIcon = null;

  if (estado === 'lendo') {
    estadoClasses = 'ring-1 ring-amber-500/80 dark:ring-amber-400/70 border-amber-500/80 shadow-book-hover shadow-amber-900/20 scale-[1.02]';
    badgeIcon = <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />;
  } else if (estado === 'lido') {
    estadoClasses = 'opacity-85 hover:opacity-100 border-emerald-600/40 dark:border-emerald-500/30 shadow-sm';
    badgeIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
  } else if (estado === 'abandonado') {
    estadoClasses = 'opacity-60 grayscale border-stone-300 dark:border-stone-700 bg-stone-100/50 dark:bg-stone-900/50';
    badgeIcon = <XCircle className="w-3.5 h-3.5 text-stone-500" />;
  } else if (estado === 'reler_5_anos') {
    estadoClasses = 'border-purple-400/70 shadow-md ring-1 ring-purple-400/30';
    badgeIcon = <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
  }

  // Visualização em Lombada (Estilo Encadernação Clássica)
  if (modoVisualizacao === 'lombada') {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Livro #${livro.id} ${livro.titulo} por ${livro.autor}`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={`group relative flex flex-col justify-between p-3.5 rounded cursor-pointer transition-all duration-300 border-l-[10px] bg-gradient-to-r from-library-paper via-[#faf7f2] to-library-paper dark:from-library-darkPaper dark:via-[#1e2025] dark:to-library-darkPaper text-left min-h-[145px] max-w-[220px] w-full border ${estadoClasses} hover:-translate-y-1`}
        style={{ borderLeftColor: cores.hex }}
      >
        {/* Fita marcadora se estiver lendo */}
        {estado === 'lendo' && <div className="book-ribbon-reading" title="Leitura em andamento" />}

        {/* Linha decorativa de encadernação clássica */}
        <div className="absolute top-0 bottom-0 left-1 w-[1px] bg-black/15 dark:bg-white/10 pointer-events-none" />

        <div className="flex items-center justify-between gap-1 text-[11px] font-medium tracking-wider text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5 font-cinzel">
            <span className="font-semibold text-stone-700 dark:text-stone-300">#{livro.id}</span>
            {livro.obra_de_vida && (
              <span title="Obra de Vida (reler a cada década)" className="inline-flex items-center text-amber-500">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              </span>
            )}
            {livro.idioma_leitura === 'en' && (
              <span className="px-1 text-[9px] font-mono bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded">EN</span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            {badgeIcon}
            <span
              className="px-1.5 py-0.5 text-[8px] font-cinzel font-bold tracking-wider uppercase rounded shadow-xs text-white"
              style={{ backgroundColor: cores.hex }}
            >
              {livro.classe}
            </span>
          </div>
        </div>

        <div className="my-2 pl-1 border-l-2 border-stone-200 dark:border-stone-800 group-hover:border-amber-600 transition-colors">
          <h4 className="font-serif font-bold text-sm leading-snug line-clamp-2 text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
            {livro.titulo}
          </h4>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-1 italic font-serif">
            {livro.autor}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-500 border-t border-stone-200/60 dark:border-stone-800/80 pt-1.5 mt-auto">
          <span className="line-clamp-1 text-[10px] tracking-wide uppercase font-medium">{livro.area}</span>
          <span className="font-cinzel text-[10px] font-semibold">{livro.ano}</span>
        </div>
      </div>
    );
  }

  // Visualização em Capa (Com efeito de profundidade física de livro)
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Livro #${livro.id} ${livro.titulo} por ${livro.autor}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex flex-col rounded-md overflow-hidden cursor-pointer transition-all duration-300 border bg-library-paper dark:bg-library-darkPaper text-left hover:-translate-y-1.5 ${estadoClasses}`}
    >
      {/* Fita marcadora de leitura clássica (estilo fita de seda) */}
      {estado === 'lendo' && <div className="book-ribbon-reading" title="Leitura em andamento" />}

      {/* Container da Capa com Proporção Clássica de Livro (2:3) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-900 select-none">
        {/* Sombra de lombada física na esquerda */}
        <div className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none bg-gradient-to-r from-black/40 via-black/15 to-transparent z-10" />
        {/* Vinco de dobra de capa (hinge crease) */}
        <div className="absolute left-3 top-0 bottom-0 w-[1px] pointer-events-none bg-black/25 dark:bg-white/10 z-10" />
        {/* Brilho da borda direita das páginas */}
        <div className="absolute right-0 top-0 bottom-0 w-[2px] pointer-events-none bg-gradient-to-l from-amber-100/40 dark:from-white/10 to-transparent z-10" />

        {livro.capa_url && !imagemErro ? (
          <img
            src={livro.capa_url}
            alt={`Capa de ${livro.titulo}`}
            loading="lazy"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
                setImagemErro(true);
              }
            }}
            onError={() => setImagemErro(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          /* Capa tipográfica clássica em marfim / linho editorial com moldura dourada */
          <div
            className="w-full h-full flex flex-col justify-between p-4 text-white select-none transition-transform duration-500 ease-out group-hover:scale-105 relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${cores.hex}ee 0%, ${cores.hex}cc 60%, ${cores.hex} 100%)`
            }}
          >
            {/* Moldura dupla dourada ornamental */}
            <div className="absolute inset-2 border border-amber-300/40 rounded-sm pointer-events-none" />
            <div className="absolute inset-2.5 border border-amber-300/20 rounded-xs pointer-events-none" />

            <div className="flex justify-between items-start text-[11px] font-cinzel opacity-90 z-10">
              <span className="font-bold tracking-wider">#{livro.id}</span>
              <span className="tracking-widest">{livro.ano}</span>
            </div>

            <div className="my-auto py-2 z-10 text-center px-1">
              <h4 className="font-serif font-bold text-sm sm:text-base leading-snug tracking-tight drop-shadow-md text-amber-50">
                {livro.titulo}
              </h4>
              <div className="w-8 h-[1px] bg-amber-200/50 mx-auto my-2" />
              <p className="text-xs text-amber-100/90 font-serif italic tracking-wide">
                {livro.autor}
              </p>
            </div>

            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-cinzel opacity-90 border-t border-amber-300/30 pt-1.5 z-10">
              <span className="truncate max-w-[90px]">{livro.area}</span>
              <span className="font-bold">{livro.classe}</span>
            </div>
          </div>
        )}

        {/* Selos flutuantes na capa com acabamento nobre */}
        <div className="absolute top-2.5 left-4 flex flex-col gap-1 z-10">
          <span className="px-2 py-0.5 text-[10px] font-cinzel font-bold rounded shadow-sm bg-stone-900/85 backdrop-blur-md text-stone-100 border border-stone-700/50 flex items-center gap-1">
            #{livro.id}
            {livro.obra_de_vida && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
          </span>
          {livro.idioma_leitura === 'en' && (
            <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold rounded shadow-xs bg-stone-800/90 text-amber-200 border border-stone-600/50">
              EN
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2 flex items-center gap-1.5 z-10">
          {badgeIcon && (
            <div className="p-1 rounded-full bg-stone-900/80 dark:bg-stone-950/90 shadow-sm border border-stone-700/40 backdrop-blur-md">
              {badgeIcon}
            </div>
          )}
          <span
            className="px-2 py-0.5 text-[8px] font-cinzel font-bold tracking-wider uppercase rounded shadow-xs text-white border border-white/20"
            style={{ backgroundColor: cores.hex }}
          >
            {livro.classe}
          </span>
        </div>

        {/* Tese do livro ao passar o mouse (overlay editorial) */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 z-10">
          <p className="text-[11px] text-stone-100 line-clamp-3 italic font-serif leading-relaxed">
            "{livro.tese}"
          </p>
        </div>
      </div>

      {/* Legenda inferior do livro com ar de biblioteca particular */}
      <div className="p-3 flex flex-col justify-between flex-grow bg-gradient-to-b from-library-paper to-[#faf8f4] dark:from-library-darkPaper dark:to-[#17181c] border-t border-stone-200/70 dark:border-stone-800/80">
        <h4 className="font-serif font-bold text-xs leading-snug line-clamp-1 text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
          {livro.titulo}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400 mt-1.5">
          <span className="truncate mr-1 italic font-serif text-[11px]">{livro.autor}</span>
          <span className="font-cinzel text-[10px] shrink-0 font-semibold text-stone-500">{livro.ano}</span>
        </div>
      </div>
    </div>
  );
};
