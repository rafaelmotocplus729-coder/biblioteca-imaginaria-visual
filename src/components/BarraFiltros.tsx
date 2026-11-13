import React from 'react';
import { Filtros, ClasseLivro, EstadoLeitura, IdiomaLeitura } from '../types';
import { Search, X, RotateCcw } from 'lucide-react';

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

  return (
    <div className="bg-white/95 dark:bg-[#18191d]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xs border border-stone-200/90 dark:border-stone-800/90 mb-6 space-y-3.5 transition-all">
      {/* Linha Principal: Busca Textual */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-amber-700/70 dark:text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filtros.textoBusca}
            onChange={(e) => onAtualizarFiltros({ textoBusca: e.target.value })}
            placeholder="Pesquisar por título, autor ou conceito da tese (ex: Camus, suicídio, mercado, virtude)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-300/80 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none placeholder:text-stone-400 transition-all shadow-2xs font-serif"
          />
          {filtros.textoBusca && (
            <button
              onClick={() => onAtualizarFiltros({ textoBusca: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer transition-colors"
              title="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Contador e Botão de Limpar */}
        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          <span className="font-serif">
            Mostrando <strong className="font-mono text-stone-900 dark:text-stone-100 font-bold">{livrosFiltrados}</strong> de {totalLivros} obras
          </span>
          {temFiltroAtivo && (
            <button
              onClick={onLimparFiltros}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-cinzel font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl border border-amber-300/80 dark:border-amber-800 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Linha Secundária: Filtros Dropdown Combináveis */}
      <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-stone-200/80 dark:border-stone-800/80 text-xs">
        {/* Nível */}
        <select
          value={filtros.nivel ?? ''}
          onChange={(e) => onAtualizarFiltros({ nivel: e.target.value ? Number(e.target.value) : undefined })}
          className="px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-cinzel text-xs font-semibold focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer hover:border-amber-400/60 transition-colors"
        >
          <option value="">Todos os Níveis (1 a 5)</option>
          <option value="1">Nível 1 (Propedêutica)</option>
          <option value="2">Nível 2 (Consciência & Crítica)</option>
          <option value="3">Nível 3 (Fundamentos Clássicos)</option>
          <option value="4">Nível 4 (Maturidade & Dialética)</option>
          <option value="5">Nível 5 (Cume Intelectual)</option>
        </select>

        {/* Área */}
        <select
          value={filtros.area ?? ''}
          onChange={(e) => onAtualizarFiltros({ area: e.target.value || undefined })}
          className="px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-serif text-xs font-medium focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer hover:border-amber-400/60 transition-colors"
        >
          <option value="">Todas as Áreas ({todasAreas.length})</option>
          {todasAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        {/* Classe */}
        <select
          value={filtros.classe ?? ''}
          onChange={(e) => onAtualizarFiltros({ classe: (e.target.value as ClasseLivro) || undefined })}
          className="px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-cinzel text-xs font-semibold focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer hover:border-amber-400/60 transition-colors"
        >
          <option value="">Todas as Classes</option>
          <option value="OBRA">OBRA (Leitura Integral)</option>
          <option value="MAPA">MAPA (Visão Panorâmica)</option>
          <option value="PORTA">PORTA (Acesso Metódico)</option>
        </select>

        {/* Estado de Leitura */}
        <select
          value={filtros.estado ?? ''}
          onChange={(e) => onAtualizarFiltros({ estado: (e.target.value as EstadoLeitura) || undefined })}
          className="px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-serif text-xs font-medium focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer hover:border-amber-400/60 transition-colors"
        >
          <option value="">Todos os Estados</option>
          <option value="lendo">Lendo Agora</option>
          <option value="lido">Lido</option>
          <option value="nao_iniciado">Não Iniciado</option>
          <option value="reler_5_anos">Reler em 5 Anos</option>
          <option value="abandonado">Abandonado</option>
        </select>

        {/* Idioma */}
        <select
          value={filtros.idioma ?? ''}
          onChange={(e) => onAtualizarFiltros({ idioma: (e.target.value as IdiomaLeitura) || undefined })}
          className="px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-serif text-xs font-medium focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer hover:border-amber-400/60 transition-colors"
        >
          <option value="">Todos os Idiomas</option>
          <option value="pt">Português (PT)</option>
          <option value="en">Inglês (EN)</option>
        </select>

        {/* Obra de Vida */}
        <button
          onClick={() => onAtualizarFiltros({ apenasObraDeVida: !filtros.apenasObraDeVida })}
          className={`px-3 py-1.5 rounded-xl border font-cinzel text-xs font-bold transition-all shadow-2xs cursor-pointer ${
            filtros.apenasObraDeVida
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-400 shadow-xs ring-1 ring-amber-500/20'
              : 'border-stone-200/90 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-amber-400'
          }`}
          title="Filtrar apenas as 5 grandes Obras de Vida (uma por nível)"
        >
          ★ Obra de Vida
        </button>
      </div>
    </div>
  );
};
