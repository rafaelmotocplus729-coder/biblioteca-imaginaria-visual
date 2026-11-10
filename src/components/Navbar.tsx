import React from 'react';
import {
  BookOpen,
  Share2,
  Columns,
  Image as ImageIcon,
  Moon,
  Sun,
  RotateCw,
  Download,
  BookMarked,
  Search,
  Scale,
  NotebookPen
} from 'lucide-react';

interface NavbarProps {
  visaoAtiva: 'estante' | 'grafo';
  onMudarVisao: (visao: 'estante' | 'grafo') => void;
  modoVisualizacao: 'capa' | 'lombada';
  onMudarModoVisualizacao: (modo: 'capa' | 'lombada') => void;
  modoEscuro: boolean;
  onToggleModoEscuro: () => void;
  onAbrirRevisao: () => void;
  onAbrirBackup: () => void;
  onAbrirBusca: () => void;
  onAbrirComparador: () => void;
  onAbrirCaderno: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  visaoAtiva,
  onMudarVisao,
  modoVisualizacao,
  onMudarModoVisualizacao,
  modoEscuro,
  onToggleModoEscuro,
  onAbrirRevisao,
  onAbrirBackup,
  onAbrirBusca,
  onAbrirComparador,
  onAbrirCaderno
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-library-paper/90 dark:bg-library-darkPaper/90 backdrop-blur border-b border-slate-200 dark:border-library-darkBorder shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Identidade / Título da Biblioteca */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white shadow-md">
            <BookMarked className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Biblioteca Imaginária
            </h1>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase font-sans">
              Grafo Visual dos 60 Livros
            </p>
          </div>
        </div>

        {/* Alternador Central: Estante vs Grafo */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onMudarVisao('estante')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              visaoAtiva === 'estante'
                ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Estante</span>
          </button>
          <button
            onClick={() => onMudarVisao('grafo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              visaoAtiva === 'grafo'
                ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Grafo em Rede</span>
          </button>
        </div>

        {/* Ações Secundárias à Direita */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botão de Busca Rápida / Command Palette */}
          <button
            onClick={onAbrirBusca}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-serif font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors bg-white/70 dark:bg-stone-900/60"
            title="Buscar Obras e Comandos (Pressione ⌘K ou Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden lg:inline text-stone-500">Buscar</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-stone-100 dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700 text-stone-500">
              ⌘K
            </kbd>
          </button>

          {/* Confronto Dialético */}
          <button
            onClick={onAbrirComparador}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-serif font-medium text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-stone-200 dark:border-stone-700 hover:border-rose-400 flex items-center gap-1.5 transition-colors"
            title="Confrontar Obras e Contrapontos Lado a Lado"
          >
            <Scale className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">Confronto</span>
          </button>

          {/* Caderno de Notas & Citações */}
          <button
            onClick={onAbrirCaderno}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-serif font-medium text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-stone-200 dark:border-stone-700 hover:border-amber-400 flex items-center gap-1.5 transition-colors"
            title="Ver Todas as Anotações e Citações Pessoais"
          >
            <NotebookPen className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Caderno</span>
          </button>

          {/* Alternar Lombada / Capa (apenas na visão estante) */}
          {visaoAtiva === 'estante' && (
            <div className="hidden sm:flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
              <button
                onClick={() => onMudarModoVisualizacao('capa')}
                className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 ${
                  modoVisualizacao === 'capa'
                    ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-500'
                }`}
                title="Exibir Capas"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Capa</span>
              </button>
              <button
                onClick={() => onMudarModoVisualizacao('lombada')}
                className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 ${
                  modoVisualizacao === 'lombada'
                    ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-500'
                }`}
                title="Exibir Lombadas"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Lombada</span>
              </button>
            </div>
          )}

          {/* Revisão Semestral */}
          <button
            onClick={onAbrirRevisao}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 transition-colors"
            title="Revisão Semestral (A cada 6 meses)"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden xl:inline">Revisão</span>
          </button>

          {/* Backup & Exportação */}
          <button
            onClick={onAbrirBackup}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 transition-colors"
            title="Exportar / Importar Dados"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden xl:inline">Backup</span>
          </button>

          {/* Alternar Modo Escuro */}
          <button
            onClick={onToggleModoEscuro}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors"
            title={modoEscuro ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {modoEscuro ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
