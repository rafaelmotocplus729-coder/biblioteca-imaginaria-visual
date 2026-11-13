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

  // Função auxiliar para calcular data futura
  const calcularDataFutura = (dias: number) => {
    const d = new Date(dia.data + 'T12:00:00');
    d.setDate(d.getDate() + dias);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#18191d] border border-stone-300 dark:border-stone-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Rotina Noturna de Fechamento
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Fechar & Revisar Dia ({dataFormatada})
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Instrução Filosófica */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-[12.5px]">
            Revise o que foi cumprido, defina o destino do que sobrou e carimbe o dia. Nada se perde: tarefas não feitas são migradas sem culpa ou canceladas com clareza.
          </div>

          {/* Triagem de Pendências */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Pendências do Dia ({itensPendentes.length})
              </span>
              {itensPendentes.length === 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  ✓ Tudo resolvido no dia!
                </span>
              )}
            </div>

            {itensPendentes.length > 0 ? (
              <div className="space-y-3">
                {itensPendentes.map((it) => {
                  const acaoAtual = acoesPendentes[it.id]?.acao || 'migrar';
                  const dataDestino = acoesPendentes[it.id]?.dataDestino || amanhaStr;

                  return (
                    <div
                      key={it.id}
                      className="p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 space-y-3 shadow-2xs hover:border-amber-400/50 transition-all"
                    >
                      {/* Texto da Pendência */}
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 shrink-0 mt-0.5">
                          {it.tipo === 'tarefa' ? '•' : '○'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="font-serif text-stone-900 dark:text-stone-100 font-medium text-sm leading-snug block">
                            {it.texto}
                          </span>
                          <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider mt-0.5 block">
                            {it.tipo === 'tarefa' ? 'Tarefa Pendente' : 'Evento / Compromisso'}
                          </span>
                        </div>
                      </div>

                      {/* Botões de Ação Rápida em Pílulas Espaçosas */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200/60 dark:border-stone-800/60">
                        <button
                          type="button"
                          onClick={() => handleMudarAcao(it.id, 'concluir')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                            acaoAtual === 'concluir'
                              ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-500/30'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Concluir (X)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMudarAcao(it.id, 'migrar')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                            acaoAtual === 'migrar'
                              ? 'bg-amber-700 text-white font-bold ring-2 ring-amber-500/30'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700'
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                          <span>Migrar (→)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMudarAcao(it.id, 'cancelar')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                            acaoAtual === 'cancelar'
                              ? 'bg-stone-700 text-white font-bold ring-2 ring-stone-500/30'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                          }`}
                        >
                          <Ban className="w-3.5 h-3.5 text-stone-400" />
                          <span>Cancelar (—)</span>
                        </button>
                      </div>

                      {/* Seção Destino da Migração (Aparece com destaque quando 'migrar' está ativo) */}
                      {acaoAtual === 'migrar' && (
                        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs text-stone-700 dark:text-stone-300">
                          <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-amber-600" /> Destino:
                          </span>
                          
                          {/* Presets Rápidos */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMudarDataDestino(it.id, calcularDataFutura(1))}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                                dataDestino === calcularDataFutura(1)
                                  ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-amber-200 dark:border-stone-700 hover:bg-amber-50'
                              }`}
                            >
                              Amanhã (+1d)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMudarDataDestino(it.id, calcularDataFutura(2))}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                                dataDestino === calcularDataFutura(2)
                                  ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-amber-200 dark:border-stone-700 hover:bg-amber-50'
                              }`}
                            >
                              +2 dias
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMudarDataDestino(it.id, calcularDataFutura(7))}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                                dataDestino === calcularDataFutura(7)
                                  ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-amber-200 dark:border-stone-700 hover:bg-amber-50'
                              }`}
                            >
                              +1 semana
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-[11px] text-stone-500 font-serif">Data livre:</span>
                            <input
                              type="date"
                              value={dataDestino}
                              onChange={(e) => handleMudarDataDestino(it.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono shadow-2xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 text-center text-stone-500 italic bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-stone-200 dark:border-stone-800">
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
