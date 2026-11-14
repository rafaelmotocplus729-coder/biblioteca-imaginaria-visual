import React, { useState, useEffect } from 'react';
import { Livro, Progresso, Relacao } from '../types';
import { CORES_AREAS, LEGENDA_RESUMO, EX_LIBRIS_NIVEIS, obterPaginasLivro } from '../constants/theme';
import { useBibliotecaStore } from '../store/useBibliotecaStore';
import {
  X,
  Star,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  FileText,
  Bookmark,
  Share2,
  Scale,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Landmark,
  ScrollText,
  Swords,
  Crown,
  Layers,
  Compass,
  Eye,
  AlertTriangle,
  Quote
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
  onAbrirComparador?: (livroAId: number, livroBId: number) => void;
}

function renderizarIconeNivel(nivel: number, className: string = 'w-3.5 h-3.5') {
  const chave = EX_LIBRIS_NIVEIS[nivel]?.iconKey || 'landmark';
  switch (chave) {
    case 'landmark':
      return <Landmark className={className} />;
    case 'scale':
      return <Scale className={className} />;
    case 'scroll':
      return <ScrollText className={className} />;
    case 'swords':
      return <Swords className={className} />;
    case 'crown':
      return <Crown className={className} />;
    default:
      return <Landmark className={className} />;
  }
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
  onEscolherEdicao,
  onAbrirComparador
}) => {
  const [imagemErro, setImagemErro] = useState(false);

  useEffect(() => {
    setImagemErro(false);
  }, [livro.capa_url]);

  const [mostrarModalLido, setMostrarModalLido] = useState(false);
  const [mudouJuizoLocal, setMudouJuizoLocal] = useState<boolean>(progresso?.mudou_meu_juizo ?? true);
  const [perguntaAbertaLocal, setPerguntaAbertaLocal] = useState<string>(progresso?.pergunta_aberta ?? '');
  const [mensagemAbandono, setMensagemAbandono] = useState<string | null>(null);

  const cores = CORES_AREAS[livro.area] || CORES_AREAS['Filosofia'];
  const estado = progresso?.estado || 'nao_iniciado';
  const exLibris = EX_LIBRIS_NIVEIS[livro.nivel] || EX_LIBRIS_NIVEIS[1];

  // Relações em que este livro participa
  const relacoesOrigem = todasRelacoes.filter((r) => r.de === livro.id);
  const relacoesDestino = todasRelacoes.filter((r) => r.para === livro.id);

  // Zettelkasten: busca nota de referência e notas permanentes vinculadas
  const { notasZettel, criarNotaReferenciaDeLivro, selecionarNotaZettel } = useBibliotecaStore();

  const notaReferenciaExistente = notasZettel.find(
    (n) => n.tipo === 'referencia' && (n.livroId === livro.id || n.titulo.toLowerCase().includes(livro.titulo.toLowerCase()))
  );

  const notasPermanentesDoLivro = notasZettel.filter(
    (n) => n.tipo === 'permanente' && (
      (notaReferenciaExistente && n.referencia?.includes(notaReferenciaExistente.titulo)) ||
      n.conteudo.toLowerCase().includes(livro.titulo.toLowerCase())
    )
  );

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-library-paper dark:bg-library-darkPaper w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-100 flex flex-col focus:outline-none"
        tabIndex={-1}
      >
        {/* Cabeçalho Fixo do Modal com Selo Ex-Libris e Toque Clássico */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="px-3 py-1 text-xs font-cinzel font-bold tracking-wider rounded-lg text-white shadow-2xs inline-flex items-center gap-1.5 tabular-nums"
              style={{ backgroundColor: cores.hex }}
              title={`${exLibris.titulo} — ${exLibris.lema}`}
            >
              {renderizarIconeNivel(livro.nivel, 'w-3.5 h-3.5 text-amber-200')}
              <span>Nível {exLibris.romano} · Obra #{livro.id}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-serif italic text-stone-500 dark:text-stone-400 px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
              <span>{exLibris.titulo}</span>
            </span>
            {livro.obra_de_vida && (
              <span className="inline-flex items-center gap-1.5 text-xs font-cinzel font-semibold px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-400/60">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Obra de Vida</span>
              </span>
            )}
            {livro.idioma_leitura === 'en' && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">
                Leitura em Inglês [EN]
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação Temporária de Abandono sem Culpa */}
        {mensagemAbandono && (
          <div className="bg-amber-50/90 dark:bg-amber-950/80 border-l-4 border-amber-600 text-amber-950 dark:text-amber-200 p-3.5 mx-6 mt-4 rounded-r-xl text-sm font-serif italic flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{mensagemAbandono}</span>
          </div>
        )}

        {/* Corpo do Modal na ordem exata da Seção 7.2 */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* 1 e 2: Capa, Autor, Título, Ano, Área, Classe */}
          <div className="flex flex-col md:flex-row gap-7 items-start">
            {/* Capa com Efeito Físico de Livro */}
            <div className="w-full md:w-56 shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-book-hover border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 relative">
              {/* Sombra de lombada física na esquerda */}
              <div className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none bg-gradient-to-r from-black/40 via-black/15 to-transparent z-10" />
              <div className="absolute left-3 top-0 bottom-0 w-[1px] pointer-events-none bg-black/25 dark:bg-white/10 z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-[2px] pointer-events-none bg-gradient-to-l from-amber-100/40 dark:from-white/10 to-transparent z-10" />

              {livro.capa_url && !imagemErro ? (
                <img
                  src={livro.capa_url}
                  alt={`Capa de ${livro.titulo}`}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
                      setImagemErro(true);
                    }
                  }}
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
                  <div className="absolute inset-2 border border-amber-300/40 rounded pointer-events-none" />
                  <div className="absolute inset-2.5 border border-amber-300/20 rounded pointer-events-none" />

                  <div className="flex justify-between text-xs opacity-90 font-cinzel z-10 tabular-nums">
                    <span className="font-bold">#{livro.id}</span>
                    <span>{livro.ano}</span>
                  </div>
                  <div className="my-auto z-10 text-center">
                    <h4 className="font-serif font-bold text-xl leading-tight drop-shadow text-amber-50">
                      {livro.titulo}
                    </h4>
                    <p className="text-sm opacity-90 mt-2 font-serif italic text-amber-100">
                      {livro.autor}
                    </p>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-cinzel font-bold tracking-wider opacity-90 border-t border-amber-300/30 pt-2 z-10">
                    <span>{livro.area}</span>
                    <span>{livro.classe}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Metadados Principais */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2.5 py-0.5 text-xs font-cinzel font-bold uppercase rounded-md text-white shadow-2xs"
                  style={{ backgroundColor: cores.hex }}
                >
                  {livro.area}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-cinzel font-bold uppercase rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">
                  {livro.classe}
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-cinzel font-semibold tabular-nums px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                  {livro.paginas || obterPaginasLivro(livro.id, livro.classe)} págs
                </span>
                <span className="text-sm text-stone-600 dark:text-stone-400 font-cinzel font-semibold tabular-nums">
                  Publicado em {livro.ano}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50 leading-tight tracking-tight">
                  {livro.titulo}
                </h2>
                <p className="text-lg text-stone-700 dark:text-stone-300 font-serif italic mt-1">
                  {livro.autor}
                </p>
              </div>

              {/* 3: Aviso de Resumo (Seção 7.6 e 7.2) com Ícones Lucide Semânticos */}
              <div className="pt-1">
                {livro.resumo_permitido === 'nao' && (
                  <div className="p-3.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-300/90 dark:border-rose-900 text-rose-950 dark:text-rose-200 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm">{LEGENDA_RESUMO.nao.rotulo}</div>
                      <p className="text-xs opacity-90 mt-0.5 font-serif leading-relaxed">
                        {LEGENDA_RESUMO.nao.descricao}
                      </p>
                    </div>
                  </div>
                )}
                {livro.resumo_permitido === 'sim' && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300/90 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm">{LEGENDA_RESUMO.sim.rotulo}</div>
                      <p className="text-xs opacity-90 mt-0.5 font-serif leading-relaxed">
                        {LEGENDA_RESUMO.sim.descricao}
                      </p>
                    </div>
                  </div>
                )}
                {livro.resumo_permitido === 'estrutura' && (
                  <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/90 dark:border-amber-900 text-amber-950 dark:text-amber-200 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm">{LEGENDA_RESUMO.estrutura.rotulo}</div>
                      <p className="text-xs opacity-90 mt-0.5 font-serif leading-relaxed">
                        {LEGENDA_RESUMO.estrutura.descricao}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status de Leitura Atual & Rastreador de Progresso Refinado */}
              <div className="pt-3 p-3.5 rounded-xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-cinzel font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                    Estado de Leitura & Progresso
                  </span>
                  {progresso?.mudou_meu_juizo !== undefined && estado === 'lido' && (
                    <span className="text-[11px] font-serif italic text-emerald-700 dark:text-emerald-400">
                      {progresso.mudou_meu_juizo ? 'Transformou meu juízo' : 'Leitura informativa'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => onAtualizarEstado(livro.id, 'lendo')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      estado === 'lendo'
                        ? 'bg-amber-700 text-white shadow-sm ring-1 ring-amber-500'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lendo</span>
                  </button>
                  <button
                    onClick={() => setMostrarModalLido(true)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      estado === 'lido'
                        ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-500'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Lido</span>
                  </button>
                  <button
                    onClick={() => onAtualizarEstado(livro.id, 'reler_5_anos')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      estado === 'reler_5_anos'
                        ? 'bg-purple-700 text-white shadow-sm ring-1 ring-purple-500'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-purple-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reler em 5 anos</span>
                  </button>
                  <button
                    onClick={handleAbandonar}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold tabular-nums flex items-center gap-1.5 transition-all cursor-pointer ${
                      estado === 'abandonado'
                        ? 'bg-stone-700 text-white shadow-sm ring-1 ring-stone-500'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Abandonar ({progresso?.tentativas || 0} tentativas)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4: Tese Fundamental da Obra */}
          <div className="space-y-2.5 border-t border-stone-200 dark:border-stone-800 pt-6">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 flex items-center gap-2">
              <Quote className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Tese Fundamental da Obra</span>
            </h3>
            <div className="relative font-serif text-lg leading-relaxed text-stone-900 dark:text-stone-100 italic bg-amber-50/70 dark:bg-amber-950/20 p-5 rounded-xl border-l-4 border-amber-600 shadow-2xs">
              &ldquo;{livro.tese}&rdquo;
            </div>
          </div>

          {/* 5 e 6: Blocos Pedagógicos Lado a Lado (Por que ler / O Que Acrescenta & Foco de Leitura / Sequência) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 5: O que acrescenta (Por que ler) */}
            <div className="p-4 rounded-xl bg-stone-50/90 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>O Que Acrescenta (Por que ler)</span>
              </h3>
              <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-serif">
                {livro.acrescenta}
              </p>
            </div>

            {/* 6: Por que vem antes do próximo (Foco de leitura & Sequência) */}
            <div className="p-4 rounded-xl bg-stone-50/90 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Por Que Vem Antes do Próximo</span>
              </h3>
              <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-serif">
                {livro.por_que_antes_do_proximo}
              </p>
            </div>
          </div>

          {/* 7: Relações (prepara / contraponto / mesmo tema) com links navegáveis e Ícones Lucide */}
          <div className="space-y-3.5 border-t border-stone-200 dark:border-stone-800 pt-6">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Relações no Grafo da Biblioteca</span>
            </h3>

            {relacoesOrigem.length === 0 && relacoesDestino.length === 0 ? (
              <p className="text-sm text-stone-500 font-serif italic">Nenhuma relação explícita registrada.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Relações que saem deste livro */}
                {relacoesOrigem.map((r) => {
                  const destino = todosLivros.find((l) => l.id === r.para);
                  if (!destino) return null;
                  return (
                    <div
                      key={r.id}
                      onClick={() => onSelecionarOutroLivro(destino.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between ${
                        r.tipo === 'contraponto'
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-500'
                          : r.tipo === 'prepara'
                          ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/15 hover:border-amber-500'
                          : 'border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 hover:border-sky-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span
                          className={`font-cinzel font-bold uppercase text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                            r.tipo === 'contraponto'
                              ? 'bg-rose-600 text-white'
                              : r.tipo === 'prepara'
                              ? 'bg-amber-700 text-white'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          {r.tipo === 'contraponto' ? (
                            <>
                              <Scale className="w-3 h-3" />
                              <span>Contrasta</span>
                            </>
                          ) : r.tipo === 'prepara' ? (
                            <>
                              <ArrowRight className="w-3 h-3" />
                              <span>Prepara / Aprofunda</span>
                            </>
                          ) : (
                            <>
                              <Layers className="w-3 h-3" />
                              <span>Contextualiza</span>
                            </>
                          )}
                        </span>
                        <span className="text-stone-500 font-mono tabular-nums text-[11px]">#{destino.id}</span>
                      </div>
                      <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-400">
                        {destino.titulo} <span className="font-normal italic text-stone-600 dark:text-stone-400">({destino.autor})</span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 font-serif italic line-clamp-2">
                        &ldquo;{r.nota}&rdquo;
                      </p>
                      {r.tipo === 'contraponto' && onAbrirComparador && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAbrirComparador(livro.id, destino.id);
                          }}
                          className="mt-2.5 text-[11px] font-cinzel font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 flex items-center gap-1.5 self-start cursor-pointer"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Confrontar Obras Lado a Lado</span>
                        </button>
                      )}
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
                      className={`p-3.5 rounded-xl border cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between ${
                        r.tipo === 'contraponto'
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-500'
                          : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/15 hover:border-emerald-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span
                          className={`font-cinzel font-bold uppercase text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-white ${
                            r.tipo === 'contraponto' ? 'bg-rose-600' : 'bg-emerald-700'
                          }`}
                        >
                          {r.tipo === 'contraponto' ? (
                            <>
                              <Scale className="w-3 h-3" />
                              <span>Contrasta</span>
                            </>
                          ) : (
                            <>
                              <ArrowLeft className="w-3 h-3" />
                              <span>Base Prévia ({r.tipo})</span>
                            </>
                          )}
                        </span>
                        <span className="text-stone-500 font-mono tabular-nums text-[11px]">#{origem.id}</span>
                      </div>
                      <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-400">
                        {origem.titulo} <span className="font-normal italic text-stone-600 dark:text-stone-400">({origem.autor})</span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 font-serif italic line-clamp-2">
                        &ldquo;{r.nota}&rdquo;
                      </p>
                      {r.tipo === 'contraponto' && onAbrirComparador && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAbrirComparador(origem.id, livro.id);
                          }}
                          className="mt-2.5 text-[11px] font-cinzel font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 flex items-center gap-1.5 self-start cursor-pointer"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Confrontar Obras Lado a Lado</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 8: Edições encontradas e escolha de edição (Seção 6.3 e 7.2) */}
          <div className="space-y-3 border-t border-stone-200 dark:border-stone-800 pt-6">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
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
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selecionada
                          ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-1 ring-amber-500 shadow-2xs'
                          : 'border-stone-200 dark:border-stone-700 hover:border-amber-400 bg-stone-50/80 dark:bg-stone-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100">
                          {ed.editora}
                        </span>
                        {selecionada && (
                          <span className="text-[10px] bg-amber-700 text-white px-2 py-0.5 rounded font-cinzel font-bold">
                            Escolhida
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 space-y-0.5 font-serif">
                        <div>Ano: {ed.ano}</div>
                        {ed.isbn && <div className="font-mono tabular-nums text-[11px]">ISBN: {ed.isbn}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-stone-500 font-serif italic">
                Edição única identificada ou catalogada em pendências.
              </p>
            )}
          </div>

          {/* 9: Sinopse Editorial com Fonte (Seção 6.4 e 7.2) */}
          {livro.sinopse_editorial && (
            <div className="space-y-2 border-t border-stone-200 dark:border-stone-800 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Sinopse Editorial
                </h3>
                <span className="text-[11px] text-stone-400 font-mono">
                  Fonte: Open Library API
                </span>
              </div>
              <p className="text-sm font-serif leading-relaxed text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-200 dark:border-stone-800 whitespace-pre-line">
                {livro.sinopse_editorial}
              </p>
            </div>
          )}

          {/* 10: Seção "Guia de Leitura — O que observar" (Seção 7.6) */}
          {livro.resumo_permitido === 'nao' && (
            <div className="space-y-2.5 border-t border-stone-200 dark:border-stone-800 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Guia de Leitura Pessoal (O que observar em cada parte)</span>
                </h3>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-serif italic flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Evite resumos substitutivos</span>
                </span>
              </div>
              <textarea
                value={progresso?.guia_leitura || ''}
                onChange={(e) => onAtualizarGuia(livro.id, e.target.value)}
                placeholder="Anotações de método: o que observar no prólogo, perguntas condutoras, conceitos axiais e armadilhas interpretativas a rastrear nos capítulos..."
                rows={3}
                className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-serif focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* 11: Campo de Notas Pessoais (Seção 7.2) */}
          <div className="space-y-2.5 border-t border-stone-200 dark:border-stone-800 pt-6">
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Minhas Anotações de Leitura</span>
            </h3>
            <textarea
              value={progresso?.notas || ''}
              onChange={(e) => onAtualizarNotas(livro.id, e.target.value)}
              placeholder="Reflexões, passagens marcantes, diálogos com outras obras da biblioteca..."
              rows={4}
              className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-serif focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* 12: Zettelkasten de Estudos (Método Luhmann / Ahrens) */}
          <div className="space-y-3 border-t border-stone-200 dark:border-stone-800 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Zettelkasten de Estudos (Notas em Rede)</span>
              </h3>
              {notaReferenciaExistente ? (
                <span className="text-[10px] font-cinzel font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300/60 dark:border-sky-800">
                  Fichamento Ativo
                </span>
              ) : (
                <span className="text-[11px] font-serif italic text-stone-500">
                  Ainda não fichado no Zettelkasten
                </span>
              )}
            </div>

            {notaReferenciaExistente ? (
              <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      Nota de Referência Bibliográfica
                    </span>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                      {notaReferenciaExistente.titulo}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      selecionarNotaZettel(notaReferenciaExistente.id);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-cinzel font-bold transition-colors cursor-pointer shrink-0"
                  >
                    <span>Abrir no Zettelkasten</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {notasPermanentesDoLivro.length > 0 && (
                  <div className="pt-2.5 border-t border-sky-200 dark:border-sky-800/60 space-y-2">
                    <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Ideias Permanentes Geradas ({notasPermanentesDoLivro.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {notasPermanentesDoLivro.map((perm) => (
                        <button
                          key={perm.id}
                          onClick={() => {
                            selecionarNotaZettel(perm.id);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-serif bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 transition inline-flex items-center gap-1.5 max-w-xs cursor-pointer"
                          title={perm.titulo}
                        >
                          <Lightbulb className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{perm.titulo}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs font-serif text-stone-600 dark:text-stone-400 leading-relaxed">
                  Gere a Nota de Referência oficial com normas ABNT, justificativa de relevância e espaço de síntese atômica em 1 clique.
                </p>
                <button
                  onClick={() => {
                    const nova = criarNotaReferenciaDeLivro(livro.id);
                    selecionarNotaZettel(nova.id);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-cinzel font-bold bg-sky-700 hover:bg-sky-800 text-white shrink-0 shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Fichar no Zettelkasten</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Conclusão de Leitura ("Mudou algum juízo seu?") */}
        {mostrarModalLido && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
            <div className="bg-library-paper dark:bg-library-darkPaper rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-300 dark:border-stone-700 space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                  Conclusão da Leitura
                </h3>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-serif font-bold text-stone-800 dark:text-stone-200">
                  Esta obra mudou algum juízo seu?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-serif cursor-pointer">
                    <input
                      type="radio"
                      name="mudouJuizo"
                      checked={mudouJuizoLocal === true}
                      onChange={() => setMudouJuizoLocal(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Sim, alterou minha visão</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-serif cursor-pointer">
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

                <div className="space-y-1.5 pt-2">
                  <label className="block text-sm font-serif font-bold text-stone-800 dark:text-stone-200">
                    Você tem alguma pergunta aberta com esta obra? (opcional)
                  </label>
                  <input
                    type="text"
                    value={perguntaAbertaLocal}
                    onChange={(e) => setPerguntaAbertaLocal(e.target.value)}
                    placeholder="Ex: Como conciliar a justiça platônica com a liberdade moderna?"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-serif focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => setMostrarModalLido(false)}
                  className="px-4 py-2 text-xs font-cinzel font-semibold rounded-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarLido}
                  className="px-4 py-2 text-xs font-cinzel font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm cursor-pointer"
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

