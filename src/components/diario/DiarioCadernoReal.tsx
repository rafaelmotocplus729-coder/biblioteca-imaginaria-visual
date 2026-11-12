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
  Layers
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ======================================================== */}
        {/* CABEÇALHO DO CADERNO (MÓDULO 1: METADADOS DO VOLUME)     */}
        {/* ======================================================== */}
        <div className="bg-white/90 dark:bg-[#18191d]/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-amber-200 flex items-center justify-center shadow-md ring-1 ring-amber-600/30 shrink-0">
              <BookMarked className="w-6 h-6 text-amber-300" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  05 — O DIÁRIO INTELECTUAL
                </span>
                <span className="text-xs text-stone-500 font-serif">
                  Metodologia "Caderno Real"
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {volumeAtivo.titulo}
              </h2>

              <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                Início: {volumeAtivo.dataInicio.split('-').reverse().join('/')}
                {volumeAtivo.dataFim ? ` · Término: ${volumeAtivo.dataFim.split('-').reverse().join('/')}` : ' · Volume Ativo (Em aberto)'}
              </p>
            </div>
          </div>

          {/* Botões de Ação do Caderno */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            {/* Botão do Índice Dinâmico */}
            <button
              onClick={() => setModalIndiceAberto(true)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-amber-400 text-stone-800 dark:text-stone-200 font-cinzel font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="Abrir Índice com Paginação Sequencial"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Índice ({Object.keys(diasLogs).length + 5} págs)</span>
            </button>

            {/* Alternar Dot Grid */}
            <button
              onClick={toggleEstiloDotGrid}
              className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                estiloDotGridAtivo
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-400'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
              }`}
              title={estiloDotGridAtivo ? 'Desativar Papel Pontilhado (Dot Grid)' : 'Ativar Papel Pontilhado (Dot Grid)'}
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Histórico de Volumes */}
            <button
              onClick={() => setModalHistoricoAberto(true)}
              className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-amber-400 text-stone-600 dark:text-stone-300 transition cursor-pointer"
              title="Arquivo & Histórico de Volumes"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NAVEGADOR DO CICLO SEMANAL (MÓDULOS 3, 4 e 7)             */}
        {/* ======================================================== */}
        <div className="bg-white/80 dark:bg-[#18191d]/80 backdrop-blur-sm border border-stone-200 dark:border-stone-800 rounded-2xl p-2.5 sm:p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
          {/* Seletor Macro das Etapas do Ciclo */}
          <div className="flex items-center bg-stone-100/90 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs">
            <button
              onClick={() => setSecaoAtiva('checkin')}
              className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition flex items-center gap-1.5 ${
                secaoAtiva === 'checkin'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Check-in Semanal</span>
              <span className="text-[10px] font-mono opacity-60">Pág. 3</span>
            </button>

            <button
              onClick={() => setSecaoAtiva('dias')}
              className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition flex items-center gap-1.5 ${
                secaoAtiva === 'dias'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Dias da Semana</span>
              <span className="text-[10px] font-mono opacity-60">Págs. 4-10</span>
            </button>

            <button
              onClick={() => setSecaoAtiva('checkout')}
              className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition flex items-center gap-1.5 ${
                secaoAtiva === 'checkout'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Checkout Semanal</span>
              <span className="text-[10px] font-mono opacity-60">Pág. 11</span>
            </button>

            <button
              onClick={() => setSecaoAtiva('livres')}
              className={`px-3 py-1.5 rounded-lg font-cinzel font-bold transition flex items-center gap-1.5 ${
                secaoAtiva === 'livres'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Páginas Livres</span>
              <span className="text-[10px] font-mono opacity-60">({paginasLivresCaderno.length})</span>
            </button>
          </div>

          {/* Subnavegador dos Dias da Semana (quando em 'dias') */}
          {secaoAtiva === 'dias' && (
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1">
              {diasOrdenados.map((d) => {
                const [, , diaNum] = d.data.split('-');
                const isSelected = d.data === diaSelecionadoData;
                const dataObj = new Date(d.data + 'T12:00:00');
                const siglaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
                const isHoje = d.data === '2026-11-12';

                return (
                  <button
                    key={d.data}
                    onClick={() => setDiaSelecionadoData(d.data)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition flex flex-col items-center shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-800 text-white font-bold shadow-2xs ring-1 ring-amber-600'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="text-[9.5px] uppercase font-cinzel tracking-tight flex items-center gap-0.5">
                      {siglaSemana}
                      {d.revisado && <span className="text-[8px] text-amber-300 font-bold">✓</span>}
                    </span>
                    <span className="text-xs font-bold leading-tight flex items-center gap-1">
                      {diaNum}
                      {isHoje && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Hoje"></span>
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
              <div className="flex items-center justify-between text-xs font-cinzel text-stone-500 px-2">
                <button
                  disabled={indiceDiaAtual <= 0}
                  onClick={() => {
                    if (indiceDiaAtual > 0) {
                      setDiaSelecionadoData(diasOrdenados[indiceDiaAtual - 1].data);
                    }
                  }}
                  className="flex items-center gap-1 hover:text-amber-800 disabled:opacity-30 disabled:hover:text-stone-500 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Dia Anterior</span>
                </button>

                <span className="font-mono text-[11px] text-stone-400">
                  Dia {indiceDiaAtual + 1} de {diasOrdenados.length} no Ciclo
                </span>

                <button
                  disabled={indiceDiaAtual >= diasOrdenados.length - 1}
                  onClick={() => {
                    if (indiceDiaAtual < diasOrdenados.length - 1) {
                      setDiaSelecionadoData(diasOrdenados[indiceDiaAtual + 1].data);
                    }
                  }}
                  className="flex items-center gap-1 hover:text-amber-800 disabled:opacity-30 disabled:hover:text-stone-500 cursor-pointer"
                >
                  <span>Próximo Dia</span>
                  <ChevronRight className="w-4 h-4" />
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
