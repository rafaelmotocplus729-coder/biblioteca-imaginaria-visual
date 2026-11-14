import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Link as LinkIcon,
  Quote,
  Search,
  Check,
  Folder,
  GitBranch,
  Zap,
  Puzzle,
  Lightbulb,
  ScrollText,
  ShieldCheck,
  Hash,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { NotaZettel, TipoRelacaoDialetica, Livro } from '../types';

interface DrawerNovaPermanenteProps {
  aberto: boolean;
  onFechar: () => void;
  tipoInicial?: 'permanente' | 'referencia' | 'indice';
  referenciaInicial?: string;
  paginaInicial?: string;
  citacaoInicial?: string;
  temaNumInicial?: number;
  temaTituloInicial?: string;
  todasReferencias: NotaZettel[];
  todasPermanentes: NotaZettel[];
  todosIndices: NotaZettel[];
  livros: Livro[];
  onCriarPermanente: (dados: {
    numTema: number;
    titulo: string;
    referencia: string;
    pagina?: string;
    relacao?: string;
    tipoRelacao?: TipoRelacaoDialetica;
    justificativaRelacao?: string;
    citacaoOriginal?: string;
    conteudoInicial?: string;
  }) => void;
  onCriarReferencia: (dados: { livroId?: number; titulo?: string; temaNum: number }) => void;
  onCriarIndice: (dados: { titulo: string }) => void;
}

export const OPCOES_RELACAO: {
  tipo: TipoRelacaoDialetica;
  label: string;
  Icone: React.FC<{ className?: string }>;
  desc: string;
  estiloAtivo: string;
  badgeEstilo: string;
}[] = [
  {
    tipo: 'desenvolve',
    label: 'Desenvolve / Aprofunda',
    Icone: GitBranch,
    desc: 'Expande um argumento já existente',
    estiloAtivo:
      'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-500/80 ring-2 ring-emerald-500/20',
    badgeEstilo:
      'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700/60'
  },
  {
    tipo: 'contraponto',
    label: 'Contraponto / Objeção',
    Icone: Zap,
    desc: 'Tensão dialética ou objeção crítica',
    estiloAtivo:
      'bg-rose-50/90 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-500/80 ring-2 ring-rose-500/20',
    badgeEstilo:
      'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border-rose-300/80 dark:border-rose-700/60'
  },
  {
    tipo: 'complementa',
    label: 'Complementa / Afim',
    Icone: Puzzle,
    desc: 'Visão afim vinda de outra área',
    estiloAtivo:
      'bg-sky-50/90 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border-sky-500/80 ring-2 ring-sky-500/20',
    badgeEstilo:
      'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border-sky-300/80 dark:border-sky-700/60'
  },
  {
    tipo: 'aplica',
    label: 'Aplica / Exemplo',
    Icone: Lightbulb,
    desc: 'Caso prático ou ilustração empírica',
    estiloAtivo:
      'bg-amber-50/90 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-500/80 ring-2 ring-amber-500/20',
    badgeEstilo:
      'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/60'
  },
  {
    tipo: 'origem',
    label: 'Origem Histórica',
    Icone: ScrollText,
    desc: 'Genealogia, antecedente ou influência',
    estiloAtivo:
      'bg-stone-100 dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 border-stone-500/80 ring-2 ring-stone-500/20',
    badgeEstilo:
      'bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
  }
];

