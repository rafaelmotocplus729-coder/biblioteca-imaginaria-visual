import React, { useState, useMemo } from 'react';
import {
  NotaTemporaria,
  TipoItemDaily
} from '../../types';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import {
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Sparkles,
  BookMarked,
  Tag,
  Send,
  Calendar,
  Layers,
  Inbox,
  Clock,
  AlertTriangle,
  ListFilter,
  BookOpen,
  X
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
      adicionarNotaTemporaria({
        pensamento: textoFinal,
        fonte: nomeFonte,
        livroId: livroId === '' ? undefined : Number(livroId),
        pagina: pagina ? pagina.trim() : undefined
      });
      const hoje = new Date().toISOString().split('T')[0];
      const textoDiario = `${textoFinal} [Fonte: ${nomeFonte}${pagina ? `, p. ${pagina}` : ''}]`;
      useBibliotecaStore.getState().adicionarItemDiaLog(hoje, {
        tipo: tipoItemDiario,
        texto: textoDiario,
        estado: 'pendente',
        urgente: false
      });
      setSucessoMsg('Ideia fugaz registrada e enviada diretamente para o Diário Intelectual de hoje!');
    } else {
      adicionarNotaTemporaria({
        pensamento: textoFinal,
        fonte: nomeFonte,
        livroId: livroId === '' ? undefined : Number(livroId),
        pagina: pagina ? pagina.trim() : undefined
      });
      setSucessoMsg('Nota fugaz adicionada à Caixa de Entrada para triagem em até 48h!');
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
    setSucessoMsg('Nota fugaz transferida para o Diário Intelectual!');
    setTimeout(() => setSucessoMsg(null), 3000);
  };

  // Cálculo de frescor SLA 48h de Luhmann
  const getTempoInfo = (dataCriacao: string) => {
    const criacao = new Date(dataCriacao).getTime();
    const agora = Date.now();
    const horasPassadas = Math.max(0, (agora - criacao) / (1000 * 60 * 60));
    const horasRestantes = Math.max(0, Math.round(48 - horasPassadas));

    if (horasPassadas >= 48) {
      return {
        status: 'expirada' as const,
        label: 'Expirando (> 48h)',
        detalhe: `${Math.round(horasPassadas)}h na fila`,
        estilo:
          'bg-rose-100/90 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800/80',
        dotColor: 'bg-rose-500',
        urgente: true
      };
    } else if (horasPassadas >= 24) {
      return {
        status: 'atencao' as const,
        label: `SLA: ${horasRestantes}h restantes`,
        detalhe: 'Triagem recomendada hoje',
        estilo:
          'bg-amber-100/90 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800/80',
        dotColor: 'bg-amber-500',
        urgente: true
      };
    } else {
      return {
        status: 'fresca' as const,
        label: `Fresca (< 24h · ${horasRestantes}h)`,
        detalhe: 'Memória ativa recente',
        estilo:
          'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80',
        dotColor: 'bg-emerald-500',
        urgente: false
      };
    }
  };

  // Estatísticas tabulares da Caixa de Entrada
  const metricasInbox = useMemo(() => {
    const pendentes = notasTemporarias.filter((t) => !t.processada);
    const convertidas = notasTemporarias.filter((t) => t.processada);
    const agora = Date.now();

    let frescas = 0;
    let expirando = 0;

    pendentes.forEach((t) => {
      const horas = (agora - new Date(t.dataCriacao).getTime()) / (1000 * 60 * 60);
      if (horas < 24) frescas += 1;
      if (horas >= 48) expirando += 1;
    });

    return {
      total: notasTemporarias.length,
      pendentes: pendentes.length,
      frescas,
      expirando,
      convertidas: convertidas.length
    };
  }, [notasTemporarias]);

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

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-6">
      {/* CABEÇALHO EDITORIAL DA CAIXA DE ENTRADA */}
      <div className="border-b border-stone-200/90 dark:border-stone-800 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
              <Inbox className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>04 — CAIXA DE ENTRADA · NOTAS FUGAZES</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-mono tabular-nums px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Regra das 48h de Luhmann</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Caixa de Entrada — Notas Fugazes
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-serif leading-relaxed max-w-2xl">
            <strong className="text-stone-800 dark:text-stone-200 font-semibold">Princípio das 48h (Niklas Luhmann):</strong>{' '}
            Notas fugazes (<em>Flüchtige Notizen</em>) são centelhas provisórias capturadas no calor da leitura. Faça a triagem em até 48 horas enquanto o contexto mental permanece vivo: promova-as a{' '}
            <span className="underline decoration-emerald-600/50">Notas Permanentes</span> autônomas, vincule ao fichamento da obra ou descarte sem culpa.
          </p>
        </div>

        {/* CONTADORES TABULARES DE TRIAGEM */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-[#fcfaf5] dark:bg-[#14151a] p-2 sm:p-2.5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs shrink-0">
          <div className="px-2.5 py-1.5 rounded-xl bg-stone-100/70 dark:bg-stone-900/70 text-center">
            <div className="text-[9.5px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
              Pendentes
            </div>
            <div className="text-base sm:text-lg font-mono tabular-nums font-bold text-amber-800 dark:text-amber-300 mt-0.5">
              {metricasInbox.pendentes}
            </div>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 text-center border border-emerald-200/50 dark:border-emerald-900/40">
            <div className="text-[9.5px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
              Frescas &lt;24h
            </div>
            <div className="text-base sm:text-lg font-mono tabular-nums font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
              {metricasInbox.frescas}
            </div>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 text-center border border-rose-200/50 dark:border-rose-900/40">
            <div className="text-[9.5px] uppercase font-bold tracking-wider text-rose-700 dark:text-rose-400">
              Expirando &gt;48h
            </div>
            <div className="text-base sm:text-lg font-mono tabular-nums font-bold text-rose-700 dark:text-rose-300 mt-0.5">
              {metricasInbox.expirando}
            </div>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-stone-100/70 dark:bg-stone-900/70 text-center">
            <div className="text-[9.5px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
              Convertidas
            </div>
            <div className="text-base sm:text-lg font-mono tabular-nums font-bold text-stone-700 dark:text-stone-200 mt-0.5">
              {metricasInbox.convertidas}
            </div>
          </div>
        </div>
      </div>

      {/* MENSAGEM DE FEEDBACK TEMPORÁRIA */}
      {sucessoMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between animate-fadeIn shadow-2xs">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{sucessoMsg}</span>
          </span>
          <button
            onClick={() => setSucessoMsg(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* COMPOSITOR DE CAPTURA RÁPIDA ("CAPTURAR IDEIA FUGAZ") */}
      <div className="card-fichario rounded-2xl p-5 sm:p-6 border border-stone-300/80 dark:border-stone-800 bg-[#fcfaf5] dark:bg-[#15161b] shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-700 dark:bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-cinzel font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                Capturar Ideia Fugaz
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                Registre o insight sem sair do fluxo de leitura
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 hidden sm:flex items-center gap-1.5">
            <span>Salvar rápido:</span>
            <kbd className="px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 shadow-2xs">
              Ctrl+Enter
            </kbd>
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
              placeholder="Qual intuição, objeção ou conexão surgiu agora? Escreva de forma direta..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-300/90 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-serif leading-relaxed resize-y shadow-2xs"
              required
            />
          </div>

          {/* Seletores de Livro / Página / Fonte */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-8 relative">
              <div className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300/80 dark:border-stone-700 focus-within:ring-2 focus-within:ring-amber-600/30">
                <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <select
                  value={livroId}
                  onChange={(e) => setLivroId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none truncate cursor-pointer"
                >
                  <option value="">Vincular obra da Biblioteca ou Fonte Externa...</option>
                  {livros.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id} {l.titulo} — {l.autor} (Nível {l.nivel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-4">
              <input
                type="text"
                value={pagina}
                onChange={(e) => setPagina(e.target.value)}
                placeholder="Página (ex: 84 ou 112-115)"
                className="w-full p-2.5 text-xs font-mono tabular-nums rounded-xl bg-white dark:bg-stone-900 border border-stone-300/80 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
              />
            </div>
          </div>

          {livroId === '' && (
            <div>
              <input
                type="text"
                value={fonteTexto}
                onChange={(e) => setFonteTexto(e.target.value)}
                placeholder="Ou especifique fonte externa, ensaio, aula ou autor..."
                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-300/80 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
              />
            </div>
          )}

          {/* Chips de Tags Rápidas */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-stone-500 font-cinzel font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              <span>Marcador:</span>
            </span>
            {TAGS_RAPIDAS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTagSelecionada(tagSelecionada === t ? '' : t)}
                className={`text-[10.5px] px-2.5 py-0.5 rounded-lg font-mono transition cursor-pointer border ${
                  tagSelecionada === t
                    ? 'bg-amber-800 text-amber-50 border-amber-700 font-bold dark:bg-amber-600 dark:text-white shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700 hover:bg-stone-200/80 dark:hover:bg-stone-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Barra Inferior do Compositor */}
          <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enviarDiretoDiario}
                  onChange={(e) => setEnviarDiretoDiario(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 border-stone-300 dark:border-stone-700 cursor-pointer"
                />
                <span className="text-xs text-stone-700 dark:text-stone-300 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Espelhar no Diário Intelectual de Hoje</span>
                </span>
              </label>

              {enviarDiretoDiario && (
                <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-stone-800 p-0.5 rounded-lg text-xs border border-stone-300/60 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setTipoItemDiario('nota')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      tipoItemDiario === 'nota'
                        ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-200 shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    – Nota
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoItemDiario('tarefa')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      tipoItemDiario === 'tarefa'
                        ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-200 shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    • Tarefa
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-white font-cinzel font-bold text-xs shadow-sm ring-1 ring-amber-900/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{enviarDiretoDiario ? 'Capturar & Registrar no Diário' : 'Salvar Ideia Fugaz'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* BARRA DE CONTROLE: BUSCA, FILTROS E VISUALIZAÇÃO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Campo de Busca Rápida */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar por conceito, palavra-chave ou obra vinculada..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-2xs"
          />
        </div>

        {/* Alternador de Status e Visualização */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200/90 dark:border-stone-800 text-xs">
            <button
              onClick={() => setFiltroStatus('pendentes')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono tabular-nums transition cursor-pointer ${
                filtroStatus === 'pendentes'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Pendentes ({metricasInbox.pendentes})
            </button>
            <button
              onClick={() => setFiltroStatus('processadas')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono tabular-nums transition cursor-pointer ${
                filtroStatus === 'processadas'
                  ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Convertidas ({metricasInbox.convertidas})
            </button>
            <button
              onClick={() => setFiltroStatus('todas')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono tabular-nums transition cursor-pointer ${
                filtroStatus === 'todas'
                  ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Todas ({metricasInbox.total})
            </button>
          </div>

          <div className="flex items-center bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200/90 dark:border-stone-800 text-xs">
            <button
              onClick={() => setModoVisualizacao('fichas')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                modoVisualizacao === 'fichas'
                  ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Visualização em Fichas de Triagem"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setModoVisualizacao('compacto')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                modoVisualizacao === 'compacto'
                  ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Visualização em Lista Compacta"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LISTA / GRID DE FICHAS DE ENTRADA */}
      <div className="space-y-3">
        {notasFiltradas.length === 0 ? (
          <div className="p-12 text-center bg-[#fcfaf5]/70 dark:bg-stone-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 space-y-2.5">
            <Inbox className="w-8 h-8 text-amber-700/50 dark:text-amber-400/50 mx-auto" />
            <h4 className="text-sm font-cinzel font-bold text-stone-800 dark:text-stone-200">
              Caixa de Entrada em Dia (Inbox Zero)
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-serif max-w-md mx-auto leading-relaxed">
              Nenhuma nota fugaz aguardando triagem neste filtro. Ao ler ou estudar, utilize o compositor acima para capturar centelhas intelectuais.
            </p>
          </div>
        ) : modoVisualizacao === 'fichas' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notasFiltradas.map((t) => {
              const tempoInfo = getTempoInfo(t.dataCriacao);

              return (
                <div
                  key={t.id}
                  className={`card-fichario rounded-2xl p-5 flex flex-col justify-between transition-all border ${
                    t.processada
                      ? 'opacity-65 bg-stone-50/60 dark:bg-stone-900/30 border-dashed border-stone-300 dark:border-stone-800'
                      : 'bg-[#fcfaf5] dark:bg-[#15161b] border-stone-200/90 dark:border-stone-800 hover:border-amber-400/90 dark:hover:border-amber-600/60 shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Linha Superior: Fonte & SLA Badge */}
                    <div className="flex items-start justify-between gap-2.5 mb-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <BookMarked className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                        {onSelecionarLivroEstante && t.livroId ? (
                          <button
                            type="button"
                            onClick={() => onSelecionarLivroEstante(t.livroId!)}
                            className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate font-sans hover:text-amber-800 dark:hover:text-amber-300 hover:underline cursor-pointer text-left"
                            title="Abrir fichamento da obra vinculada"
                          >
                            {t.fonte}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate font-sans">
                            {t.fonte}
                          </span>
                        )}
                        {t.pagina && (
                          <span className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-stone-400 shrink-0">
                            · p. {t.pagina}
                          </span>
                        )}
                      </div>

                      {!t.processada ? (
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 font-mono tabular-nums ${tempoInfo.estilo}`}
                          title={tempoInfo.detalhe}
                        >
                          {tempoInfo.status === 'expirada' ? (
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${tempoInfo.dotColor}`} />
                          )}
                          <span>{tempoInfo.label}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3" />
                          <span>Convertida</span>
                        </span>
                      )}
                    </div>

                    {/* Corpo do Pensamento / Ideia Fugaz */}
                    <blockquote className="text-xs sm:text-sm font-serif text-stone-800 dark:text-stone-100 leading-relaxed border-l-2 border-amber-600/50 dark:border-amber-500/50 pl-3.5 my-2">
                      “{t.pensamento}”
                    </blockquote>
                  </div>

                  {/* Barra de Triagem (Ação Primária + Secundárias) */}
                  <div className="mt-4 pt-3.5 border-t border-stone-200/80 dark:border-stone-800/90 flex items-center justify-between gap-2 flex-wrap">
                    {!t.processada ? (
                      <>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* AÇÃO PRIMÁRIA: PROMOVER A NOTA PERMANENTE */}
                          <button
                            type="button"
                            onClick={() => onConverterEmPermanente(t)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                            title="Redigir e promover esta ideia fugaz a uma Nota Permanente atômica"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                            <span>Promover a Nota Permanente</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-80 shrink-0" />
                          </button>

                          {/* AÇÃO SECUNDÁRIA 1: VINCULAR / ABRIR FICHAMENTO OU DIÁRIO */}
                          {onSelecionarLivroEstante && t.livroId ? (
                            <button
                              type="button"
                              onClick={() => onSelecionarLivroEstante(t.livroId!)}
                              className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/90 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 border border-stone-200/90 dark:border-stone-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Abrir fichamento de referência desta obra"
                            >
                              <BookOpen className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                              <span>Abrir Fichamento</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMoverParaDiario(t.id, 'nota')}
                              className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/90 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 border border-stone-200/90 dark:border-stone-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Vincular e enviar para o Diário Intelectual de Hoje"
                            >
                              <Calendar className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                              <span>Diário</span>
                            </button>
                          )}
                        </div>

                        {/* AÇÕES SECUNDÁRIAS DE APOIO: COPIAR & DESCARTAR */}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleCopiarTexto(t.pensamento, t.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                            title="Copiar texto da nota"
                          >
                            {copiadoId === t.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => removerNotaTemporaria(t.id)}
                            className="px-2 py-1.5 rounded-lg text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                            title="Descartar nota fugaz"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Descartar</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-stone-400">
                        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Consolidada no Zettelkasten</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removerNotaTemporaria(t.id)}
                          className="text-[11px] text-stone-400 hover:text-rose-600 underline cursor-pointer"
                        >
                          Descartar registro
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MODO COMPACTO / TABELA DE TRIAGEM */
          <div className="bg-[#fcfaf5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-hidden shadow-2xs divide-y divide-stone-200/70 dark:divide-stone-800">
            {notasFiltradas.map((t) => {
              const tempoInfo = getTempoInfo(t.dataCriacao);
              return (
                <div
                  key={t.id}
                  className={`p-3.5 flex items-center justify-between gap-3 hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition ${
                    t.processada ? 'opacity-60' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-0.5">
                      <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {t.fonte}
                      </span>
                      {t.pagina && <span className="font-mono tabular-nums">· p. {t.pagina}</span>}
                      {!t.processada && (
                        <span className={`text-[9.5px] font-mono tabular-nums px-1.5 py-0.2 rounded border ${tempoInfo.estilo}`}>
                          {tempoInfo.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-serif text-stone-800 dark:text-stone-200 truncate">
                      “{t.pensamento}”
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!t.processada && (
                      <>
                        <button
                          type="button"
                          onClick={() => onConverterEmPermanente(t)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 cursor-pointer transition"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Promover a Nota Permanente</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoverParaDiario(t.id, 'nota')}
                          className="px-2 py-1 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 cursor-pointer transition"
                        >
                          + Diário
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removerNotaTemporaria(t.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 cursor-pointer transition"
                      title="Descartar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

