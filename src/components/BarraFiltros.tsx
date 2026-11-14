import React from 'react';
import { Filtros, ClasseLivro, EstadoLeitura, IdiomaLeitura } from '../types';
import {
  Search,
  X,
  RotateCcw,
  Star,
  ChevronDown,
  Layers,
  Compass,
  BookOpen,
  CheckCircle2,
  Globe,
  SlidersHorizontal
} from 'lucide-react';

interface BarraFiltrosProps {
  filtros: Filtros;
  onAtualizarFiltros: (novos: Partial<Filtros>) => void;
  onLimparFiltros: () => void;
  totalLivros: number;
  livrosFiltrados: number;
  todasAreas: string[];
}

export const BarraFiltros: React.FC<BarraFiltrosProps> = ({
  filtros,
  onAtualizarFiltros,
  onLimparFiltros,
  totalLivros,
  livrosFiltrados,
  todasAreas
}) => {
  const temFiltroAtivo =
    Boolean(filtros.textoBusca) ||
    Boolean(filtros.area) ||
    Boolean(filtros.classe) ||
    Boolean(filtros.nivel) ||
    Boolean(filtros.estado) ||
    Boolean(filtros.apenasObraDeVida) ||
    Boolean(filtros.idioma);

  const selectWrapperClass = 'relative inline-flex items-center';
  const selectBaseClass =
    'appearance-none h-9 pl-8 pr-7 rounded-xl border border-stone-200/90 dark:border-stone-700/90 bg-stone-50/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 text-xs font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none cursor-pointer hover:border-amber-400/70 dark:hover:border-amber-600/60 transition-colors';

  return (
    <div className="surface-editorial rounded-2xl p-4 sm:p-5 mb-5 space-y-3.5 transition-all">
      {/* Linha Principal: Busca Textual + Quick Pills + Contador */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-amber-700/80 dark:text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filtros.textoBusca}
            onChange={(e) => onAtualizarFiltros({ textoBusca: e.target.value })}
            placeholder="Filtrar acervo por título, autor, área ou conceito (ex: Agostinho, tragédia, liberdade, estado)..."
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-stone-300/80 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all font-serif"
          />
          {filtros.textoBusca && (
            <button
              type="button"
              onClick={() => onAtualizarFiltros({ textoBusca: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-md cursor-pointer transition-colors"
              title="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Atalhos Rápidos de Estado e Contador */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 shrink-0">
          {/* Pílulas rápidas: Lendo Agora / Lidos / Obra de Vida */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                onAtualizarFiltros({ estado: filtros.estado === 'lendo' ? undefined : 'lendo' })
              }
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-cinzel font-bold transition-all cursor-pointer ${
                filtros.estado === 'lendo'
                  ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-400 dark:border-amber-600 shadow-2xs'
                  : 'border-stone-200/90 dark:border-stone-700/90 bg-stone-50/80 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-amber-400/60'
              }`}
              title="Mostrar apenas obras em leitura ativa"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Lendo</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onAtualizarFiltros({ estado: filtros.estado === 'lido' ? undefined : 'lido' })
              }
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-cinzel font-bold transition-all cursor-pointer ${
                filtros.estado === 'lido'
                  ? 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700 shadow-2xs'
                  : 'border-stone-200/90 dark:border-stone-700/90 bg-stone-50/80 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-emerald-400/60'
              }`}
              title="Mostrar apenas obras concluídas"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Lidos</span>
            </button>

            <button
              type="button"
              onClick={() => onAtualizarFiltros({ apenasObraDeVida: !filtros.apenasObraDeVida })}
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border font-cinzel text-xs font-bold transition-all cursor-pointer ${
                filtros.apenasObraDeVida
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-400 dark:border-amber-600 shadow-2xs'
                  : 'border-stone-200/90 dark:border-stone-700/90 bg-stone-50/80 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-amber-400/60'
              }`}
              title="Filtrar apenas as grandes Obras de Vida (uma por nível)"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  filtros.apenasObraDeVida
                    ? 'text-amber-600 dark:text-amber-400 fill-amber-500 dark:fill-amber-400'
                    : 'text-amber-600/80 dark:text-amber-400/80'
                }`}
              />
              <span>Obras de Vida</span>
            </button>
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block mx-1" />

          {/* Contador Tabular e Limpar */}
          <div className="flex items-center gap-2.5 text-xs text-stone-500 dark:text-stone-400 tabular-nums">
            <span className="font-serif">
              Exibindo{' '}
              <strong className="font-mono text-stone-900 dark:text-stone-100 font-bold">
                {livrosFiltrados}
              </strong>{' '}
              de {totalLivros}
            </span>
            {temFiltroAtivo && (
              <button
                type="button"
                onClick={onLimparFiltros}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-cinzel font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-300/80 dark:border-amber-800 transition-all cursor-pointer"
                title="Restaurar todos os filtros"
              >
                <RotateCcw className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Linha Secundária: Seletores Refinados de Recorte */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-200/70 dark:border-stone-800/80 text-xs">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-cinzel font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700/70 dark:text-amber-400/70" />
          <span>Recortes:</span>
        </span>

        {/* Área */}
        <div className={selectWrapperClass}>
          <Compass className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-2.5 pointer-events-none" />
          <select
            value={filtros.area ?? ''}
            onChange={(e) => onAtualizarFiltros({ area: e.target.value || undefined })}
            aria-label="Filtrar por Área do Conhecimento"
            className={`${selectBaseClass} font-serif`}
          >
            <option value="">Todas as Áreas ({todasAreas.length})</option>
            {todasAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Classe */}
        <div className={selectWrapperClass}>
          <Layers className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-2.5 pointer-events-none" />
          <select
            value={filtros.classe ?? ''}
            onChange={(e) => onAtualizarFiltros({ classe: (e.target.value as ClasseLivro) || undefined })}
            aria-label="Filtrar por Classe de Leitura"
            className={`${selectBaseClass} font-cinzel font-semibold`}
          >
            <option value="">Todas as Classes</option>
            <option value="OBRA">OBRA (Leitura Integral)</option>
            <option value="MAPA">MAPA (Visão Panorâmica)</option>
            <option value="PORTA">PORTA (Acesso Metódico)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Estado de Leitura Completo */}
        <div className={selectWrapperClass}>
          <BookOpen className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-2.5 pointer-events-none" />
          <select
            value={filtros.estado ?? ''}
            onChange={(e) => onAtualizarFiltros({ estado: (e.target.value as EstadoLeitura) || undefined })}
            aria-label="Filtrar por Estado de Leitura"
            className={`${selectBaseClass} font-serif`}
          >
            <option value="">Todos os Estados</option>
            <option value="lendo">Lendo Agora</option>
            <option value="lido">Lido (Concluído)</option>
            <option value="nao_iniciado">Não Iniciado</option>
            <option value="reler_5_anos">Reler em 5 Anos</option>
            <option value="abandonado">Abandonado</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Idioma */}
        <div className={selectWrapperClass}>
          <Globe className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-2.5 pointer-events-none" />
          <select
            value={filtros.idioma ?? ''}
            onChange={(e) => onAtualizarFiltros({ idioma: (e.target.value as IdiomaLeitura) || undefined })}
            aria-label="Filtrar por Idioma"
            className={`${selectBaseClass} font-serif`}
          >
            <option value="">Todos os Idiomas</option>
            <option value="pt">Português (PT)</option>
            <option value="en">Inglês (EN)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

