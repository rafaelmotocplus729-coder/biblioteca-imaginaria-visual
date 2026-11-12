import React, { useState, useMemo } from 'react';
import {
  NotaTemporaria,
  TipoItemDaily
} from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import {
  ArrowRight,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  BookMarked,
  Tag,
  Send,
  Calendar,
  Layers,
  Inbox
} from 'lucide-react';

interface CaixaEntradaInboxProps {
  onConverterEmPermanente: (nota: NotaTemporaria) => void;
  onSelecionarLivroEstante?: (livroId: number) => void;
}

export const CaixaEntradaInbox: React.FC<CaixaEntradaInboxProps> = ({
  onConverterEmPermanente,
  onSelecionarLivroEstante
}) => {
  const {
    livros,
    notasTemporarias,
    adicionarNotaTemporaria,
    removerNotaTemporaria,
    converterNotaTemporariaParaDiario
  } = useBibliotecaStore();

  // Estados do formulário de captura
  const [pensamento, setPensamento] = useState('');
  const [livroId, setLivroId] = useState<number | ''>('');
  const [pagina, setPagina] = useState('');
  const [fonteTexto, setFonteTexto] = useState('');
  const [tagSelecionada, setTagSelecionada] = useState<string>('');
  const [enviarDiretoDiario, setEnviarDiretoDiario] = useState(false);
  const [tipoItemDiario, setTipoItemDiario] = useState<TipoItemDaily>('nota');

  // Estados de busca e filtro
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'pendentes' | 'processadas'>('pendentes');
  const [modoVisualizacao, setModoVisualizacao] = useState<'fichas' | 'compacto'>('fichas');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);

  // Tags rápidas sugeridas
  const TAGS_RAPIDAS = ['#citação', '#ideia', '#dúvida', '#ensaio', '#epistemologia', '#moral', '#método'];

  // Submeter captura
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pensamento.trim()) return;

    let nomeFonte = fonteTexto.trim();
    if (livroId !== '') {
      const livro = livros.find((l) => l.id === Number(livroId));
      if (livro) {
        nomeFonte = `#${livro.id} ${livro.titulo} (${livro.autor})`;
      }
    }
    if (!nomeFonte) nomeFonte = 'Reflexão Solta / Fonte Externa';

    const textoFinal = tagSelecionada
      ? `${pensamento.trim()} ${tagSelecionada}`
      : pensamento.trim();

    if (enviarDiretoDiario) {
      // Cria temporária e converte imediatamente para o Diário de hoje
      adicionarNotaTemporaria({
        pensamento: textoFinal,
        fonte: nomeFonte,
        livroId: livroId === '' ? undefined : Number(livroId),
        pagina: pagina ? pagina.trim() : undefined
      });
      // A última adicionada vai para o diário
      const hoje = new Date().toISOString().split('T')[0];
      const textoDiario = `${textoFinal} [Fonte: ${nomeFonte}${pagina ? `, p. ${pagina}` : ''}]`;
      useBibliotecaStore.getState().adicionarItemDiaLog(hoje, {
        tipo: tipoItemDiario,
        texto: textoDiario,
        estado: 'pendente',
        urgente: false
      });
      setSucessoMsg('Pensamento registrado e enviado diretamente para o Diário Intelectual de hoje!');
    } else {
      adicionarNotaTemporaria({
        pensamento: textoFinal,
        fonte: nomeFonte,
        livroId: livroId === '' ? undefined : Number(livroId),
        pagina: pagina ? pagina.trim() : undefined
      });
      setSucessoMsg('Ficha de captura adicionada à Caixa de Entrada!');
    }

    // Resetar campos
    setPensamento('');
    setPagina('');
    setFonteTexto('');
    setTagSelecionada('');
    setTimeout(() => setSucessoMsg(null), 3500);
  };

  // Tecla de atalho Ctrl+Enter / Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Copiar para área de transferência
  const handleCopiarTexto = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  // Enviar ficha existente para o diário
  const handleMoverParaDiario = (notaId: string, tipo: TipoItemDaily = 'nota') => {
    converterNotaTemporariaParaDiario(notaId, tipo);
    setSucessoMsg('Ficha convertida e transferida para o Diário Intelectual!');
    setTimeout(() => setSucessoMsg(null), 3000);
  };

  // Filtragem
  const notasFiltradas = useMemo(() => {
    return notasTemporarias.filter((t) => {
      if (filtroStatus === 'pendentes' && t.processada) return false;
      if (filtroStatus === 'processadas' && !t.processada) return false;

      if (termoBusca.trim()) {
        const busca = termoBusca.toLowerCase();
        const matchPensamento = t.pensamento.toLowerCase().includes(busca);
        const matchFonte = t.fonte.toLowerCase().includes(busca);
        return matchPensamento || matchFonte;
      }
      return true;
    });
  }, [notasTemporarias, filtroStatus, termoBusca]);

  // Estatísticas
  const totalNotas = notasTemporarias.length;
  const totalPendentes = notasTemporarias.filter((t) => !t.processada).length;
  const totalProcessadas = notasTemporarias.filter((t) => t.processada).length;

  // Cálculo de frescor 48h
  const getTempoInfo = (dataCriacao: string) => {
    const criacao = new Date(dataCriacao).getTime();
    const agora = Date.now();
    const horasPassadas = (agora - criacao) / (1000 * 60 * 60);
    const horasRestantes = Math.max(0, Math.round(48 - horasPassadas));

    if (horasPassadas >= 48) {
      return {
        label: 'Expirada (> 48h)',
        estilo: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        urgente: true
      };
    } else if (horasPassadas >= 24) {
      return {
        label: `Atenção: ${horasRestantes}h restantes`,
        estilo: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        urgente: true
      };
    } else {
      return {
        label: `Fresca: ${horasRestantes}h restantes`,
        estilo: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        urgente: false
      };
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-6">
      {/* Cabeçalho da Caixa de Entrada */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
              <Inbox className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>04 — CAIXA DE ENTRADA</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono tracking-tight">
              Fichário 48h · Luhmann Method
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">
            Caixa de Entrada & Captura Rápida
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 font-serif leading-relaxed max-w-2xl">
            Anote intuições e citações instantâneas durante a leitura sem interromper seu foco. Processe em notas permanentes ou envie para o seu diário em até 48 horas.
          </p>
        </div>

        {/* Indicadores Resumidos */}
        <div className="flex items-center gap-2 sm:gap-3 bg-stone-100/80 dark:bg-stone-900/80 p-2 sm:p-2.5 rounded-xl border border-stone-200/90 dark:border-stone-800 text-xs">
          <div className="text-center px-2 border-r border-stone-200 dark:border-stone-800">
            <div className="text-[10px] uppercase font-bold text-stone-500">Na Fila</div>
            <div className="text-base font-serif font-bold text-amber-800 dark:text-amber-300">
              {totalPendentes}
            </div>
          </div>
          <div className="text-center px-2 border-r border-stone-200 dark:border-stone-800">
            <div className="text-[10px] uppercase font-bold text-stone-500">Processadas</div>
            <div className="text-base font-serif font-bold text-emerald-700 dark:text-emerald-400">
              {totalProcessadas}
            </div>
          </div>
          <div className="text-center px-2">
            <div className="text-[10px] uppercase font-bold text-stone-500">Total Fichas</div>
            <div className="text-base font-serif font-bold text-stone-800 dark:text-stone-200">
              {totalNotas}
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de Feedback Temporária */}
      {sucessoMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fadeIn shadow-2xs">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {sucessoMsg}
          </span>
          <button onClick={() => setSucessoMsg(null)} className="text-stone-400 hover:text-stone-600">
            &times;
          </button>
        </div>
      )}

      {/* CARD DE CAPTURA RÁPIDA (Ficha de Input Ágil) */}
      <div className="card-fichario rounded-2xl p-5 sm:p-6 border border-stone-300/80 dark:border-stone-800 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-cinzel font-bold text-stone-900 dark:text-stone-100 tracking-wide">
              Nova Ficha de Captura Instantânea
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-400 hidden sm:inline">
            Atalho: <kbd className="px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-[10px] font-semibold text-stone-700 dark:text-stone-300">Ctrl+Enter</kbd>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Textarea do Pensamento */}
          <div>
            <textarea
              rows={3}
              value={pensamento}
              onChange={(e) => setPensamento(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="O que você acabou de ler ou intuir? Registre a ideia essencial com suas palavras..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-serif leading-relaxed resize-y"
              required
            />
          </div>

          {/* Seletores de Livro / Página / Fonte */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-8">
              <select
                value={livroId}
                onChange={(e) => setLivroId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="">Fonte Externa / Outra Leitura...</option>
                {livros.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} {l.titulo} — {l.autor} (Nível {l.nivel})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <input
                type="text"
                value={pagina}
                onChange={(e) => setPagina(e.target.value)}
                placeholder="Página (ex: 84 ou 112-115)"
                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {livroId === '' && (
            <div>
              <input
                type="text"
                value={fonteTexto}
                onChange={(e) => setFonteTexto(e.target.value)}
                placeholder="Nome da fonte externa, artigo, podcast ou autor..."
                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          )}

          {/* Chips de Tags Rápidas */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-stone-500 font-cinzel font-semibold flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-stone-400" />
              Tag:
            </span>
            {TAGS_RAPIDAS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTagSelecionada(tagSelecionada === t ? '' : t)}
                className={`text-[10.5px] px-2 py-0.5 rounded-md font-mono transition cursor-pointer ${
                  tagSelecionada === t
                    ? 'bg-amber-800 text-amber-100 font-bold dark:bg-amber-600 dark:text-white'
                    : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Opção de Enviar Direto para o Diário */}
          <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enviarDiretoDiario}
                onChange={(e) => setEnviarDiretoDiario(e.target.checked)}
                className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 border-stone-300 dark:border-stone-700"
              />
              <span className="text-xs text-stone-700 dark:text-stone-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Também incluir como item no Diário de Hoje</span>
              </span>
            </label>

            {enviarDiretoDiario && (
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setTipoItemDiario('nota')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    tipoItemDiario === 'nota' ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-200 shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  - Nota
                </button>
                <button
                  type="button"
                  onClick={() => setTipoItemDiario('tarefa')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    tipoItemDiario === 'tarefa' ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-200 shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  • Tarefa
                </button>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-cinzel font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{enviarDiretoDiario ? 'Capturar & Adicionar ao Diário' : 'Adicionar ao Fichário 48h'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* BARRA DE CONTROLE: BUSCA, FILTROS E VISUALIZAÇÃO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Campo de Busca Rápida */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Filtrar pensamentos ou fonte..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Alternador de Status e Visualização */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-stone-100 dark:bg-stone-900 p-0.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs">
            <button
              onClick={() => setFiltroStatus('pendentes')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                filtroStatus === 'pendentes'
                  ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Pendentes ({totalPendentes})
            </button>
            <button
              onClick={() => setFiltroStatus('processadas')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                filtroStatus === 'processadas'
                  ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Processadas ({totalProcessadas})
            </button>
            <button
              onClick={() => setFiltroStatus('todas')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                filtroStatus === 'todas'
                  ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Todas ({totalNotas})
            </button>
          </div>

          <div className="flex items-center bg-stone-100 dark:bg-stone-900 p-0.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs">
            <button
              onClick={() => setModoVisualizacao('fichas')}
              className={`p-1 rounded ${modoVisualizacao === 'fichas' ? 'bg-white dark:bg-stone-800 text-amber-800 shadow-2xs' : 'text-stone-500'}`}
              title="Visualização em Fichas Bibliográficas"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setModoVisualizacao('compacto')}
              className={`p-1 rounded ${modoVisualizacao === 'compacto' ? 'bg-white dark:bg-stone-800 text-amber-800 shadow-2xs' : 'text-stone-500'}`}
              title="Visualização Compacta"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LISTA / GRID DE FICHAS DE ENTRADA */}
      <div className="space-y-3">
        {notasFiltradas.length === 0 ? (
          <div className="p-12 text-center bg-stone-50/70 dark:bg-stone-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 space-y-2">
            <Inbox className="w-8 h-8 text-amber-700/50 mx-auto" />
            <h4 className="text-sm font-cinzel font-bold text-stone-800 dark:text-stone-200">
              Sua Caixa de Entrada está livre!
            </h4>
            <p className="text-xs text-stone-500 font-serif max-w-md mx-auto">
              Nenhuma ficha pendente no momento. Ao ler ou estudar, use o campo acima para capturar intuições sem interromper sua concentração.
            </p>
          </div>
        ) : modoVisualizacao === 'fichas' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notasFiltradas.map((t) => {
              const tempoInfo = getTempoInfo(t.dataCriacao);

              return (
                <div
                  key={t.id}
                  className={`card-fichario rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-amber-400 dark:hover:border-amber-600/70 ${
                    t.processada
                      ? 'opacity-60 bg-stone-50/60 dark:bg-stone-900/30 border-dashed'
                      : 'shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Linha de Metadados / Fonte & Tempo Restante */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <BookMarked className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                        {onSelecionarLivroEstante && t.livroId ? (
                          <button
                            type="button"
                            onClick={() => onSelecionarLivroEstante(t.livroId!)}
                            className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate font-sans hover:text-amber-800 dark:hover:text-amber-400 hover:underline cursor-pointer text-left"
                            title="Ver livro na estante"
                          >
                            {t.fonte}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate font-sans">
                            {t.fonte}
                          </span>
                        )}
                        {t.pagina && (
                          <span className="text-[11px] font-mono text-stone-500 shrink-0">
                            · p. {t.pagina}
                          </span>
                        )}
                      </div>

                      {!t.processada ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 font-mono ${tempoInfo.estilo}`}>
                          {tempoInfo.label}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Processada
                        </span>
                      )}
                    </div>

                    {/* Texto da Ideia / Citação */}
                    <blockquote className="text-xs sm:text-sm font-serif text-stone-800 dark:text-stone-200 italic leading-relaxed border-l-2 border-amber-600/40 pl-3 my-2">
                      "{t.pensamento}"
                    </blockquote>
                  </div>

                  {/* Barra Inferior com Ações de 1 Clique */}
                  <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2">
                    {!t.processada ? (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onConverterEmPermanente(t)}
                            className="text-xs font-cinzel font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                            title="Sintetizar em Nota Permanente no Zettelkasten"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Sintetizar em Permanente</span>
                          </button>

                          <button
                            onClick={() => handleMoverParaDiario(t.id, 'nota')}
                            className="text-[11px] font-cinzel font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 transition cursor-pointer"
                            title="Adicionar ao Diário Intelectual de Hoje"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Diário</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopiarTexto(t.pensamento, t.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                            title="Copiar texto"
                          >
                            {copiadoId === t.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => removerNotaTemporaria(t.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Excluir ficha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-stone-400">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ficha consolidada com sucesso
                        </span>
                        <button
                          onClick={() => removerNotaTemporaria(t.id)}
                          className="text-[11px] text-stone-400 hover:text-rose-600 underline"
                        >
                          Limpar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MODO COMPACTO / TABELA */
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-2xs divide-y divide-stone-100 dark:divide-stone-800">
            {notasFiltradas.map((t) => (
              <div
                key={t.id}
                className={`p-3 flex items-center justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition ${
                  t.processada ? 'opacity-60' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-0.5">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {t.fonte}
                    </span>
                    {t.pagina && <span>· p. {t.pagina}</span>}
                  </div>
                  <p className="text-xs font-serif text-stone-800 dark:text-stone-200 truncate">
                    "{t.pensamento}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!t.processada && (
                    <>
                      <button
                        onClick={() => onConverterEmPermanente(t)}
                        className="px-2 py-1 rounded-lg text-xs font-cinzel font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                      >
                        Sintetizar
                      </button>
                      <button
                        onClick={() => handleMoverParaDiario(t.id, 'nota')}
                        className="px-2 py-1 rounded-lg text-xs font-cinzel text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                      >
                        + Diário
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removerNotaTemporaria(t.id)}
                    className="p-1 rounded text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
