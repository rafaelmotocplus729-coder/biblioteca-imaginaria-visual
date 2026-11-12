import React, { useState } from 'react';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import {
  Plus,
  Calendar,
  X,
  Archive
} from 'lucide-react';

interface HistoricoVolumesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoricoVolumesModal: React.FC<HistoricoVolumesModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    cadernosVolumes,
    cadernoAtivoId,
    criarCadernoVolume,
    concluirCadernoVolume,
    setCadernoAtivoId
  } = useBibliotecaStore();

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDataInicio, setNovaDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [mostrandoCriar, setMostrandoCriar] = useState(false);

  if (!isOpen) return null;

  const handleCriarVolume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;
    criarCadernoVolume(novoTitulo.trim(), novaDataInicio);
    setNovoTitulo('');
    setMostrandoCriar(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#18191d] border border-stone-300 dark:border-stone-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center shadow-md">
              <Archive className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Módulo 1 · Volumes & Arquivo
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Arquivo de Cadernos Reais
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Volumes */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-cinzel font-bold text-stone-700 dark:text-stone-300">
              Volumes Registrados ({cadernosVolumes.length})
            </span>
            {!mostrandoCriar && (
              <button
                onClick={() => setMostrandoCriar(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-cinzel font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Caderno (Volume)</span>
              </button>
            )}
          </div>

          {/* Form para novo volume */}
          {mostrandoCriar && (
            <form onSubmit={handleCriarVolume} className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/80 space-y-3 animate-fadeIn">
              <div className="font-cinzel font-bold text-amber-900 dark:text-amber-300">
                Iniciar Novo Caderno Físico/Digital
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Título do Volume
                </label>
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Caderno Real — Vol. II (2026/2)"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-serif"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={novaDataInicio}
                  onChange={(e) => setNovaDataInicio(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMostrandoCriar(false)}
                  className="px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-200/50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-800 text-white font-cinzel font-bold shadow-xs hover:bg-amber-700"
                >
                  Criar e Ativar Caderno
                </button>
              </div>
            </form>
          )}

          {/* Lista dos Volumes Existentes */}
          <div className="space-y-3">
            {cadernosVolumes.map((vol) => {
              const isAtivo = vol.id === cadernoAtivoId;

              return (
                <div
                  key={vol.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isAtivo
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-400/30'
                      : 'bg-stone-50/40 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {vol.titulo}
                      </h4>
                      {isAtivo ? (
                        <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          Ativo Agora
                        </span>
                      ) : vol.dataFim ? (
                        <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          Concluído
                        </span>
                      ) : (
                        <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                          Em Aberto
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-stone-500 font-serif text-[11px] mt-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        Início: {vol.dataInicio.split('-').reverse().join('/')}
                        {vol.dataFim ? ` · Término: ${vol.dataFim.split('-').reverse().join('/')}` : ' (Em andamento)'}
                      </span>
                    </div>

                    {vol.descricao && (
                      <p className="text-[11px] text-stone-500 font-serif italic mt-1 max-w-md">
                        {vol.descricao}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!isAtivo && (
                      <button
                        onClick={() => {
                          setCadernoAtivoId(vol.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-cinzel font-bold text-xs"
                      >
                        Abrir Este Volume
                      </button>
                    )}

                    {isAtivo && !vol.dataFim && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja concluir e arquivar o "${vol.titulo}"? Você poderá consultá-lo sempre que quiser.`)) {
                            concluirCadernoVolume(vol.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-cinzel font-bold text-xs"
                      >
                        Concluir Caderno
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-between text-stone-500">
          <span className="font-serif">
            Mantenha o histórico dos seus ciclos intelectuais preservado ano após ano.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-cinzel font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
