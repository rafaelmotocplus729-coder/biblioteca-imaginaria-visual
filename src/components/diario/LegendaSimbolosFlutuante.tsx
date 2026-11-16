import React from 'react';
import { HelpCircle, EyeOff } from 'lucide-react';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';

export const LegendaSimbolosFlutuante: React.FC = () => {
  const { legendaSimbolosVisivel, toggleLegendaSimbolos } = useBibliotecaStore();

  if (!legendaSimbolosVisivel) {
    return null;
  }

  return (
    <div className="surface-editorial rounded-2xl p-4 space-y-3 transition-all animate-fadeIn">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
            Gramática de Símbolos
          </span>
          <span className="text-xs font-serif text-stone-500 dark:text-stone-400 hidden sm:inline">
            · Clique no símbolo à esquerda de cada item para alternar o estado
          </span>
        </div>
        <button
          type="button"
          onClick={toggleLegendaSimbolos}
          className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
          title="Ocultar legenda de símbolos"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>Ocultar</span>
        </button>
      </div>

      {/* Tabela de Símbolos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5 text-xs">
        {/* Tipos de Itens */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-base text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800/80 shrink-0">
            •
          </span>
          <span className="text-stone-700 dark:text-stone-300 text-[11px]">
            <strong className="font-semibold text-stone-900 dark:text-stone-100">Tarefa</strong> a fazer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-sm text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800/80 shrink-0">
            ○
          </span>
          <span className="text-stone-700 dark:text-stone-300 text-[11px]">
            <strong className="font-semibold text-stone-900 dark:text-stone-100">Compromisso</strong> (hora)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-base text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800/80 shrink-0">
            -
          </span>
          <span className="text-stone-700 dark:text-stone-300 text-[11px]">
            <strong className="font-semibold text-stone-900 dark:text-stone-100">Nota</strong> ou ideia solta
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
            X
          </span>
          <span className="text-stone-700 dark:text-stone-300 text-[11px]">
            <strong className="font-semibold text-stone-900 dark:text-stone-100">Concluído</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 shrink-0">
            →
          </span>
          <span className="text-stone-700 dark:text-stone-300 text-[11px]">
            <strong className="font-semibold text-stone-900 dark:text-stone-100">Migrado</strong> para outro dia
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-sm text-stone-400 bg-stone-100 dark:bg-stone-800/80 shrink-0 line-through">
            —
          </span>
          <span className="text-stone-700 dark:text-stone-300 text-[11px]">
            <strong className="font-semibold text-stone-900 dark:text-stone-100">Cancelado</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 shrink-0">
            *
          </span>
          <span className="text-stone-700 dark:text-stone-300 text-[11px]">
            <strong className="font-semibold text-stone-900 dark:text-stone-100">Urgente</strong> / Foco
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 shrink-0">
            ≡
          </span>
          <span className="text-stone-700 dark:text-stone-300 text-[11px]">
            <strong className="font-semibold text-stone-900 dark:text-stone-100">Termômetro</strong> diário
          </span>
        </div>
      </div>

      {/* Nota de rodapé da metodologia */}
      <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-500 font-serif leading-tight">
        Dica: Clique no símbolo à esquerda do item para alternar seu estado rapidamente.
      </div>
    </div>
  );
};
