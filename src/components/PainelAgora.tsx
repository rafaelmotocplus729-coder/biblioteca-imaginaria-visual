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
    <section aria-label="Painel de leitura atual e ritmo" className="bg-gradient-to-b from-stone-50/95 via-stone-50/80 to-stone-100/90 dark:from-[#17181c]/95 dark:via-[#151619]/90 dark:to-[#121316]/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-md border border-amber-900/15 dark:border-amber-500/20 mb-8 relative ring-1 ring-black/5 dark:ring-white/5 transition-all">
      {/* Aviso Suave de Leitura Simultânea (>1 OBRA e >1 MAPA) */}
      {avisoLeituraSimultanea && (
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-3 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-serif leading-snug">{avisoLeituraSimultanea}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
        {/* Coluna 1: O Que Estou Lendo Agora */}
        <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#18191d]/95 border border-stone-200/90 dark:border-stone-800/90 shadow-2xs hover:shadow-xs transition-all space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 opacity-80" />
          
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Lendo Agora ({emAndamento.length})</span>
            </h3>
            <span className="text-[10px] font-cinzel font-bold px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 shadow-2xs">
              Nível {nivelAtual}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {emAndamento.length === 0 ? (
              <div className="text-center py-6 px-3 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700 stroke-[1.5]" />
                <p className="text-xs text-stone-500 dark:text-stone-400 italic font-serif leading-relaxed">
                  Sua mesa de leitura está livre no momento. Selecione uma obra na estante para iniciar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {emAndamento.map((livro) => {
                  const cores = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
                  const prog = progressos[livro.id];
                  return (
                    <div
                      key={livro.id}
                      onClick={() => onSelecionarLivro(livro.id)}
                      className="group/card relative p-3 sm:p-3.5 rounded-2xl border border-amber-400/60 dark:border-amber-600/40 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-stone-800/90 dark:via-stone-800/70 dark:to-stone-900/90 hover:border-amber-500 dark:hover:border-amber-400 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md flex items-center gap-3 sm:gap-3.5"
                    >
                      {/* Miniatura do livro com proporção e lombada refinada */}
                      <div className="w-14 h-20 sm:w-16 sm:h-24 shrink-0 rounded-lg overflow-hidden shadow-book border border-black/15 dark:border-stone-700/60 relative bg-stone-200 dark:bg-stone-800 group-hover/card:scale-105 transition-transform duration-200">
                        <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />
                        {livro.capa_url ? (
                          <img src={livro.capa_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full text-[8px] p-1.5 text-white font-cinzel font-bold flex flex-col justify-between"
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
                            className="font-cinzel font-bold uppercase text-white px-2 py-0.5 rounded shadow-2xs text-[9px] tracking-wide"
                            style={{ backgroundColor: cores.hex }}
                          >
                            {livro.classe}
                          </span>
                          <span className="text-stone-500 dark:text-stone-400 truncate uppercase text-[9px] font-semibold tracking-wider">
                            {livro.area}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm sm:text-[15px] text-stone-900 dark:text-stone-100 truncate group-hover/card:text-amber-800 dark:group-hover/card:text-amber-300 transition-colors mt-1 leading-snug">
                          {livro.titulo}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 truncate italic font-serif">
                          {livro.autor}
                        </p>
                        {prog?.data_inicio && (
                          <div className="flex items-center gap-1 text-[10.5px] text-stone-500 dark:text-stone-400 mt-1 font-mono">
                            <Calendar className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                            <span>Iniciado: {new Date(prog.data_inicio).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>

                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover/card:text-amber-600 dark:text-stone-600 dark:group-hover/card:text-amber-400 shrink-0 self-center transition-all group-hover/card:translate-x-0.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Sugestão do Próximo Livro */}
        <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#18191d]/95 border border-stone-200/90 dark:border-stone-800/90 shadow-2xs hover:shadow-xs transition-all space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-600 opacity-80" />

          <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Próximo Sugerido (Regra do Grafo)</span>
            </h3>
            <span className="text-[10px] font-cinzel text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
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
                    className="group/card relative p-3 sm:p-3.5 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-gradient-to-br from-stone-50/60 via-white to-stone-50/40 dark:from-stone-800/80 dark:via-stone-800/60 dark:to-stone-900/80 hover:border-amber-500/80 dark:hover:border-amber-400/80 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md flex items-center gap-3 sm:gap-3.5"
                  >
                    <div className="w-14 h-20 sm:w-16 sm:h-24 shrink-0 rounded-lg overflow-hidden shadow-book border border-black/15 dark:border-stone-700/60 relative bg-stone-200 dark:bg-stone-800 group-hover/card:scale-105 transition-transform duration-200">
                      <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />
                      {proximoSugerido.capa_url ? (
                        <img src={proximoSugerido.capa_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full text-[8px] p-1.5 text-white font-cinzel font-bold flex flex-col justify-between"
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
                          className="font-cinzel font-bold uppercase text-white px-2 py-0.5 rounded shadow-2xs text-[9px] tracking-wide"
                          style={{ backgroundColor: cores.hex }}
                        >
                          {proximoSugerido.classe}
                        </span>
                        <span className="text-stone-500 dark:text-stone-400 truncate uppercase text-[9px] font-semibold tracking-wider">
                          {proximoSugerido.area}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm sm:text-[15px] text-stone-900 dark:text-stone-100 truncate group-hover/card:text-amber-800 dark:group-hover/card:text-amber-300 transition-colors mt-1 leading-snug">
                        {proximoSugerido.titulo}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 truncate italic font-serif">
                        {proximoSugerido.autor}
                      </p>

                      {/* Marginalia de justificativa dialética */}
                      {proximoSugerido.por_que_antes_do_proximo && (
                        <div className="mt-1.5 pl-2.5 py-1 border-l-2 border-amber-600/80 bg-amber-500/10 dark:bg-amber-500/15 rounded-r text-[10.5px] font-serif italic text-stone-800 dark:text-stone-200 line-clamp-2 leading-relaxed shadow-2xs">
                          “{proximoSugerido.por_que_antes_do_proximo}”
                        </div>
                      )}
                    </div>

                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover/card:text-amber-600 dark:text-stone-600 dark:group-hover/card:text-amber-400 shrink-0 self-center transition-all group-hover/card:translate-x-0.5" />
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-6 px-3 space-y-2">
                <CheckCheck className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="text-xs text-stone-600 dark:text-stone-400 italic font-serif">
                  Parabéns! Todas as obras planejadas deste nível foram concluídas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Ritmo e Estimativa de Horas (Seção 7.4) */}
        <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#18191d]/95 border border-stone-200/90 dark:border-stone-800/90 shadow-2xs hover:shadow-xs transition-all space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-stone-400 to-amber-700 opacity-80" />

          <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-stone-800/80">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Ritmo & Projeção Sóbria</span>
            </h3>
            <button
              onClick={() => setConfigAberto(!configAberto)}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
              title="Configurar dedicação semanal"
              aria-label="Ajustar dedicação semanal"
            >
              <Settings className="w-3.5 h-3.5 hover:rotate-45 transition-transform" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Dedicação semanal:</span>
              <span className="font-bold font-mono text-stone-900 dark:text-stone-100 bg-amber-50 dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 px-2 py-0.5 rounded-md">
                {horasPorSemana} h / semana
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
                <span>Obras concluídas:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 font-cinzel">
                  {totalLidos} de {livros.length} ({pctConcluido}%)
                </span>
              </div>
              {/* Barra de progresso com design nobre */}
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-200/80 dark:border-stone-700/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 rounded-full transition-all duration-500 shadow-2xs"
                  style={{ width: `${Math.max(pctConcluido, 3)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Estimativa total restante:</span>
              <span className="font-mono text-stone-800 dark:text-stone-200 font-medium">
                {horasMin}h – {horasMax}h (~{Math.round(horasMedia)}h)
              </span>
            </div>

            {/* Cartão de Projeção Sóbria Nobre e Destacado */}
            <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50/20 dark:from-amber-950/50 dark:via-amber-900/30 dark:to-transparent border border-amber-400/50 dark:border-amber-600/40 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Horizonte Projetado
                </p>
                <p className="text-[10.5px] text-stone-600 dark:text-stone-400 font-serif">
                  Leitura consistente
                </p>
              </div>
              <div className="text-right">
                <p className="text-base font-cinzel font-bold text-amber-950 dark:text-amber-200">
                  ~{mesesProjetados} meses
                </p>
                <p className="text-[10px] font-mono text-amber-800 dark:text-amber-400 font-semibold">
                  {semanasProjetadas} semanas
                </p>
              </div>
            </div>
          </div>

          {configAberto && (
            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-xs flex items-center justify-between gap-3 border border-amber-500/30 animate-fadeIn">
              <label className="text-stone-800 dark:text-stone-200 font-serif font-medium">Ajustar dedicação:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={horasPorSemana}
                  onChange={(e) => onAlterarHorasPorSemana(Number(e.target.value) || 6)}
                  className="w-14 p-1 rounded-lg text-center bg-white dark:bg-stone-900 font-mono text-xs border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:outline-none shadow-2xs"
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
