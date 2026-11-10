import React, { useState } from 'react';
import { Livro, Progresso, SessaoRevisao, ItemRevisao } from '../types';
import { RotateCw, CheckCircle, Clock, XCircle, ArrowRight, ArrowLeft, History, Star, ShieldCheck } from 'lucide-react';

interface ModalRevisaoSemestralProps {
  livros: Livro[];
  progressos: Record<number, Progresso>;
  historicoRevisoes: SessaoRevisao[];
  onSalvarRevisao: (sessao: SessaoRevisao) => void;
  onClose: () => void;
}

export const ModalRevisaoSemestral: React.FC<ModalRevisaoSemestralProps> = ({
  livros,
  progressos,
  historicoRevisoes,
  onSalvarRevisao,
  onClose
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'guia' | 'historico'>('guia');

  // Livros a revisar: lidos ou em andamento (ou pelo menos #13 que já inicia em andamento)
  const livrosParaRevisar = livros.filter((l) => {
    const estado = progressos[l.id]?.estado;
    return estado === 'lendo' || estado === 'lido';
  });

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, Partial<ItemRevisao>>>({});
  const [revisaoConcluida, setRevisaoConcluida] = useState(false);

  const livroAtual = livrosParaRevisar[indiceAtual];
  const respAtual = livroAtual ? (respostas[livroAtual.id] || {
    mudou_juizo: true,
    tem_pergunta_aberta: false,
    pegou_ultimos_30_dias: true,
    entendeu_pouco_mas_valia: false,
    decisao: livroAtual.obra_de_vida ? 'reler_5_anos' : 'manter'
  }) : null;

  const handleAtualizarResp = (campo: keyof ItemRevisao, valor: any) => {
    if (!livroAtual) return;
    setRespostas({
      ...respostas,
      [livroAtual.id]: {
        ...respAtual,
        [campo]: valor
      }
    });
  };

  const handleProximo = () => {
    if (indiceAtual < livrosParaRevisar.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    } else {
      // Finalizar revisão
      const dataHoje = new Date().toISOString().split('T')[0];
      const data5Anos = new Date();
      data5Anos.setFullYear(data5Anos.getFullYear() + 5);

      const itensFinais: ItemRevisao[] = livrosParaRevisar.map((l) => {
        const r = respostas[l.id] || {};
        const decisao = l.obra_de_vida ? 'reler_5_anos' : (r.decisao || 'manter');
        return {
          livro_id: l.id,
          mudou_juizo: r.mudou_juizo ?? true,
          tem_pergunta_aberta: r.tem_pergunta_aberta ?? false,
          pegou_ultimos_30_dias: r.pegou_ultimos_30_dias ?? true,
          entendeu_pouco_mas_valia: r.entendeu_pouco_mas_valia ?? false,
          decisao,
          data_prevista_reler: decisao === 'reler_5_anos' ? data5Anos.toISOString().split('T')[0] : undefined,
          reflexao: r.reflexao
        };
      });

      const sessao: SessaoRevisao = {
        id: `rev-${Date.now()}`,
        data: dataHoje,
        itens: itensFinais
      };

      onSalvarRevisao(sessao);
      setRevisaoConcluida(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-library-paper dark:bg-library-darkPaper w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-library-darkBorder text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <RotateCw className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
              Revisão Semestral de Leitura
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAbaAtiva('guia')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                abaAtiva === 'guia'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Fluxo Guiado
            </button>
            <button
              onClick={() => setAbaAtiva('historico')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                abaAtiva === 'historico'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Histórico ({historicoRevisoes.length})
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-6">
          {abaAtiva === 'historico' ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {historicoRevisoes.length === 0 ? (
                <p className="text-sm text-slate-500 italic p-6 text-center">
                  Nenhuma revisão registrada ainda. Complete seu primeiro ciclo semestral no fluxo guiado!
                </p>
              ) : (
                historicoRevisoes.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        Ciclo Semestral · {new Date(rev.data).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-slate-500">{rev.itens.length} obras avaliadas</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {rev.itens.map((it) => {
                        const l = livros.find((x) => x.id === it.livro_id);
                        return (
                          <div
                            key={it.livro_id}
                            className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                          >
                            <span className="font-serif font-semibold">
                              #{it.livro_id} {l?.titulo}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                it.decisao === 'manter'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : it.decisao === 'reler_5_anos'
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {it.decisao === 'reler_5_anos' ? 'Reler em 5 anos' : it.decisao}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : revisaoConcluida ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                Revisão Semestral Concluída!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Seus juízos e decisões foram incorporados com sucesso ao seu progresso. Obras de vida foram agendadas para releitura e abandonos foram registrados sem culpa.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow"
              >
                Voltar à Biblioteca
              </button>
            </div>
          ) : livrosParaRevisar.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Não há livros marcados como "Lendo" ou "Lido" para revisão no momento.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold"
              >
                Voltar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Indicador de Progresso na Revisão */}
              <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span>
                  Obra {indiceAtual + 1} de {livrosParaRevisar.length}
                </span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {Math.round(((indiceAtual + 1) / livrosParaRevisar.length) * 100)}% concluído
                </span>
              </div>

              {/* Ficha da Obra em Exame */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20 flex gap-4 items-center">
                <div className="w-12 h-16 shrink-0 rounded overflow-hidden shadow-sm bg-slate-200 border">
                  {livroAtual.capa_url ? (
                    <img src={livroAtual.capa_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-700 text-white text-[10px] p-1 font-bold">
                      #{livroAtual.id}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                      Nível {livroAtual.nivel} · #{livroAtual.id}
                    </span>
                    {livroAtual.obra_de_vida && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        Obra de Vida
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                    {livroAtual.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {livroAtual.autor} ({livroAtual.ano})
                  </p>
                </div>
              </div>

              {/* As 4 Perguntas Rigorosas da Seção 7.5 */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    1. Mudou algum juízo meu, ou só me informou?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAtualizarResp('mudou_juizo', true)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        respAtual?.mudou_juizo === true
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Mudou juízo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAtualizarResp('mudou_juizo', false)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        respAtual?.mudou_juizo === false
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Só informou
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    2. Ainda tenho uma pergunta aberta com ele?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAtualizarResp('tem_pergunta_aberta', true)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        respAtual?.tem_pergunta_aberta === true
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAtualizarResp('tem_pergunta_aberta', false)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        respAtual?.tem_pergunta_aberta === false
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    3. Peguei por vontade nos últimos 30 dias, depois de duas tentativas honestas?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAtualizarResp('pegou_ultimos_30_dias', true)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        respAtual?.pegou_ultimos_30_dias === true
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAtualizarResp('pegou_ultimos_30_dias', false)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        respAtual?.pegou_ultimos_30_dias === false
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    4. Entendi menos da metade, mas senti que valia?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAtualizarResp('entendeu_pouco_mas_valia', true)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        respAtual?.entendeu_pouco_mas_valia === true
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAtualizarResp('entendeu_pouco_mas_valia', false)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        respAtual?.entendeu_pouco_mas_valia === false
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>
              </div>

              {/* Decisão do Ciclo Semestral */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Decisão Final para esta Obra:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAtualizarResp('decisao', 'manter')}
                    disabled={livroAtual.obra_de_vida}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      respAtual?.decisao === 'manter'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 shadow'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-80'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Manter no Ritmo
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAtualizarResp('decisao', 'reler_5_anos')}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      respAtual?.decisao === 'reler_5_anos'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-200 shadow'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-80'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-purple-600" />
                    Reler em 5 Anos
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAtualizarResp('decisao', 'abandonar')}
                    disabled={livroAtual.obra_de_vida}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      respAtual?.decisao === 'abandonar'
                        ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-80'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-slate-500" />
                    Abandonar sem culpa
                  </button>
                </div>
                {livroAtual.obra_de_vida && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                    * Obras de vida entram em ciclo de releitura a cada década automaticamente.
                  </p>
                )}
              </div>

              {/* Navegação Entre Obras */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={indiceAtual === 0}
                  onClick={() => setIndiceAtual(indiceAtual - 1)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={handleProximo}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow"
                >
                  {indiceAtual < livrosParaRevisar.length - 1 ? (
                    <>
                      Próxima Obra
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    'Finalizar Revisão Semestral'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
