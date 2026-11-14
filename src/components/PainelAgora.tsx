import React, { useState } from 'react';
import { Livro, Progresso, Relacao } from '../types';
import { CORES_AREAS, ESTIMATIVAS_HORAS, EX_LIBRIS_NIVEIS } from '../constants/theme';
import {
  BookOpen,
  Sparkles,
  AlertCircle,
  Clock,
  Settings,
  Calendar,
  ArrowUpRight,
  CheckCheck,
  Minus,
  Plus,
  Compass
} from 'lucide-react';

interface PainelAgoraProps {
  livros: Livro[];
  progressos: Record<number, Progresso>;
  relacoes: Relacao[];
  horasPorSemana: number;
  avisoLeituraSimultanea: string | null;
  onSelecionarLivro: (id: number) => void;
  onAlterarHorasPorSemana: (horas: number) => void;
}

export const PainelAgora: React.FC<PainelAgoraProps> = ({
  livros,
  progressos,
  relacoes,
  horasPorSemana,
  avisoLeituraSimultanea,
  onSelecionarLivro,
  onAlterarHorasPorSemana
}) => {
  const [configAberto, setConfigAberto] = useState(false);

  // Livros em andamento
  const emAndamento = livros.filter((l) => progressos[l.id]?.estado === 'lendo');

  // Lógica de sugestão do próximo livro conforme Seção 7.4:
  // "primeiro não iniciado do nível atual cuja dependência 'prepara' já foi lida"
  const nivelAtual = emAndamento.length > 0
    ? emAndamento[0].nivel
    : (livros.find((l) => progressos[l.id]?.estado !== 'lido')?.nivel || 1);

  const livrosNivelAtual = livros.filter((l) => l.nivel === nivelAtual);

  const proximoSugerido = livrosNivelAtual.find((livro) => {
    const estado = progressos[livro.id]?.estado;
    if (estado !== 'nao_iniciado') return false;

    const deps = relacoes.filter((r) => r.para === livro.id && r.tipo === 'prepara');
    if (deps.length === 0) return true;

    return deps.every((d) => progressos[d.de]?.estado === 'lido');
  }) || livrosNivelAtual.find((livro) => progressos[livro.id]?.estado === 'nao_iniciado');

  // Total de livros lidos
  const totalLidos = livros.filter((l) => progressos[l.id]?.estado === 'lido').length;
  const pctConcluido = Math.round((totalLidos / (livros.length || 1)) * 100);
  const lidosNoNivelAtual = livrosNivelAtual.filter((l) => progressos[l.id]?.estado === 'lido').length;

  // Cálculo de estimativa de horas para os livros restantes
  const livrosRestantes = livros.filter((l) => progressos[l.id]?.estado !== 'lido');
  let horasMin = 0;
  let horasMax = 0;
  let horasMedia = 0;

  livrosRestantes.forEach((l) => {
    const est = ESTIMATIVAS_HORAS[l.classe];
    horasMin += est.min;
    horasMax += est.max;
    horasMedia += est.media;
  });

  const semanasProjetadas = Math.ceil(horasMedia / (horasPorSemana || 6));
  const mesesProjetados = (semanasProjetadas / 4.3).toFixed(1);
  const exLibrisAtual = EX_LIBRIS_NIVEIS[nivelAtual];

  return (
    <section
      aria-label="Mesa de Leitura Atual e Ritmo Intelectual"
      className="surface-parchment rounded-2xl p-4 sm:p-6 mb-6 shadow-2xs transition-all"
    >
      {/* Cabeçalho Editorial Compacto da Mesa de Estudos */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-900/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 font-cinzel font-bold text-xs border border-amber-700/20 dark:border-amber-500/25">
            {exLibrisAtual?.romano || nivelAtual}
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              Mesa de Leitura &amp; Orientação do Cânone
            </h2>
            <p className="text-[11px] font-serif italic text-stone-500 dark:text-stone-400 hidden sm:block">
              {exLibrisAtual?.titulo} — “{exLibrisAtual?.lema}”
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs tabular-nums">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300">
            <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="font-serif">Nível {nivelAtual}:</span>
            <strong className="font-mono font-bold text-stone-900 dark:text-stone-100">
              {lidosNoNivelAtual}/{livrosNivelAtual.length}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300">
            <span className="font-serif">Acervo Lido:</span>
            <strong className="font-mono font-bold text-amber-800 dark:text-amber-300">
              {totalLidos}/{livros.length} ({pctConcluido}%)
            </strong>
          </div>
        </div>
      </div>

      {/* Aviso Suave de Leitura Simultânea (>1 OBRA e >1 MAPA) */}
      {avisoLeituraSimultanea && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-serif leading-snug">{avisoLeituraSimultanea}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
        {/* Coluna 1: O Que Estou Lendo Agora */}
        <div className="surface-editorial rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`${
                    emAndamento.length > 0 ? 'animate-ping bg-amber-400' : 'bg-stone-300 dark:bg-stone-700'
                  } absolute inline-flex h-full w-full rounded-full opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    emAndamento.length > 0 ? 'bg-amber-600' : 'bg-stone-400 dark:bg-stone-600'
                  }`}
                />
              </span>
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Em Leitura Atual</span>
            </h3>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 tabular-nums">
              {emAndamento.length} {emAndamento.length === 1 ? 'obra ativa' : 'obras ativas'}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {emAndamento.length === 0 ? (
              <div className="text-center py-5 px-3 space-y-2 rounded-xl bg-stone-50/70 dark:bg-stone-900/40 border border-dashed border-stone-200 dark:border-stone-800">
                <BookOpen className="w-7 h-7 mx-auto text-stone-400 dark:text-stone-600 stroke-[1.5]" />
                <p className="text-xs text-stone-600 dark:text-stone-400 font-serif leading-relaxed">
                  Nenhuma obra em leitura ativa no momento.
                </p>
                {proximoSugerido && (
                  <button
                    type="button"
                    onClick={() => onSelecionarLivro(proximoSugerido.id)}
                    className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg text-[11px] font-cinzel font-bold text-amber-900 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200/70 dark:hover:bg-amber-900/60 border border-amber-300/70 dark:border-amber-800 transition-colors cursor-pointer"
                  >
                    <span>Examinar #{proximoSugerido.id} ({proximoSugerido.titulo})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {emAndamento.map((livro) => {
                  const cores = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
                  const prog = progressos[livro.id];
                  return (
                    <div
                      key={livro.id}
                      onClick={() => onSelecionarLivro(livro.id)}
                      className="group/card relative p-3 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-800/90 hover:border-amber-500/70 dark:hover:border-amber-500/60 cursor-pointer transition-all duration-200 flex items-center gap-3.5"
                    >
                      <div className="w-13 h-19 sm:w-14 sm:h-20 shrink-0 rounded-md overflow-hidden shadow-book border border-black/15 dark:border-stone-700/60 relative bg-stone-200 dark:bg-stone-800">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 pointer-events-none bg-gradient-to-r from-black/35 to-transparent z-10" />
                        {livro.capa_url ? (
                          <img src={livro.capa_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full text-[8px] p-1.5 text-white font-cinzel font-bold flex flex-col justify-between"
                            style={{ backgroundColor: cores.hex }}
                          >
                            <span className="tabular-nums">#{livro.id}</span>
                            <span className="truncate">{livro.classe}</span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span
                            className="font-cinzel font-bold uppercase text-white px-1.5 py-0.5 rounded text-[9px] tracking-wide"
                            style={{ backgroundColor: cores.hex }}
                          >
                            {livro.classe}
                          </span>
                          <span className="text-stone-500 dark:text-stone-400 truncate uppercase text-[9px] font-semibold tracking-wider">
                            {livro.area}
                          </span>
                          <span className="ml-auto font-mono text-[10px] text-stone-400 dark:text-stone-500 tabular-nums">
                            #{livro.id}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover/card:text-amber-800 dark:group-hover/card:text-amber-300 transition-colors mt-1 leading-snug">
                          {livro.titulo}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 truncate italic font-serif">
                          {livro.autor}
                        </p>
                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-stone-200/60 dark:border-stone-800/80 text-[10px] text-stone-500 dark:text-stone-400">
                          {prog?.data_inicio ? (
                            <span className="flex items-center gap-1 font-mono tabular-nums">
                              <Calendar className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                              Desde {new Date(prog.data_inicio).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="font-serif italic">Leitura em curso</span>
                          )}
                          <span className="inline-flex items-center gap-0.5 font-cinzel font-bold text-amber-800 dark:text-amber-300 group-hover/card:translate-x-0.5 transition-transform">
                            Abrir Ficha <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Sugestão do Próximo Livro */}
        <div className="surface-editorial rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Próximo Sugerido pelo Grafo</span>
            </h3>
            <span className="text-[10px] font-cinzel text-amber-900 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80">
              Ordem Dialética
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {proximoSugerido ? (
              (() => {
                const cores = CORES_AREAS[proximoSugerido.area] || CORES_AREAS['Filosofia'];
                return (
                  <div
                    onClick={() => onSelecionarLivro(proximoSugerido.id)}
                    className="group/card relative p-3 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-800/90 hover:border-amber-500/70 dark:hover:border-amber-500/60 cursor-pointer transition-all duration-200 flex items-center gap-3.5"
                  >
                    <div className="w-13 h-19 sm:w-14 sm:h-20 shrink-0 rounded-md overflow-hidden shadow-book border border-black/15 dark:border-stone-700/60 relative bg-stone-200 dark:bg-stone-800">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 pointer-events-none bg-gradient-to-r from-black/35 to-transparent z-10" />
                      {proximoSugerido.capa_url ? (
                        <img src={proximoSugerido.capa_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full text-[8px] p-1.5 text-white font-cinzel font-bold flex flex-col justify-between"
                          style={{ backgroundColor: cores.hex }}
                        >
                          <span className="tabular-nums">#{proximoSugerido.id}</span>
                          <span className="truncate">{proximoSugerido.classe}</span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span
                          className="font-cinzel font-bold uppercase text-white px-1.5 py-0.5 rounded text-[9px] tracking-wide"
                          style={{ backgroundColor: cores.hex }}
                        >
                          {proximoSugerido.classe}
                        </span>
                        <span className="text-stone-500 dark:text-stone-400 truncate uppercase text-[9px] font-semibold tracking-wider">
                          {proximoSugerido.area}
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-stone-400 dark:text-stone-500 tabular-nums">
                          #{proximoSugerido.id}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover/card:text-amber-800 dark:group-hover/card:text-amber-300 transition-colors mt-1 leading-snug">
                        {proximoSugerido.titulo}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 truncate italic font-serif">
                        {proximoSugerido.autor}
                      </p>

                      {proximoSugerido.por_que_antes_do_proximo && (
                        <div className="mt-1.5 pl-2.5 py-1 border-l-2 border-amber-600/70 bg-amber-50/70 dark:bg-amber-950/30 rounded-r text-[10.5px] font-serif italic text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
                          “{proximoSugerido.por_que_antes_do_proximo}”
                        </div>
                      )}
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover/card:text-amber-600 dark:text-stone-500 dark:group-hover/card:text-amber-400 shrink-0 self-center transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-6 px-3 space-y-2 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <CheckCheck className="w-7 h-7 mx-auto text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs text-stone-700 dark:text-stone-300 italic font-serif">
                  Todas as obras planejadas deste nível foram concluídas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Ritmo & Projeção Sóbria (Ledger Tipográfico) */}
        <div className="surface-editorial rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Ritmo &amp; Projeção Sóbria</span>
            </h3>
            <button
              type="button"
              onClick={() => setConfigAberto(!configAberto)}
              className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
              title="Ajustar horas semanais de estudo"
              aria-label="Ajustar dedicação semanal"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs tabular-nums">
            {/* Dedicação semanal com controle rápido inline */}
            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Dedicação semanal:</span>
              <div className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => onAlterarHorasPorSemana(Math.max(1, horasPorSemana - 1))}
                  className="w-5 h-5 rounded flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Reduzir 1h por semana"
                  aria-label="Reduzir horas semanais"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100 px-1.5 text-[11px]">
                  {horasPorSemana}h/sem
                </span>
                <button
                  type="button"
                  onClick={() => onAlterarHorasPorSemana(Math.min(40, horasPorSemana + 1))}
                  className="w-5 h-5 rounded flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Aumentar 1h por semana"
                  aria-label="Aumentar horas semanais"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
                <span>Progresso integral:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 font-mono text-[11px]">
                  {totalLidos} de {livros.length} obras ({pctConcluido}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200/70 dark:border-stone-700/70">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pctConcluido, 2)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Carga estimada restante:</span>
              <span className="font-mono text-stone-800 dark:text-stone-200 font-medium text-[11px]">
                {horasMin}h–{horasMax}h (~{Math.round(horasMedia)}h)
              </span>
            </div>

            {/* Cartão de Projeção Sóbria */}
            <div className="pt-1">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/90 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Horizonte Projetado
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-serif">
                    Ritmo constante ({horasPorSemana}h/sem)
                  </p>
                </div>
                <div className="text-right tabular-nums">
                  <p className="text-sm sm:text-base font-cinzel font-bold text-stone-900 dark:text-amber-200 leading-tight">
                    ~{mesesProjetados} meses
                  </p>
                  <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    ({semanasProjetadas} semanas)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {configAberto && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 text-xs flex items-center justify-between gap-3 border border-amber-300/60 dark:border-amber-800/50 animate-fadeIn">
              <label className="text-stone-800 dark:text-stone-200 font-serif">Definir horas exatas:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={horasPorSemana}
                  onChange={(e) => onAlterarHorasPorSemana(Number(e.target.value) || 6)}
                  className="w-14 p-1 rounded-lg text-center bg-white dark:bg-stone-900 font-mono text-xs border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:outline-none tabular-nums"
                />
                <span className="text-[11px] text-stone-600 dark:text-stone-400 font-mono">h/sem</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

