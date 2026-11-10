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
  BookMarked
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
}

export const Navbar: React.FC<NavbarProps> = ({
  visaoAtiva,
  onMudarVisao,
  modoVisualizacao,
  onMudarModoVisualizacao,
  modoEscuro,
  onToggleModoEscuro,
  onAbrirRevisao,
  onAbrirBackup
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
          {/* Alternar Lombada / Capa (apenas na visão estante) */}
          {visaoAtiva === 'estante' && (
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => onMudarModoVisualizacao('capa')}
                className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 ${
                  modoVisualizacao === 'capa'
                    ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-slate-500'
                }`}
                title="Exibir Capas"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Capa</span>
              </button>
              <button
                onClick={() => onMudarModoVisualizacao('lombada')}
                className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 ${
                  modoVisualizacao === 'lombada'
                    ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-slate-500'
                }`}
                title="Exibir Lombadas"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Lombada</span>
              </button>
            </div>
          )}

          {/* Revisão Semestral */}
          <button
            onClick={onAbrirRevisao}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Revisão Semestral (A cada 6 meses)"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Revisão</span>
          </button>

          {/* Backup & Exportação */}
          <button
            onClick={onAbrirBackup}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Exportar / Importar Dados"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Alternar Modo Escuro */}
          <button
            onClick={onToggleModoEscuro}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={modoEscuro ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {modoEscuro ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
