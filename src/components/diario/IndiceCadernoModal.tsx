import React, { useState, useMemo } from 'react';
import {
  CadernoVolume,
  CheckinSemanal,
  DiaLog,
  CheckoutSemanal,
  PaginaLivreCaderno
} from '../../types';
import {
  Search,
  X,
  Bookmark,
  ChevronRight
} from 'lucide-react';

export interface ItemIndiceNavegacao {
  id: string;
  paginaNumero: number;
  titulo: string;
  subtitulo?: string;
  tipo: 'checkin' | 'dia' | 'checkout' | 'pagina_livre' | 'volume';
  dataReferencia?: string;
  revisado?: boolean;
}

interface IndiceCadernoModalProps {
  isOpen: boolean;
  onClose: () => void;
  volume: CadernoVolume;
  checkins: CheckinSemanal[];
  diasLogs: Record<string, DiaLog>;
  checkouts: CheckoutSemanal[];
  paginasLivres: PaginaLivreCaderno[];
  onSelecionarPagina: (item: ItemIndiceNavegacao) => void;
}

export const IndiceCadernoModal: React.FC<IndiceCadernoModalProps> = ({
  isOpen,
  onClose,
  volume,
  checkins,
  diasLogs,
  checkouts,
  paginasLivres,
  onSelecionarPagina
}) => {
  const [busca, setBusca] = useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Montar lista completa e ordenada do índice com base nas páginas reais do caderno
  const itensIndice = useMemo(() => {
    const itens: ItemIndiceNavegacao[] = [];

    // 1. Check-ins Semanais
    checkins.forEach((c) => {
      itens.push({
        id: `checkin-${c.id}`,
        paginaNumero: c.paginaNumero || 3,
        titulo: `Check-in Semanal (${c.dataInicio.split('-').reverse().slice(0, 2).join('/')} a ${c.dataFim.split('-').reverse().slice(0, 2).join('/')})`,
        subtitulo: c.paragrafoIntencao ? `"${c.paragrafoIntencao.slice(0, 75)}"` : 'Planejamento e foco semanal',
        tipo: 'checkin',
        dataReferencia: c.dataInicio
      });
    });

    // 2. Dias da Semana (Daily Logs)
    const diasOrdenados = Object.values(diasLogs).sort((a, b) => a.data.localeCompare(b.data));
    diasOrdenados.forEach((d) => {
      const [, mes, diaNum] = d.data.split('-');
      const dataObj = new Date(d.data + 'T12:00:00');
      const diaDaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
      const diaCapitalizado = diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);
      const qtd = d.itens.length;
      const resumoItens =
        qtd === 0 ? 'Sem registros' : qtd === 1 ? '1 registro' : `${qtd} registros`;

      itens.push({
        id: `dia-${d.data}`,
        paginaNumero: d.paginaNumero,
        titulo: `${diaCapitalizado}, ${diaNum}/${mes}`,
        subtitulo: d.revisado ? `Dia revisado · ${resumoItens}` : resumoItens,
        tipo: 'dia',
        dataReferencia: d.data,
        revisado: d.revisado
      });
    });

    // 3. Checkouts Semanais
    checkouts.forEach((co) => {
      itens.push({
        id: `checkout-${co.id}`,
        paginaNumero: co.paginaNumero || 11,
        titulo: `Checkout Semanal — Balanço`,
        subtitulo: co.balancoBom ? `"${co.balancoBom.slice(0, 70)}"` : 'Fechamento do ciclo semanal',
        tipo: 'checkout'
      });
    });

    // 4. Páginas Livres / Anotações
    paginasLivres.forEach((p) => {
      const preview = p.conteudo.slice(0, 80).replace(/[#*`_]/g, '').trim();
      itens.push({
        id: `pag-${p.id}`,
        paginaNumero: p.paginaNumero,
        titulo: p.titulo,
        subtitulo: preview || 'Página livre sem conteúdo',
        tipo: 'pagina_livre'
      });
    });

    // Ordenar estritamente por número de página
    return itens.sort((a, b) => a.paginaNumero - b.paginaNumero);
  }, [checkins, diasLogs, checkouts, paginasLivres]);

  // Filtragem de busca
  const itensFiltrados = useMemo(() => {
    if (!busca.trim()) return itensIndice;
    const b = busca.toLowerCase();
    return itensIndice.filter(
      (it) =>
        it.titulo.toLowerCase().includes(b) ||
        (it.subtitulo && it.subtitulo.toLowerCase().includes(b)) ||
        `página ${it.paginaNumero}`.includes(b) ||
        `pág ${it.paginaNumero}`.includes(b)
    );
  }, [itensIndice, busca]);

  if (!isOpen) return null;

  const labelTipo = (tipo: ItemIndiceNavegacao['tipo']) => {
    switch (tipo) {
      case 'checkin':
        return 'Check-in';
      case 'checkout':
        return 'Checkout';
      case 'pagina_livre':
        return 'Livre';
      default:
        return 'Diário';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 dark:bg-black/75 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Índice do Caderno"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#fcfaf5] dark:bg-[#18191d] border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-[#FBF8F3] dark:bg-stone-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-amber-800 text-amber-300 flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block truncate">
                {volume.titulo}
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
                Índice do Caderno
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar índice"
            className="p-2 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca no Índice */}
        <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/30">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por tópico, dia ou número da página..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
              autoFocus
            />
          </div>
        </div>

        {/* Lista do Índice */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 overflow-y-auto flex-1 divide-y divide-stone-200/60 dark:divide-stone-800/60">
          {itensFiltrados.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 dark:text-stone-400 font-serif">
              {busca.trim()
                ? `Nenhuma página encontrada para "${busca}".`
                : 'Nenhuma página indexada neste caderno.'}
            </div>
          ) : (
            itensFiltrados.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelecionarPagina(item);
                  onClose();
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-amber-50/70 dark:hover:bg-amber-950/25 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-14 shrink-0 text-right font-mono text-xs font-bold text-amber-900 dark:text-amber-400 tabular-nums">
                    Pág. {item.paginaNumero}
                  </span>

                  <div className="h-5 w-px bg-stone-200 dark:bg-stone-800 shrink-0" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 truncate">
                        {item.titulo}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 shrink-0">
                        {labelTipo(item.tipo)}
                      </span>
                      {item.revisado && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                          ✓ Revisado
                        </span>
                      )}
                    </div>

                    {item.subtitulo && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate font-serif mt-0.5">
                        {item.subtitulo}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="px-5 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-[#FBF8F3] dark:bg-stone-900/60 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
          <span className="font-mono tabular-nums">
            {itensIndice.length} {itensIndice.length === 1 ? 'página indexada' : 'páginas indexadas'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
