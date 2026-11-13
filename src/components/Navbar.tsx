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
  NotebookPen,
  Lightbulb,
  Hourglass
} from 'lucide-react';

interface NavbarProps {
  visaoAtiva: 'estante' | 'grafo' | 'linha-tempo' | 'zettelkasten';
  onMudarVisao: (visao: 'estante' | 'grafo' | 'linha-tempo' | 'zettelkasten') => void;
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
    <header className="sticky top-0 z-30 w-full bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800/90 shadow-2xs transition-colors">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Identidade / Marca da Biblioteca */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer select-none" onClick={() => onMudarVisao('estante')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900 flex items-center justify-center text-amber-200 shadow-md ring-1 ring-amber-600/30 transition-transform hover:scale-105">
            <BookMarked className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Biblioteca Imaginária
            </h1>
            <p className="text-[9px] sm:text-[10px] text-amber-800/90 dark:text-amber-400/90 tracking-widest uppercase font-cinzel font-semibold truncate">
              Grafo Visual & Zettelkasten
            </p>
          </div>
        </div>

        {/* Alternador Central de Visões Principais */}
        <nav aria-label="Visões principais" className="flex items-center bg-stone-100/95 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/90 dark:border-stone-800/90 shadow-2xs">
          <button
            onClick={() => onMudarVisao('estante')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all ${
              visaoAtiva === 'estante'
                ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/70 dark:border-stone-700/70'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
            }`}
            title="Estante Clássica de Obras"
          >
            <BookOpen className={`w-3.5 h-3.5 ${visaoAtiva === 'estante' ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400'}`} />
            <span className="hidden sm:inline">Estante</span>
          </button>

          <button
            onClick={() => onMudarVisao('grafo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all ${
              visaoAtiva === 'grafo'
                ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/70 dark:border-stone-700/70'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
            }`}
            title="Grafo Visual Dialético das Relações"
          >
            <Share2 className={`w-3.5 h-3.5 ${visaoAtiva === 'grafo' ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400'}`} />
            <span className="hidden sm:inline">Grafo</span>
          </button>

          <button
            onClick={() => onMudarVisao('linha-tempo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all ${
              visaoAtiva === 'linha-tempo'
                ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/70 dark:border-stone-700/70'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
            }`}
            title="Linha do Tempo Cronológica das 120 Obras"
          >
            <Hourglass className={`w-3.5 h-3.5 ${visaoAtiva === 'linha-tempo' ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400'}`} />
            <span className="hidden sm:inline">Cronologia</span>
          </button>

          <button
            onClick={() => onMudarVisao('zettelkasten')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all ${
              visaoAtiva === 'zettelkasten'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-500/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
            }`}
            title="Zettelkasten & Diário Intelectual (Método Luhmann / Caderno Real)"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${visaoAtiva === 'zettelkasten' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600/70'}`} />
            <span className="hidden sm:inline">Zettelkasten</span>
          </button>
        </nav>

        {/* Grupo de Ações e Ferramentas à Direita */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Busca Global (Command Palette) */}
          <button
            onClick={onAbrirBusca}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-serif text-stone-700 dark:text-stone-300 bg-stone-100/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-2xs cursor-pointer"
            title="Buscar Obras, Autores e Comandos (⌘K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden md:inline font-sans text-stone-600 dark:text-stone-400">Buscar</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-stone-200/80 dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700 text-stone-500">
              ⌘K
            </kbd>
          </button>

          {/* Grupo de Ferramentas de Estudo (Confronto e Caderno) */}
          <div className="hidden lg:flex items-center bg-stone-100/90 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
            <button
              onClick={onAbrirComparador}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-800 dark:hover:text-rose-300 transition-all cursor-pointer"
              title="Confrontar Obras e Contrapontos Lado a Lado"
            >
              <Scale className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Confronto</span>
            </button>

            <button
              onClick={onAbrirCaderno}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-900 dark:hover:text-amber-200 transition-all cursor-pointer"
              title="Ver Todas as Anotações e Citações Pessoais"
            >
              <NotebookPen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Caderno</span>
            </button>
          </div>

          {/* Alternar Lombada / Capa (Apenas na Visão Estante) */}
          {visaoAtiva === 'estante' && (
            <div className="hidden sm:flex items-center bg-stone-100/90 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
              <button
                onClick={() => onMudarModoVisualizacao('capa')}
                className={`px-2.5 py-1 rounded-lg text-xs font-cinzel font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  modoVisualizacao === 'capa'
                    ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs border border-stone-200/60 dark:border-stone-700/60 font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="Exibir Capas das Obras"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden xl:inline">Capa</span>
              </button>
              <button
                onClick={() => onMudarModoVisualizacao('lombada')}
                className={`px-2.5 py-1 rounded-lg text-xs font-cinzel font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  modoVisualizacao === 'lombada'
                    ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs border border-stone-200/60 dark:border-stone-700/60 font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="Exibir Lombadas na Estante de Madeira"
              >
                <Columns className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden xl:inline">Lombada</span>
              </button>
            </div>
          )}

          {/* Divisor vertical sutil */}
          <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block mx-0.5" />

          {/* Cluster de Utilidades: Revisão, Backup e Tema */}
          <div className="flex items-center bg-stone-100/90 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
            <button
              onClick={onAbrirRevisao}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Revisão Semestral (A cada 6 meses)"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden 2xl:inline">Revisão</span>
            </button>

            <button
              onClick={onAbrirBackup}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Backup & Sincronização Local"
            >
              <Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span className="hidden 2xl:inline">Backup</span>
            </button>

            <button
              onClick={onToggleModoEscuro}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-all cursor-pointer"
              title={modoEscuro ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label="Alternar tema"
            >
              {modoEscuro ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-stone-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
