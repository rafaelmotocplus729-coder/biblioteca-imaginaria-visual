import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Livro, Progresso } from '../types';
import {
  Search,
  BookOpen,
  Share2,
  Moon,
  Sun,
  Columns,
  Image as ImageIcon,
  CheckCircle,
  RotateCw,
  Scale,
  NotebookPen,
  Download,
  Layers,
  CornerDownLeft,
  X,
  Lightbulb,
  Hourglass,
  Clock
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  livros: Livro[];
  progressos: Record<number, Progresso>;
  onSelecionarLivro: (id: number) => void;
  visaoAtiva: 'estante' | 'grafo' | 'linha-tempo' | 'zettelkasten';
  onMudarVisao: (visao: 'estante' | 'grafo' | 'linha-tempo' | 'zettelkasten') => void;
  modoVisualizacao: 'capa' | 'lombada';
  onMudarModoVisualizacao: (modo: 'capa' | 'lombada') => void;
  modoEscuro: boolean;
  onToggleModoEscuro: () => void;
  onAbrirRevisao: () => void;
  onAbrirBackup: () => void;
  onAbrirComparador: (livroAId?: number, livroBId?: number) => void;
  onAbrirCaderno: () => void;
  onFiltrarNivel: (nivel?: number) => void;
}

interface ItemComando {
  id: string;
  tipo: 'acao' | 'livro';
  titulo: string;
  subtitulo?: string;
  badge?: string;
  badgeColor?: string;
  icone: React.ReactNode;
  acao: () => void;
  livroId?: number;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  livros,
  progressos,
  onSelecionarLivro,
  visaoAtiva: _visaoAtiva,
  onMudarVisao,
  modoVisualizacao,
  onMudarModoVisualizacao,
  modoEscuro,
  onToggleModoEscuro,
  onAbrirRevisao,
  onAbrirBackup,
  onAbrirComparador,
  onAbrirCaderno,
  onFiltrarNivel
}) => {
  const [busca, setBusca] = useState('');
  const [indiceFocado, setIndiceFocado] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listaRef = useRef<HTMLDivElement | null>(null);

  // Auto-foco ao abrir
  useEffect(() => {
    if (isOpen) {
      setBusca('');
      setIndiceFocado(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Ações do sistema pré-configuradas
  const acoesSistema: ItemComando[] = useMemo(() => [
    {
      id: 'cmd-visao-estante',
      tipo: 'acao',
      titulo: 'Ver Estante Principal',
      subtitulo: 'Modo de prateleira física dos 60 livros',
      badge: 'Tecla E',
      icone: <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      acao: () => {
        onMudarVisao('estante');
        onClose();
      }
    },
    {
      id: 'cmd-visao-grafo',
      tipo: 'acao',
      titulo: 'Explorar Grafo em Rede',
      subtitulo: 'Mapa interativo de relações dialéticas e dependências',
      badge: 'Tecla G',
      icone: <Share2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      acao: () => {
        onMudarVisao('grafo');
        onClose();
      }
    },
    {
      id: 'cmd-visao-linha-tempo',
      tipo: 'acao',
      titulo: 'Ver Linha do Tempo Cronológica',
      subtitulo: 'Régua histórica interativa de 441 a.C. a 2013',
      badge: 'Tecla T',
      icone: <Hourglass className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      acao: () => {
        onMudarVisao('linha-tempo');
        onClose();
      }
    },
    {
      id: 'cmd-visao-zettelkasten',
      tipo: 'acao',
      titulo: 'Abrir Zettelkasten de Estudos',
      subtitulo: 'Sistema pessoal de notas atômicas em rede (Luhmann / Ahrens)',
      badge: 'Tecla Z',
      icone: <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      acao: () => {
        onMudarVisao('zettelkasten');
        onClose();
      }
    },
    {
      id: 'cmd-caixa-entrada',
      tipo: 'acao',
      titulo: '04 — Abrir Caixa de Entrada (Inbox 48h)',
      subtitulo: 'Capturar intuições e citações rápidas das leituras',
      badge: 'Inbox',
      icone: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      acao: () => {
        onMudarVisao('zettelkasten');
        onClose();
      }
    },
    {
      id: 'cmd-diario-intelectual',
      tipo: 'acao',
      titulo: '05 — Abrir Diário Intelectual ("Caderno Real")',
      subtitulo: 'Check-in semanal, Daily Log com símbolos (•, ○, -), termômetro e checkout',
      badge: 'Diário',
      icone: <NotebookPen className="w-4 h-4 text-amber-700 dark:text-amber-400" />,
      acao: () => {
        onMudarVisao('zettelkasten');
        onClose();
      }
    },
    {
      id: 'cmd-alternar-lombada',
      tipo: 'acao',
      titulo: modoVisualizacao === 'capa' ? 'Mudar para Visão em Lombadas' : 'Mudar para Visão em Capas',
      subtitulo: 'Alternar entre encadernação em lombada e capas reais',
      badge: 'Tecla C',
      icone: modoVisualizacao === 'capa' ? <Columns className="w-4 h-4 text-purple-600" /> : <ImageIcon className="w-4 h-4 text-purple-600" />,
      acao: () => {
        onMudarModoVisualizacao(modoVisualizacao === 'capa' ? 'lombada' : 'capa');
        onClose();
      }
    },
    {
      id: 'cmd-comparador',
      tipo: 'acao',
      titulo: 'Abrir Confronto Dialético (Comparador Lado a Lado)',
      subtitulo: 'Comparar duas teses opostas frente a frente (ex: Hayek vs Polanyi)',
      badge: 'Estudo',
      icone: <Scale className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      acao: () => {
        onAbrirComparador(42, 43); // Hayek vs Polanyi como exemplo emblemático
        onClose();
      }
    },
    {
      id: 'cmd-caderno-notas',
      tipo: 'acao',
      titulo: 'Abrir Caderno Geral de Notas e Citações',
      subtitulo: 'Consultar todas as anotações acumuladas dos livros',
      badge: 'Caderno',
      icone: <NotebookPen className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      acao: () => {
        onAbrirCaderno();
        onClose();
      }
    },
    {
      id: 'cmd-revisao',
      tipo: 'acao',
      titulo: 'Iniciar Revisão Semestral',
      subtitulo: 'Avaliação crítica de juízos e perguntas em aberto',
      badge: 'Exame',
      icone: <RotateCw className="w-4 h-4 text-emerald-600" />,
      acao: () => {
        onAbrirRevisao();
        onClose();
      }
    },
    {
      id: 'cmd-backup',
      tipo: 'acao',
      titulo: 'Backup & Exportação de Dados',
      subtitulo: 'Exportar ou importar em JSON, Markdown ou CSV',
      badge: 'Dados',
      icone: <Download className="w-4 h-4 text-stone-600 dark:text-stone-300" />,
      acao: () => {
        onAbrirBackup();
        onClose();
      }
    },
    {
      id: 'cmd-modo-escuro',
      tipo: 'acao',
      titulo: modoEscuro ? 'Ativar Modo Sala de Leitura Diurna' : 'Ativar Modo Noturno de Estudos',
      subtitulo: 'Alternar paleta clara e escura antiquarian',
      badge: 'Tecla D',
      icone: modoEscuro ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      acao: () => {
        onToggleModoEscuro();
        onClose();
      }
    },
    ...([1, 2, 3, 4, 5].map((lvl): ItemComando => ({
      id: `cmd-filtro-nivel-${lvl}`,
      tipo: 'acao',
      titulo: `Filtrar Nível ${lvl}`,
      subtitulo: `Exibir na estante apenas as obras do Nível ${lvl}`,
      badge: `Tecla ${lvl}`,
      icone: <Layers className="w-4 h-4 text-amber-600" />,
      acao: () => {
        onFiltrarNivel(lvl);
        onClose();
      }
    })))
  ], [modoVisualizacao, modoEscuro, onMudarVisao, onMudarModoVisualizacao, onToggleModoEscuro, onAbrirComparador, onAbrirCaderno, onAbrirRevisao, onAbrirBackup, onFiltrarNivel, onClose]);

  // Filtragem e busca ponderada
  const resultados = useMemo(() => {
    const q = busca.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Se a busca estiver vazia, exibe ações rápidas + livros em andamento
    if (!q) {
      const livrosLendo = livros.filter((l) => progressos[l.id]?.estado === 'lendo').map((l): ItemComando => {
        return {
          id: `livro-${l.id}`,
          tipo: 'livro',
          titulo: `#${l.id} ${l.titulo}`,
          subtitulo: `${l.autor} · Nível ${l.nivel} · ${l.area}`,
          badge: 'Lendo Agora',
          badgeColor: 'bg-amber-600 text-white',
          icone: <BookOpen className="w-4 h-4 text-amber-500 animate-pulse" />,
          acao: () => {
            onSelecionarLivro(l.id);
            onClose();
          },
          livroId: l.id
        };
      });

      return [...acoesSistema, ...livrosLendo];
    }

    // Busca textual nas ações do sistema
    const acoesFiltradas = acoesSistema.filter((a) =>
      a.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
      (a.subtitulo && a.subtitulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q))
    );

    // Busca nos 60 livros
    const livrosFiltrados: ItemComando[] = livros
      .filter((livro) => {
        const idStr = `${livro.id}`;
        const matchId = idStr === q || `#${idStr}` === q;
        const matchTitulo = livro.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
        const matchAutor = livro.autor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
        const matchArea = livro.area.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
        const matchTese = livro.tese.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
        const matchClasse = livro.classe.toLowerCase() === q;
        return matchId || matchTitulo || matchAutor || matchArea || matchTese || matchClasse;
      })
      .slice(0, 15)
      .map((livro) => {
        const prog = progressos[livro.id];
        let badge = `Nível ${livro.nivel}`;
        let badgeColor = 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300';
        let icone = <BookOpen className="w-4 h-4 text-stone-400" />;

        if (prog?.estado === 'lendo') {
          badge = 'Lendo';
          badgeColor = 'bg-amber-600 text-white';
          icone = <BookOpen className="w-4 h-4 text-amber-500" />;
        } else if (prog?.estado === 'lido') {
          badge = 'Lido';
          badgeColor = 'bg-emerald-600 text-white';
          icone = <CheckCircle className="w-4 h-4 text-emerald-500" />;
        }

        return {
          id: `livro-${livro.id}`,
          tipo: 'livro',
          titulo: `#${livro.id} ${livro.titulo}`,
          subtitulo: `${livro.autor} · ${livro.ano} · ${livro.area} · "${livro.tese.slice(0, 75)}..."`,
          badge,
          badgeColor,
          icone,
          acao: () => {
            onSelecionarLivro(livro.id);
            onClose();
          },
          livroId: livro.id
        };
      });

    return [...acoesFiltradas, ...livrosFiltrados];
  }, [busca, acoesSistema, livros, progressos, onSelecionarLivro, onClose]);

  // Teclado: Navegação pelas setas e Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndiceFocado((prev) => (prev + 1) % Math.max(1, resultados.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndiceFocado((prev) => (prev - 1 + resultados.length) % Math.max(1, resultados.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (resultados[indiceFocado]) {
          resultados[indiceFocado].acao();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, resultados, indiceFocado, onClose]);

  // Garantir que o item focado fique visível na rolagem
  useEffect(() => {
    if (listaRef.current) {
      const elementoFocado = listaRef.current.children[indiceFocado] as HTMLElement;
      if (elementoFocado) {
        elementoFocado.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [indiceFocado]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-[12vh] sm:pt-[15vh] animate-fadeIn">
      {/* Clique no backdrop para fechar */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-library-paper dark:bg-library-darkPaper w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-100 flex flex-col overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Pesquisa Superior */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800/80 bg-stone-50/60 dark:bg-stone-900/60">
          <Search className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setIndiceFocado(0);
            }}
            placeholder="Digite para buscar qualquer livro, autor, tese ou comando..."
            className="w-full bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none font-serif"
          />
          {busca ? (
            <button
              onClick={() => {
                setBusca('');
                setIndiceFocado(0);
                inputRef.current?.focus();
              }}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-stone-500 bg-stone-200 dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700">
              ESC para sair
            </kbd>
          )}
        </div>

        {/* Lista de Resultados e Ações */}
        <div
          ref={listaRef}
          className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-stone-100 dark:divide-stone-800/50"
        >
          {resultados.length === 0 ? (
            <div className="p-8 text-center text-stone-500 dark:text-stone-400 font-serif italic text-sm">
              Nenhuma obra ou comando correspondente a "{busca}".
            </div>
          ) : (
            resultados.map((item, idx) => {
              const focado = idx === indiceFocado;
              return (
                <div
                  key={item.id}
                  onClick={item.acao}
                  onMouseEnter={() => setIndiceFocado(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    focado
                      ? 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 ring-1 ring-amber-400/50'
                      : 'hover:bg-stone-100/70 dark:hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0 shadow-xs">
                      {item.icone}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-sm truncate text-stone-900 dark:text-stone-100">
                        {item.titulo}
                      </h4>
                      {item.subtitulo && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate font-serif">
                          {item.subtitulo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-cinzel font-semibold tracking-wider ${
                          item.badgeColor || 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {focado && <CornerDownLeft className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo de Teclas de Atalho */}
        <div className="px-4 py-2.5 bg-stone-100/70 dark:bg-stone-900/70 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 rounded">↓</kbd> navegar</span>
            <span><kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 rounded">ENTER</kbd> abrir</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span>Atalhos: <kbd className="px-1 bg-stone-200 dark:bg-stone-800 rounded">E</kbd> Estante · <kbd className="px-1 bg-stone-200 dark:bg-stone-800 rounded">G</kbd> Grafo · <kbd className="px-1 bg-stone-200 dark:bg-stone-800 rounded">C</kbd> Capa/Lombada</span>
          </div>
        </div>
      </div>
    </div>
  );
};
