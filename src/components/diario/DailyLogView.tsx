import React, { useState, useRef } from 'react';
import {
  DiaLog,
  ItemDailyLog,
  TipoItemDaily,
  EstadoItemDaily
} from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import { TermometroDiario } from './TermometroDiario';
import { ModalFechamentoDia } from './ModalFechamentoDia';
import {
  CheckCircle2,
  Trash2,
  Edit2,
  Check,
  Send
} from 'lucide-react';

interface DailyLogViewProps {
  dia: DiaLog;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({ dia }) => {
  const {
    adicionarItemDiaLog,
    atualizarItemDiaLog,
    removerItemDiaLog
  } = useBibliotecaStore();

  const [modalRevisaoAberto, setModalRevisaoAberto] = useState(false);

  // Estados do formulário de entrada ultra-ágil
  const [novoTexto, setNovoTexto] = useState('');
  const [novoTipo, setNovoTipo] = useState<TipoItemDaily>('tarefa');
  const [novaHora, setNovaHora] = useState('');
  const [novoUrgente, setNovoUrgente] = useState(false);

  // Edição inline de item
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);
  const [editandoTexto, setEditandoTexto] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Adicionar item e manter o foco para ultra-agilidade
  const handleAdicionarItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!novoTexto.trim()) return;

    adicionarItemDiaLog(dia.data, {
      tipo: novoTipo,
      texto: novoTexto.trim(),
      hora: novoTipo === 'compromisso' && novaHora ? novaHora : undefined,
      estado: 'pendente',
      urgente: novoUrgente
    });

    setNovoTexto('');
    setNovaHora('');
    setNovoUrgente(false);
    // Manter foco no input para digitação contínua
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Ciclar estado do item ao clicar no símbolo: pendente -> concluído -> migrado -> cancelado -> pendente
  const handleCiclarEstado = (item: ItemDailyLog) => {
    let proximoEstado: EstadoItemDaily = 'concluido';
    if (item.estado === 'pendente') proximoEstado = 'concluido';
    else if (item.estado === 'concluido') proximoEstado = 'migrado';
    else if (item.estado === 'migrado') proximoEstado = 'cancelado';
    else if (item.estado === 'cancelado') proximoEstado = 'pendente';

    atualizarItemDiaLog(dia.data, item.id, { estado: proximoEstado });
  };

  // Toggle de urgência *
  const handleToggleUrgencia = (item: ItemDailyLog) => {
    atualizarItemDiaLog(dia.data, item.id, { urgente: !item.urgente });
  };

  // Salvar edição inline
  const handleSalvarEdicao = (itemId: string) => {
    if (editandoTexto.trim()) {
      atualizarItemDiaLog(dia.data, itemId, { texto: editandoTexto.trim() });
    }
    setEditandoItemId(null);
  };

  // Formatação da data por extenso
  const [ano, , diaNum] = dia.data.split('-');
  const dataObj = new Date(dia.data + 'T12:00:00');
  const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  const mesNome = dataObj.toLocaleDateString('pt-BR', { month: 'long' });
  const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  // Renderizar o glifo visual do símbolo de acordo com o tipo e estado
  const renderSimboloGlifo = (item: ItemDailyLog) => {
    if (item.estado === 'concluido') {
      return (
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs cursor-pointer select-none"
          title="Concluído (Clique para ciclar estado)"
        >
          X
        </span>
      );
    }
    if (item.estado === 'migrado') {
      return (
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs cursor-pointer select-none"
          title="Migrado para outro dia (Clique para ciclar estado)"
        >
          →
        </span>
      );
    }
    if (item.estado === 'cancelado') {
      return (
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400 border border-stone-300 dark:border-stone-700 shadow-2xs cursor-pointer select-none line-through"
          title="Cancelado (Clique para ciclar estado)"
        >
          —
        </span>
      );
    }

    // Pendente
    if (item.tipo === 'tarefa') {
      return (
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-base text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 transition cursor-pointer select-none border border-stone-200 dark:border-stone-700"
          title="Tarefa pendente (Clique para marcar X)"
        >
          •
        </span>
      );
    }
    if (item.tipo === 'compromisso') {
      return (
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 transition cursor-pointer select-none border border-stone-200 dark:border-stone-700"
          title="Compromisso pendente (Clique para marcar X)"
        >
          ○
        </span>
      );
    }
    // Nota
    return (
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-sm text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 transition cursor-pointer select-none border border-stone-200 dark:border-stone-700"
        title="Nota ou pensamento solto"
      >
        -
      </span>
    );
  };

  // Estatísticas do dia para o painel de fechamento
  const itensConcluidos = dia.itens.filter((i) => i.estado === 'concluido').length;
  const itensPendentes = dia.itens.filter((i) => i.estado === 'pendente').length;
  const percentualConcluido = dia.itens.length > 0 ? Math.round((itensConcluidos / dia.itens.length) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* ========================================================================= */}
      {/* SPREAD DE DUAS PÁGINAS DO CADERNO REAL (ABERTO EM MONITORES LARGOS - LG+) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* PÁGINA ESQUERDA: AGENDA DE REGISTROS (LG: 7/12 | XL: 8/12) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <div className="card-fichario rounded-3xl p-5 sm:p-7 border border-stone-300/90 dark:border-stone-800 shadow-sm space-y-5 bg-white/95 dark:bg-[#18191d]/95">
            {/* Cabeçalho da Página do Caderno */}
            <div className="border-b border-stone-200/90 dark:border-stone-800 pb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Daily Log
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-400">
                    Página {dia.paginaNumero}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1 flex items-center gap-2.5 flex-wrap">
                  <span>{diaSemanaCap}, {diaNum} de {mesNome} de {ano}</span>
                  {dia.revisado && (
                    <span className="vintage-stamp-reviewed">
                      ✓ Revisado
                    </span>
                  )}
                </h3>
              </div>

              {/* Botão rápido no mobile */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setModalRevisaoAberto(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-800 text-amber-100 text-xs font-cinzel font-bold shadow-sm"
                >
                  {dia.revisado ? 'Revisar' : 'Fechar Dia'}
                </button>
              </div>
            </div>

            {/* LISTA DE ITENS DO DAILY LOG */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-cinzel font-bold text-stone-700 dark:text-stone-300">
                <span className="flex items-center gap-2">
                  <span>Registros do Dia</span>
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-mono text-stone-600 dark:text-stone-300">
                    {dia.itens.length}
                  </span>
                </span>
                <span className="text-[10px] text-stone-400 font-serif font-normal hidden sm:inline">
                  Clique no símbolo à esquerda para marcar concluído (X), migrado (→) ou cancelado (—)
                </span>
              </div>

              {dia.itens.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs italic bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                  Nenhum registro ainda neste dia. Digite abaixo para adicionar rapidamente tarefas (•), eventos (○) ou notas (-).
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-0.5">
                  {dia.itens.map((item) => {
                    const isEditando = editandoItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`group p-2.5 sm:p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                          item.estado === 'concluido'
                            ? 'bg-stone-50/60 dark:bg-stone-900/20 border-stone-200/80 dark:border-stone-800/80 opacity-75'
                            : item.estado === 'migrado'
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40'
                            : item.estado === 'cancelado'
                            ? 'bg-stone-100/40 dark:bg-stone-900/20 border-stone-200/60 dark:border-stone-800/60 opacity-60'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700/80 shadow-2xs hover:border-amber-400'
                        }`}
                      >
                        {/* Símbolo Clicável para Alternar Estado */}
                        <div onClick={() => handleCiclarEstado(item)} className="pt-0.5 shrink-0">
                          {renderSimboloGlifo(item)}
                        </div>

                        {/* Urgência Asterisco (*) */}
                        <button
                          onClick={() => handleToggleUrgencia(item)}
                          className={`pt-1 shrink-0 transition ${
                            item.urgente
                              ? 'text-amber-600 dark:text-amber-400 font-bold text-sm'
                              : 'text-stone-300 dark:text-stone-700 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                          }`}
                          title={item.urgente ? 'Remover urgência (*)' : 'Marcar como urgente (*)'}
                        >
                          *
                        </button>

                        {/* Conteúdo do Item */}
                        <div className="flex-1 min-w-0">
                          {isEditando ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editandoTexto}
                                onChange={(e) => setEditandoTexto(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSalvarEdicao(item.id);
                                  if (e.key === 'Escape') setEditandoItemId(null);
                                }}
                                className="w-full p-1.5 text-xs rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 font-serif"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSalvarEdicao(item.id)}
                                className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-2 flex-wrap">
                              {item.hora && (
                                <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shrink-0">
                                  {item.hora}
                                </span>
                              )}

                              <span
                                className={`text-xs sm:text-sm font-serif leading-relaxed ${
                                  item.estado === 'concluido'
                                    ? 'line-through text-stone-500 dark:text-stone-400'
                                    : item.estado === 'cancelado'
                                    ? 'line-through text-stone-400 dark:text-stone-500'
                                    : 'text-stone-900 dark:text-stone-100'
                                }`}
                              >
                                {item.texto}
                              </span>

                              {item.migradoPara && (
                                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 italic">
                                  (migrado para {item.migradoPara.split('-').reverse().slice(0, 2).join('/')})
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Ações Rápidas (Aparecem no Hover) */}
                        <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            onClick={() => {
                              setEditandoItemId(item.id);
                              setEditandoTexto(item.texto);
                            }}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                            title="Editar texto"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removerItemDiaLog(dia.data, item.id)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Excluir item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LINHA DE ENTRADA ULTRA-ÁGIL (Input de Digitação Rápida com Enter) */}
            <form
              onSubmit={handleAdicionarItem}
              className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                {/* Seletor rápido de tipo: • Tarefa | ○ Compromisso | - Nota */}
                <div className="flex items-center bg-white dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setNovoTipo('tarefa')}
                    className={`px-2 py-1 rounded-lg text-xs font-cinzel font-bold transition ${
                      novoTipo === 'tarefa'
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                    title="Tarefa (•)"
                  >
                    • Tarefa
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovoTipo('compromisso')}
                    className={`px-2 py-1 rounded-lg text-xs font-cinzel font-bold transition ${
                      novoTipo === 'compromisso'
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                    title="Compromisso (○)"
                  >
                    ○ Evento
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovoTipo('nota')}
                    className={`px-2 py-1 rounded-lg text-xs font-cinzel font-bold transition ${
                      novoTipo === 'nota'
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                    title="Nota / Pensamento (-)"
                  >
                    - Nota
                  </button>
                </div>

                {/* Campo de Hora quando for compromisso */}
                {novoTipo === 'compromisso' && (
                  <input
                    type="time"
                    value={novaHora}
                    onChange={(e) => setNovaHora(e.target.value)}
                    className="p-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200 shrink-0"
                    title="Horário do compromisso"
                  />
                )}

                {/* Toggle de Urgência * */}
                <button
                  type="button"
                  onClick={() => setNovoUrgente(!novoUrgente)}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer shrink-0 ${
                    novoUrgente
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                      : 'bg-white dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                  title="Marcar como Urgente (*)"
                >
                  *
                </button>

                {/* Campo de Texto Principal */}
                <input
                  ref={inputRef}
                  type="text"
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                  placeholder={
                    novoTipo === 'tarefa'
                      ? 'Nova tarefa (pressione Enter para salvar)...'
                      : novoTipo === 'compromisso'
                      ? 'Novo compromisso com hora marcada...'
                      : 'Novo pensamento, nota rápida ou lembrete...'
                  }
                  className="flex-1 p-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 font-serif focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />

                <button
                  type="submit"
                  className="p-2 rounded-xl bg-amber-800 text-white hover:bg-amber-700 transition shrink-0 cursor-pointer shadow-2xs"
                  title="Adicionar à lista (Enter)"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PÁGINA DIREITA: PAINEL DE REFLEXÃO & FECHAMENTO (5/12 | 4/12) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Cartão de Fechamento & Revisão Noturna */}
          <div className="card-fichario rounded-2xl p-5 border border-stone-300/80 dark:border-stone-800 bg-white/95 dark:bg-[#18191d]/95 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-stone-800/70 pb-2.5">
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest text-amber-900 dark:text-amber-400">
                Fechamento Noturno
              </span>
              <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">
                {itensConcluidos} de {dia.itens.length} concluídos
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {dia.revisado ? 'Dia Concluído & Arquivado' : 'Rotina Noturna em Aberto'}
              </h4>
              <p className="text-xs text-stone-500 font-serif leading-relaxed">
                {dia.revisado
                  ? 'Você já revisou suas pendências e migrou itens abertos. O histórico está consolidado.'
                  : `${itensPendentes} item(ns) pendente(s). Descarregue o ruído mental do dia, migre o que restou e finalize a jornada.`}
              </p>
            </div>

            {/* Barra de Progresso do Dia */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-stone-400">
                <span>Progresso</span>
                <span>{percentualConcluido}%</span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden border border-stone-200/60 dark:border-stone-700/60">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentualConcluido}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalRevisaoAberto(true)}
              className={`w-full py-2.5 px-4 rounded-xl font-cinzel font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
                dia.revisado
                  ? 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                  : 'bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-600 text-amber-50 ring-1 ring-amber-600/30 shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{dia.revisado ? 'Revisar Novamente o Dia' : 'Fechar / Revisar Dia'}</span>
            </button>
          </div>

          {/* MÓDULO 5: O TERMÔMETRO DIÁRIO (≡) */}
          <TermometroDiario
            dataStr={dia.data}
            termometro={dia.termometro}
            paginaNumero={dia.paginaNumero}
          />

          {/* Guia Rápido dos Símbolos do Caderno Real */}
          <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 text-xs space-y-2.5">
            <span className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-stone-500 block">
              Guia Rápido de Símbolos
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-serif text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded font-bold flex items-center justify-center bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs">•</span>
                <span>Tarefa pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded font-bold flex items-center justify-center bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px]">X</span>
                <span>Concluído</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded font-bold flex items-center justify-center bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px]">→</span>
                <span>Migrado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded font-bold flex items-center justify-center bg-stone-200 dark:bg-stone-800 text-stone-500 text-[10px]">—</span>
                <span>Cancelado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded font-bold flex items-center justify-center bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs">○</span>
                <span>Compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded font-bold flex items-center justify-center bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs">-</span>
                <span>Nota rápida</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Fechamento / Revisão Noturna */}
      <ModalFechamentoDia
        isOpen={modalRevisaoAberto}
        onClose={() => setModalRevisaoAberto(false)}
        dia={dia}
      />
    </div>
  );
};
