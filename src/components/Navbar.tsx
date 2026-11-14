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
  const navItems: Array<{
    id: 'estante' | 'grafo' | 'linha-tempo' | 'zettelkasten';
    label: string;
    shortcut: string;
    title: string;
    icon: React.FC<{ className?: string }>;
    accent?: 'amber' | 'emerald';
  }> = [
    {
      id: 'estante',
      label: 'Estante',
      shortcut: 'E',
      title: 'Estante Clássica de Obras (Atalho: E)',
      icon: BookOpen,
      accent: 'amber'
    },
    {
      id: 'grafo',
      label: 'Grafo',
      shortcut: 'G',
      title: 'Grafo Visual Dialético das Relações (Atalho: G)',
      icon: Share2,
      accent: 'amber'
    },
    {
      id: 'linha-tempo',
      label: 'Cronologia',
      shortcut: 'T',
      title: 'Linha do Tempo Cronológica das 120 Obras (Atalho: T)',
      icon: Hourglass,
      accent: 'amber'
    },
    {
      id: 'zettelkasten',
      label: 'Zettelkasten',
      shortcut: 'Z',
      title: 'Zettelkasten & Diário Intelectual — Método Luhmann (Atalho: Z)',
      icon: Lightbulb,
      accent: 'emerald'
    }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FBF8F3]/95 dark:bg-[#121316]/95 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800/90 transition-colors">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Identidade / Marca da Biblioteca */}
        <button
          type="button"
          onClick={() => onMudarVisao('estante')}
          className="flex items-center gap-3 shrink-0 cursor-pointer select-none text-left group focus-editorial rounded-xl p-1 -ml-1"
          title="Voltar ao Início — Biblioteca Imaginária"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900 dark:bg-stone-800 border border-amber-600/40 flex items-center justify-center text-amber-300 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-sm sm:text-[17px] text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                Biblioteca Imaginária
              </h1>
              <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 tabular-nums">
                120 Obras
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 tracking-[0.14em] uppercase font-cinzel font-semibold truncate mt-1">
              Cânone Visual &amp; Zettelkasten
            </p>
          </div>
        </button>

        {/* Alternador Central de Visões Principais */}
        <nav
          aria-label="Visões principais"
          className="flex items-center bg-stone-200/60 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-300/70 dark:border-stone-800"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const ativo = visaoAtiva === item.id;
            const isZettel = item.accent === 'emerald';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onMudarVisao(item.id)}
                title={item.title}
                aria-current={ativo ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all cursor-pointer focus-editorial ${
                  ativo
                    ? isZettel
                      ? 'bg-white dark:bg-stone-800 text-emerald-900 dark:text-emerald-300 shadow-2xs border border-emerald-500/40 dark:border-emerald-500/30'
                      : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-200 shadow-2xs border border-stone-300/80 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/50 dark:hover:bg-stone-800/50 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    ativo
                      ? isZettel
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                      : isZettel
                        ? 'text-emerald-700/70 dark:text-emerald-400/70'
                        : 'text-stone-500 dark:text-stone-400'
                  }`}
                />
                <span className="hidden sm:inline tracking-wide">{item.label}</span>
                <kbd
                  className={`hidden xl:inline-block ml-0.5 px-1 py-0.2 text-[9px] font-mono rounded transition-colors ${
                    ativo
                      ? isZettel
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50/90 dark:bg-stone-900 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-stone-700'
                      : 'bg-stone-200/70 dark:bg-stone-800/80 text-stone-500 dark:text-stone-500 border border-stone-300/50 dark:border-stone-700/60'
                  }`}
                >
                  {item.shortcut}
                </kbd>
              </button>
            );
          })}
        </nav>

        {/* Grupo de Ações e Ferramentas à Direita */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Busca Global (Command Palette) */}
          <button
            type="button"
            onClick={onAbrirBusca}
            className="flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl text-xs bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-800 border border-stone-300/80 dark:border-stone-800 hover:border-amber-500/70 dark:hover:border-amber-500/60 transition-all cursor-pointer focus-editorial"
            title="Buscar Obras, Autores e Comandos (⌘K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="hidden md:inline font-sans font-medium text-stone-600 dark:text-stone-300">
              Buscar...
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-stone-100 dark:bg-stone-800 rounded border border-stone-300/80 dark:border-stone-700 text-stone-500 dark:text-stone-400">
              ⌘K
            </kbd>
          </button>

          {/* Grupo de Ferramentas de Estudo (Confronto e Caderno) */}
          <div className="hidden lg:flex items-center h-9 bg-stone-200/50 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-300/70 dark:border-stone-800">
            <button
              type="button"
              onClick={onAbrirComparador}
              className="flex items-center gap-1.5 px-2.5 h-full rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:text-rose-800 dark:hover:text-rose-300 transition-all cursor-pointer"
              title="Comparador Dialético — Confrontar Obras Lado a Lado (Atalho: C)"
            >
              <Scale className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
              <span>Confronto</span>
            </button>

            <div className="w-px h-3.5 bg-stone-300/70 dark:bg-stone-800 mx-0.5" />

            <button
              type="button"
              onClick={onAbrirCaderno}
              className="flex items-center gap-1.5 px-2.5 h-full rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:text-amber-900 dark:hover:text-amber-200 transition-all cursor-pointer"
              title="Caderno de Notas e Citações Pessoais (Atalho: D)"
            >
              <NotebookPen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Caderno</span>
            </button>
          </div>

          {/* Alternar Lombada / Capa (Apenas na Visão Estante) */}
          {visaoAtiva === 'estante' && (
            <div className="hidden sm:flex items-center h-9 bg-stone-200/50 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-300/70 dark:border-stone-800">
              <button
                type="button"
                onClick={() => onMudarModoVisualizacao('capa')}
                className={`px-2.5 h-full rounded-lg text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  modoVisualizacao === 'capa'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-200 shadow-2xs border border-stone-300/70 dark:border-stone-700 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="Exibir Galeria de Capas das Obras"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden xl:inline">Capas</span>
              </button>
              <button
                type="button"
                onClick={() => onMudarModoVisualizacao('lombada')}
                className={`px-2.5 h-full rounded-lg text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  modoVisualizacao === 'lombada'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-200 shadow-2xs border border-stone-300/70 dark:border-stone-700 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="Exibir Lombadas Físicas na Estante de Madeira"
              >
                <Columns className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden xl:inline">Lombadas</span>
              </button>
            </div>
          )}

          {/* Cluster de Utilidades: Revisão, Backup e Tema */}
          <div className="flex items-center h-9 bg-stone-200/50 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-300/70 dark:border-stone-800">
            <button
              type="button"
              onClick={onAbrirRevisao}
              className="px-2 h-full rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Revisão Semestral do Plano de Estudos"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden 2xl:inline">Revisão</span>
            </button>

            <button
              type="button"
              onClick={onAbrirBackup}
              className="px-2 h-full rounded-lg text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Backup & Sincronização Local / Nuvem"
            >
              <Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span className="hidden 2xl:inline">Backup</span>
            </button>

            <div className="w-px h-3.5 bg-stone-300/70 dark:bg-stone-800 mx-0.5" />

            <button
              type="button"
              onClick={onToggleModoEscuro}
              className="px-2 h-full rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-all cursor-pointer flex items-center justify-center"
              title={modoEscuro ? 'Mudar para Modo Claro (Pergaminho)' : 'Mudar para Modo Escuro (Estudo Noturno)'}
              aria-label="Alternar tema claro ou escuro"
            >
              {modoEscuro ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-stone-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

