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
    <div className="bg-library-paper dark:bg-library-darkPaper rounded-xl p-5 shadow-sm border border-slate-200 dark:border-library-darkBorder mb-6">
      {/* Aviso Suave de Leitura Simultânea (>1 OBRA e >1 MAPA) */}
      {avisoLeituraSimultanea && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{avisoLeituraSimultanea}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: O Que Estou Lendo Agora */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              Lendo Agora ({emAndamento.length})
            </h3>
            <span className="text-[11px] text-slate-500">Nível {nivelAtual}</span>
          </div>

          {emAndamento.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              Nenhum livro em andamento no momento. Escolha uma obra na estante para iniciar!
            </p>
          ) : (
            <div className="space-y-2.5">
              {emAndamento.map((livro) => {
                const cores = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
                const prog = progressos[livro.id];
                return (
                  <div
                    key={livro.id}
                    onClick={() => onSelecionarLivro(livro.id)}
                    className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500 cursor-pointer transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-14 shrink-0 rounded overflow-hidden bg-slate-200 shadow-sm border">
                      {livro.capa_url ? (
                        <img src={livro.capa_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full text-[8px] p-1 text-white font-bold"
                          style={{ backgroundColor: cores.hex }}
                        >
                          #{livro.id}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span
                          className="font-bold uppercase text-white px-1.5 py-0.2 rounded"
                          style={{ backgroundColor: cores.hex }}
                        >
                          {livro.classe}
                        </span>
                        <span className="text-slate-500 truncate">{livro.area}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 truncate hover:text-amber-600 mt-0.5">
                        {livro.titulo}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {livro.autor}
                      </p>
                      {prog?.data_inicio && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Iniciado em: {new Date(prog.data_inicio).toLocaleDateString('pt-BR')}
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
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Próximo Sugerido (Regra do Grafo)
            </h3>
            <span className="text-[10px] font-serif text-slate-400">Sequência Natural</span>
          </div>

          {proximoSugerido ? (
            (() => {
              const cores = CORES_AREAS[proximoSugerido.area] || CORES_AREAS['Filosofia'];
              return (
                <div
                  onClick={() => onSelecionarLivro(proximoSugerido.id)}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-amber-400 cursor-pointer transition-all flex items-start gap-3"
                >
                  <div className="w-10 h-14 shrink-0 rounded overflow-hidden bg-slate-200 shadow-sm border">
                    {proximoSugerido.capa_url ? (
                      <img src={proximoSugerido.capa_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full text-[8px] p-1 text-white font-bold"
                        style={{ backgroundColor: cores.hex }}
                      >
                        #{proximoSugerido.id}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className="font-bold uppercase text-white px-1.5 py-0.2 rounded"
                        style={{ backgroundColor: cores.hex }}
                      >
                        {proximoSugerido.classe}
                      </span>
                      <span className="text-slate-500 truncate">{proximoSugerido.area}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 truncate hover:text-amber-600 mt-0.5">
                      {proximoSugerido.titulo}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {proximoSugerido.autor}
                    </p>
                    <p className="text-[11px] text-slate-500 italic line-clamp-1 mt-1">
                      "{proximoSugerido.por_que_antes_do_proximo}"
                    </p>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              Você completou todas as obras planejadas deste nível!
            </p>
          )}
        </div>

        {/* Coluna 3: Ritmo e Estimativa de Horas (Seção 7.4) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600" />
              Ritmo & Projeção Sóbria
            </h3>
            <button
              onClick={() => setConfigAberto(!configAberto)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              title="Configurar horas de leitura semanal"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Dedicação semanal:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                {horasPorSemana} h / semana
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Obras restantes:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {livrosRestantes.length} de {livros.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Estimativa total restante:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {horasMin}h – {horasMax}h (~{Math.round(horasMedia)}h)
              </span>
            </div>
            <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-amber-700 dark:text-amber-400 font-medium">
              <span>Horizonte de conclusão:</span>
              <span>~{mesesProjetados} meses ({semanasProjetadas} sem.)</span>
            </div>
          </div>

          {configAberto && (
            <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800 text-xs flex items-center gap-3">
              <label className="text-slate-600 dark:text-slate-400">Ajustar horas/sem:</label>
              <input
                type="number"
                min={1}
                max={40}
                value={horasPorSemana}
                onChange={(e) => onAlterarHorasPorSemana(Number(e.target.value) || 6)}
                className="w-16 p-1 border rounded text-center bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
