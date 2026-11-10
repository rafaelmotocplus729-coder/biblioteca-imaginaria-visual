import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Link as LinkIcon,
  Quote,
  Search,
  Check,
  Folder
} from 'lucide-react';
import { NotaZettel, TipoRelacaoDialetica, Livro } from '../types';

interface DrawerNovaPermanenteProps {
  aberto: boolean;
  onFechar: () => void;
  tipoInicial?: 'permanente' | 'referencia' | 'indice';
  referenciaInicial?: string;
  paginaInicial?: string;
  citacaoInicial?: string;
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

export const DrawerNovaPermanente: React.FC<DrawerNovaPermanenteProps> = ({
  aberto,
  onFechar,
  tipoInicial = 'permanente',
  referenciaInicial = '',
  paginaInicial = '',
  citacaoInicial = '',
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
  const [numTema, setNumTema] = useState<number>(2); // Padrão: 2 Filosofia
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

      if (referenciaInicial) {
        const match = referenciaInicial.match(/^(\d)/);
        if (match) {
          setNumTema(Number(match[1]));
        }
      }
    }
  }, [aberto, tipoInicial, referenciaInicial, paginaInicial, citacaoInicial]);

  if (!aberto) return null;

  const permanentesFiltradas = todasPermanentes.filter((p) => {
    if (!buscaRelacao) return true;
    const b = buscaRelacao.toLowerCase();
    return p.titulo.toLowerCase().includes(b) || (p.tags && p.tags.some((t) => t.toLowerCase().includes(b)));
  });

  const notaRelacaoSelecionada = todasPermanentes.find((p) => p.id === relacaoNotaId || p.titulo === relacaoNotaId);

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
    { num: 1, nome: 'Literatura', cor: 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
    { num: 2, nome: 'História', cor: 'border-amber-600 text-amber-700 bg-amber-50 dark:bg-amber-950/40' },
    { num: 3, nome: 'Psicologia', cor: 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
    { num: 4, nome: 'Religião', cor: 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
    { num: 5, nome: 'Filosofia', cor: 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' }
  ];

  const relacoesDialeticas: { tipo: TipoRelacaoDialetica; label: string; icone: string; desc: string; estilo: string }[] = [
    {
      tipo: 'desenvolve',
      label: 'Desenvolve / Aprofunda',
      icone: '🌲',
      desc: 'Expande um argumento já existente',
      estilo: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-400'
    },
    {
      tipo: 'contraponto',
      label: 'Contraponto / Objeção',
      icone: '⚡',
      desc: 'Tensão dialética ou objeção crítica',
      estilo: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-400'
    },
    {
      tipo: 'complementa',
      label: 'Complementa / Afim',
      icone: '🧩',
      desc: 'Visão afim vinda de outra área',
      estilo: 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border-sky-400'
    },
    {
      tipo: 'aplica',
      label: 'Aplica / Exemplo',
      icone: '💡',
      desc: 'Caso prático ou ilustração empírica',
      estilo: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-400'
    },
    {
      tipo: 'origem',
      label: 'Origem Histórica',
      icone: '📜',
      desc: 'Genealogia, antecedente ou influência',
      estilo: 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border-stone-400'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity duration-300 animate-fadeIn">
      <div
        className="w-full sm:w-[560px] lg:w-[620px] bg-white dark:bg-[#16171b] border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col h-full text-stone-800 dark:text-stone-200"
        role="dialog"
        aria-modal="true"
      >
        {/* CABEÇALHO DO DRAWER */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-[#131417]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              tipo === 'permanente'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : tipo === 'referencia'
                ? 'bg-sky-100 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300'
                : 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300'
            }`}>
              {tipo === 'permanente' ? <Sparkles className="w-4 h-4" /> : tipo === 'referencia' ? <BookOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>
                  {tipo === 'permanente'
                    ? 'Nova Nota Permanente'
                    : tipo === 'referencia'
                    ? 'Nova Ficha de Referência'
                    : 'Nova Nota Índice (Macrotema)'}
                </span>
                <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                  Zettelkasten
                </span>
              </h2>
              <p className="text-[11px] text-stone-500 font-sans">
                {tipo === 'permanente'
                  ? '1 conceito atômico redigido com suas próprias palavras'
                  : tipo === 'referencia'
                  ? 'Fichamento de fonte, livro ou artigo para colher citações'
                  : 'Ponto focal de entrada para agrupar conceitos afins'}
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELETOR DE ABAS */}
        <div className="px-5 pt-3 pb-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#15161a]">
          <div className="flex items-center gap-1 bg-stone-200/60 dark:bg-stone-800/80 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setTipo('permanente')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center ${
                tipo === 'permanente'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Minha Ideia (Permanente)
            </button>
            <button
              type="button"
              onClick={() => setTipo('referencia')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center ${
                tipo === 'referencia'
                  ? 'bg-white dark:bg-sky-800 text-sky-900 dark:text-sky-100 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Fonte / Livro (Referência)
            </button>
            <button
              type="button"
              onClick={() => setTipo('indice')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center ${
                tipo === 'indice'
                  ? 'bg-white dark:bg-purple-800 text-purple-900 dark:text-purple-100 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Macrotema
            </button>
          </div>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {tipo === 'permanente' && (
            <>
              {/* CITAÇÃO ORIGINAL INSPIRADORA */}
              {citacao && (
                <div className="relative p-4 rounded-xl bg-gradient-to-r from-amber-50/90 to-stone-50/60 dark:from-amber-950/30 dark:to-[#1a1b1f] border-l-4 border-amber-600 dark:border-amber-500 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 font-sans font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5" />
                      <span>Trecho da Fonte Inspiradora (Citação)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCitacao('')}
                      className="text-[11px] text-stone-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>

                  <blockquote className="font-serif italic text-xs sm:text-sm text-stone-800 dark:text-amber-100/90 leading-relaxed pl-1">
                    "{citacao}"
                  </blockquote>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-sans border-t border-amber-200/50 dark:border-amber-900/40">
                    <span className="truncate max-w-[280px]">
                      Fonte: <strong className="text-stone-700 dark:text-stone-300">{referencia || 'Obra'}</strong>
                    </span>
                    {pagina && <span>Página: <strong>p. {pagina}</strong></span>}
                  </div>
                </div>
              )}

              {/* TÍTULO DO CONCEITO */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                    Título Conceitual da Ideia *
                  </label>
                  <span className="text-[10px] text-stone-400">1 ideia com suas palavras</span>
                </div>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: O ciúme retrospectivo como tribunal paranoico"
                  className="w-full p-3 font-serif text-sm sm:text-base font-semibold rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:font-sans placeholder:font-normal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-600 transition"
                  autoFocus
                  required
                />
              </div>

              {/* MACROTEMA CANÔNICO */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                  Macrotema Canônico
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {macrotemas.map((m) => (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => setNumTema(m.num)}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        numTema === m.num
                          ? `${m.cor} font-bold ring-2 ring-emerald-600/30 shadow-2xs`
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-stone-400">Nº {m.num}</div>
                      <div className="text-[11px] font-medium truncate">{m.nome}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FONTE E PÁGINA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                    <span>Fonte de Referência</span>
                  </label>
                  <select
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600 truncate"
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
                    Página da Citação
                  </label>
                  <input
                    type="text"
                    value={pagina}
                    onChange={(e) => setPagina(e.target.value)}
                    placeholder="Ex: 84"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* CONEXÃO DIALÉTICA COM OUTRA PERMANENTE */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Conectar com Outra Nota Permanente (Opcional)</span>
                  </div>
                  <span className="text-[10px] text-purple-600 font-semibold">Teia Dialética</span>
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
                        placeholder="Buscar ideia permanente existente para interligar..."
                        className="w-full p-2.5 text-xs pl-8 rounded-lg bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                      {relacaoNotaId && (
                        <button
                          type="button"
                          onClick={() => {
                            setRelacaoNotaId('');
                            setBuscaRelacao('');
                          }}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
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
                          <span className="text-[10px] text-stone-400 shrink-0">{p.pasta}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {relacaoNotaId && (
                  <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800 animate-fadeIn">
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block uppercase tracking-wider">
                      Tipo de Relação Intelectual
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {relacoesDialeticas.map((rd) => (
                        <button
                          key={rd.tipo}
                          type="button"
                          onClick={() => setTipoRelacao(rd.tipo)}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer text-xs ${
                            tipoRelacao === rd.tipo
                              ? `${rd.estilo} ring-2 ring-purple-600/30 font-semibold shadow-2xs`
                              : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{rd.icone}</span>
                            <span>{rd.label}</span>
                          </div>
                          <div className="text-[10px] opacity-75 truncate pt-0.5">{rd.desc}</div>
                        </button>
                      ))}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={justificativaRelacao}
                        onChange={(e) => setJustificativaRelacao(e.target.value)}
                        placeholder="Justificativa breve (Ex: Contrapõe a tese hobbesiana ao defender a bondade natural)"
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* MINHA SÍNTESE / DESENVOLVIMENTO INICIAL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                    Minha Ideia com Minhas Palavras
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono">Markdown</span>
                </div>
                <textarea
                  rows={5}
                  value={conteudoInicial}
                  onChange={(e) => setConteudoInicial(e.target.value)}
                  placeholder="Explique o conceito de forma autônoma e completa, sem depender da citação original..."
                  className="w-full p-3 font-serif text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 leading-relaxed"
                />
              </div>
            </>
          )}

          {tipo === 'referencia' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Fichar Livro da Biblioteca (1 Clique)
                </label>
                <select
                  value={livroSelecionadoId}
                  onChange={(e) => setLivroSelecionadoId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
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
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Título da Fonte Externa *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Dostoiévski - Memórias do Subsolo"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Macrotema</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {macrotemas.map((m) => (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => setNumTema(m.num)}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        numTema === m.num
                          ? `${m.cor} font-bold ring-2 ring-sky-600/30 shadow-2xs`
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-stone-400">Nº {m.num}</div>
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
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nome do Macrotema / Índice *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: 6 - SOCIOLOGIA ou 7 - POLÍTICA"
                  className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              {todosIndices.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Índices Já Existentes ({todosIndices.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
                    {todosIndices.map((ind) => (
                      <span
                        key={ind.id}
                        className="text-[11px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40"
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
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
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
                  ? 'Criar Nota Permanente'
                  : tipo === 'referencia'
                  ? 'Criar Ficha de Referência'
                  : 'Criar Macrotema'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
