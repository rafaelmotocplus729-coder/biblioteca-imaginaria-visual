import React, { useState, useMemo, useEffect } from 'react';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import { calcularDomingoDaSemana, formatarDataISO, somarDiasData } from '../../data/diarioPadrao';
import { ItemIndiceNavegacao, IndiceCadernoModal } from './IndiceCadernoModal';
import { HistoricoVolumesModal } from './HistoricoVolumesModal';
import { CheckinSemanalView } from './CheckinSemanalView';
import { DailyLogView } from './DailyLogView';
import { CheckoutSemanalView } from './CheckoutSemanalView';
import { PaginasLivresView } from './PaginasLivresView';
import { LegendaSimbolosFlutuante } from './LegendaSimbolosFlutuante';
import {
  BookMarked,
  Calendar,
  Grid,
  Bookmark,
  CheckCircle2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Check,
  Plus,
  HelpCircle,
  RefreshCw,
  Database,
  Copy
} from 'lucide-react';

const SQL_AGENDA_MINIMO = `CREATE TABLE IF NOT EXISTS public.cadernos_volumes (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  data_inicio TEXT NOT NULL,
  data_fim TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  descricao TEXT,
  criado_em TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.checkins_semanais (
  id TEXT PRIMARY KEY,
  semana_id TEXT NOT NULL,
  caderno_id TEXT NOT NULL,
  data_inicio TEXT NOT NULL,
  data_fim TEXT NOT NULL,
  pagina_numero INTEGER NOT NULL DEFAULT 1,
  paragrafo_intencao TEXT DEFAULT '',
  foco_tarefas JSONB DEFAULT '[]'::jsonb,
  foco_compromissos JSONB DEFAULT '[]'::jsonb,
  foco_metas JSONB DEFAULT '[]'::jsonb,
  concluido BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.dias_logs (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  semana_id TEXT NOT NULL,
  caderno_id TEXT NOT NULL,
  pagina_numero INTEGER NOT NULL DEFAULT 1,
  revisado BOOLEAN DEFAULT FALSE,
  data_revisao TEXT,
  itens JSONB DEFAULT '[]'::jsonb,
  termometro JSONB DEFAULT '{"texto":"","humor":"","atualizadoEm":""}'::jsonb,
  data_atualizacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.checkouts_semanais (
  id TEXT PRIMARY KEY,
  semana_id TEXT NOT NULL,
  caderno_id TEXT NOT NULL,
  pagina_numero INTEGER NOT NULL DEFAULT 1,
  balanco_bom TEXT DEFAULT '',
  balanco_ruim TEXT DEFAULT '',
  concluido BOOLEAN DEFAULT FALSE,
  data_fechamento TEXT,
  data_atualizacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.paginas_livres_caderno (
  id TEXT PRIMARY KEY,
  caderno_id TEXT NOT NULL,
  pagina_numero INTEGER NOT NULL DEFAULT 1,
  titulo TEXT NOT NULL,
  conteudo TEXT DEFAULT '',
  data_criacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.cadernos_volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins_semanais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dias_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkouts_semanais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paginas_livres_caderno ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em cadernos_volumes" ON public.cadernos_volumes;
CREATE POLICY "Permitir tudo em cadernos_volumes" ON public.cadernos_volumes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir tudo em checkins_semanais" ON public.checkins_semanais;
CREATE POLICY "Permitir tudo em checkins_semanais" ON public.checkins_semanais FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir tudo em dias_logs" ON public.dias_logs;
CREATE POLICY "Permitir tudo em dias_logs" ON public.dias_logs FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir tudo em checkouts_semanais" ON public.checkouts_semanais;
CREATE POLICY "Permitir tudo em checkouts_semanais" ON public.checkouts_semanais FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir tudo em paginas_livres_caderno" ON public.paginas_livres_caderno;
CREATE POLICY "Permitir tudo em paginas_livres_caderno" ON public.paginas_livres_caderno FOR ALL USING (true) WITH CHECK (true);`;

