import React, { useState } from 'react';
import { Livro, Progresso, Relacao } from '../types';
import { CORES_AREAS, LEGENDA_RESUMO } from '../constants/theme';
import {
  X,
  Star,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  FileText,
  Bookmark,
  Share2
} from 'lucide-react';

interface ModalLivroProps {
  livro: Livro;
  todosLivros: Livro[];
  todasRelacoes: Relacao[];
  progresso?: Progresso;
  onClose: () => void;
  onSelecionarOutroLivro: (id: number) => void;
  onAtualizarEstado: (livroId: number, estado: Progresso['estado'], mudouJuizo?: boolean, perguntaAberta?: string) => void;
  onAtualizarNotas: (livroId: number, notas: string) => void;
  onAtualizarGuia: (livroId: number, guia: string) => void;
  onEscolherEdicao: (livroId: number, edicao: string) => void;
}

export const ModalLivro: React.FC<ModalLivroProps> = ({
  livro,
  todosLivros,
  todasRelacoes,
  progresso,
  onClose,
  onSelecionarOutroLivro,
  onAtualizarEstado,
  onAtualizarNotas,
  onAtualizarGuia,
  onEscolherEdicao
}) => {
  const [imagemErro, setImagemErro] = useState(false);
  const [mostrarModalLido, setMostrarModalLido] = useState(false);
  const [mudouJuizoLocal, setMudouJuizoLocal] = useState<boolean>(progresso?.mudou_meu_juizo ?? true);
  const [perguntaAbertaLocal, setPerguntaAbertaLocal] = useState<string>(progresso?.pergunta_aberta ?? '');
  const [mensagemAbandono, setMensagemAbandono] = useState<string | null>(null);

  const cores = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
  const estado = progresso?.estado || 'nao_iniciado';

  // Relações em que este livro participa
  const relacoesOrigem = todasRelacoes.filter((r) => r.de === livro.id);
  const relacoesDestino = todasRelacoes.filter((r) => r.para === livro.id);

  // Manipulador de abandono conforme Seção 7.4:
  // "Contador de tentativas: ao marcar 'abandonar', incrementar tentativas. Mostrar a mensagem: 'abandonar sem culpa é parte do método'."
  const handleAbandonar = () => {
    onAtualizarEstado(livro.id, 'abandonado');
    setMensagemAbandono('Abandonar sem culpa é parte do método.');
    setTimeout(() => setMensagemAbandono(null), 4000);
  };

  const handleSalvarLido = () => {
    onAtualizarEstado(livro.id, 'lido', mudouJuizoLocal, perguntaAbertaLocal);
    setMostrarModalLido(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-library-paper dark:bg-library-darkPaper w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl border border-slate-200 dark:border-library-darkBorder text-slate-800 dark:text-slate-100 flex flex-col focus:outline-none"
        tabIndex={-1}
      >
        {/* Cabeçalho Fixo do Modal */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur border-b border-slate-200 dark:border-library-darkBorder">
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 text-xs font-bold rounded text-white"
              style={{ backgroundColor: cores.hex }}
            >
              Nível {livro.nivel} · Livro #{livro.id}
            </span>
            {livro.obra_de_vida && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                Obra de Vida
              </span>
            )}
            {livro.idioma_leitura === 'en' && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                Leitura em Inglês [EN]
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notificação Temporária de Abandono sem Culpa */}
        {mensagemAbandono && (
          <div className="bg-amber-50 dark:bg-amber-950/80 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 p-3 mx-6 mt-4 rounded text-sm font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            {mensagemAbandono}
          </div>
        )}

        {/* Corpo do Modal na ordem exata da Seção 7.2 */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* 1 e 2: Capa, Autor, Título, Ano, Área, Classe */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Capa */}
            <div className="w-full md:w-56 shrink-0 aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative">
              {livro.capa_url && !imagemErro ? (
                <img
                  src={livro.capa_url}
                  alt={`Capa de ${livro.titulo}`}
                  onError={() => setImagemErro(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col justify-between p-5 text-white relative overflow-hidden"
                  style={{
                    background: `linear-gradient(150deg, ${cores.hex}ee, ${cores.hex}cc, ${cores.hex}ff)`
                  }}
                >
                  <div className="absolute inset-2 border border-white/20 rounded pointer-events-none"></div>

                  <div className="flex justify-between text-xs opacity-80 font-serif z-10">
                    <span className="font-mono">#{livro.id}</span>
                    <span>{livro.ano}</span>
                  </div>
                  <div className="my-auto z-10">
                    <h4 className="font-serif font-bold text-xl leading-tight drop-shadow">
                      {livro.titulo}
                    </h4>
                    <p className="text-sm opacity-90 mt-2 font-medium">
                      {livro.autor}
                    </p>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase font-bold tracking-wider opacity-80 border-t border-white/20 pt-2 z-10">
                    <span>{livro.area}</span>
                    <span>{livro.classe}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Metadados Principais */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2.5 py-0.5 text-xs font-bold uppercase rounded text-white"
                  style={{ backgroundColor: cores.hex }}
                >
                  {livro.area}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {livro.classe}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-serif">
                  Publicado em {livro.ano}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 leading-tight">
                {livro.titulo}
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 font-serif">
                {livro.autor}
              </p>

              {/* 3: Aviso de Resumo (Seção 7.6 e 7.2) */}
              <div className="pt-2">
                {livro.resumo_permitido === 'nao' && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3">
                    <span className="font-bold text-rose-600 text-base">✗</span>
                    <div>
                      <div className="font-bold text-sm">{LEGENDA_RESUMO.nao.rotulo}</div>
                      <p className="text-xs opacity-90 mt-0.5">
                        {LEGENDA_RESUMO.nao.descricao}
                      </p>
                    </div>
                  </div>
                )}
                {livro.resumo_permitido === 'sim' && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                    <span className="font-bold text-emerald-600 text-base">✓</span>
                    <div>
                      <div className="font-bold text-sm">{LEGENDA_RESUMO.sim.rotulo}</div>
                      <p className="text-xs opacity-90 mt-0.5">
                        {LEGENDA_RESUMO.sim.descricao}
                      </p>
                    </div>
                  </div>
                )}
                {livro.resumo_permitido === 'estrutura' && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                    <span className="font-bold text-amber-600 text-base">~</span>
                    <div>
                      <div className="font-bold text-sm">{LEGENDA_RESUMO.estrutura.rotulo}</div>
                      <p className="text-xs opacity-90 mt-0.5">
                        {LEGENDA_RESUMO.estrutura.descricao}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status de Leitura Atual & Ações Rápidas */}
              <div className="pt-4 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
                  Estado:
                </span>
                <button
                  onClick={() => onAtualizarEstado(livro.id, 'lendo')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                    estado === 'lendo'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Lendo
                </button>
                <button
                  onClick={() => setMostrarModalLido(true)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                    estado === 'lido'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Lido
                </button>
                <button
                  onClick={() => onAtualizarEstado(livro.id, 'reler_5_anos')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                    estado === 'reler_5_anos'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Reler em 5 anos
                </button>
                <button
                  onClick={handleAbandonar}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                    estado === 'abandonado'
                      ? 'bg-slate-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Abandonar ({progresso?.tentativas || 0} tentativas)
                </button>
              </div>
            </div>
          </div>

          {/* 4: Tese */}
          <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tese
            </h3>
            <p className="font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200 italic bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-lg border-l-4 border-amber-500">
              "{livro.tese}"
            </p>
          </div>

          {/* 5: O que acrescenta */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              O Que Acrescenta
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {livro.acrescenta}
            </p>
          </div>

          {/* 6: Por que vem antes do próximo */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Por Que Vem Antes do Próximo
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {livro.por_que_antes_do_proximo}
            </p>
          </div>

          {/* 7: Relações (prepara / contraponto / mesmo tema) com links navegáveis */}
          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Relações no Grafo da Biblioteca
            </h3>
            
            {relacoesOrigem.length === 0 && relacoesDestino.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Nenhuma relação explícita registrada.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Relações que saem deste livro */}
                {relacoesOrigem.map((r) => {
                  const destino = todosLivros.find((l) => l.id === r.para);
                  if (!destino) return null;
                  return (
                    <div
                      key={r.id}
                      onClick={() => onSelecionarOutroLivro(destino.id)}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between ${
                        r.tipo === 'contraponto'
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-500'
                          : r.tipo === 'prepara'
                          ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-amber-500'
                          : 'border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span
                          className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                            r.tipo === 'contraponto'
                              ? 'bg-rose-600 text-white'
                              : r.tipo === 'prepara'
                              ? 'bg-slate-700 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {r.tipo === 'contraponto' ? '⚡ Contraponto' : (r.tipo === 'prepara' ? '→ Prepara' : '≈ Mesmo Tema')}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">#{destino.id}</span>
                      </div>
                      <div className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-amber-600">
                        {destino.titulo} ({destino.autor})
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic line-clamp-2">
                        "{r.nota}"
                      </p>
                    </div>
                  );
                })}

                {/* Relações que chegam a este livro */}
                {relacoesDestino.map((r) => {
                  const origem = todosLivros.find((l) => l.id === r.de);
                  if (!origem) return null;
                  return (
                    <div
                      key={r.id}
                      onClick={() => onSelecionarOutroLivro(origem.id)}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between ${
                        r.tipo === 'contraponto'
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-500'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-amber-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-600 text-white">
                          ← Recebe ({r.tipo})
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">#{origem.id}</span>
                      </div>
                      <div className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-amber-600">
                        {origem.titulo} ({origem.autor})
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic line-clamp-2">
                        "{r.nota}"
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 8: Edições encontradas e escolha de edição (Seção 6.3 e 7.2) */}
          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Edições Documentadas (Escolha sua Edição Preferida)
            </h3>
            {livro.edicoes_pt && livro.edicoes_pt.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {livro.edicoes_pt.map((ed, idx) => {
                  const selecionada = progresso?.edicao_escolhida === ed.editora;
                  return (
                    <div
                      key={idx}
                      onClick={() => onEscolherEdicao(livro.id, ed.editora)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selecionada
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-slate-50 dark:bg-slate-900/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {ed.editora}
                        </span>
                        {selecionada && (
                          <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">
                            Escolhida
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div>Ano: {ed.ano}</div>
                        {ed.isbn && <div className="font-mono text-[11px]">ISBN: {ed.isbn}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                Edição única identificada ou catalogada em pendências.
              </p>
            )}
          </div>

          {/* 9: Sinopse Editorial com Fonte (Seção 6.4 e 7.2) */}
          {livro.sinopse_editorial && (
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sinopse Editorial
                </h3>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  Fonte: Open Library API
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-line">
                {livro.sinopse_editorial}
              </p>
            </div>
          )}

          {/* 10: Seção "Guia de Leitura" (Seção 7.6) */}
          {livro.resumo_permitido === 'nao' && (
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                  Guia de Leitura Pessoal (O que observar em cada parte)
                </h3>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                  Seu roteiro autoral de leitura
                </span>
              </div>
              <textarea
                value={progresso?.guia_leitura || ''}
                onChange={(e) => onAtualizarGuia(livro.id, e.target.value)}
                placeholder="Anotações de método: o que observar no prólogo, perguntas condutoras, conceitos axiais a rastrear nos capítulos..."
                rows={3}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-sans focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* 11: Campo de Notas Pessoais (Seção 7.2) */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Minhas Anotações de Leitura
            </h3>
            <textarea
              value={progresso?.notas || ''}
              onChange={(e) => onAtualizarNotas(livro.id, e.target.value)}
              placeholder="Reflexões, passagens marcantes, diálogos com outras obras da biblioteca..."
              rows={4}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-sans focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal de Conclusão de Leitura ("Mudou algum juízo seu?") */}
        {mostrarModalLido && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-6 h-6" />
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                  Conclusão da Leitura
                </h3>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mudou algum juízo seu?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="mudouJuizo"
                      checked={mudouJuizoLocal === true}
                      onChange={() => setMudouJuizoLocal(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Sim, alterou minha visão</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="mudouJuizo"
                      checked={mudouJuizoLocal === false}
                      onChange={() => setMudouJuizoLocal(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Apenas me informou</span>
                  </label>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Você tem alguma pergunta aberta com esta obra? (opcional)
                  </label>
                  <input
                    type="text"
                    value={perguntaAbertaLocal}
                    onChange={(e) => setPerguntaAbertaLocal(e.target.value)}
                    placeholder="Ex: Como conciliar a justiça platônica com a liberdade moderna?"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setMostrarModalLido(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarLido}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow"
                >
                  Confirmar Leitura
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
