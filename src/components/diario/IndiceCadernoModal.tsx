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

  // Montar lista completa e ordenada do índice com base nas páginas
  const itensIndice = useMemo(() => {
    const itens: ItemIndiceNavegacao[] = [];

    // 1. Identidade do Volume (Páginas 1-2)
    itens.push({
      id: 'vol-capa',
      paginaNumero: 1,
      titulo: `${volume.titulo} — Abertura e Termos`,
      subtitulo: `Iniciado em ${volume.dataInicio} ${volume.dataFim ? `· Concluído em ${volume.dataFim}` : '· Em Aberto'}`,
      tipo: 'volume'
    });

    // 2. Check-ins Semanais
    checkins.forEach((c) => {
      itens.push({
        id: `checkin-${c.id}`,
        paginaNumero: c.paginaNumero || 3,
        titulo: `Check-in Semanal (${c.dataInicio.split('-').reverse().slice(0, 2).join('/')} a ${c.dataFim.split('-').reverse().slice(0, 2).join('/')})`,
        subtitulo: c.paragrafoIntencao ? `"${c.paragrafoIntencao.slice(0, 75)}..."` : 'Planejamento e foco semanal',
        tipo: 'checkin',
        dataReferencia: c.dataInicio
      });
    });

    // 3. Dias da Semana (Daily Logs)
    const diasOrdenados = Object.values(diasLogs).sort((a, b) => a.data.localeCompare(b.data));
    diasOrdenados.forEach((d) => {
      const [, mes, diaNum] = d.data.split('-');
      const dataObj = new Date(d.data + 'T12:00:00');
      const diaDaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
      const diaCapitalizado = diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);

      itens.push({
        id: `dia-${d.data}`,
        paginaNumero: d.paginaNumero,
        titulo: `${diaCapitalizado}, ${diaNum}/${mes} · Daily Log`,
        subtitulo: d.revisado ? '✓ Dia Revisado & Concluído' : `${d.itens.length} registros anotados`,
        tipo: 'dia',
        dataReferencia: d.data,
        revisado: d.revisado
      });
    });

    // 4. Checkouts Semanais
    checkouts.forEach((co) => {
      itens.push({
        id: `checkout-${co.id}`,
        paginaNumero: co.paginaNumero || 11,
        titulo: `Checkout Semanal — Balanço & Estatísticas`,
        subtitulo: co.balancoBom ? `O que funcionou: "${co.balancoBom.slice(0, 70)}..."` : 'Fechamento do ciclo semanal',
        tipo: 'checkout'
      });
    });

    // 5. Páginas Livres / Anotações
    paginasLivres.forEach((p) => {
      itens.push({
        id: `pag-${p.id}`,
        paginaNumero: p.paginaNumero,
        titulo: p.titulo,
        subtitulo: p.conteudo.slice(0, 80).replace(/[#*`_]/g, '') + '...',
        tipo: 'pagina_livre'
      });
    });

    // Ordenar estritamente por número de página
    return itens.sort((a, b) => a.paginaNumero - b.paginaNumero);
  }, [volume, checkins, diasLogs, checkouts, paginasLivres]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#18191d] border border-stone-300 dark:border-stone-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-200 flex items-center justify-center shadow-md">
              <Bookmark className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Módulo 2 · Paginação Sequencial
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Índice Geral do Caderno Real
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca no Índice */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/20">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por tópico, semana, dia ou número da página..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              autoFocus
            />
          </div>
        </div>

        {/* Tabela do Índice */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-1.5 divide-y divide-stone-100 dark:divide-stone-800/60">
          {itensFiltrados.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 italic">
              Nenhuma página encontrada para "{busca}".
            </div>
          ) : (
            itensFiltrados.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelecionarPagina(item);
                  onClose();
                }}
                className="pt-2 pb-2 px-3 rounded-xl hover:bg-amber-50/70 dark:hover:bg-amber-950/30 cursor-pointer flex items-center justify-between gap-3 group transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Número da Página estilo Caderno Real */}
                  <span className="w-16 shrink-0 text-right font-mono text-xs font-bold text-amber-900 dark:text-amber-400 group-hover:text-amber-700">
                    Pág. {item.paginaNumero}
                  </span>

                  <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 shrink-0 self-center" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 truncate">
                        {item.titulo}
                      </span>
                      {item.revisado && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-cinzel font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
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

                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-xs text-stone-500 flex items-center justify-between">
          <span className="font-serif">
            Total de {itensIndice.length} páginas indexadas no {volume.titulo}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
