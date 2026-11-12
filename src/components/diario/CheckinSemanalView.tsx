import React, { useState, useEffect } from 'react';
import { CheckinSemanal } from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import {
  Calendar,
  Sparkles,
  Target,
  CheckCircle2,
  Plus,
  Trash2,
  Check
} from 'lucide-react';

interface CheckinSemanalViewProps {
  checkin: CheckinSemanal;
  onAvancarParaDias?: () => void;
}

export const CheckinSemanalView: React.FC<CheckinSemanalViewProps> = ({
  checkin,
  onAvancarParaDias
}) => {
  const { salvarCheckinSemanal } = useBibliotecaStore();

  const [paragrafo, setParagrafo] = useState(checkin.paragrafoIntencao);
  const [dataInicio, setDataInicio] = useState(checkin.dataInicio);
  const [dataFim, setDataFim] = useState(checkin.dataFim);

  const [tarefas, setTarefas] = useState<string[]>(checkin.focoTarefas || []);
  const [compromissos, setCompromissos] = useState<string[]>(checkin.focoCompromissos || []);
  const [metas, setMetas] = useState<string[]>(checkin.focoMetas || []);

  const [novaTarefa, setNovaTarefa] = useState('');
  const [novoCompromisso, setNovoCompromisso] = useState('');
  const [novaMeta, setNovaMeta] = useState('');

  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Sincronizar se prop checkin mudar
  useEffect(() => {
    setParagrafo(checkin.paragrafoIntencao);
    setDataInicio(checkin.dataInicio);
    setDataFim(checkin.dataFim);
    setTarefas(checkin.focoTarefas || []);
    setCompromissos(checkin.focoCompromissos || []);
    setMetas(checkin.focoMetas || []);
  }, [checkin]);

  // Salvar alterações
  const handleSalvar = (concluir = false) => {
    const atualizado: CheckinSemanal = {
      ...checkin,
      dataInicio,
      dataFim,
      paragrafoIntencao: paragrafo,
      focoTarefas: tarefas,
      focoCompromissos: compromissos,
      focoMetas: metas,
      concluido: concluir ? true : checkin.concluido
    };
    salvarCheckinSemanal(atualizado);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2500);

    if (concluir && onAvancarParaDias) {
      onAvancarParaDias();
    }
  };

  const handleAddTarefa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTarefa.trim()) return;
    setTarefas([...tarefas, novaTarefa.trim()]);
    setNovaTarefa('');
  };

  const handleAddCompromisso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCompromisso.trim()) return;
    setCompromissos([...compromissos, novoCompromisso.trim()]);
    setNovoCompromisso('');
  };

  const handleAddMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMeta.trim()) return;
    setMetas([...metas, novaMeta.trim()]);
    setNovaMeta('');
  };

  // Formatar datas
  const inicioFmt = dataInicio.split('-').reverse().slice(0, 2).join('/');
  const fimFmt = dataFim.split('-').reverse().slice(0, 2).join('/');

  return (
    <div className="card-fichario rounded-3xl p-5 sm:p-8 border border-stone-300/90 dark:border-stone-800 shadow-sm space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho da Página do Check-in */}
      <div className="border-b border-stone-200/90 dark:border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
              Módulo 3 · Ciclo Semanal Fechado
            </span>
            <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-400">
              Página {checkin.paginaNumero}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1.5">
            Check-in Semanal ({inicioFmt} a {fimFmt})
          </h3>
          <p className="text-xs text-stone-500 font-serif mt-0.5">
            Abra a semana no domingo ou segunda com intenção clara e foco delimitado.
          </p>
        </div>

        {/* Intervalo de Datas Editável */}
        <div className="flex items-center gap-2 bg-stone-100/90 dark:bg-stone-900/90 p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="bg-transparent border-none text-[11px] font-mono text-stone-700 dark:text-stone-300 p-0 focus:ring-0"
          />
          <span className="text-stone-400 text-xs">até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="bg-transparent border-none text-[11px] font-mono text-stone-700 dark:text-stone-300 p-0 focus:ring-0"
          />
        </div>
      </div>

      {/* 1. Parágrafo de Intenção */}
      <div className="space-y-2">
        <label className="text-xs font-cinzel font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>1. Parágrafo de Intenção Semanal</span>
          <span className="text-[10px] text-stone-400 font-serif font-normal">
            (O que tenho em mente e espero desta semana?)
          </span>
        </label>
        <textarea
          rows={4}
          value={paragrafo}
          onChange={(e) => setParagrafo(e.target.value)}
          placeholder="Escreva com sinceridade: qual o ritmo desejado? Quais as leituras centrais? O que evitar? O que manter?"
          className="w-full p-4 text-xs sm:text-sm rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />
      </div>

      {/* 2. Quadro de Foco (Tarefas, Compromissos, Metas) */}
      <div className="space-y-4">
        <div className="text-xs font-cinzel font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-amber-700" />
          <span>2. Quadro de Foco da Semana</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coluna A: Tarefas Prioritárias */}
          <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-stone-200/80 dark:border-stone-800 pb-2">
              <span className="w-4 h-4 rounded font-bold text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 flex items-center justify-center">
                •
              </span>
              <h4 className="font-cinzel font-bold text-xs text-stone-800 dark:text-stone-200">
                Tarefas Prioritárias
              </h4>
            </div>

            <ul className="space-y-2 text-xs">
              {tarefas.map((t, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-1.5 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-serif"
                >
                  <span className="leading-snug">{t}</span>
                  <button
                    onClick={() => setTarefas(tarefas.filter((_, i) => i !== idx))}
                    className="text-stone-400 hover:text-rose-600 shrink-0 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddTarefa} className="flex items-center gap-1.5">
              <input
                type="text"
                value={novaTarefa}
                onChange={(e) => setNovaTarefa(e.target.value)}
                placeholder="+ Adicionar tarefa..."
                className="w-full p-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder-stone-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-amber-800 text-white hover:bg-amber-700 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Coluna B: Compromissos Fixos */}
          <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-stone-200/80 dark:border-stone-800 pb-2">
              <span className="w-4 h-4 rounded font-bold text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 flex items-center justify-center">
                ○
              </span>
              <h4 className="font-cinzel font-bold text-xs text-stone-800 dark:text-stone-200">
                Compromissos Marcados
              </h4>
            </div>

            <ul className="space-y-2 text-xs">
              {compromissos.map((c, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-1.5 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-serif"
                >
                  <span className="leading-snug">{c}</span>
                  <button
                    onClick={() => setCompromissos(compromissos.filter((_, i) => i !== idx))}
                    className="text-stone-400 hover:text-rose-600 shrink-0 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddCompromisso} className="flex items-center gap-1.5">
              <input
                type="text"
                value={novoCompromisso}
                onChange={(e) => setNovoCompromisso(e.target.value)}
                placeholder="+ Adicionar compromisso..."
                className="w-full p-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder-stone-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-amber-800 text-white hover:bg-amber-700 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Coluna C: Metas & Princípios */}
          <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-stone-200/80 dark:border-stone-800 pb-2">
              <span className="w-4 h-4 rounded font-bold text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 flex items-center justify-center">
                *
              </span>
              <h4 className="font-cinzel font-bold text-xs text-stone-800 dark:text-stone-200">
                Metas & Princípios
              </h4>
            </div>

            <ul className="space-y-2 text-xs">
              {metas.map((m, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-1.5 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-serif"
                >
                  <span className="leading-snug">{m}</span>
                  <button
                    onClick={() => setMetas(metas.filter((_, i) => i !== idx))}
                    className="text-stone-400 hover:text-rose-600 shrink-0 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddMeta} className="flex items-center gap-1.5">
              <input
                type="text"
                value={novaMeta}
                onChange={(e) => setNovaMeta(e.target.value)}
                placeholder="+ Adicionar meta..."
                className="w-full p-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder-stone-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-amber-800 text-white hover:bg-amber-700 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Barra de Ações do Check-in */}
      <div className="pt-4 border-t border-stone-200/90 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {salvoFeedback && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Check-in Semanal salvo com sucesso!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleSalvar(false)}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-cinzel font-semibold transition cursor-pointer"
          >
            Salvar Rascunho
          </button>

          <button
            type="button"
            onClick={() => handleSalvar(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-cinzel font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>Confirmar Check-in & Ir para os Dias</span>
          </button>
        </div>
      </div>
    </div>
  );
};
