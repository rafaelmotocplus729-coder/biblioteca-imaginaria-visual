import React, { useState } from 'react';
import { PaginaLivreCaderno } from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import {
  Plus,
  Trash2,
  Edit2,
  Check
} from 'lucide-react';

interface PaginasLivresViewProps {
  paginaSelecionadaId?: string;
}

export const PaginasLivresView: React.FC<PaginasLivresViewProps> = ({
  paginaSelecionadaId
}) => {
  const {
    paginasLivresCaderno,
    cadernoAtivoId,
    salvarPaginaLivre,
    removerPaginaLivre,
    diasLogs
  } = useBibliotecaStore();

  const [idAtiva, setIdAtiva] = useState<string>(
    paginaSelecionadaId || paginasLivresCaderno[0]?.id || ''
  );

  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Próximo número de página sequencial
  const proximoNumeroPagina =
    Math.max(
      12,
      ...paginasLivresCaderno.map((p) => p.paginaNumero),
      Object.keys(diasLogs).length + 5
    ) + 1;

  const paginaAtiva = paginasLivresCaderno.find((p) => p.id === idAtiva) || paginasLivresCaderno[0];

  const handleIniciarCriacao = () => {
    const nova: PaginaLivreCaderno = {
      id: `pag-livre-${Date.now()}`,
      cadernoId: cadernoAtivoId,
      paginaNumero: proximoNumeroPagina,
      titulo: 'Novo Tópico de Anotações',
      conteudo: '# Título da Anotação Livre\n\nComece a escrever seus pensamentos, esquemas conceituais ou reflexões temáticas...',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    salvarPaginaLivre(nova);
    setIdAtiva(nova.id);
    setTitulo(nova.titulo);
    setConteudo(nova.conteudo);
    setEditando(true);
  };

  const handleSalvarEdicao = () => {
    if (!paginaAtiva) return;
    salvarPaginaLivre({
      ...paginaAtiva,
      titulo: titulo.trim() || paginaAtiva.titulo,
      conteudo,
      dataAtualizacao: new Date().toISOString()
    });
    setEditando(false);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2000);
  };

  return (
    <div className="card-fichario rounded-3xl p-5 sm:p-8 border border-stone-300/90 dark:border-stone-800 shadow-sm space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="border-b border-stone-200/90 dark:border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
              Páginas Livres / Anotações
            </span>
            {paginaAtiva && (
              <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-400">
                Página {paginaAtiva.paginaNumero}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1.5">
            {paginaAtiva ? paginaAtiva.titulo : 'Anotações Livres'}
          </h3>
          <p className="text-xs text-stone-500 font-serif mt-0.5">
            Espaço aberto para notas temáticas, sínteses livres e mapeamentos conceituais sequenciais.
          </p>
        </div>

        <button
          onClick={handleIniciarCriacao}
          className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-cinzel font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Página Livre (Pág. {proximoNumeroPagina})</span>
        </button>
      </div>

      {/* Seletor de Páginas Livres */}
      {paginasLivresCaderno.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {paginasLivresCaderno.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setIdAtiva(p.id);
                setEditando(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition shrink-0 flex items-center gap-2 ${
                p.id === idAtiva
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              <span className="font-mono text-[10px]">Pág. {p.paginaNumero}</span>
              <span className="truncate max-w-[140px]">{p.titulo}</span>
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo da Página Ativa */}
      {paginaAtiva ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-mono">
              Registrado no Índice do Volume
            </span>
            <div className="flex items-center gap-2">
              {salvoFeedback && (
                <span className="text-xs text-emerald-600 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Salvo!
                </span>
              )}

              {!editando ? (
                <button
                  onClick={() => {
                    setTitulo(paginaAtiva.titulo);
                    setConteudo(paginaAtiva.conteudo);
                    setEditando(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-cinzel flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Página</span>
                </button>
              ) : (
                <button
                  onClick={handleSalvarEdicao}
                  className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-600 text-xs font-cinzel font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm('Deseja excluir esta página de anotações livres?')) {
                    removerPaginaLivre(paginaAtiva.id);
                  }
                }}
                className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Excluir página"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {editando ? (
            <div className="space-y-3 animate-fadeIn">
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título do Tópico..."
                className="w-full p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm font-serif font-bold text-stone-900 dark:text-stone-100"
              />
              <textarea
                rows={12}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs sm:text-sm font-serif leading-relaxed text-stone-900 dark:text-stone-100"
              />
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 prose dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 font-serif leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
              {paginaAtiva.conteudo}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-stone-400 italic">
          Nenhuma página livre criada. Clique no botão acima para criar a Página {proximoNumeroPagina}.
        </div>
      )}
    </div>
  );
};
