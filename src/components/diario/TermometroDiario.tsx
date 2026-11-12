import React, { useState, useEffect } from 'react';
import { TermometroDia } from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import { Activity, Check } from 'lucide-react';

interface TermometroDiarioProps {
  dataStr: string;
  termometro?: TermometroDia;
  paginaNumero: number;
}

export const TermometroDiario: React.FC<TermometroDiarioProps> = ({
  dataStr,
  termometro,
  paginaNumero
}) => {
  const { atualizarTermometroDia, diasLogs } = useBibliotecaStore();

  const [texto, setTexto] = useState(termometro?.texto || '');
  const [humor, setHumor] = useState(termometro?.humor || '');
  const [salvando, setSalvando] = useState(false);

  // Sincronizar quando mudar a data
  useEffect(() => {
    setTexto(termometro?.texto || '');
    setHumor(termometro?.humor || '');
  }, [dataStr, termometro]);

  // Auto-save com debounce
  useEffect(() => {
    if (texto === (termometro?.texto || '') && humor === (termometro?.humor || '')) return;

    setSalvando(true);
    const timeout = setTimeout(() => {
      atualizarTermometroDia(dataStr, texto, humor);
      setSalvando(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [texto, humor, dataStr]);

  // Contar dias com termômetro preenchido nos últimos 7 dias (consistência / streak)
  const streakDias = Object.values(diasLogs).filter(
    (d) => d.termometro && d.termometro.texto.trim().length > 0
  ).length;

  const HUMORES = [
    { id: 'sereno', label: 'Sereno', cor: 'text-emerald-700 dark:text-emerald-400' },
    { id: 'focado', label: 'Focado', cor: 'text-amber-700 dark:text-amber-400' },
    { id: 'inspirado', label: 'Inspirado', cor: 'text-indigo-700 dark:text-indigo-400' },
    { id: 'cansado', label: 'Cansado', cor: 'text-stone-500' },
    { id: 'resiliente', label: 'Resiliente', cor: 'text-sky-700 dark:text-sky-400' },
    { id: 'inquieto', label: 'Inquieto', cor: 'text-rose-600 dark:text-rose-400' }
  ];

  return (
    <div className="card-fichario rounded-2xl p-4 sm:p-5 border border-stone-300/80 dark:border-stone-800 space-y-3 relative overflow-hidden transition-all">
      {/* Cabeçalho do Bloco ≡ */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center font-mono font-bold text-lg text-indigo-700 dark:text-indigo-400 shadow-2xs">
            ≡
          </span>
          <div>
            <h4 className="font-cinzel font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>Termômetro do Dia</span>
              <span className="text-[10px] text-stone-400 font-mono font-normal">
                (Pág. {paginaNumero})
              </span>
            </h4>
            <p className="text-[10.5px] text-stone-500 font-serif leading-tight">
              Medir a temperatura: desabafo, sentimentos, como o dia realmente se desenrolou.
            </p>
          </div>
        </div>

        {/* Indicador de Auto-save & Consistência */}
        <div className="flex items-center gap-2">
          {salvando ? (
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono animate-pulse">
              Salvando...
            </span>
          ) : (
            texto.trim() && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                Salvo
              </span>
            )
          )}

          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-[10px] text-amber-800 dark:text-amber-300 font-bold font-mono"
            title={`${streakDias} dias com reflexão sincera registrada no Caderno Real`}
          >
            <Activity className="w-3 h-3 text-amber-600" />
            <span>{streakDias} dias</span>
          </div>
        </div>
      </div>

      {/* Caixa de Texto Acolhedora */}
      <textarea
        rows={2}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escreva como você se sentiu hoje. Nem que seja uma única frase curta: o importante é descarregar o ruído interno sem autocensura estética..."
        className="w-full p-3 text-xs sm:text-sm rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-serif leading-relaxed resize-y"
      />

      {/* Seletores de Humor / Tom Emocional */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-cinzel font-semibold text-stone-400 mr-1">
            Tom do Dia:
          </span>
          {HUMORES.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHumor(humor === h.id ? '' : h.id)}
              className={`text-[10.5px] px-2 py-0.5 rounded-md transition cursor-pointer font-serif ${
                humor === h.id
                  ? 'bg-indigo-900 text-white font-bold dark:bg-indigo-700 shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-stone-400 font-serif italic">
          Anti-perfeccionismo: sem cobrança de formato.
        </span>
      </div>
    </div>
  );
};
