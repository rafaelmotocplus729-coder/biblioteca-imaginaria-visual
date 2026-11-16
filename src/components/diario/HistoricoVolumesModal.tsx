import React, { useState } from 'react';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import { calcularDomingoDaSemana, formatarDataISO, somarDiasData } from '../../data/diarioPadrao';
import {
  Plus,
  Calendar,
  X,
  Archive,
  Trash2
} from 'lucide-react';

interface HistoricoVolumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  abrirCriacaoDireto?: boolean;
  onCadernoCriado?: (cadernoId: string) => void;
}

export const HistoricoVolumesModal: React.FC<HistoricoVolumesModalProps> = ({
  isOpen,
  onClose,
  abrirCriacaoDireto = false,
  onCadernoCriado
}) => {
  const {
    cadernosVolumes,
    cadernoAtivoId,
    criarCadernoVolume,
    concluirCadernoVolume,
    removerCadernoVolume,
    setCadernoAtivoId
  } = useBibliotecaStore();

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDataInicio, setNovaDataInicio] = useState(formatarDataISO(new Date()));
  const [novaDescricao, setNovaDescricao] = useState('');
  const [mostrandoCriar, setMostrandoCriar] = useState(abrirCriacaoDireto);

  React.useEffect(() => {
    if (isOpen) {
      setMostrandoCriar(abrirCriacaoDireto || cadernosVolumes.length === 0);
    }
  }, [isOpen, abrirCriacaoDireto, cadernosVolumes.length]);

  if (!isOpen) return null;

  const domingoCalculado = calcularDomingoDaSemana(novaDataInicio || formatarDataISO(new Date()));
  const sabadoCalculado = somarDiasData(domingoCalculado, 6);

  const handleCriarVolume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;
    const novoId = criarCadernoVolume(novoTitulo.trim(), novaDataInicio, novaDescricao);
    setNovoTitulo('');
    setNovaDescricao('');
    setMostrandoCriar(false);
    if (onCadernoCriado) onCadernoCriado(novoId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/65 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Gerenciar Cadernos"
    >
      <div className="bg-[#fcfaf5] dark:bg-[#17191e] border border-stone-300 dark:border-stone-800 rounded-2xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-[#FBF8F3] dark:bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-amber-800 text-amber-200 flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Meus Cadernos
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-serif">
                Crie novos volumes ou alterne entre cadernos existentes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-cinzel font-bold text-xs text-stone-700 dark:text-stone-300">
              Cadernos ({cadernosVolumes.length})
            </span>
            {!mostrandoCriar && (
              <button
                type="button"
                onClick={() => setMostrandoCriar(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-cinzel font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Caderno</span>
              </button>
            )}
          </div>

          {/* Formulário para Novo Caderno */}
          {mostrandoCriar && (
            <form
              onSubmit={handleCriarVolume}
              className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800/80 space-y-4 animate-fadeIn"
            >
              <div className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Criar Novo Caderno
              </div>

              <div>
                <label
                  htmlFor="modal-novo-caderno-titulo"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
                >
                  Nome do Caderno
                </label>
                <input
                  id="modal-novo-caderno-titulo"
                  type="text"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Caderno de Novembro — Estudos & Rotina"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fcfaf5] dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-sm font-serif text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="modal-novo-caderno-data"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
                  >
                    Semana de Referência
                  </label>
                  <input
                    id="modal-novo-caderno-data"
                    type="date"
                    value={novaDataInicio}
                    onChange={(e) => setNovaDataInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fcfaf5] dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#FBF8F3] dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 flex flex-col justify-center">
                  <span className="text-[11px] font-cinzel font-bold text-amber-800 dark:text-amber-400">
                    Dia 01 = Domingo
                  </span>
                  <span className="text-xs font-mono text-stone-700 dark:text-stone-300 tabular-nums mt-0.5">
                    {domingoCalculado.split('-').reverse().join('/')} a {sabadoCalculado.split('-').reverse().join('/')}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-novo-caderno-desc"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
                >
                  Objetivo (opcional)
                </label>
                <input
                  id="modal-novo-caderno-desc"
                  type="text"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Ex: Foco em clareza diária e leituras"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#fcfaf5] dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-xs font-serif text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {cadernosVolumes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMostrandoCriar(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-cinzel font-bold text-xs cursor-pointer transition-colors"
                >
                  Criar e Abrir Caderno
                </button>
              </div>
            </form>
          )}

          {/* Lista dos Cadernos Existentes */}
          {cadernosVolumes.length > 0 && (
            <div className="space-y-3">
              {cadernosVolumes.map((vol) => {
                const isAtivo = vol.id === cadernoAtivoId;

                return (
                  <div
                    key={vol.id}
                    className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAtivo
                        ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-400 dark:border-amber-700'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                          {vol.titulo}
                        </h4>
                        {isAtivo ? (
                          <span className="text-[11px] font-cinzel font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Ativo
                          </span>
                        ) : vol.dataFim ? (
                          <span className="text-[11px] font-cinzel px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            Concluído
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 font-mono text-xs mt-1 tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>
                          Dia 01 (Dom): {vol.dataInicio.split('-').reverse().join('/')}
                          {vol.dataFim ? ` · Fim: ${vol.dataFim.split('-').reverse().join('/')}` : ''}
                        </span>
                      </div>

                      {vol.descricao && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 font-serif italic mt-1">
                          {vol.descricao}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {!isAtivo && (
                        <button
                          type="button"
                          onClick={() => {
                            setCadernoAtivoId(vol.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-600 font-cinzel font-bold text-xs cursor-pointer"
                        >
                          Abrir
                        </button>
                      )}

                      {isAtivo && !vol.dataFim && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja concluir o "${vol.titulo}"?`)) {
                              concluirCadernoVolume(vol.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-cinzel font-bold text-xs cursor-pointer"
                        >
                          Concluir
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Excluir o caderno "${vol.titulo}" e todos os seus registros?`)) {
                            removerCadernoVolume(vol.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Excluir caderno"
                        aria-label={`Excluir ${vol.titulo}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-[#FBF8F3] dark:bg-stone-900/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-cinzel font-bold text-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
