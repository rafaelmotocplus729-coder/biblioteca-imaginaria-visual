import React from 'react';
import {
  Highlighter,
  Quote,
  Sparkles,
  Copy,
  MessageSquare,
  FileCheck
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
  const left = Math.max(12, Math.min(window.innerWidth - 420, posicao.x - 210));
  const top = Math.max(10, posicao.y - 52);

  return (
    <div
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-50 flex items-center gap-1 p-1 bg-white/95 dark:bg-[#1a1b22]/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-700/90 rounded-xl shadow-2xl animate-fadeIn text-stone-800 dark:text-stone-200 select-none"
      onMouseDown={(e) => e.preventDefault()} // Impede perda de seleção no clique
    >
      {/* Botão: Marca-texto amarelo */}
      <button
        type="button"
        onClick={onDestacar}
        className="px-2.5 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-yellow-500/20 text-amber-900 dark:text-yellow-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        title="Destacar com marca-texto amarelo (==texto==)"
      >
        <Highlighter className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
        <span className="hidden sm:inline">Destacar</span>
      </button>

      {/* Botão: Citação clássica */}
      <button
        type="button"
        onClick={onCitar}
        className="px-2.5 py-1.5 rounded-lg hover:bg-amber-100/70 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        title="Formatar como citação de fonte (- #citação p. : &quot;...&quot;)"
      >
        <Quote className="w-3.5 h-3.5 text-amber-600" />
        <span className="hidden sm:inline">Citação</span>
      </button>

      {/* Botão: Síntese pessoal */}
      {onSintese && (
        <button
          type="button"
          onClick={onSintese}
          className="px-2 py-1.5 rounded-lg hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
          title="Marcar como síntese pessoal (- #síntese)"
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">#síntese</span>
        </button>
      )}

      {/* Botão: Comentário Pessoal */}
      {onComentario && (
        <button
          type="button"
          onClick={onComentario}
          className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
          title="Adicionar comentário pessoal (- #comentário)"
        >
          <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>#comentário</span>
        </button>
      )}

      {/* Botão: NotebookLM */}
      {onNotebooklm && (
        <button
          type="button"
          onClick={onNotebooklm}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
          title="Marcar como ideia/síntese do NotebookLM (- #notebooklm)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">#NotebookLM</span>
        </button>
      )}

      <div className="w-[1px] h-4 bg-stone-200 dark:bg-stone-700 mx-0.5" />

      {/* BOTÃO PRINCIPAL: EXTRAIR PARA NOTA PERMANENTE */}
      <button
        type="button"
        onClick={onExtrairPermanente}
        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        title="Gerar uma nova nota permanente a partir deste trecho"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>+ Criar Permanente</span>
      </button>

      {/* Copiar citação com fonte */}
      <button
        type="button"
        onClick={onCopiar}
        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        title="Copiar trecho"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
