import React from 'react';
import {
  Highlighter,
  Quote,
  Sparkles,
  Copy,
  MessageSquare,
  FileCheck,
  Wand2
} from 'lucide-react';

interface MenuFlutuanteSelecaoProps {
  posicao: { x: number; y: number } | null;
  textoSelecionado: string;
  onDestacar: () => void;
  onCitar: () => void;
  onSintese?: () => void;
  onComentario?: () => void;
  onNotebooklm?: () => void;
  onExtrairPermanente: () => void;
  onCopiar: () => void;
}

export const MenuFlutuanteSelecao: React.FC<MenuFlutuanteSelecaoProps> = ({
  posicao,
  textoSelecionado,
  onDestacar,
  onCitar,
  onSintese,
  onComentario,
  onNotebooklm,
  onExtrairPermanente,
  onCopiar
}) => {
  if (!posicao || !textoSelecionado || textoSelecionado.trim().length === 0) return null;

  // Garante que o menu não transborde os cantos da viewport
  const left = Math.max(12, Math.min(window.innerWidth - 480, posicao.x - 240));
  const top = Math.max(10, posicao.y - 56);

  return (
    <div
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-50 flex items-center gap-1 p-1.5 bg-[#fcfaf5]/95 dark:bg-[#14151a]/95 backdrop-blur-md border border-stone-300/90 dark:border-stone-700/90 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5 animate-fadeIn text-stone-800 dark:text-stone-200 select-none"
      onMouseDown={(e) => e.preventDefault()} // Impede perda de seleção no clique
      role="toolbar"
      aria-label="Ferramentas de seleção e marginália"
    >
      {/* GRUPO 1: GRIFO E EXCERTO */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onDestacar}
          className="px-2.5 py-1.5 rounded-xl hover:bg-amber-100/90 dark:hover:bg-amber-500/15 text-stone-700 dark:text-stone-200 hover:text-amber-900 dark:hover:text-amber-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          title="Grifar trecho com marca-texto (==texto==)"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Grifar</span>
        </button>

        <button
          type="button"
          onClick={onCitar}
          className="px-2.5 py-1.5 rounded-xl hover:bg-amber-100/80 dark:hover:bg-amber-950/60 text-stone-700 dark:text-stone-200 hover:text-amber-900 dark:hover:text-amber-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          title="Inserir como excerto formal (- #citação p. : &quot;...&quot;)"
        >
          <Quote className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Citar</span>
        </button>
      </div>

      {/* GRUPO 2: MARGINÁLIA & SÍNTESE */}
      {(onSintese || onComentario || onNotebooklm) && (
        <>
          <div className="w-px h-4 bg-stone-200 dark:bg-stone-700/80 mx-0.5 shrink-0" />
          <div className="flex items-center gap-0.5">
            {onSintese && (
              <button
                type="button"
                onClick={onSintese}
                className="px-2 py-1.5 rounded-xl hover:bg-emerald-100/80 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="Registrar síntese interpretativa (- #síntese)"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden md:inline">Síntese</span>
              </button>
            )}

            {onComentario && (
              <button
                type="button"
                onClick={onComentario}
                className="px-2.5 py-1.5 rounded-xl hover:bg-sky-100/80 dark:hover:bg-sky-950/60 text-stone-700 dark:text-stone-300 hover:text-sky-900 dark:hover:text-sky-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="Anotar glosa ou marginália pessoal (- #comentário)"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="hidden sm:inline">Marginália</span>
              </button>
            )}

            {onNotebooklm && (
              <button
                type="button"
                onClick={onNotebooklm}
                className="px-2 py-1.5 rounded-xl hover:bg-indigo-100/80 dark:hover:bg-indigo-950/60 text-stone-700 dark:text-stone-300 hover:text-indigo-900 dark:hover:text-indigo-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="Marcar síntese assistida (- #notebooklm)"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="hidden lg:inline">NotebookLM</span>
              </button>
            )}
          </div>
        </>
      )}

      <div className="w-px h-4 bg-stone-200 dark:bg-stone-700/80 mx-0.5 shrink-0" />

      {/* AÇÃO PRIMÁRIA: EXTRAIR NOTA ATÔMICA */}
      <button
        type="button"
        onClick={onExtrairPermanente}
        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
        title="Extrair conceito atômico para o Zettelkasten (Nota Permanente)"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
        <span>Extrair Nota Atômica</span>
      </button>

      <div className="w-px h-4 bg-stone-200 dark:bg-stone-700/80 mx-0.5 shrink-0" />

      {/* COPIAR EXCERTO */}
      <button
        type="button"
        onClick={onCopiar}
        className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer shrink-0"
        title="Copiar trecho selecionado"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

