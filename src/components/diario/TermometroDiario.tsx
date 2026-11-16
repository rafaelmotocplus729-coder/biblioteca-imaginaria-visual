import React, { useState, useEffect } from 'react';
import { TermometroDia } from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import { Activity, Check, Maximize2, Minimize2 } from 'lucide-react';

interface TermometroDiarioProps {
  dataStr: string;
  termometro?: TermometroDia;
  paginaNumero: number;
  streakDias?: number;
}

const HUMORES = [
  { id: 'sereno', label: 'Sereno' },
  { id: 'focado', label: 'Focado' },
  { id: 'inspirado', label: 'Inspirado' },
  { id: 'cansado', label: 'Cansado' },
  { id: 'resiliente', label: 'Resiliente' },
  { id: 'inquieto', label: 'Inquieto' }
];

export const TermometroDiario: React.FC<TermometroDiarioProps> = ({
  dataStr,
  termometro,
  paginaNumero,
  streakDias
}) => {
  const { atualizarTermometroDia, diasLogs, cadernoAtivoId } = useBibliotecaStore();

  const [texto, setTexto] = useState(termometro?.texto || '');
  const [humor, setHumor] = useState(termometro?.humor || '');
  const [salvando, setSalvando] = useState(false);
  const [expandido, setExpandido] = useState(false);

  // Sincronizar quando mudar a data ou o caderno
  useEffect(() => {
    setTexto(termometro?.texto || '');
    setHumor(termometro?.humor || '');
  }, [dataStr, termometro?.texto, termometro?.humor]);

  // Auto-save com debounce
  useEffect(() => {
    if (texto === (termometro?.texto || '') && humor === (termometro?.humor || '')) return;

    setSalvando(true);
    const timeout = setTimeout(() => {
      atualizarTermometroDia(dataStr, texto, humor);
      setSalvando(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [texto, humor, dataStr, termometro?.texto, termometro?.humor, atualizarTermometroDia]);

  const diasComRegistro =
    streakDias ??
    Object.values(diasLogs).filter(
      (d) =>
        (!cadernoAtivoId || d.cadernoId === cadernoAtivoId) &&
        d.termometro &&
        d.termometro.texto.trim().length > 0
    ).length;

  const palavras = texto.trim() ? texto.trim().split(/\s+/).length : 0;

  return (
    <>
      <section
        aria-label="Termômetro do Dia"
        className="surface-editorial rounded-2xl p-5 sm:p-6 space-y-4 transition-colors"
      >
        {/* Cabeçalho do Bloco ≡ */}
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3.5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-mono font-bold text-lg text-stone-800 dark:text-stone-100 shrink-0"
            >
              ≡
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Termômetro do Dia
                </h4>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                  Pág. {paginaNumero}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-serif mt-0.5">
                Espaço livre para desabafo, temperatura emocional e reflexões sinceras sobre o dia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {salvando ? (
              <span className="text-xs text-amber-700 dark:text-amber-400 font-mono">
                Salvando...
              </span>
            ) : texto.trim() ? (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Salvo
              </span>
            ) : null}

            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 font-mono tabular-nums"
              title={`${diasComRegistro} dia(s) com reflexão registrada neste caderno`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>{diasComRegistro}d</span>
            </div>

            <button
              type="button"
              onClick={() => setExpandido(true)}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
              title="Expandir caixa de escrita para modo foco"
              aria-label="Expandir caixa de escrita do termômetro"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Caixa de Texto Ampla e Confortável */}
        <div className="space-y-2">
          <textarea
            rows={8}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva livremente sobre como foi o seu dia, o que pesou, o que trouxe clareza ou o que precisa sair da cabeça..."
            aria-label="Texto do termômetro do dia"
            className="w-full min-h-[210px] p-4 text-sm sm:text-[15px] rounded-xl bg-[#fcfaf5] dark:bg-stone-900/90 border border-stone-300/90 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-serif leading-relaxed resize-y"
          />
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
            <span>{palavras} {palavras === 1 ? 'palavra' : 'palavras'}</span>
            <span className="font-serif italic">Sem autocensura estética</span>
          </div>
        </div>

        {/* Seletores de Tom Emocional */}
        <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-cinzel font-bold text-stone-600 dark:text-stone-400 mr-1">
            Tom do Dia:
          </span>
          {HUMORES.map((h) => {
            const ativo = humor === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => setHumor(ativo ? '' : h.id)}
                className={`text-xs px-3 py-1 rounded-lg border transition-colors cursor-pointer font-serif ${
                  ativo
                    ? 'bg-stone-900 dark:bg-amber-700 text-white border-stone-900 dark:border-amber-600 font-semibold'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'
                }`}
              >
                {h.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Modal Modo Foco Expandido para Escrita Longa */}
      {expandido && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Termômetro do Dia — Modo Foco"
        >
          <div className="bg-[#fcfaf5] dark:bg-[#17191e] border border-stone-300 dark:border-stone-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center font-mono font-bold text-lg text-stone-800 dark:text-stone-100">
                  ≡
                </span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    Termômetro do Dia — Escrita Livre
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                    {dataStr.split('-').reverse().join('/')} · Pág. {paginaNumero} · {palavras} palavras
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpandido(false)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 text-xs font-cinzel font-bold flex items-center gap-1.5 hover:border-amber-600 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Concluir</span>
              </button>
            </div>

            <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                autoFocus
                placeholder="Escreva sem pressa e sem limites de espaço..."
                className="w-full flex-1 min-h-[360px] p-5 text-base rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-serif leading-relaxed resize-none"
              />

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-cinzel font-bold text-stone-600 dark:text-stone-400">
                    Tom:
                  </span>
                  {HUMORES.map((h) => {
                    const ativo = humor === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHumor(ativo ? '' : h.id)}
                        className={`text-xs px-3 py-1 rounded-lg border transition-colors cursor-pointer font-serif ${
                          ativo
                            ? 'bg-stone-900 dark:bg-amber-700 text-white border-stone-900 dark:border-amber-600 font-semibold'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  {salvando ? 'Salvando...' : 'Salvo automaticamente'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
