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
    <header className="sticky top-0 z-30 w-full bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800/90 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Identidade / Título da Biblioteca */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900 flex items-center justify-center text-amber-200 shadow-md ring-1 ring-amber-600/30">
            <BookMarked className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Biblioteca Imaginária
            </h1>
            <p className="text-[9.5px] sm:text-[10px] text-amber-800/80 dark:text-amber-400/80 tracking-widest uppercase font-cinzel font-semibold truncate">
              Grafo Visual & Zettelkasten
            </p>
          </div>
        </div>

        {/* Alternador Central de Visões: Estante vs Grafo vs Zettelkasten */}
        <nav aria-label="Visões principais" className="flex items-center bg-stone-100/90 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
          <button
            onClick={() => onMudarVisao('estante')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition-all ${
              visaoAtiva === 'estante'
                ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/50 dark:border-stone-700/50'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${visaoAtiva === 'estante' ? 'text-amber-700 dark:text-amber-400' : ''}`} />
            <span className="hidden xs:inline">Estante</span>
          </button>
          <button
            onClick={() => onMudarVisao('grafo')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition-all ${
              visaoAtiva === 'grafo'
                ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/50 dark:border-stone-700/50'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Share2 className={`w-3.5 h-3.5 ${visaoAtiva === 'grafo' ? 'text-amber-700 dark:text-amber-400' : ''}`} />
            <span className="hidden xs:inline">Grafo</span>
          </button>
          <button
            onClick={() => onMudarVisao('linha-tempo')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition-all ${
              visaoAtiva === 'linha-tempo'
                ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/50 dark:border-stone-700/50'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title="Linha do Tempo Cronológica das 120 Obras"
          >
            <Hourglass className={`w-3.5 h-3.5 ${visaoAtiva === 'linha-tempo' ? 'text-amber-700 dark:text-amber-400' : ''}`} />
            <span className="hidden xs:inline">Linha do Tempo</span>
          </button>
          <button
            onClick={() => onMudarVisao('zettelkasten')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition-all ${
              visaoAtiva === 'zettelkasten'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-500/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title="Abrir Zettelkasten de Estudos (Método Luhmann/Ahrens)"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${visaoAtiva === 'zettelkasten' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600/70'}`} />
            <span className="hidden xs:inline">Zettelkasten</span>
          </button>
        </nav>

        {/* Grupo de Ações à Direita */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botão de Busca Rápida / Command Palette */}
          <button
            onClick={onAbrirBusca}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-serif text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/90 transition-all bg-stone-50/80 dark:bg-stone-900/80 hover:border-amber-400 dark:hover:border-amber-600 shadow-2xs"
            title="Buscar Obras e Comandos (Pressione ⌘K ou Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden md:inline text-stone-600 dark:text-stone-400 font-sans">Buscar</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-stone-200/60 dark:bg-stone-800 rounded border border-stone-300/80 dark:border-stone-700 text-stone-500">
              ⌘K
            </kbd>
          </button>

          {/* Confronto Dialético */}
          <button
            onClick={onAbrirComparador}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 border border-stone-200/90 dark:border-stone-800 hover:border-rose-400 dark:hover:border-rose-700 flex items-center gap-1.5 transition-all shadow-2xs"
            title="Confrontar Obras e Contrapontos Lado a Lado"
          >
            <Scale className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden lg:inline">Confronto</span>
          </button>

          {/* Caderno de Notas */}
          <button
            onClick={onAbrirCaderno}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-700 flex items-center gap-1.5 transition-all shadow-2xs"
            title="Ver Todas as Anotações e Citações Pessoais"
          >
            <NotebookPen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden lg:inline">Caderno</span>
          </button>

          {/* Alternar Lombada / Capa (quando na visão estante) */}
          {visaoAtiva === 'estante' && (
            <div className="hidden sm:flex items-center bg-stone-100/90 dark:bg-stone-900/90 p-0.5 rounded-lg border border-stone-200/90 dark:border-stone-800 shadow-2xs">
              <button
                onClick={() => onMudarModoVisualizacao('capa')}
                className={`px-2 py-1 rounded text-xs font-cinzel font-semibold flex items-center gap-1 transition-all ${
                  modoVisualizacao === 'capa'
                    ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs border border-stone-200/50 dark:border-stone-700/50'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="Exibir Capas das Obras"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden xl:inline">Capa</span>
              </button>
              <button
                onClick={() => onMudarModoVisualizacao('lombada')}
                className={`px-2 py-1 rounded text-xs font-cinzel font-semibold flex items-center gap-1 transition-all ${
                  modoVisualizacao === 'lombada'
                    ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs border border-stone-200/50 dark:border-stone-700/50'
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

          {/* Revisão Semestral */}
          <button
            onClick={onAbrirRevisao}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 flex items-center gap-1.5 transition-all shadow-2xs"
            title="Revisão Semestral (A cada 6 meses)"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden xl:inline">Revisão</span>
          </button>

          {/* Backup & Exportação */}
          <button
            onClick={onAbrirBackup}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 flex items-center gap-1.5 transition-all shadow-2xs"
            title="Exportar / Importar Dados"
          >
            <Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            <span className="hidden xl:inline">Backup</span>
          </button>

          {/* Alternar Modo Escuro */}
          <button
            onClick={onToggleModoEscuro}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-800 transition-all shadow-2xs"
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
