import React, { useState, useMemo } from 'react';
import { Livro, Progresso } from '../types';
import { CORES_AREAS } from '../constants/theme';
import {
  NotebookPen,
  X,
  Search,
  Download,
  FileText,
  ExternalLink,
  Edit3,
  HelpCircle,
  ScrollText,
  Check
} from 'lucide-react';

interface CadernoNotasModalProps {
  isOpen: boolean;
  onClose: () => void;
  livros: Livro[];
  progressos: Record<number, Progresso>;
  onSelecionarLivro: (id: number) => void;
  onAtualizarNotas: (livroId: number, notas: string) => void;
}

export const CadernoNotasModal: React.FC<CadernoNotasModalProps> = ({
  isOpen,
  onClose,
  livros,
  progressos,
  onSelecionarLivro,
  onAtualizarNotas
}) => {
  const [busca, setBusca] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'lendo' | 'lido'>('todos');
  const [livroEditandoId, setLivroEditandoId] = useState<number | null>(null);
  const [notaTemporaria, setNotaTemporaria] = useState('');

  // Filtrar apenas livros que possuem anotações ou guias, ou que estão em andamento/lidos
  const notasFiltradas = useMemo(() => {
    const q = busca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return livros
      .filter((livro) => {
        const prog = progressos[livro.id];
        const temAnotacao = Boolean(prog?.notas?.trim()) || Boolean(prog?.guia_leitura?.trim()) || Boolean(prog?.pergunta_aberta?.trim());

        // Se busca ativa, busca em qualquer livro com notas
        if (!temAnotacao && !q) return false;

        // Filtro de estado
        if (filtroEstado !== 'todos' && prog?.estado !== filtroEstado) {
          return false;
        }

        if (q) {
          const matchTitulo = livro.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
          const matchAutor = livro.autor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
          const matchNotas = (prog?.notas || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
          const matchGuia = (prog?.guia_leitura || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
          const matchPergunta = (prog?.pergunta_aberta || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
          if (!matchTitulo && !matchAutor && !matchNotas && !matchGuia && !matchPergunta) return false;
        }

        return temAnotacao;
      })
      .sort((a, b) => a.id - b.id);
  }, [livros, progressos, busca, filtroEstado]);

  // Exportar caderno em Markdown
  const handleExportarMarkdown = () => {
    let md = `# Caderno de Estudos e Anotações — Biblioteca Imaginária\n\n`;
    md += `*Gerado em ${new Date().toLocaleDateString('pt-BR')}*\n\n---\n\n`;

    notasFiltradas.forEach((livro) => {
      const prog = progressos[livro.id];
      md += `## Livro #${livro.id} — ${livro.titulo}\n`;
      md += `**Autor:** ${livro.autor} (${livro.ano}) | **Área:** ${livro.area} | **Nível:** ${livro.nivel}\n\n`;
      md += `> **Tese:** ${livro.tese}\n\n`;

      if (prog?.estado) {
        md += `*Status de Leitura:* \`${prog.estado}\`\n\n`;
      }
      if (prog?.pergunta_aberta) {
        md += `### Pergunta em Aberto deixada pela obra:\n${prog.pergunta_aberta}\n\n`;
      }
      if (prog?.guia_leitura) {
        md += `### Guia de Leitura Próprio:\n${prog.guia_leitura}\n\n`;
      }
      if (prog?.notas) {
        md += `### Anotações e Citações:\n${prog.notas}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Caderno_Estudos_Biblioteca_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-library-paper dark:bg-library-darkPaper w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-800 to-amber-950 flex items-center justify-center text-white shadow-md ring-1 ring-amber-700/40">
              <NotebookPen className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                Caderno de Estudos & Anotações
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans uppercase tracking-widest tabular-nums">
                {notasFiltradas.length} obras com registros de leitura
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportarMarkdown}
              disabled={notasFiltradas.length === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold tracking-wider bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              title="Baixar todas as anotações em Markdown"
            >
              <Download className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Exportar .MD</span>
            </button>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 bg-stone-200/80 dark:bg-stone-800 rounded-md border border-stone-300 dark:border-stone-700 shadow-2xs">
              ESC
            </kbd>
            <button
              onClick={onClose}
              title="Fechar (Esc)"
              className="p-2 rounded-xl hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca de Notas */}
        <div className="p-4 sm:px-6 bg-stone-100/60 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar nas suas anotações..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-serif text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                title="Limpar pesquisa"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-cinzel self-start sm:self-auto">
            {(['todos', 'lendo', 'lido'] as const).map((est) => (
              <button
                key={est}
                onClick={() => setFiltroEstado(est)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors border cursor-pointer ${
                  filtroEstado === est
                    ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-amber-500/70'
                }`}
              >
                {est === 'todos' ? 'Todas as Obras' : est === 'lendo' ? 'Em Andamento' : 'Concluídos'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Anotações */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {notasFiltradas.length === 0 ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400 font-serif italic text-sm">
              Nenhuma anotação registrada ainda. Conforme você lê e anota suas reflexões nos livros, elas ficarão reunidas aqui neste caderno.
            </div>
          ) : (
            notasFiltradas.map((livro) => {
              const prog = progressos[livro.id];
              const cores = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
              const isEditando = livroEditandoId === livro.id;

              return (
                <div
                  key={livro.id}
                  className="rounded-2xl p-5 border border-stone-300/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/50 shadow-xs space-y-3.5 relative group"
                  style={{ borderLeft: `4px solid ${cores.hex}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className="px-2 py-0.5 text-[9px] font-cinzel font-bold uppercase rounded-md text-white shadow-2xs tabular-nums"
                        style={{ backgroundColor: cores.hex }}
                      >
                        #{livro.id} · Nível {livro.nivel}
                      </span>
                      <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                        {livro.titulo}
                      </h3>
                      <span className="text-xs text-stone-500 italic font-serif hidden sm:inline">
                        — {livro.autor}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelecionarLivro(livro.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-cinzel font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 hover:underline flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <span>Abrir Livro</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Pergunta Aberta */}
                  {prog?.pergunta_aberta && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-800/60 text-xs font-serif text-amber-950 dark:text-amber-200">
                      <strong className="font-cinzel text-[10px] tracking-wider uppercase flex items-center gap-1.5 text-amber-800 dark:text-amber-300 mb-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                        <span>Pergunta em Aberto deixada pela Leitura:</span>
                      </strong>
                      &ldquo;{prog.pergunta_aberta}&rdquo;
                    </div>
                  )}

                  {/* Guia de Leitura */}
                  {prog?.guia_leitura && (
                    <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs font-serif text-stone-800 dark:text-stone-200">
                      <strong className="font-cinzel text-[10px] tracking-wider uppercase flex items-center gap-1.5 text-stone-600 dark:text-stone-400 mb-1">
                        <ScrollText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                        <span>Guia Pessoal de Leitura:</span>
                      </strong>
                      <p className="whitespace-pre-wrap leading-relaxed">{prog.guia_leitura}</p>
                    </div>
                  )}

                  {/* Anotações Pessoais & Citações */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-stone-400" />
                        Notas & Citações
                      </span>
                      {!isEditando && (
                        <button
                          onClick={() => {
                            setLivroEditandoId(livro.id);
                            setNotaTemporaria(prog?.notas || '');
                          }}
                          className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-amber-700 dark:hover:text-amber-300 text-xs flex items-center gap-1 transition-opacity cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Editar
                        </button>
                      )}
                    </div>

                    {isEditando ? (
                      <div className="space-y-2">
                        <textarea
                          value={notaTemporaria}
                          onChange={(e) => setNotaTemporaria(e.target.value)}
                          rows={4}
                          className="w-full p-3 rounded-xl border border-amber-400 dark:border-amber-600 bg-white dark:bg-stone-950 text-xs font-serif text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 leading-relaxed"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setLivroEditandoId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              onAtualizarNotas(livro.id, notaTemporaria);
                              setLivroEditandoId(null);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-cinzel font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Salvar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm font-serif text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap pl-2.5 border-l-2 border-amber-600/40">
                        {prog?.notas || <em className="text-stone-400">Sem notas textuais.</em>}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
