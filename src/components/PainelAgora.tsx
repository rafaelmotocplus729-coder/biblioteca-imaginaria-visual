import React, { useState } from 'react';
import { Livro, Progresso, Relacao } from '../types';
import { CORES_AREAS, ESTIMATIVAS_HORAS } from '../constants/theme';
import { BookOpen, Sparkles, AlertCircle, Clock, Settings } from 'lucide-react';

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
    <div className="bg-library-paper/90 dark:bg-library-darkPaper/90 backdrop-blur-md rounded-xl p-5 sm:p-6 shadow-sm border border-stone-300/80 dark:border-stone-800 mb-8 relative">
      {/* Aviso Suave de Leitura Simultânea (>1 OBRA e >1 MAPA) */}
      {avisoLeituraSimultanea && (
        <div className="mb-5 p-3 rounded bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-serif">{avisoLeituraSimultanea}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: O Que Estou Lendo Agora */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-500" />
              Lendo Agora ({emAndamento.length})
            </h3>
            <span className="text-[11px] font-cinzel text-stone-500">Nível {nivelAtual}</span>
          </div>

          {emAndamento.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-stone-400 italic p-4 bg-stone-100/60 dark:bg-stone-900/50 rounded border border-dashed border-stone-300 dark:border-stone-800 font-serif">
              Nenhum livro em andamento no momento. Escolha uma obra na estante para iniciar sua leitura.
            </p>
          ) : (
            <div className="space-y-3">
              {emAndamento.map((livro) => {
                const cores = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
                const prog = progressos[livro.id];
                return (
                  <div
                    key={livro.id}
                    onClick={() => onSelecionarLivro(livro.id)}
                    className="group relative p-3 rounded-lg border border-amber-400/60 dark:border-amber-700/60 bg-gradient-to-r from-amber-50/60 via-library-paper to-amber-50/30 dark:from-amber-950/30 dark:via-library-darkPaper dark:to-stone-900/40 hover:border-amber-500 cursor-pointer transition-all duration-200 shadow-sm flex items-start gap-3.5"
                  >
                    {/* Mini livro com lombada */}
                    <div className="w-12 h-16 shrink-0 rounded overflow-hidden shadow-book border border-black/10 relative bg-stone-200 dark:bg-stone-800">
                      <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none bg-gradient-to-r from-black/35 to-transparent z-10" />
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
                          className="font-cinzel font-bold uppercase text-white px-1.5 py-0.2 rounded shadow-2xs"
                          style={{ backgroundColor: cores.hex }}
                        >
                          {livro.classe}
                        </span>
                        <span className="text-stone-500 truncate uppercase text-[9px] font-medium">{livro.area}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors mt-0.5">
                        {livro.titulo}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 truncate italic font-serif">
                        {livro.autor}
                      </p>
                      {prog?.data_inicio && (
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-mono">
                          Iniciado: {new Date(prog.data_inicio).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna 2: Sugestão do Próximo Livro */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Próximo Sugerido (Regra do Grafo)
            </h3>
            <span className="text-[10px] font-cinzel text-stone-400">Sequência Natural</span>
          </div>

          {proximoSugerido ? (
            (() => {
              const cores = CORES_AREAS[proximoSugerido.area] || CORES_AREAS['Filosofia'];
              return (
                <div
                  onClick={() => onSelecionarLivro(proximoSugerido.id)}
                  className="group relative p-3 rounded-lg border border-stone-300/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 hover:border-amber-500/80 cursor-pointer transition-all duration-200 shadow-sm flex items-start gap-3.5"
                >
                  <div className="w-12 h-16 shrink-0 rounded overflow-hidden shadow-book border border-black/10 relative bg-stone-200 dark:bg-stone-800">
                    <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none bg-gradient-to-r from-black/35 to-transparent z-10" />
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
                        className="font-cinzel font-bold uppercase text-white px-1.5 py-0.2 rounded shadow-2xs"
                        style={{ backgroundColor: cores.hex }}
                      >
                        {proximoSugerido.classe}
                      </span>
                      <span className="text-stone-500 truncate uppercase text-[9px] font-medium">{proximoSugerido.area}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors mt-0.5">
                      {proximoSugerido.titulo}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 truncate italic font-serif">
                      {proximoSugerido.autor}
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 italic line-clamp-2 mt-1.5 font-serif leading-tight">
                      "{proximoSugerido.por_que_antes_do_proximo}"
                    </p>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-xs text-stone-500 italic p-4 bg-stone-100/60 dark:bg-stone-900/50 rounded border border-dashed border-stone-300 dark:border-stone-800 font-serif">
              Você completou todas as obras planejadas deste nível!
            </p>
          )}
        </div>

        {/* Coluna 3: Ritmo e Estimativa de Horas (Seção 7.4) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              Ritmo & Projeção Sóbria
            </h3>
            <button
              onClick={() => setConfigAberto(!configAberto)}
              className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              title="Configurar horas de leitura semanal"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-300/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-2 text-xs">
            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Dedicação semanal:</span>
              <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                {horasPorSemana} h / semana
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Obras restantes:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100 font-cinzel">
                {livrosRestantes.length} de {livros.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400 font-serif">
              <span>Estimativa total restante:</span>
              <span className="font-mono text-stone-900 dark:text-stone-100">
                {horasMin}h – {horasMax}h (~{Math.round(horasMedia)}h)
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-amber-800 dark:text-amber-400 font-cinzel font-semibold">
              <span>Horizonte projetado:</span>
              <span>~{mesesProjetados} meses ({semanasProjetadas} sem.)</span>
            </div>
          </div>

          {configAberto && (
            <div className="p-2.5 rounded bg-stone-100 dark:bg-stone-800 text-xs flex items-center gap-3 border border-stone-300 dark:border-stone-700">
              <label className="text-stone-600 dark:text-stone-400 font-serif">Ajustar horas/sem:</label>
              <input
                type="number"
                min={1}
                max={40}
                value={horasPorSemana}
                onChange={(e) => onAlterarHorasPorSemana(Number(e.target.value) || 6)}
                className="w-16 p-1 border rounded text-center bg-white dark:bg-stone-900 font-mono text-xs border-stone-300 dark:border-stone-700 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