export const DiarioCadernoReal: React.FC = () => {
  const {
    cadernosVolumes,
    cadernoAtivoId,
    checkinsSemanais,
    diasLogs,
    checkoutsSemanais,
    paginasLivresCaderno,
    estiloDotGridAtivo,
    toggleEstiloDotGrid,
    legendaSimbolosVisivel,
    toggleLegendaSimbolos,
    criarCadernoVolume,
    criarProximaSemanaCaderno,
    supabaseStatus,
    agendaTabelaAusente,
    sincronizarSupabase
  } = useBibliotecaStore();
  const [sqlCopiado, setSqlCopiado] = useState(false);

  // Estados de navegação interna no caderno
  const [secaoAtiva, setSecaoAtiva] = useState<'checkin' | 'dias' | 'checkout' | 'livres'>('dias');
  const [semanaAtivaId, setSemanaAtivaId] = useState<string>('');
  const [diaSelecionadoData, setDiaSelecionadoData] = useState<string>('');
  const [paginaLivreIdAtiva, setPaginaLivreIdAtiva] = useState<string>('');

  // Estados para criação do primeiro caderno (quando vazio)
  const [primeiroTitulo, setPrimeiroTitulo] = useState('');
  const [primeiraData, setPrimeiraData] = useState(formatarDataISO(new Date()));

  // Modais
  const [modalIndiceAberto, setModalIndiceAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [abrirCriacaoNoModal, setAbrirCriacaoNoModal] = useState(false);

  // Volume ativo
  const volumeAtivo = useMemo(() => {
    return (
      cadernosVolumes.find((v) => v.id === cadernoAtivoId) ||
      cadernosVolumes[0] ||
      null
    );
  }, [cadernosVolumes, cadernoAtivoId]);

  // Dados filtrados estritamente pelo volume ativo
  const checkinsDoVolume = useMemo(() => {
    if (!volumeAtivo) return [];
    return checkinsSemanais
      .filter((c) => c.cadernoId === volumeAtivo.id)
      .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
  }, [checkinsSemanais, volumeAtivo]);

  const checkoutsDoVolume = useMemo(() => {
    if (!volumeAtivo) return [];
    return checkoutsSemanais.filter((c) => c.cadernoId === volumeAtivo.id);
  }, [checkoutsSemanais, volumeAtivo]);

  const paginasLivresDoVolume = useMemo(() => {
    if (!volumeAtivo) return [];
    return paginasLivresCaderno.filter((p) => p.cadernoId === volumeAtivo.id);
  }, [paginasLivresCaderno, volumeAtivo]);

  const diasDoVolumeMap = useMemo(() => {
    if (!volumeAtivo) return {};
    const filtrado: Record<string, typeof diasLogs[string]> = {};
    Object.entries(diasLogs).forEach(([k, d]) => {
      if (d.cadernoId === volumeAtivo.id) {
        filtrado[k] = d;
      }
    });
    return filtrado;
  }, [diasLogs, volumeAtivo]);

  const todosDiasDoVolume = useMemo(() => {
    return Object.values(diasDoVolumeMap).sort((a, b) => a.data.localeCompare(b.data));
  }, [diasDoVolumeMap]);

  // Sincronizar semana ativa quando muda o volume
  useEffect(() => {
    if (!volumeAtivo) {
      setSemanaAtivaId('');
      setDiaSelecionadoData('');
      return;
    }

    const semanaValida = checkinsDoVolume.some((c) => c.semanaId === semanaAtivaId);
    if (!semanaValida) {
      const ultimaSemana = checkinsDoVolume[checkinsDoVolume.length - 1];
      setSemanaAtivaId(ultimaSemana?.semanaId || '');
    }
  }, [volumeAtivo?.id, checkinsDoVolume, semanaAtivaId]);

  // Checkin e Checkout da semana ativa
  const checkinAtivo = useMemo(() => {
    return (
      checkinsDoVolume.find((c) => c.semanaId === semanaAtivaId) ||
      checkinsDoVolume[checkinsDoVolume.length - 1]
    );
  }, [checkinsDoVolume, semanaAtivaId]);

  const checkoutAtivo = useMemo(() => {
    const semId = checkinAtivo?.semanaId || semanaAtivaId;
    return (
      checkoutsDoVolume.find((c) => c.semanaId === semId) ||
      checkoutsDoVolume[checkoutsDoVolume.length - 1]
    );
  }, [checkoutsDoVolume, checkinAtivo, semanaAtivaId]);

  // Dias da semana ativa (7 dias: Dia 01 Domingo .. Dia 07 Sábado)
  const diasDaSemanaAtual = useMemo(() => {
    const semId = checkinAtivo?.semanaId || semanaAtivaId;
    if (!semId) return todosDiasDoVolume;
    const daSemana = todosDiasDoVolume.filter((d) => d.semanaId === semId);
    return daSemana.length > 0 ? daSemana : todosDiasDoVolume;
  }, [todosDiasDoVolume, checkinAtivo, semanaAtivaId]);

  // Garantir que diaSelecionadoData aponte sempre para um dia válido do volume
  useEffect(() => {
    if (todosDiasDoVolume.length === 0) {
      setDiaSelecionadoData('');
      return;
    }

    const existeNaSemana = diasDaSemanaAtual.some((d) => d.data === diaSelecionadoData);
    if (!existeNaSemana) {
      const hojeStr = formatarDataISO(new Date());
      const hojeNaSemana = diasDaSemanaAtual.find((d) => d.data === hojeStr);
      setDiaSelecionadoData(hojeNaSemana?.data || diasDaSemanaAtual[0]?.data || todosDiasDoVolume[0].data);
    }
  }, [volumeAtivo?.id, semanaAtivaId, diasDaSemanaAtual, todosDiasDoVolume, diaSelecionadoData]);

  // Dia ativo e navegação global entre todos os dias do volume
  const diaAtivo = useMemo(() => {
    return (
      todosDiasDoVolume.find((d) => d.data === diaSelecionadoData) ||
      diasDaSemanaAtual[0] ||
      todosDiasDoVolume[0]
    );
  }, [todosDiasDoVolume, diasDaSemanaAtual, diaSelecionadoData]);

  const indiceDiaGlobal = todosDiasDoVolume.findIndex((d) => d.data === diaAtivo?.data);
  const indiceDiaNaSemana = diasDaSemanaAtual.findIndex((d) => d.data === diaAtivo?.data);

  const handleSelecionarDia = (dataStr: string, semanaId?: string) => {
    if (semanaId && semanaId !== semanaAtivaId) {
      setSemanaAtivaId(semanaId);
    }
    setDiaSelecionadoData(dataStr);
  };

  const handleDiaAnterior = () => {
    if (indiceDiaGlobal > 0) {
      const anterior = todosDiasDoVolume[indiceDiaGlobal - 1];
      handleSelecionarDia(anterior.data, anterior.semanaId);
    }
  };

  const handleProximoDia = () => {
    if (indiceDiaGlobal >= 0 && indiceDiaGlobal < todosDiasDoVolume.length - 1) {
      const proximo = todosDiasDoVolume[indiceDiaGlobal + 1];
      handleSelecionarDia(proximo.data, proximo.semanaId);
    }
  };

  const handleCriarNovaSemana = () => {
    if (!volumeAtivo) return;
    const res = criarProximaSemanaCaderno(volumeAtivo.id);
    if (res) {
      setSemanaAtivaId(res.semanaId);
      setDiaSelecionadoData(res.primeiroDia);
      setSecaoAtiva('dias');
    }
  };

  const handleCriarPrimeiroCaderno = (e: React.FormEvent) => {
    e.preventDefault();
    const tituloFinal = primeiroTitulo.trim() || 'Meu Caderno — Ciclo I';
    const novoId = criarCadernoVolume(tituloFinal, primeiraData);
    if (novoId) {
      const domingo = calcularDomingoDaSemana(primeiraData);
      setDiaSelecionadoData(domingo);
      setSecaoAtiva('dias');
      setPrimeiroTitulo('');
    }
  };

  const handleNavegarPeloIndice = (item: ItemIndiceNavegacao) => {
    if (item.tipo === 'checkin') {
      setSecaoAtiva('checkin');
    } else if (item.tipo === 'dia' && item.dataReferencia) {
      const diaEncontrado = todosDiasDoVolume.find((d) => d.data === item.dataReferencia);
      setSecaoAtiva('dias');
      handleSelecionarDia(item.dataReferencia, diaEncontrado?.semanaId);
    } else if (item.tipo === 'checkout') {
      setSecaoAtiva('checkout');
    } else if (item.tipo === 'pagina_livre') {
      setSecaoAtiva('livres');
      setPaginaLivreIdAtiva(item.id.replace('pag-', ''));
    }
  };

  // =========================================================================
  // ESTADO VAZIO (SEM DADOS MOCKADOS) — CRIAÇÃO DIRETA DO PRIMEIRO CADERNO
  // =========================================================================
  if (!volumeAtivo) {
    const domingoPreview = calcularDomingoDaSemana(primeiraData || formatarDataISO(new Date()));
    const sabadoPreview = somarDiasData(domingoPreview, 6);

    return (
      <div
        className={`min-h-[80vh] p-4 sm:p-8 flex items-center justify-center ${
          estiloDotGridAtivo ? 'dot-grid-paper' : ''
        }`}
      >
        <div className="surface-editorial rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
            <div className="w-12 h-12 rounded-xl bg-stone-900 dark:bg-amber-800 text-amber-200 flex items-center justify-center shrink-0">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Crie seu Primeiro Caderno
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 font-serif mt-1 leading-relaxed">
                Cada caderno organiza seus ciclos semanais com o <strong>Dia 01 começando sempre no Domingo</strong>, seguido de Segunda a Sábado, Termômetro diário e páginas livres.
              </p>
            </div>
          </div>

          <form onSubmit={handleCriarPrimeiroCaderno} className="space-y-4">
            <div>
              <label
                htmlFor="primeiro-caderno-titulo"
                className="block text-xs font-cinzel font-bold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Título do Caderno
              </label>
              <input
                id="primeiro-caderno-titulo"
                type="text"
                value={primeiroTitulo}
                onChange={(e) => setPrimeiroTitulo(e.target.value)}
                placeholder="Ex: Caderno Real — Novembro 2026"
                className="w-full px-4 py-3 rounded-xl bg-[#fcfaf5] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm font-serif text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="primeiro-caderno-data"
                  className="block text-xs font-cinzel font-bold text-stone-700 dark:text-stone-300 mb-1.5"
                >
                  Semana de Referência
                </label>
                <input
                  id="primeiro-caderno-data"
                  type="date"
                  value={primeiraData}
                  onChange={(e) => setPrimeiraData(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fcfaf5] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FBF8F3] dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 flex flex-col justify-center">
                <span className="text-[11px] font-cinzel font-bold text-amber-800 dark:text-amber-400">
                  Dia 01 (Domingo)
                </span>
                <span className="text-xs font-mono text-stone-700 dark:text-stone-300 tabular-nums mt-0.5">
                  {domingoPreview.split('-').reverse().join('/')} a {sabadoPreview.split('-').reverse().join('/')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-cinzel font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Caderno & Iniciar no Domingo (Dia 01)</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalPaginasVolume =
    checkinsDoVolume.length +
    todosDiasDoVolume.length +
    checkoutsDoVolume.length +
    paginasLivresDoVolume.length +
    2;

  const hojeStr = formatarDataISO(new Date());

  return (
    <div
      className={`min-h-[85vh] p-3 sm:p-6 transition-colors ${
        estiloDotGridAtivo ? 'dot-grid-paper' : ''
      }`}
    >
      <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-5">
        {/* CABEÇALHO DO CADERNO */}
        <header className="surface-editorial rounded-2xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-amber-800 text-amber-200 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500 dark:text-stone-400">
                <span className="font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Diário Intelectual
                </span>
                <span>·</span>
                <span className="font-mono tabular-nums">
                  Dia 01 (Dom): {volumeAtivo.dataInicio.split('-').reverse().join('/')}
                  {volumeAtivo.dataFim
                    ? ` · Concluído em ${volumeAtivo.dataFim.split('-').reverse().join('/')}`
                    : ''}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5 tracking-tight truncate">
                {volumeAtivo.titulo}
              </h2>
            </div>
          </div>

          {/* Barra de Ações do Caderno */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setAbrirCriacaoNoModal(true);
                setModalHistoricoAberto(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-cinzel font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Caderno</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAbrirCriacaoNoModal(false);
                setModalHistoricoAberto(true);
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-stone-400 text-stone-700 dark:text-stone-200 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Alternar ou gerenciar cadernos"
            >
              <Archive className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>Cadernos ({cadernosVolumes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setModalIndiceAberto(true)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-stone-400 text-stone-700 dark:text-stone-200 font-cinzel font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Abrir Índice com Paginação Sequencial"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Índice</span>
              <span className="font-mono tabular-nums text-[11px] text-stone-500 dark:text-stone-400">
                {totalPaginasVolume}p
              </span>
            </button>

            <button
              type="button"
              onClick={toggleEstiloDotGrid}
              className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                estiloDotGridAtivo
                  ? 'bg-stone-200/75 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-600 font-semibold'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
              }`}
              title="Alternar papel pontilhado"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pontilhado</span>
            </button>

            <button
              type="button"
              onClick={toggleLegendaSimbolos}
              className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                legendaSimbolosVisivel
                  ? 'bg-stone-200/75 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-600 font-semibold'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
              }`}
              title="Mostrar ou ocultar legenda de símbolos"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Símbolos</span>
            </button>

            <button
              type="button"
              onClick={() => void sincronizarSupabase()}
              disabled={supabaseStatus === 'sincronizando'}
              className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              title="Sincronizar Agenda e Notas com o Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${supabaseStatus === 'sincronizando' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {supabaseStatus === 'sincronizando' ? 'Sincronizando...' : 'Sincronizar'}
              </span>
            </button>
          </div>
        </header>

        {agendaTabelaAusente && (
          <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-amber-950 dark:text-amber-200">
              <Database className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  Tabelas da Agenda ainda não foram criadas no seu Supabase
                </p>
                <p className="text-amber-800 dark:text-amber-300/90 mt-0.5">
                  Seus dados estão salvos localmente. Para sincronizar a Agenda entre notebook e domínio, execute o SQL no{' '}
                  <a
                    href="https://supabase.com/dashboard/project/meeinyzahufzttyqouwg/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold hover:text-amber-950 dark:hover:text-amber-100"
                  >
                    SQL Editor do Supabase
                  </a>{' '}
                  e clique em Sincronizar.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(SQL_AGENDA_MINIMO);
                  setSqlCopiado(true);
                  setTimeout(() => setSqlCopiado(false), 2500);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {sqlCopiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{sqlCopiado ? 'SQL Copiado!' : 'Copiar SQL'}</span>
              </button>
              <button
                type="button"
                onClick={() => void sincronizarSupabase()}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
              >
                Verificar
              </button>
            </div>
          </div>
        )}

        {/* NAVEGAÇÃO UNIFICADA DE SEMANAS, ETAPAS E DIAS */}
        <nav
          aria-label="Navegação do Caderno"
          className="surface-editorial rounded-2xl p-3 sm:p-4 space-y-3"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Etapas do Ciclo */}
            <div className="flex items-center bg-[#FBF8F3] dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800 text-xs overflow-x-auto scrollbar-none gap-1">
              <button
                type="button"
                onClick={() => setSecaoAtiva('checkin')}
                className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  secaoAtiva === 'checkin'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-200 border border-stone-200 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Check-in</span>
                {checkinAtivo && (
                  <span className="text-[11px] font-mono tabular-nums opacity-65">
                    P.{checkinAtivo.paginaNumero}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSecaoAtiva('dias')}
                className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  secaoAtiva === 'dias'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-200 border border-stone-200 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Dias da Semana</span>
                {diasDaSemanaAtual.length > 0 && (
                  <span className="text-[11px] font-mono tabular-nums opacity-65">
                    P.{diasDaSemanaAtual[0].paginaNumero}–{diasDaSemanaAtual[diasDaSemanaAtual.length - 1].paginaNumero}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSecaoAtiva('checkout')}
                className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  secaoAtiva === 'checkout'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-200 border border-stone-200 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Checkout</span>
                {checkoutAtivo && (
                  <span className="text-[11px] font-mono tabular-nums opacity-65">
                    P.{checkoutAtivo.paginaNumero}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSecaoAtiva('livres')}
                className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  secaoAtiva === 'livres'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-amber-200 border border-stone-200 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Páginas Livres</span>
                <span className="text-[11px] font-mono tabular-nums opacity-65">
                  ({paginasLivresDoVolume.length})
                </span>
              </button>
            </div>

            {/* Seletor de Semanas do Caderno + Botão Nova Semana */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {checkinsDoVolume.map((sem, idx) => {
                const ativa = sem.semanaId === checkinAtivo?.semanaId;
                return (
                  <button
                    key={sem.id}
                    type="button"
                    onClick={() => {
                      setSemanaAtivaId(sem.semanaId);
                      if (secaoAtiva === 'dias') {
                        const primeiroDia = todosDiasDoVolume.find((d) => d.semanaId === sem.semanaId);
                        if (primeiroDia) setDiaSelecionadoData(primeiroDia.data);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono tabular-nums border transition-colors shrink-0 cursor-pointer ${
                      ativa
                        ? 'bg-stone-900 dark:bg-amber-800 text-white border-stone-900 dark:border-amber-700 font-bold'
                        : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    }`}
                  >
                    Sem {idx + 1}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleCriarNovaSemana}
                className="px-2.5 py-1.5 rounded-lg text-xs font-cinzel font-bold border border-dashed border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-300 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                title="Criar próximo ciclo semanal (Domingo a Sábado)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Semana</span>
              </button>
            </div>
          </div>

          {/* Tira Integrada: < Dia Anterior | D01 Dom .. D07 Sáb | Próximo Dia > */}
          {secaoAtiva === 'dias' && diasDaSemanaAtual.length > 0 && (
            <div className="flex items-center gap-2 pt-2.5 border-t border-stone-200/80 dark:border-stone-800">
              <button
                type="button"
                disabled={indiceDiaGlobal <= 0}
                onClick={handleDiaAnterior}
                title="Dia Anterior"
                aria-label="Dia Anterior"
                className="px-2.5 py-2.5 rounded-xl bg-[#FBF8F3] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-xs font-cinzel font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xl:inline">Anterior</span>
              </button>

              <div className="flex-1 flex overflow-x-auto scrollbar-none sm:grid sm:grid-cols-7 gap-1.5">
                {diasDaSemanaAtual.map((d, idx) => {
                  const [, mesNum, diaNum] = d.data.split('-');
                  const isSelected = d.data === diaAtivo?.data;
                  const dataObj = new Date(d.data + 'T12:00:00');
                  const siglaSemana = dataObj
                    .toLocaleDateString('pt-BR', { weekday: 'short' })
                    .replace('.', '')
                    .slice(0, 3);
                  const isHoje = d.data === hojeStr;
                  const numDiaCiclo = String(idx + 1).padStart(2, '0');

                  return (
                    <button
                      key={d.data}
                      type="button"
                      onClick={() => handleSelecionarDia(d.data, d.semanaId)}
                      className={`min-w-[58px] sm:min-w-0 shrink-0 px-2 py-1.5 rounded-xl text-xs transition-colors flex flex-col items-center cursor-pointer border ${
                        isSelected
                          ? 'bg-stone-900 dark:bg-amber-800 text-white font-bold border-stone-900 dark:border-amber-700'
                          : 'bg-[#FBF8F3] dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200/90 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <span className="text-[10px] font-mono opacity-70 tabular-nums">
                        D{numDiaCiclo}
                      </span>
                      <span className="text-[11px] uppercase font-cinzel tracking-tight flex items-center gap-0.5">
                        <span>{siglaSemana}</span>
                        {d.revisado && (
                          <Check
                            className={`w-3 h-3 ${
                              isSelected ? 'text-amber-200' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          />
                        )}
                      </span>
                      <span className="text-[11px] font-mono font-semibold tabular-nums flex items-center gap-1">
                        <span>{diaNum}/{mesNum}</span>
                        {isHoje && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                            title="Hoje"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {indiceDiaGlobal < todosDiasDoVolume.length - 1 ? (
                <button
                  type="button"
                  onClick={handleProximoDia}
                  title="Próximo Dia"
                  aria-label="Próximo Dia"
                  className="px-2.5 py-2.5 rounded-xl bg-[#FBF8F3] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-xs font-cinzel font-bold"
                >
                  <span className="hidden xl:inline">Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCriarNovaSemana}
                  title="Criar e avançar para a Próxima Semana (Domingo)"
                  aria-label="Próxima Semana"
                  className="px-2.5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-xs font-cinzel font-bold"
                >
                  <span className="hidden xl:inline">Próx. Sem</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </nav>

        <LegendaSimbolosFlutuante />

        {/* ÁREA DE CONTEÚDO DA SEÇÃO ATIVA */}
        <main className="transition-all animate-fadeIn">
          {secaoAtiva === 'checkin' ? (
            <CheckinSemanalView
              checkin={checkinAtivo}
              onAvancarParaDias={() => setSecaoAtiva('dias')}
            />
          ) : secaoAtiva === 'dias' ? (
            diaAtivo ? (
              <DailyLogView
                dia={diaAtivo}
                diaNumeroNoCiclo={(indiceDiaNaSemana >= 0 ? indiceDiaNaSemana : 0) + 1}
              />
            ) : (
              <div className="surface-editorial rounded-2xl p-8 text-center space-y-3">
                <p className="text-sm font-serif text-stone-600 dark:text-stone-400">
                  Este caderno ainda não possui dias gerados.
                </p>
                <button
                  type="button"
                  onClick={handleCriarNovaSemana}
                  className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-cinzel font-bold cursor-pointer"
                >
                  Gerar Semana (Dia 01 · Domingo)
                </button>
              </div>
            )
          ) : secaoAtiva === 'checkout' ? (
            <CheckoutSemanalView
              checkout={checkoutAtivo}
              diasDaSemana={diasDaSemanaAtual}
              onIniciarProximaSemana={handleCriarNovaSemana}
            />
          ) : (
            <PaginasLivresView paginaSelecionadaId={paginaLivreIdAtiva} />
          )}
        </main>
      </div>

      {/* Modal de Índice Dinâmico */}
      <IndiceCadernoModal
        isOpen={modalIndiceAberto}
        onClose={() => setModalIndiceAberto(false)}
        volume={volumeAtivo}
        checkins={checkinsDoVolume}
        diasLogs={diasDoVolumeMap}
        checkouts={checkoutsDoVolume}
        paginasLivres={paginasLivresDoVolume}
        onSelecionarPagina={handleNavegarPeloIndice}
      />

      {/* Modal de Cadernos / Volumes */}
      <HistoricoVolumesModal
        isOpen={modalHistoricoAberto}
        onClose={() => setModalHistoricoAberto(false)}
        abrirCriacaoDireto={abrirCriacaoNoModal}
        onCadernoCriado={() => {
          setSecaoAtiva('dias');
        }}
      />
    </div>
  );
};
