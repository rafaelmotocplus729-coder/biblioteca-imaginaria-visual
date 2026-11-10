import React, { useState } from 'react';
import { Livro, Progresso, Relacao } from '../types';
import { CORES_AREAS, ESTIMATIVAS_HORAS } from '../constants/theme';
import { BookOpen, Sparkles, AlertCircle, Clock, Settings, Calendar, ArrowRight, CheckCheck } from 'lucide-react';

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
  // Determinamos o nível atual com base nos livros em andamento ou no primeiro livro não lido
  const nivelAtual = emAndamento.length > 0
    ? emAndamento[0].nivel
    : (livros.find((l) => progressos[l.id]?.estado !== 'lido')?.nivel || 1);

  const livrosNivelAtual = livros.filter((l) => l.nivel === nivelAtual);

  const proximoSugerido = livrosNivelAtual.find((livro) => {
    const estado = progressos[livro.id]?.estado;
    if (estado !== 'nao_iniciado') return false;

    // Achar relações que preparam este livro
    const deps = relacoes.filter((r) => r.para === livro.id && r.tipo === 'prepara');
    if (deps.length === 0) return true; // Se não tem dependência anterior no nível

    // Se tiver dependência, todas devem estar lidas
    return deps.every((d) => progressos[d.de]?.estado === 'lido');
  }) || livrosNivelAtual.find((livro) => progressos[livro.id]?.estado === 'nao_iniciado');

  // Total de livros lidos
  const totalLidos = livros.filter((l) => progressos[l.id]?.estado === 'lido').length;
  const pctConcluido = Math.round((totalLidos / (livros.length || 1)) * 100);

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

  return (
    <section aria-label="Painel de leitura atual e ritmo" className="bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200/90 dark:border-stone-800/90 mb-8 relative">
      {/* Aviso Suave de Leitura Simultânea (>1 OBRA e >1 MAPA) */}
      {avisoLeituraSimultanea && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-serif leading-snug">{avisoLeituraSimultanea}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
        {/* Coluna 1: O Que Estou Lendo Agora */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              Lendo Agora ({emAndamento.length})
            </h3>
            <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300/40 dark:border-amber-700/40">
              Nível {nivelAtual}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {emAndamento.length === 0 ? (
              <div className="text-center py-5 px-3 space-y-2">
                <BookOpen className="w-7 h-7 mx-auto text-stone-300 dark:text-stone-700 stroke-[1.5]" />
                <p className="text-xs text-stone-500 dark:text-stone-400 italic font-serif leading-relaxed">
                  Sua mesa de leitura está livre no momento. Selecione uma obra na estante para iniciar.
                </p>
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
                      className="group relative p-3 rounded-xl border border-amber-400/50 dark:border-amber-700/50 bg-white/90 dark:bg-stone-800/90 hover:border-amber-500 dark:hover:border-amber-400 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs flex items-start gap-3"
                    >
                      {/* Miniatura do livro */}
                      <div className="w-12 h-16 shrink-0 rounded overflow-hidden shadow-book border border-black/10 relative bg-stone-200 dark:bg-stone-800">
                        <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none bg-gradient-to-r from-black/40 to-transparent z-10" />
                        {livro.capa_url ? (
                          <img src={livro.capa_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full text-[8px] p-1 text-white font-cinzel font-bold flex flex-col justify-between"
                            style={{ backgroundColor: cores.hex }}
                          >
                            <span>#{livro.id}</span>
                            <span className="truncate">{livro.classe}</span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span
                            className="font-cinzel font-bold uppercase text-white px-1.5 py-0.2 rounded shadow-2xs text-[9px]"
                            style={{ backgroundColor: cores.hex }}
                          >
                            {livro.classe}
                          </span>
                          <span className="text-stone-500 dark:text-stone-400 truncate uppercase text-[9px] font-semibold tracking-wide">
                            {livro.area}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors mt-0.5">
                          {livro.titulo}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 truncate italic font-serif">
                          {livro.autor}
                        </p>
                        {prog?.data_inicio && (
                          <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-mono">
                            <Calendar className="w-3 h-3 text-amber-700/70 dark:text-amber-400/70" />
                            <span>Iniciado: {new Date(prog.data_inicio).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>

                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 dark:text-stone-600 dark:group-hover:text-amber-400 shrink-0 self-center transition-colors" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Sugestão do Próximo Livro */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              Próximo Sugerido (Regra do Grafo)
            </h3>
            <span className="text-[10px] font-cinzel text-stone-500 dark:text-stone-400 font-semibold">
              Sequência Natural
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {proximoSugerido ? (
              (() => {
                const cores = CORES_AREAS[proximoSugerido.area] || CORES_AREAS['Filosofia'];
                return (
                  <div
                    onClick={() => onSelecionarLivro(proximoSugerido.id)}
                    className="group relative p-3 rounded-xl border border-stone-200/90 dark:border-stone-800/90 bg-white/90 dark:bg-stone-800/90 hover:border-amber-500/80 dark:hover:border-amber-400/80 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs flex items-start gap-3"
                  >
                    <div className="w-12 h-16 shrink-0 rounded overflow-hidden shadow-book border border-black/10 relative bg-stone-200 dark:bg-stone-800">
                      <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none bg-gradient-to-r from-black/40 to-transparent z-10" />
                      {proximoSugerido.capa_url ? (
                        <img src={proximoSugerido.capa_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full text-[8px] p-1 text-white font-cinzel font-bold flex flex-col justify-between"
                          style={{ backgroundColor: cores.hex }}
                        >
                          <span>#{proximoSugerido.id}</span>
                          <span className="truncate">{proximoSugerido.classe}</span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span
                          className="font-cinzel font-bold uppercase text-white px-1.5 py-0.2 rounded shadow-2xs text-[9px]"
                          style={{ backgroundColor: cores.hex }}
                        >
                          {proximoSugerido.classe}
                        </span>
                        <span className="text-stone-500 dark:text-stone-400 truncate uppercase text-[9px] font-semibold tracking-wide">
                          {proximoSugerido.area}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors mt-0.5">
                        {proximoSugerido.titulo}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 truncate italic font-serif">
                        {proximoSugerido.autor}
                      </p>

                      {/* Marginalia de justificativa dialética */}
                      {proximoSugerido.por_que_antes_do_proximo && (
                        <div className="mt-2 pl-2.5 py-1 border-l-2 border-amber-600/70 bg-amber-500/5 dark:bg-amber-500/10 rounded-r text-[11px] font-serif italic text-stone-700 dark:text-stone-300 line-clamp-2 leading-snug">
                          “{proximoSugerido.por_que_antes_do_proximo}”
                        </div>
                      )}
                    </div>

                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 dark:text-stone-600 dark:group-hover:text-amber-400 shrink-0 self-center transition-colors" />
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-5 px-3 space-y-2">
                <CheckCheck className="w-7 h-7 mx-auto text-emerald-500" />
                <p className="text-xs text-stone-600 dark:text-stone-400 italic font-serif">
                  Parabéns! Todas as obras planejadas deste nível foram concluídas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Ritmo e Estimativa de Horas (Seção 7.4) */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              Ritmo & Projeção Sóbria
            </h3>
            <button
              onClick={() => setConfigAberto(!configAberto)}
              className="p-1 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              title="Configurar horas de leitura semanal"
              aria-label="Ajustar dedicação semanal"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Dedicação semanal:</span>
              <span className="font-bold font-mono text-stone-900 dark:text-stone-100 bg-stone-200/50 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                {horasPorSemana} h / semana
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
                <span>Obras concluídas:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 font-cinzel">
                  {totalLidos} de {livros.length} ({pctConcluido}%)
                </span>
              </div>
              {/* Barra de progresso sutil */}
              <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-700 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.max(pctConcluido, 2)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Estimativa total restante:</span>
              <span className="font-mono text-stone-800 dark:text-stone-200">
                {horasMin}h – {horasMax}h (~{Math.round(horasMedia)}h)
              </span>
            </div>

            {/* Cartão de Projeção Sóbria Nobre */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-900/10 via-amber-800/5 to-transparent dark:from-amber-950/40 dark:via-amber-900/20 dark:to-transparent border border-amber-500/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Horizonte Projetado
                </p>
                <p className="text-[10.5px] text-stone-500 dark:text-stone-400 font-serif">
                  Leitura consistente
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-cinzel font-bold text-amber-900 dark:text-amber-200">
                  ~{mesesProjetados} meses
                </p>
                <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                  {semanasProjetadas} semanas
                </p>
              </div>
            </div>
          </div>

          {configAberto && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-xs flex items-center justify-between gap-3 border border-amber-500/30 animate-fadeIn">
              <label className="text-stone-700 dark:text-stone-300 font-serif font-medium">Ajustar horas/semana:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={horasPorSemana}
                  onChange={(e) => onAlterarHorasPorSemana(Number(e.target.value) || 6)}
                  className="w-14 p-1 rounded-md text-center bg-white dark:bg-stone-900 font-mono text-xs border border-stone-300 dark:border-stone-700 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[11px] text-stone-500">h</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
