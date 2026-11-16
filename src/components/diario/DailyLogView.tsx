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
  Plus
} from 'lucide-react';

interface DailyLogViewProps {
  dia: DiaLog;
  diaNumeroNoCiclo?: number;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  dia,
  diaNumeroNoCiclo
}) => {
  const {
    adicionarItemDiaLog,
    atualizarItemDiaLog,
    removerItemDiaLog
  } = useBibliotecaStore();

  const [modalRevisaoAberto, setModalRevisaoAberto] = useState(false);

  // Estados do formulário de entrada simples e ágil
  const [novoTexto, setNovoTexto] = useState('');
  const [novoTipo, setNovoTipo] = useState<TipoItemDaily>('tarefa');
  const [novaHora, setNovaHora] = useState('');
  const [novoUrgente, setNovoUrgente] = useState(false);

  // Edição inline de item
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);
  const [editandoTexto, setEditandoTexto] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

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
    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  };

  const handleCiclarEstado = (item: ItemDailyLog) => {
    let proximoEstado: EstadoItemDaily = 'concluido';
    if (item.estado === 'pendente') proximoEstado = 'concluido';
    else if (item.estado === 'concluido') proximoEstado = 'migrado';
    else if (item.estado === 'migrado') proximoEstado = 'cancelado';
    else if (item.estado === 'cancelado') proximoEstado = 'pendente';

    atualizarItemDiaLog(dia.data, item.id, { estado: proximoEstado });
  };

  const handleToggleUrgencia = (item: ItemDailyLog) => {
    atualizarItemDiaLog(dia.data, item.id, { urgente: !item.urgente });
  };

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
  const diaCicloFmt = diaNumeroNoCiclo ? String(diaNumeroNoCiclo).padStart(2, '0') : null;

  const renderSimboloGlifo = (item: ItemDailyLog) => {
    if (item.estado === 'concluido') {
      return (
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 select-none"
          title="Concluído (clique para alternar)"
        >
          X
        </span>
      );
    }
    if (item.estado === 'migrado') {
      return (
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 select-none"
          title="Migrado para outro dia (clique para alternar)"
        >
          →
        </span>
      );
    }
    if (item.estado === 'cancelado') {
      return (
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400 border border-stone-300 dark:border-stone-700 select-none line-through"
          title="Cancelado (clique para alternar)"
        >
          —
        </span>
      );
    }

    if (item.tipo === 'tarefa') {
      return (
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-base text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors select-none border border-stone-200 dark:border-stone-700"
          title="Tarefa pendente (clique para marcar concluído)"
        >
          •
        </span>
      );
    }
    if (item.tipo === 'compromisso') {
      return (
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors select-none border border-stone-200 dark:border-stone-700"
          title="Compromisso pendente (clique para marcar concluído)"
        >
          ○
        </span>
      );
    }
    return (
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors select-none border border-stone-200 dark:border-stone-700"
        title="Nota rápida"
      >
        -
      </span>
    );
  };

  const itensConcluidos = dia.itens.filter((i) => i.estado === 'concluido').length;
  const itensPendentes = dia.itens.filter((i) => i.estado === 'pendente').length;
  const percentualConcluido = dia.itens.length > 0 ? Math.round((itensConcluidos / dia.itens.length) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PÁGINA ESQUERDA: REGISTROS DO DIA (7/12) */}
        <section
          aria-label="Registros do Dia"
          className="lg:col-span-7 surface-editorial rounded-2xl p-5 sm:p-7 space-y-5"
        >
          {/* Cabeçalho da Página do Dia */}
          <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {diaCicloFmt && (
                  <span className="text-xs font-cinzel font-bold px-2.5 py-0.5 rounded-md bg-stone-900 text-amber-100 dark:bg-amber-800 dark:text-amber-50 tabular-nums">
                    Dia {diaCicloFmt}
                  </span>
                )}
                <span className="text-xs font-mono font-semibold text-stone-500 dark:text-stone-400 tabular-nums">
                  Página {dia.paginaNumero}
                </span>
                {dia.revisado && (
                  <span className="vintage-stamp-reviewed">
                    ✓ Revisado
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">
                {diaSemanaCap}, {diaNum} de {mesNome} de {ano}
              </h3>
            </div>

            <div className="lg:hidden shrink-0">
              <button
                type="button"
                onClick={() => setModalRevisaoAberto(true)}
                className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-amber-700 text-white text-xs font-cinzel font-bold cursor-pointer"
              >
                {dia.revisado ? 'Revisar' : 'Fechar Dia'}
              </button>
            </div>
          </div>

          {/* FLUXO SIMPLES DE INSERÇÃO RÁPIDA (Sempre visível no topo) */}
          <form
            onSubmit={handleAdicionarItem}
            className="p-3.5 sm:p-4 rounded-xl bg-[#FBF8F3] dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center bg-white dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700 gap-1">
                <button
                  type="button"
                  onClick={() => setNovoTipo('tarefa')}
                  className={`px-2.5 py-1 rounded-md text-xs font-cinzel font-bold transition-colors cursor-pointer ${
                    novoTipo === 'tarefa'
                      ? 'bg-stone-900 dark:bg-amber-700 text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  • Tarefa
                </button>
                <button
                  type="button"
                  onClick={() => setNovoTipo('compromisso')}
                  className={`px-2.5 py-1 rounded-md text-xs font-cinzel font-bold transition-colors cursor-pointer ${
                    novoTipo === 'compromisso'
                      ? 'bg-stone-900 dark:bg-amber-700 text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  ○ Evento
                </button>
                <button
                  type="button"
                  onClick={() => setNovoTipo('nota')}
                  className={`px-2.5 py-1 rounded-md text-xs font-cinzel font-bold transition-colors cursor-pointer ${
                    novoTipo === 'nota'
                      ? 'bg-stone-900 dark:bg-amber-700 text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  - Nota
                </button>
              </div>

              <div className="flex items-center gap-2">
                {novoTipo === 'compromisso' && (
                  <input
                    type="time"
                    value={novaHora}
                    onChange={(e) => setNovaHora(e.target.value)}
                    aria-label="Horário do evento"
                    className="px-2 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200"
                  />
                )}

                <button
                  type="button"
                  onClick={() => setNovoUrgente(!novoUrgente)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    novoUrgente
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-700'
                      : 'bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                  title="Marcar como prioritário (*)"
                >
                  * Prioridade
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                placeholder={
                  novoTipo === 'tarefa'
                    ? 'O que precisa ser feito hoje? (Enter para adicionar)'
                    : novoTipo === 'compromisso'
                    ? 'Qual é o compromisso ou encontro?'
                    : 'Anote um pensamento, ideia ou observação...'
                }
                aria-label="Novo registro do dia"
                className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 font-serif focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
              />

              <button
                type="submit"
                disabled={!novoTexto.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-cinzel font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* LISTA DE REGISTROS DO DIA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <span className="font-cinzel font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <span>Registros</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-mono tabular-nums text-stone-700 dark:text-stone-300">
                  {dia.itens.length}
                </span>
              </span>
              <span className="text-xs font-serif hidden sm:inline">
                Clique no símbolo à esquerda para alternar o estado
              </span>
            </div>

            {dia.itens.length === 0 ? (
              <div className="p-8 text-center text-stone-500 dark:text-stone-400 text-sm font-serif bg-[#FBF8F3] dark:bg-stone-900/40 rounded-xl border border-dashed border-stone-300 dark:border-stone-700">
                Dia em branco. Use a caixa acima para registrar tarefas (•), eventos (○) ou notas (-).
              </div>
            ) : (
              <ul className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 divide-y divide-stone-200/80 dark:divide-stone-800 max-h-[540px] overflow-y-auto custom-scrollbar">
                {dia.itens.map((item) => {
                  const isEditando = editandoItemId === item.id;

                  return (
                    <li
                      key={item.id}
                      className={`group px-3.5 py-3 transition-colors flex items-start gap-3 ${
                        item.estado === 'concluido'
                          ? 'bg-stone-50/70 dark:bg-stone-900/30 opacity-75'
                          : item.estado === 'migrado'
                          ? 'bg-amber-50/40 dark:bg-amber-950/15'
                          : item.estado === 'cancelado'
                          ? 'bg-stone-100/50 dark:bg-stone-900/20 opacity-60'
                          : 'hover:bg-[#FBF8F3]/80 dark:hover:bg-stone-800/40'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleCiclarEstado(item)}
                        className="shrink-0 cursor-pointer"
                        aria-label={`Alternar estado de ${item.texto}`}
                      >
                        {renderSimboloGlifo(item)}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleUrgencia(item)}
                        className={`pt-1 shrink-0 transition-opacity cursor-pointer ${
                          item.urgente
                            ? 'text-amber-700 dark:text-amber-400 font-bold text-sm opacity-100'
                            : 'text-stone-400 opacity-0 group-hover:opacity-100 hover:text-amber-600'
                        }`}
                        title={item.urgente ? 'Remover prioridade (*)' : 'Marcar como prioritário (*)'}
                      >
                        *
                      </button>

                      <div className="flex-1 min-w-0 pt-0.5">
                        {isEditando ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editandoTexto}
                              onChange={(e) => setEditandoTexto(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSalvarEdicao(item.id);
                                if (e.key === 'Escape') setEditandoItemId(null);
                              }}
                              className="w-full px-2.5 py-1.5 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 font-serif"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSalvarEdicao(item.id)}
                              className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 cursor-pointer"
                              aria-label="Salvar edição"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {item.hora && (
                              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shrink-0 tabular-nums">
                                {item.hora}
                              </span>
                            )}

                            <span
                              className={`text-sm font-serif leading-relaxed ${
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
                              <span className="text-xs font-mono text-amber-800 dark:text-amber-400">
                                → {item.migradoPara.split('-').reverse().slice(0, 2).join('/')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditandoItemId(item.id);
                            setEditandoTexto(item.texto);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                          title="Editar"
                          aria-label="Editar registro"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removerItemDiaLog(dia.data, item.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Excluir"
                          aria-label="Excluir registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* PÁGINA DIREITA: TERMÔMETRO AMPLO & FECHAMENTO (5/12) */}
        <aside className="lg:col-span-5 space-y-5">
          {/* Termômetro do Dia com Caixa Ampla */}
          <TermometroDiario
            dataStr={dia.data}
            termometro={dia.termometro}
            paginaNumero={dia.paginaNumero}
          />

          {/* Cartão de Fechamento & Revisão Noturna */}
          <div className="surface-editorial rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Fechamento do Dia
              </span>
              <span className="text-xs font-mono font-semibold text-stone-600 dark:text-stone-400 tabular-nums">
                {itensConcluidos} de {dia.itens.length} concluídos
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {dia.revisado ? 'Dia Revisado & Consolidado' : 'Rotina Noturna em Aberto'}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-serif leading-relaxed">
                {dia.revisado
                  ? 'Pendências triadas e histórico salvo neste caderno.'
                  : `${itensPendentes} item(ns) pendente(s). Revise, migre para o próximo dia ou finalize a jornada.`}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-stone-500 dark:text-stone-400 tabular-nums">
                <span>Progresso</span>
                <span>{percentualConcluido}%</span>
              </div>
              <div className="w-full bg-stone-200/70 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-700 dark:bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentualConcluido}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalRevisaoAberto(true)}
              className={`w-full py-2.5 px-4 rounded-xl font-cinzel font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                dia.revisado
                  ? 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700'
                  : 'bg-stone-900 dark:bg-amber-700 hover:bg-stone-800 dark:hover:bg-amber-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{dia.revisado ? 'Revisar Novamente o Dia' : 'Fechar / Revisar Dia'}</span>
            </button>
          </div>
        </aside>
      </div>

      <ModalFechamentoDia
        isOpen={modalRevisaoAberto}
        onClose={() => setModalRevisaoAberto(false)}
        dia={dia}
      />
    </div>
  );
};
