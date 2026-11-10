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

  // Estados visuais claros exigidos na Seção 7.1:
  // "não iniciado, lendo (destaque), lido (opacidade reduzida com marca discreta), abandonado (cinza), reler em 5 anos (ícone de relógio)"
  let estadoClasses = 'border-slate-300 dark:border-slate-700 hover:shadow-lg';
  let badgeIcon = null;

  if (estado === 'lendo') {
    estadoClasses = 'ring-2 ring-amber-500 shadow-xl shadow-amber-500/20 scale-[1.02] border-amber-500';
    badgeIcon = <BookOpen className="w-3.5 h-3.5 text-amber-500 animate-pulse" />;
  } else if (estado === 'lido') {
    estadoClasses = 'opacity-75 hover:opacity-100 border-emerald-500/50 grayscale-[20%]';
    badgeIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
  } else if (estado === 'abandonado') {
    estadoClasses = 'opacity-60 grayscale border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-900';
    badgeIcon = <XCircle className="w-3.5 h-3.5 text-slate-500" />;
  } else if (estado === 'reler_5_anos') {
    estadoClasses = 'border-purple-400/80 shadow-md';
    badgeIcon = <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
  }

  // Visualização em Lombada
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
        className={`group relative flex flex-col justify-between p-3 rounded-md cursor-pointer transition-all duration-200 border-l-8 bg-library-paper dark:bg-library-darkPaper text-left min-h-[140px] max-w-[210px] w-full border ${estadoClasses}`}
        style={{ borderLeftColor: cores.hex }}
      >
        <div className="flex items-center justify-between gap-1 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            #{livro.id}
            {livro.obra_de_vida && (
              <span title="Obra de Vida (reler a cada década)">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              </span>
            )}
            {livro.idioma_leitura === 'en' && (
              <span className="px-1 text-[9px] font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">EN</span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            {badgeIcon}
            <span
              className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded text-white"
              style={{ backgroundColor: cores.hex }}
            >
              {livro.classe}
            </span>
          </div>
        </div>

        <div className="my-2">
          <h4 className="font-serif font-bold text-sm leading-snug line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            {livro.titulo}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
            {livro.autor}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-auto">
          <span className="line-clamp-1">{livro.area}</span>
          <span>{livro.ano}</span>
        </div>
      </div>
    );
  }

  // Visualização em Capa
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
      className={`group relative flex flex-col rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border bg-library-paper dark:bg-library-darkPaper text-left ${estadoClasses}`}
    >
      {/* Container da Capa */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* Capa tipográfica de biblioteca em português conforme Seção 6.5 do PRD */
          <div
            className="w-full h-full flex flex-col justify-between p-3.5 text-white select-none transition-transform duration-300 group-hover:scale-105 relative overflow-hidden"
            style={{
              background: `linear-gradient(150deg, ${cores.hex}ee, ${cores.hex}cc, ${cores.hex}ff)`
            }}
          >
            {/* Moldura clássica de encadernação */}
            <div className="absolute inset-1.5 border border-white/20 rounded pointer-events-none"></div>
            
            <div className="flex justify-between items-start text-[11px] font-serif opacity-80 z-10">
              <span className="font-mono">#{livro.id}</span>
              <span>{livro.ano}</span>
            </div>

            <div className="my-auto py-2 z-10">
              <h4 className="font-serif font-bold text-sm sm:text-base leading-tight tracking-tight drop-shadow">
                {livro.titulo}
              </h4>
              <p className="text-xs opacity-90 mt-2 font-medium tracking-wide">
                {livro.autor}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold opacity-80 border-t border-white/20 pt-1.5 z-10">
              <span>{livro.area}</span>
              <span>{livro.classe}</span>
            </div>
          </div>
        )}

        {/* Selos flutuantes na capa */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded shadow-md bg-slate-900/80 backdrop-blur text-white flex items-center gap-1">
            #{livro.id}
            {livro.obra_de_vida && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
          </span>
          {livro.idioma_leitura === 'en' && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow bg-blue-700 text-white">
              [EN]
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          {badgeIcon && (
            <div className="p-1 rounded-full bg-white/90 dark:bg-slate-900/90 shadow backdrop-blur">
              {badgeIcon}
            </div>
          )}
          <span
            className="px-2 py-0.5 text-[9px] font-bold uppercase rounded shadow-md text-white"
            style={{ backgroundColor: cores.hex }}
          >
            {livro.classe}
          </span>
        </div>

        {/* Efeito sutil ao passar o mouse */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <p className="text-[11px] text-white line-clamp-2 italic font-serif">
            "{livro.tese}"
          </p>
        </div>
      </div>

      {/* Rodapé com Título e Autor */}
      <div className="p-2.5 flex flex-col justify-between flex-grow">
        <h4 className="font-serif font-bold text-xs leading-snug line-clamp-1 text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          {livro.titulo}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          <span className="truncate mr-1">{livro.autor}</span>
          <span className="text-[10px] shrink-0 font-medium">{livro.ano}</span>
        </div>
      </div>
    </div>
  );
};
