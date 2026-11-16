import {
  CheckinSemanal,
  CheckoutSemanal,
  DiaLog
} from '../types';

/**
 * Formata um objeto Date (em horário local ao meio-dia) para YYYY-MM-DD.
 */
export function formatarDataISO(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Soma (ou subtrai) dias de uma data YYYY-MM-DD sem risco de deslocamento por fuso horário.
 */
export function somarDiasData(dataStr: string, dias: number): string {
  const base = new Date(`${dataStr}T12:00:00`);
  base.setDate(base.getDate() + dias);
  return formatarDataISO(base);
}

/**
 * Dado qualquer YYYY-MM-DD, retorna o Domingo (Dia 01) daquela semana.
 * Se a data já for domingo (getDay() === 0), retorna ela mesma.
 */
export function calcularDomingoDaSemana(dataStr: string): string {
  const base = new Date(`${dataStr}T12:00:00`);
  const diaSemana = base.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  if (diaSemana === 0) return dataStr;
  base.setDate(base.getDate() - diaSemana);
  return formatarDataISO(base);
}

/**
 * Retorna a chave única de um dia no store para evitar colisões entre cadernos diferentes.
 */
export function chaveDiaCaderno(cadernoId: string, dataStr: string): string {
  return `${cadernoId}::${dataStr}`;
}

/**
 * Gera um ciclo semanal completo (Check-in + 7 dias começando no Domingo como Dia 01 + Checkout)
 * com numeração sequencial de páginas a partir de `paginaInicial`.
 */
export function gerarCicloSemanal(
  cadernoId: string,
  dataReferencia: string,
  paginaInicial: number = 3,
  indiceSemana: number = 1
): {
  semanaId: string;
  domingoStr: string;
  sabadoStr: string;
  checkin: CheckinSemanal;
  dias: Record<string, DiaLog>;
  checkout: CheckoutSemanal;
} {
  const domingoStr = calcularDomingoDaSemana(dataReferencia);
  const sabadoStr = somarDiasData(domingoStr, 6);
  const semanaId = `${cadernoId}-sem-${indiceSemana}-${domingoStr}`;
  const agoraISO = new Date().toISOString();

  const checkin: CheckinSemanal = {
    id: `checkin-${semanaId}`,
    semanaId,
    cadernoId,
    dataInicio: domingoStr,
    dataFim: sabadoStr,
    paginaNumero: paginaInicial,
    paragrafoIntencao: '',
    focoTarefas: [],
    focoCompromissos: [],
    focoMetas: [],
    concluido: false,
    criadoEm: agoraISO
  };

  const dias: Record<string, DiaLog> = {};
  for (let i = 0; i < 7; i++) {
    const dataDia = somarDiasData(domingoStr, i);
    const key = chaveDiaCaderno(cadernoId, dataDia);
    dias[key] = {
      id: key,
      data: dataDia,
      semanaId,
      cadernoId,
      paginaNumero: paginaInicial + 1 + i,
      revisado: false,
      dataRevisao: null,
      itens: [],
      termometro: {
        texto: '',
        humor: '',
        atualizadoEm: ''
      }
    };
  }

  const checkout: CheckoutSemanal = {
    id: `checkout-${semanaId}`,
    semanaId,
    cadernoId,
    paginaNumero: paginaInicial + 8,
    balancoBom: '',
    balancoRuim: '',
    concluido: false,
    dataFechamento: undefined
  };

  return {
    semanaId,
    domingoStr,
    sabadoStr,
    checkin,
    dias,
    checkout
  };
}
