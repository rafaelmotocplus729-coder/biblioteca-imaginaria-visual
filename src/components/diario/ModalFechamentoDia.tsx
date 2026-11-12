import React, { useState } from 'react';
import { DiaLog } from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import {
  CheckCircle2,
  X,
  ArrowRight,
  Ban,
  Clock
} from 'lucide-react';

interface ModalFechamentoDiaProps {
  isOpen: boolean;
  onClose: () => void;
  dia: DiaLog;
}

export const ModalFechamentoDia: React.FC<ModalFechamentoDiaProps> = ({
  isOpen,
  onClose,
  dia
}) => {
  const { revisarFecharDia, atualizarTermometroDia } = useBibliotecaStore();

  // Calcular data de amanhã como sugestão
  const dataObj = new Date(dia.data + 'T12:00:00');
  dataObj.setDate(dataObj.getDate() + 1);
  const amanhaStr = dataObj.toISOString().split('T')[0];

  // Itens pendentes do dia
  const itensPendentes = dia.itens.filter((i) => i.estado === 'pendente' && i.tipo !== 'nota');

  // Estado das ações de cada item pendente
  // itemId -> { acao: 'concluir' | 'migrar' | 'cancelar', dataDestino?: string }
  const [acoesPendentes, setAcoesPendentes] = useState<Record<string, { acao: 'concluir' | 'migrar' | 'cancelar'; dataDestino?: string }>>(() => {
    const inicial: Record<string, { acao: 'concluir' | 'migrar' | 'cancelar'; dataDestino?: string }> = {};
    itensPendentes.forEach((it) => {
      // Default: migrar para amanhã
      inicial[it.id] = { acao: 'migrar', dataDestino: amanhaStr };
    });
    return inicial;
  });

  const [textoTermometro, setTextoTermometro] = useState(dia.termometro?.texto || '');
  const [humorSelecionado, setHumorSelecionado] = useState(dia.termometro?.humor || 'sereno');

  if (!isOpen) return null;

  const handleMudarAcao = (itemId: string, acao: 'concluir' | 'migrar' | 'cancelar') => {
    setAcoesPendentes((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], acao, dataDestino: prev[itemId]?.dataDestino || amanhaStr }
    }));
  };

  const handleMudarDataDestino = (itemId: string, dataDestino: string) => {
    setAcoesPendentes((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], dataDestino }
    }));
  };

  const handleConfirmarFechamento = () => {
    if (textoTermometro.trim() && textoTermometro !== dia.termometro?.texto) {
      atualizarTermometroDia(dia.data, textoTermometro.trim(), humorSelecionado);
    }
    revisarFecharDia(dia.data, acoesPendentes);
    onClose();
  };

  // Formatar data em português
  const [ano, mes, diaNum] = dia.data.split('-');
  const dataFormatada = `${diaNum}/${mes}/${ano}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#18191d] border border-stone-300 dark:border-stone-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Rotina Noturna de Fechamento
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Fechar & Revisar Dia ({dataFormatada})
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

        {/* Corpo com Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Instrução Filosófica */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-stone-700 dark:text-stone-300 font-serif leading-relaxed">
            Revise o que foi cumprido, defina o destino do que sobrou e carimbe o dia. Nada se perde: tarefas não feitas são migradas sem culpa ou canceladas com clareza.
          </div>

          {/* Triagem de Pendências */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Pendências do Dia ({itensPendentes.length})
              </span>
              {itensPendentes.length === 0 && (
                <span className="text-[11px] text-emerald-600 font-medium">
                  ✓ Tudo resolvido no dia!
                </span>
              )}
            </div>

            {itensPendentes.length > 0 ? (
              <div className="space-y-2.5">
                {itensPendentes.map((it) => {
                  const acaoAtual = acoesPendentes[it.id]?.acao || 'migrar';
                  const dataDestino = acoesPendentes[it.id]?.dataDestino || amanhaStr;

                  return (
                    <div
                      key={it.id}
                      className="p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded flex items-center justify-center font-bold text-xs bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 shrink-0">
                          {it.tipo === 'tarefa' ? '•' : '○'}
                        </span>
                        <span className="font-serif text-stone-900 dark:text-stone-100 font-medium text-xs leading-snug">
                          {it.texto}
                        </span>
                      </div>

                      {/* Botões de Ação Rápida */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleMudarAcao(it.id, 'concluir')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                            acaoAtual === 'concluir'
                              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Concluir (X)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMudarAcao(it.id, 'migrar')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                            acaoAtual === 'migrar'
                              ? 'bg-amber-700 text-white font-bold shadow-2xs'
                              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>Migrar (→)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMudarAcao(it.id, 'cancelar')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                            acaoAtual === 'cancelar'
                              ? 'bg-stone-700 text-white font-bold shadow-2xs'
                              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          <span>Cancelar (—)</span>
                        </button>

                        {acaoAtual === 'migrar' && (
                          <div className="flex items-center gap-1 ml-auto text-[11px] text-stone-500">
                            <span>Para:</span>
                            <input
                              type="date"
                              value={dataDestino}
                              onChange={(e) => handleMudarDataDestino(it.id, e.target.value)}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-[11px]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-stone-500 italic bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-stone-200 dark:border-stone-800">
                Todas as tarefas do dia foram cumpridas ou registradas!
              </div>
            )}
          </div>

          {/* O Termômetro Diário (≡) */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <span className="text-base text-indigo-700 dark:text-indigo-400 font-mono">≡</span>
                Termômetro do Dia (Desabafo & Temperatura)
              </span>
              <span className="text-[10px] text-stone-400 font-serif">Sem cobrança formal</span>
            </div>

            <textarea
              rows={3}
              value={textoTermometro}
              onChange={(e) => setTextoTermometro(e.target.value)}
              placeholder="Como você se sentiu hoje? O que pesou ou o que fluiu? Nem que seja uma única frase honesta..."
              className="w-full p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 font-serif text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />

            {/* Tons de Humor do Dia */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-stone-400 font-cinzel">Tom:</span>
              {['sereno', 'focado', 'cansado', 'inspirado', 'resiliente', 'turbulento'].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHumorSelecionado(h)}
                  className={`text-[10.5px] px-2 py-0.5 rounded-full capitalize transition cursor-pointer ${
                    humorSelecionado === h
                      ? 'bg-amber-800 text-amber-100 font-bold dark:bg-amber-600 dark:text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé com Carimbo */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 text-xs font-semibold"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleConfirmarFechamento}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100 font-cinzel font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer ring-1 ring-amber-600/40"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>Carimbar Dia como "Revisado"</span>
          </button>
        </div>
      </div>
    </div>
  );
};
