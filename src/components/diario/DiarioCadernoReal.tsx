import React, { useState, useMemo } from 'react';
import { useBibliotecaStore } from '../../store/useBibliotecaStore';
import { ItemIndiceNavegacao } from './IndiceCadernoModal';
import { IndiceCadernoModal } from './IndiceCadernoModal';
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
  Feather
} from 'lucide-react';

export const DiarioCadernoReal: React.FC = () => {
  const {
    cadernosVolumes,
    cadernoAtivoId,
    checkinsSemanais,
    diasLogs,
    checkoutsSemanais,
    paginasLivresCaderno,
    estiloDotGridAtivo,
    toggleEstiloDotGrid
  } = useBibliotecaStore();

  // Estados de navegação interna no caderno
  const [secaoAtiva, setSecaoAtiva] = useState<'checkin' | 'dias' | 'checkout' | 'livres'>('dias');
  const [diaSelecionadoData, setDiaSelecionadoData] = useState<string>('2026-11-12'); // Quinta (Hoje)
  const [paginaLivreIdAtiva, setPaginaLivreIdAtiva] = useState<string>('');

  // Modais
  const [modalIndiceAberto, setModalIndiceAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);

  // Volume ativo
  const volumeAtivo =
    cadernosVolumes.find((v) => v.id === cadernoAtivoId) ||
    cadernosVolumes[0] || {
      id: 'vol-1',
      titulo: 'Caderno Real — Vol. I (2026)',
      dataInicio: '2026-11-09',
      dataFim: null,
      ativo: true,
      criadoEm: new Date().toISOString()
    };

  // Checkin e checkout ativos
  const checkinAtivo = checkinsSemanais[0];
  const checkoutAtivo = checkoutsSemanais[0];

  // Lista ordenada de dias da semana
  const diasOrdenados = useMemo(() => {
    return Object.values(diasLogs).sort((a, b) => a.data.localeCompare(b.data));
  }, [diasLogs]);

  // Dia ativo
  const diaAtivo = diasLogs[diaSelecionadoData] || diasOrdenados[0];

  // Índice para navegação anterior/próximo nos dias
  const indiceDiaAtual = diasOrdenados.findIndex((d) => d.data === diaAtivo?.data);

  // Manipulador de navegação a partir do Índice
  const handleNavegarPeloIndice = (item: ItemIndiceNavegacao) => {
    if (item.tipo === 'checkin') {
      setSecaoAtiva('checkin');
    } else if (item.tipo === 'dia' && item.dataReferencia) {
      setSecaoAtiva('dias');
      setDiaSelecionadoData(item.dataReferencia);
    } else if (item.tipo === 'checkout') {
      setSecaoAtiva('checkout');
    } else if (item.tipo === 'pagina_livre') {
      setSecaoAtiva('livres');
      setPaginaLivreIdAtiva(item.id.replace('pag-', ''));
    }
  };

  return (
    <div
      className={`min-h-[85vh] p-3 sm:p-6 transition-all ${
        estiloDotGridAtivo ? 'dot-grid-paper' : ''
      }`}
    >
      <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-6">
        {/* ======================================================== */}
        {/* CABEÇALHO DO CADERNO (MÓDULO 1: METADADOS DO VOLUME)     */}
        {/* ======================================================== */}
        <div className="bg-[#fcfaf5]/95 dark:bg-[#15161b]/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-amber-200 flex items-center justify-center shadow-md ring-1 ring-amber-600/30 shrink-0">
              <BookMarked className="w-6 h-6 text-amber-300" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10.5px] font-cinzel font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
                  <Feather className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>05 — O DIÁRIO INTELECTUAL</span>
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-serif italic">
                  Metodologia “Caderno Real”
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1 tracking-tight">
                {volumeAtivo.titulo}
              </h2>

              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono tabular-nums mt-0.5">
                Início: {volumeAtivo.dataInicio.split('-').reverse().join('/')}
                {volumeAtivo.dataFim
                  ? ` · Término: ${volumeAtivo.dataFim.split('-').reverse().join('/')}`
                  : ' · Volume Ativo (Em aberto)'}
              </p>
            </div>
          </div>

          {/* Barra de Ferramentas Editorial do Caderno */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            {/* Botão do Índice Dinâmico */}
            <button
              type="button"
              onClick={() => setModalIndiceAberto(true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300/90 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-600 text-stone-800 dark:text-stone-200 font-cinzel font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="Abrir Índice com Paginação Sequencial"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Índice</span>
              <span className="font-mono tabular-nums text-[10.5px] px-1.5 py-0.2 rounded bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                {Object.keys(diasLogs).length + 5} págs
              </span>
            </button>

            {/* Alternar Dot Grid */}
            <button
              type="button"
              onClick={toggleEstiloDotGrid}
              className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                estiloDotGridAtivo
                  ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 border-amber-400 dark:border-amber-700 font-semibold'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-300/90 dark:border-stone-700 hover:border-amber-400'
              }`}
              title={
                estiloDotGridAtivo
                  ? 'Desativar Papel Pontilhado (Dot Grid)'
                  : 'Ativar Papel Pontilhado (Dot Grid)'
              }
            >
              <Grid className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Papel Pontilhado</span>
            </button>

            {/* Histórico de Volumes */}
            <button
              type="button"
              onClick={() => setModalHistoricoAberto(true)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300/90 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-600 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="Arquivo & Histórico de Volumes"
            >
              <Archive className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span className="hidden sm:inline">Volumes</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NAVEGADOR DO CICLO SEMANAL (MÓDULOS 3, 4 e 7)             */}
        {/* ======================================================== */}
        <div className="bg-[#fcfaf5]/90 dark:bg-[#15161b]/90 backdrop-blur-sm border border-stone-200/90 dark:border-stone-800 rounded-2xl p-2.5 sm:p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
          {/* Seletor Macro das Etapas do Ciclo */}
          <div className="flex items-center bg-stone-200/60 dark:bg-stone-900 p-1 rounded-xl border border-stone-300/60 dark:border-stone-800 text-xs overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setSecaoAtiva('checkin')}
              className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                secaoAtiva === 'checkin'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs border border-amber-200/60 dark:border-amber-800/50'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Check-in Semanal</span>
              <span className="text-[10px] font-mono tabular-nums opacity-65">Pág. 3</span>
            </button>

            <button
              type="button"
              onClick={() => setSecaoAtiva('dias')}
              className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                secaoAtiva === 'dias'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs border border-amber-200/60 dark:border-amber-800/50'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Dias da Semana</span>
              <span className="text-[10px] font-mono tabular-nums opacity-65">Págs. 4–10</span>
            </button>

            <button
              type="button"
              onClick={() => setSecaoAtiva('checkout')}
              className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                secaoAtiva === 'checkout'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs border border-amber-200/60 dark:border-amber-800/50'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Checkout Semanal</span>
              <span className="text-[10px] font-mono tabular-nums opacity-65">Pág. 11</span>
            </button>

            <button
              type="button"
              onClick={() => setSecaoAtiva('livres')}
              className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                secaoAtiva === 'livres'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs border border-amber-200/60 dark:border-amber-800/50'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Páginas Livres</span>
              <span className="text-[10px] font-mono tabular-nums opacity-65">
                ({paginasLivresCaderno.length})
              </span>
            </button>
          </div>

          {/* Subnavegador dos Dias da Semana (quando em 'dias') */}
          {secaoAtiva === 'dias' && (
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1">
              {diasOrdenados.map((d) => {
                const [, , diaNum] = d.data.split('-');
                const isSelected = d.data === diaSelecionadoData;
                const dataObj = new Date(d.data + 'T12:00:00');
                const siglaSemana = dataObj
                  .toLocaleDateString('pt-BR', { weekday: 'short' })
                  .slice(0, 3);
                const isHoje = d.data === '2026-11-12';

                return (
                  <button
                    key={d.data}
                    type="button"
                    onClick={() => setDiaSelecionadoData(d.data)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono tabular-nums transition flex flex-col items-center shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-800 text-white font-bold shadow-2xs border-amber-700 ring-2 ring-amber-600/20'
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="text-[9.5px] uppercase font-cinzel tracking-tight flex items-center gap-0.5">
                      <span>{siglaSemana}</span>
                      {d.revisado && (
                        <Check
                          className={`w-2.5 h-2.5 ${
                            isSelected ? 'text-amber-200' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        />
                      )}
                    </span>
                    <span className="text-xs font-bold leading-tight flex items-center gap-1 mt-0.5">
                      <span>{diaNum}</span>
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
          )}
        </div>

        {/* ======================================================== */}
        {/* ÁREA DE EXIBIÇÃO DA SEÇÃO ATIVA                          */}
        {/* ======================================================== */}
        <main className="transition-all animate-fadeIn">
          {secaoAtiva === 'checkin' ? (
            <CheckinSemanalView
              checkin={checkinAtivo}
              onAvancarParaDias={() => setSecaoAtiva('dias')}
            />
          ) : secaoAtiva === 'dias' ? (
            <div className="space-y-4">
              {/* Barra de Navegação Anterior / Próximo Dia */}
              <div className="flex items-center justify-between text-xs font-cinzel text-stone-600 dark:text-stone-400 px-1">
                <button
                  type="button"
                  disabled={indiceDiaAtual <= 0}
                  onClick={() => {
                    if (indiceDiaAtual > 0) {
                      setDiaSelecionadoData(diasOrdenados[indiceDiaAtual - 1].data);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#fcfaf5] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center gap-1.5 hover:border-amber-400 hover:text-amber-800 dark:hover:text-amber-300 disabled:opacity-35 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Dia Anterior</span>
                </button>

                <span className="font-mono tabular-nums text-[11px] px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200/70 dark:border-stone-800">
                  Dia {indiceDiaAtual + 1} de {diasOrdenados.length} no Ciclo Semanal
                </span>

                <button
                  type="button"
                  disabled={indiceDiaAtual >= diasOrdenados.length - 1}
                  onClick={() => {
                    if (indiceDiaAtual < diasOrdenados.length - 1) {
                      setDiaSelecionadoData(diasOrdenados[indiceDiaAtual + 1].data);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#fcfaf5] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center gap-1.5 hover:border-amber-400 hover:text-amber-800 dark:hover:text-amber-300 disabled:opacity-35 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
                >
                  <span>Próximo Dia</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Componente do Daily Log do Dia Selecionado */}
              <DailyLogView dia={diaAtivo} />
            </div>
          ) : secaoAtiva === 'checkout' ? (
            <CheckoutSemanalView
              checkout={checkoutAtivo}
              diasDaSemana={diasOrdenados}
              onIniciarProximaSemana={() => setSecaoAtiva('checkin')}
            />
          ) : (
            <PaginasLivresView paginaSelecionadaId={paginaLivreIdAtiva} />
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ÍNDICE DINÂMICO & PAGINAÇÃO SEQUENCIAL          */}
      {/* ======================================================== */}
      <IndiceCadernoModal
        isOpen={modalIndiceAberto}
        onClose={() => setModalIndiceAberto(false)}
        volume={volumeAtivo}
        checkins={checkinsSemanais}
        diasLogs={diasLogs}
        checkouts={checkoutsSemanais}
        paginasLivres={paginasLivresCaderno}
        onSelecionarPagina={handleNavegarPeloIndice}
      />

      {/* ======================================================== */}
      {/* MODAL 2: HISTÓRICO DE VOLUMES PASSADOS                   */}
      {/* ======================================================== */}
      <HistoricoVolumesModal
        isOpen={modalHistoricoAberto}
        onClose={() => setModalHistoricoAberto(false)}
      />

      {/* ======================================================== */}
      {/* MÓDULO 8: LEGENDA FLUTUANTE ONBOARDING                   */}
      {/* ======================================================== */}
      <LegendaSimbolosFlutuante />
    </div>
  );
};