export const DrawerNovaPermanente: React.FC<DrawerNovaPermanenteProps> = ({
  aberto,
  onFechar,
  tipoInicial = 'permanente',
  referenciaInicial = '',
  paginaInicial = '',
  citacaoInicial = '',
  temaNumInicial,
  temaTituloInicial = '',
  todasReferencias,
  todasPermanentes,
  todosIndices,
  livros,
  onCriarPermanente,
  onCriarReferencia,
  onCriarIndice
}) => {
  const [tipo, setTipo] = useState<'permanente' | 'referencia' | 'indice'>(tipoInicial);
  const [titulo, setTitulo] = useState('');
  const [numTema, setNumTema] = useState<number>(temaNumInicial ?? 2); // Padrão: 2 História
  const [referencia, setReferencia] = useState(referenciaInicial);
  const [pagina, setPagina] = useState(paginaInicial);
  const [citacao, setCitacao] = useState(citacaoInicial);
  const [conteudoInicial, setConteudoInicial] = useState('');
  const [livroSelecionadoId, setLivroSelecionadoId] = useState<number | ''>('');

  // Relação dialética
  const [relacaoNotaId, setRelacaoNotaId] = useState('');
  const [tipoRelacao, setTipoRelacao] = useState<TipoRelacaoDialetica>('desenvolve');
  const [justificativaRelacao, setJustificativaRelacao] = useState('');
  const [buscaRelacao, setBuscaRelacao] = useState('');
  const [dropdownRelacaoAberto, setDropdownRelacaoAberto] = useState(false);

  // Critérios de validação atômica de Luhmann (interativos + auto-assistidos)
  const [criteriosManuais, setCriteriosManuais] = useState<{
    atomicidade: boolean;
    autonomia: boolean;
    conexao: boolean;
  }>({
    atomicidade: false,
    autonomia: false,
    conexao: false
  });

  // Sincronizar quando abrir com props iniciais
  useEffect(() => {
    if (aberto) {
      setTipo(tipoInicial);
      setReferencia(referenciaInicial);
      setPagina(paginaInicial);
      setCitacao(citacaoInicial);
      setTitulo('');
      setConteudoInicial('');
      setRelacaoNotaId('');
      setJustificativaRelacao('');
      setBuscaRelacao('');
      setDropdownRelacaoAberto(false);
      setLivroSelecionadoId('');
      setCriteriosManuais({
        atomicidade: false,
        autonomia: false,
        conexao: false
      });

      if (temaNumInicial) {
        setNumTema(temaNumInicial);
      } else if (referenciaInicial) {
        const match = referenciaInicial.match(/^(\d)/);
        if (match) {
          setNumTema(Number(match[1]));
        }
      }
      if (tipoInicial === 'indice' && temaTituloInicial) {
        setTitulo(temaTituloInicial);
      }
    }
  }, [aberto, tipoInicial, referenciaInicial, paginaInicial, citacaoInicial, temaNumInicial, temaTituloInicial]);

  const permanentesFiltradas = useMemo(() => {
    return todasPermanentes.filter((p) => {
      if (!buscaRelacao) return true;
      const b = buscaRelacao.toLowerCase();
      return p.titulo.toLowerCase().includes(b) || (p.tags && p.tags.some((t) => t.toLowerCase().includes(b)));
    });
  }, [todasPermanentes, buscaRelacao]);

  const notaRelacaoSelecionada = useMemo(() => {
    return todasPermanentes.find((p) => p.id === relacaoNotaId || p.titulo === relacaoNotaId);
  }, [todasPermanentes, relacaoNotaId]);

  // Cálculo do preview de endereço Folgezettel (tabular-nums font-mono)
  const folgezettelPreview = useMemo(() => {
    const notasMesmoTema = todasPermanentes.filter((p) => p.pasta.startsWith(`${numTema} -`) || p.id.startsWith(`${numTema}.`));
    const seqNum = notasMesmoTema.length + 1;
    if (notaRelacaoSelecionada) {
      const matchCodigo = notaRelacaoSelecionada.titulo.match(/^(\d+[a-z0-9.]*)/i);
      const baseCode = matchCodigo ? matchCodigo[1] : `${numTema}.${seqNum}`;
      return `${baseCode}a`;
    }
    return `${numTema}.${seqNum}`;
  }, [todasPermanentes, numTema, notaRelacaoSelecionada]);

  // Avaliação dos 3 Critérios de Luhmann (combina preenchimento real ou confirmação manual)
  const statusCriterios = useMemo(() => {
    const temAtomicidade = criteriosManuais.atomicidade || titulo.trim().length >= 8;
    const temAutonomia = criteriosManuais.autonomia || conteudoInicial.trim().length >= 25;
    const temConexao = criteriosManuais.conexao || Boolean(relacaoNotaId.trim() || referencia.trim());
    const total = [temAtomicidade, temAutonomia, temConexao].filter(Boolean).length;
    return { temAtomicidade, temAutonomia, temConexao, total };
  }, [criteriosManuais, titulo, conteudoInicial, relacaoNotaId, referencia]);

  if (!aberto) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (tipo === 'permanente') {
      if (!titulo.trim()) return;
      onCriarPermanente({
        numTema,
        titulo: titulo.trim(),
        referencia: referencia.trim(),
        pagina: pagina.trim() || undefined,
        relacao: relacaoNotaId ? (notaRelacaoSelecionada ? notaRelacaoSelecionada.titulo : relacaoNotaId) : undefined,
        tipoRelacao: relacaoNotaId ? tipoRelacao : undefined,
        justificativaRelacao: justificativaRelacao.trim() || undefined,
        citacaoOriginal: citacao.trim() || undefined,
        conteudoInicial: conteudoInicial.trim() || undefined
      });
      onFechar();
    } else if (tipo === 'referencia') {
      if (livroSelecionadoId !== '') {
        onCriarReferencia({ livroId: Number(livroSelecionadoId), temaNum: numTema });
        onFechar();
      } else if (titulo.trim()) {
        onCriarReferencia({ titulo: titulo.trim(), temaNum: numTema });
        onFechar();
      }
    } else if (tipo === 'indice') {
      if (!titulo.trim()) return;
      onCriarIndice({ titulo: titulo.trim() });
      onFechar();
    }
  };

  const macrotemas = [
    { num: 1, nome: 'Literatura', cor: 'border-purple-500 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40' },
    { num: 2, nome: 'História', cor: 'border-amber-600 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40' },
    { num: 3, nome: 'Psicologia', cor: 'border-orange-500 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40' },
    { num: 4, nome: 'Religião', cor: 'border-rose-500 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40' },
    { num: 5, nome: 'Filosofia', cor: 'border-emerald-600 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end transition-opacity duration-300 animate-fadeIn">
      <div
        className="w-full sm:w-[580px] lg:w-[640px] bg-[#fcfaf5] dark:bg-[#141519] border-l border-stone-200/90 dark:border-stone-800 shadow-2xl flex flex-col h-full text-stone-800 dark:text-stone-200"
        role="dialog"
        aria-modal="true"
      >
        {/* CABEÇALHO DO DRAWER */}
        <div className="px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 bg-stone-100/70 dark:bg-[#111216] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${
                tipo === 'permanente'
                  ? 'bg-emerald-100/80 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                  : tipo === 'referencia'
                  ? 'bg-sky-100/80 dark:bg-sky-950/70 border-sky-300 dark:border-sky-800/80 text-sky-800 dark:text-sky-300'
                  : 'bg-purple-100/80 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800/80 text-purple-800 dark:text-purple-300'
              }`}
            >
              {tipo === 'permanente' ? (
                <Sparkles className="w-4 h-4" />
              ) : tipo === 'referencia' ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <Folder className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight">
                  {tipo === 'permanente'
                    ? 'Nova Nota Permanente'
                    : tipo === 'referencia'
                    ? 'Nova Ficha de Referência'
                    : 'Nova Nota Índice (Macrotema)'}
                </h2>
                {tipo === 'permanente' && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/70 shadow-2xs"
                    title="Endereço Folgezettel sugerido no fichário"
                  >
                    <Hash className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                    <span>Folgezettel {folgezettelPreview}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans mt-0.5">
                {tipo === 'permanente'
                  ? '1 conceito atômico e autônomo redigido com suas próprias palavras'
                  : tipo === 'referencia'
                  ? 'Fichamento bibliográfico de obra, artigo ou fonte primária'
                  : 'Ponto focal de entrada para catalogar linhagens conceituais'}
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELETOR DE ABAS */}
        <div className="px-6 py-2.5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#15161b]">
          <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-stone-900 p-1 rounded-xl text-xs border border-stone-300/50 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setTipo('permanente')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                tipo === 'permanente'
                  ? 'bg-white dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-100 shadow-2xs border border-emerald-200/60 dark:border-emerald-700/50'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nota Permanente</span>
            </button>
            <button
              type="button"
              onClick={() => setTipo('referencia')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                tipo === 'referencia'
                  ? 'bg-white dark:bg-sky-900/70 text-sky-900 dark:text-sky-100 shadow-2xs border border-sky-200/60 dark:border-sky-700/50'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Fonte / Referência</span>
            </button>
            <button
              type="button"
              onClick={() => setTipo('indice')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                tipo === 'indice'
                  ? 'bg-white dark:bg-purple-900/70 text-purple-900 dark:text-purple-100 shadow-2xs border border-purple-200/60 dark:border-purple-700/50'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Macrotema</span>
            </button>
          </div>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {tipo === 'permanente' && (
            <>
              {/* CITAÇÃO ORIGINAL INSPIRADORA (CARD ANTIQUÁRIO REFINADO) */}
              {citacao && (
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-amber-50/95 via-[#faf6ec] to-stone-100/70 dark:from-amber-950/35 dark:via-[#1b1916] dark:to-[#17181c] border border-amber-300/70 dark:border-amber-800/50 border-l-4 border-l-amber-600 dark:border-l-amber-500 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 font-sans font-semibold">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <Quote className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Excerto da Fonte Primária</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCitacao('')}
                      className="text-[11px] text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer font-normal"
                    >
                      Desvincular trecho
                    </button>
                  </div>

                  <blockquote className="font-serif italic text-xs sm:text-sm text-stone-800 dark:text-amber-100/90 leading-relaxed pl-1">
                    “{citacao}”
                  </blockquote>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1.5 font-sans border-t border-amber-200/60 dark:border-amber-900/40">
                    <span className="truncate max-w-[340px] flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-amber-700/70 dark:text-amber-400/70 shrink-0" />
                      <strong className="text-stone-700 dark:text-stone-300 font-medium truncate">
                        {referencia || 'Obra de referência'}
                      </strong>
                    </span>
                    {pagina && (
                      <span className="font-mono tabular-nums text-[10.5px] px-1.5 py-0.5 rounded bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300">
                        p. {pagina}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* TÍTULO DO CONCEITO */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    Tese ou Conceito Atômico *
                  </label>
                  <span className="text-[10.5px] text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                    ID: {folgezettelPreview}
                  </span>
                </div>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: O ciúme retrospectivo como tribunal paranoico da memória"
                  className="w-full p-3 font-serif text-sm sm:text-base font-semibold rounded-xl bg-white dark:bg-stone-900/90 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:font-sans placeholder:font-normal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition shadow-2xs"
                  autoFocus
                  required
                />
              </div>

              {/* MACROTEMA CANÔNICO */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    Macrotema Canônico
                  </label>
                  <span className="text-[10px] font-mono tabular-nums text-stone-400">
                    Gaveta Nº 0{numTema}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {macrotemas.map((m) => (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => setNumTema(m.num)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        numTema === m.num
                          ? `${m.cor} font-bold ring-2 ring-emerald-600/25 shadow-2xs`
                          : 'border-stone-200/90 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="text-[10px] font-mono tabular-nums opacity-75">Nº {m.num}</div>
                      <div className="text-[11px] font-medium truncate">{m.nome}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FONTE E PÁGINA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>Ficha de Referência (Fonte)</span>
                  </label>
                  <select
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 truncate"
                  >
                    <option value="">Selecione ou vincule uma fonte...</option>
                    {todasReferencias.map((ref) => (
                      <option key={ref.id} value={ref.titulo}>
                        {ref.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200">
                    Página / Local
                  </label>
                  <input
                    type="text"
                    value={pagina}
                    onChange={(e) => setPagina(e.target.value)}
                    placeholder="Ex: 84"
                    className="w-full p-2.5 text-xs font-mono tabular-nums rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
              </div>

              {/* CONEXÃO DIALÉTICA COM OUTRA PERMANENTE */}
              <div className="p-4 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <LinkIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Costura Dialética no Fichário (Folgezettel)</span>
                  </div>
                  <span className="text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full bg-purple-100/80 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300/60 dark:border-purple-800/60 font-semibold">
                    Teia de Ideias
                  </span>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={buscaRelacao || (notaRelacaoSelecionada ? notaRelacaoSelecionada.titulo : relacaoNotaId)}
                        onChange={(e) => {
                          setBuscaRelacao(e.target.value);
                          setRelacaoNotaId(e.target.value);
                          setDropdownRelacaoAberto(true);
                        }}
                        onFocus={() => setDropdownRelacaoAberto(true)}
                        placeholder="Buscar nota permanente existente para ramificar ou tensionar..."
                        className="w-full p-2.5 text-xs pl-8 rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                      {relacaoNotaId && (
                        <button
                          type="button"
                          onClick={() => {
                            setRelacaoNotaId('');
                            setBuscaRelacao('');
                          }}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>

                  {dropdownRelacaoAberto && permanentesFiltradas.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-[#1a1b1f] border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl z-30 p-1 space-y-1">
                      {permanentesFiltradas.slice(0, 15).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setRelacaoNotaId(p.titulo);
                            setBuscaRelacao('');
                            setDropdownRelacaoAberto(false);
                          }}
                          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-xs cursor-pointer flex items-center justify-between text-stone-800 dark:text-stone-200"
                        >
                          <span className="font-medium truncate">{p.titulo}</span>
                          <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-2">{p.pasta}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {relacaoNotaId && (
                  <div className="space-y-2.5 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 animate-fadeIn">
                    <label className="text-[10.5px] font-bold text-stone-600 dark:text-stone-400 block uppercase tracking-wider">
                      Natureza do Vínculo Dialético
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {OPCOES_RELACAO.map((rd) => {
                        const IconComponent = rd.Icone;
                        const ativo = tipoRelacao === rd.tipo;
                        return (
                          <button
                            key={rd.tipo}
                            type="button"
                            onClick={() => setTipoRelacao(rd.tipo)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer text-xs flex items-start gap-2.5 ${
                              ativo
                                ? `${rd.estiloAtivo} font-semibold shadow-2xs`
                                : 'border-stone-200/90 dark:border-stone-800 bg-white/70 dark:bg-stone-950/60 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/70'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${rd.badgeEstilo}`}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="leading-snug truncate">{rd.label}</div>
                              <div className="text-[10px] opacity-75 truncate pt-0.5 font-normal">{rd.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={justificativaRelacao}
                        onChange={(e) => setJustificativaRelacao(e.target.value)}
                        placeholder="Justificativa da costura (Ex: Contrapõe a tese hobbesiana ao defender a cooperação espontânea)"
                        className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* MINHA SÍNTESE / DESENVOLVIMENTO INICIAL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    Redação Autônoma (Com Suas Palavras)
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono tabular-nums">
                    {conteudoInicial.trim().length} caracteres · Markdown
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={conteudoInicial}
                  onChange={(e) => setConteudoInicial(e.target.value)}
                  placeholder="Redija o argumento completo como se escrevesse para publicação. Qualquer leitor futuro deve compreender esta ficha sem precisar abrir o livro original..."
                  className="w-full p-3.5 font-serif text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900/90 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 leading-relaxed shadow-2xs"
                />
              </div>

              {/* 3 CRITÉRIOS DE VALIDAÇÃO ATÔMICA DE LUHMANN */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Validação Atômica de Luhmann</span>
                  </span>
                  <span className="text-[10.5px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    {statusCriterios.total}/3 critérios
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCriteriosManuais((prev) => ({ ...prev, atomicidade: !prev.atomicidade }))
                    }
                    className={`p-2 rounded-lg border text-left transition cursor-pointer flex items-start gap-2 ${
                      statusCriterios.temAtomicidade
                        ? 'bg-white dark:bg-stone-900 border-emerald-400/80 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                        : 'bg-white/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-500'
                    }`}
                  >
                    {statusCriterios.temAtomicidade ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold leading-tight">1. Atomicidade</div>
                      <div className="text-[10px] opacity-75 leading-tight mt-0.5">Uma única tese central</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCriteriosManuais((prev) => ({ ...prev, autonomia: !prev.autonomia }))
                    }
                    className={`p-2 rounded-lg border text-left transition cursor-pointer flex items-start gap-2 ${
                      statusCriterios.temAutonomia
                        ? 'bg-white dark:bg-stone-900 border-emerald-400/80 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                        : 'bg-white/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-500'
                    }`}
                  >
                    {statusCriterios.temAutonomia ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold leading-tight">2. Autonomia</div>
                      <div className="text-[10px] opacity-75 leading-tight mt-0.5">Válida fora do contexto</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCriteriosManuais((prev) => ({ ...prev, conexao: !prev.conexao }))
                    }
                    className={`p-2 rounded-lg border text-left transition cursor-pointer flex items-start gap-2 ${
                      statusCriterios.temConexao
                        ? 'bg-white dark:bg-stone-900 border-emerald-400/80 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                        : 'bg-white/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-500'
                    }`}
                  >
                    {statusCriterios.temConexao ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold leading-tight">3. Conectividade</div>
                      <div className="text-[10px] opacity-75 leading-tight mt-0.5">Ancorada na rede</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {tipo === 'referencia' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Fichar Livro da Biblioteca (1 Clique)
                </label>
                <select
                  value={livroSelecionadoId}
                  onChange={(e) => setLivroSelecionadoId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="">Ou digitar fonte / artigo externo manualmente abaixo...</option>
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      Nível {l.nivel} · #{l.id} {l.titulo} — {l.autor}
                    </option>
                  ))}
                </select>
              </div>

              {livroSelecionadoId === '' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Título da Fonte Externa *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Dostoiévski - Memórias do Subsolo"
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">Macrotema</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {macrotemas.map((m) => (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => setNumTema(m.num)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        numTema === m.num
                          ? `${m.cor} font-bold ring-2 ring-sky-600/30 shadow-2xs`
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="text-[10px] font-mono tabular-nums text-stone-400">Nº {m.num}</div>
                      <div className="text-[11px] font-medium truncate">{m.nome}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tipo === 'indice' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Nome do Macrotema / Índice *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: 6 - SOCIOLOGIA ou 7 - POLÍTICA"
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              {todosIndices.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Índices Já Existentes ({todosIndices.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 rounded-xl bg-white dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
                    {todosIndices.map((ind) => (
                      <span
                        key={ind.id}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40"
                      >
                        {ind.titulo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RODAPÉ COM AÇÕES */}
          <div className="pt-4 border-t border-stone-200/90 dark:border-stone-800 flex items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono tabular-nums hidden sm:flex items-center gap-1.5">
              {tipo === 'permanente' && (
                <>
                  <span>Destino:</span>
                  <strong className="text-stone-700 dark:text-stone-300">
                    03 - PERMANENTES / Nº {numTema} ({folgezettelPreview})
                  </strong>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onFechar}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                  tipo === 'permanente'
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : tipo === 'referencia'
                    ? 'bg-sky-700 hover:bg-sky-600'
                    : 'bg-purple-700 hover:bg-purple-600'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {tipo === 'permanente'
                    ? 'Arquivar Nota Permanente'
                    : tipo === 'referencia'
                    ? 'Criar Ficha de Referência'
                    : 'Criar Macrotema'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

