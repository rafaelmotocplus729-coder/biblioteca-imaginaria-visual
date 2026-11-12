import React, { useState, useEffect, useMemo } from 'react';
import { CheckoutSemanal, DiaLog } from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import {
  CheckCircle2,
  TrendingUp,
  Heart,
  BarChart3,
  Check
} from 'lucide-react';

interface CheckoutSemanalViewProps {
  checkout: CheckoutSemanal;
  diasDaSemana: DiaLog[];
  onIniciarProximaSemana?: () => void;
}

export const CheckoutSemanalView: React.FC<CheckoutSemanalViewProps> = ({
  checkout,
  diasDaSemana,
  onIniciarProximaSemana
}) => {
  const { salvarCheckoutSemanal } = useBibliotecaStore();

  const [balancoBom, setBalancoBom] = useState(checkout.balancoBom);
  const [balancoRuim, setBalancoRuim] = useState(checkout.balancoRuim);
  const [concluido, setConcluido] = useState(checkout.concluido);
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  useEffect(() => {
    setBalancoBom(checkout.balancoBom);
    setBalancoRuim(checkout.balancoRuim);
    setConcluido(checkout.concluido);
  }, [checkout]);

  // Estatísticas automáticas agregadas dos dias da semana
  const stats = useMemo(() => {
    let concluidas = 0;
    let migradas = 0;
    let canceladas = 0;
    let pendentes = 0;
    let totalNotas = 0;
    let diasRevisados = 0;

    diasDaSemana.forEach((d) => {
      if (d.revisado) diasRevisados++;
      d.itens.forEach((it) => {
        if (it.tipo === 'nota') {
          totalNotas++;
        } else {
          if (it.estado === 'concluido') concluidas++;
          else if (it.estado === 'migrado') migradas++;
          else if (it.estado === 'cancelado') canceladas++;
          else if (it.estado === 'pendente') pendentes++;
        }
      });
    });

    const totalTarefas = concluidas + migradas + canceladas + pendentes;
    const taxaConclusao = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0;

    return {
      totalTarefas,
      concluidas,
      migradas,
      canceladas,
      pendentes,
      totalNotas,
      diasRevisados,
      taxaConclusao
    };
  }, [diasDaSemana]);

  const handleSalvar = (fechar = false) => {
    const atualizado: CheckoutSemanal = {
      ...checkout,
      balancoBom,
      balancoRuim,
      concluido: fechar ? true : concluido,
      dataFechamento: fechar ? new Date().toISOString() : checkout.dataFechamento
    };
    salvarCheckoutSemanal(atualizado);
    setConcluido(fechar ? true : concluido);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2500);

    if (fechar && onIniciarProximaSemana) {
      onIniciarProximaSemana();
    }
  };

  return (
    <div className="card-fichario rounded-3xl p-5 sm:p-8 border border-stone-300/90 dark:border-stone-800 shadow-sm space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="border-b border-stone-200/90 dark:border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
              Módulo 7 · Fechamento do Ciclo
            </span>
            <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-400">
              Página {checkout.paginaNumero}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1.5">
            Checkout Semanal & Balanço Sincero
          </h3>
          <p className="text-xs text-stone-500 font-serif mt-0.5">
            Fechamento do ciclo semanal: analisar o que deu certo, onde apertou e consolidar o aprendizado.
          </p>
        </div>

        {concluido && (
          <span className="vintage-stamp-reviewed">
            ✓ Semana Concluída
          </span>
        )}
      </div>

      {/* PAINEL DE ESTATÍSTICAS AUTOMÁTICAS (Módulo 7.2) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-cinzel font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-amber-700" />
            Estatísticas Automáticas do Caderno
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
            {stats.taxaConclusao}% de Eficácia
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
            <div className="text-[10px] uppercase font-bold text-stone-500">Concluídas (X)</div>
            <div className="text-xl font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {stats.concluidas}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
            <div className="text-[10px] uppercase font-bold text-stone-500">Migradas (→)</div>
            <div className="text-xl font-serif font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              {stats.migradas}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
            <div className="text-[10px] uppercase font-bold text-stone-500">Canceladas (—)</div>
            <div className="text-xl font-serif font-bold text-stone-500 mt-0.5">
              {stats.canceladas}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
            <div className="text-[10px] uppercase font-bold text-stone-500">Notas / Ideias (-)</div>
            <div className="text-xl font-serif font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
              {stats.totalNotas}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-serif">
          <span>Dias revisados nesta semana: <strong>{stats.diasRevisados} de {diasDaSemana.length} dias</strong></span>
          <span>Total de ações processadas: <strong>{stats.totalTarefas} tarefas</strong></span>
        </div>
      </div>

      {/* BALANÇO EM DUAS COLUNAS: O QUE DEU CERTO VS O QUE DEU ERRADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* O que deu certo */}
        <div className="space-y-2">
          <label className="text-xs font-cinzel font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>O que funcionou bem?</span>
          </label>
          <textarea
            rows={5}
            value={balancoBom}
            onChange={(e) => setBalancoBom(e.target.value)}
            placeholder="Quais hábitos se mantiveram? Quais momentos de leitura foram prazerosos? O que valeu a pena?"
            className="w-full p-3.5 text-xs rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* O que deu errado */}
        <div className="space-y-2">
          <label className="text-xs font-cinzel font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span>O que deu errado? ("Abrir o coração")</span>
          </label>
          <textarea
            rows={5}
            value={balancoRuim}
            onChange={(e) => setBalancoRuim(e.target.value)}
            placeholder="Onde o cansaço pesou? Que distrações roubaram tempo? O que precisa ser ajustado na semana que vem sem culpa?"
            className="w-full p-3.5 text-xs rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {/* Rodapé com Fechamento da Semana */}
      <div className="pt-4 border-t border-stone-200/90 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {salvoFeedback && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Checkout salvo com sucesso!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleSalvar(false)}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-cinzel font-semibold transition"
          >
            Salvar Reflexão
          </button>

          <button
            type="button"
            onClick={() => handleSalvar(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-cinzel font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>Concluir Checkout & Fechar Ciclo Semanal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
