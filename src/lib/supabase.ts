import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  NotaZettel,
  NotaTemporaria,
  CadernoVolume,
  CheckinSemanal,
  DiaLog,
  CheckoutSemanal,
  PaginaLivreCaderno
} from '../types';

const STORAGE_URL_KEY = 'zettel_supabase_url';
const STORAGE_KEY_KEY = 'zettel_supabase_anon_key';

const DEFAULT_PROJECT_URL = 'https://meeinyzahufzttyqouwg.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_QCZF6jOLEk5Na5LpzH219g_EgqHJLgq';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envObj = (import.meta as any).env || {};
  const envUrl = envObj.VITE_SUPABASE_URL || '';
  const envKey = envObj.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  return {
    url: localUrl || envUrl || DEFAULT_PROJECT_URL,
    anonKey: localKey || envKey || DEFAULT_ANON_KEY
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  _client = null; // reinicia o cliente
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  _client = null;
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      _client = createClient(config.url, config.anonKey);
      return _client;
    } catch (e) {
      console.warn('Erro ao inicializar cliente Supabase:', e);
      return null;
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

// -------------------------------------------------------------
// SERVIÇOS DE PERSISTÊNCIA REMOTA COM O SUPABASE
// -------------------------------------------------------------

export async function testarConexaoSupabase(url: string, anonKey: string): Promise<{ ok: boolean; mensagem: string }> {
  try {
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('notas_zettel').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          ok: false,
          mensagem: 'Conectou ao Supabase, mas a tabela "notas_zettel" ainda não existe. Execute o script SQL no seu dashboard.'
        };
      }
      return { ok: false, mensagem: `Erro do Supabase: ${error.message}` };
    }
    return { ok: true, mensagem: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { ok: false, mensagem: err.message || 'Falha ao conectar com o Supabase' };
  }
}

// Mapeamentos de dados para o Postgres
function mapearParaDB(nota: NotaZettel) {
  return {
    id: nota.id,
    titulo: nota.titulo,
    tipo: nota.tipo,
    pasta: nota.pasta,
    tags: nota.tags || [],
    tema: nota.tema || null,
    referencia: nota.referencia || null,
    pagina: nota.pagina ? String(nota.pagina) : null,
    relacao: nota.relacao || null,
    livro_id: nota.livroId || null,
    revisar: Boolean(nota.revisar),
    conteudo: nota.conteudo,
    data_criacao: nota.dataCriacao,
    data_atualizacao: nota.dataAtualizacao
  };
}

function mapearDoDB(row: any): NotaZettel {
  return {
    id: row.id,
    titulo: row.titulo,
    tipo: row.tipo,
    pasta: row.pasta,
    tags: Array.isArray(row.tags) ? row.tags : [],
    tema: row.tema || undefined,
    referencia: row.referencia || undefined,
    pagina: row.pagina || undefined,
    relacao: row.relacao || undefined,
    livroId: row.livro_id || undefined,
    revisar: Boolean(row.revisar),
    conteudo: row.conteudo || '',
    dataCriacao: row.data_criacao || new Date().toISOString(),
    dataAtualizacao: row.data_atualizacao || new Date().toISOString()
  };
}

function mapearTempParaDB(temp: NotaTemporaria) {
  return {
    id: temp.id,
    pensamento: temp.pensamento,
    fonte: temp.fonte,
    livro_id: temp.livroId || null,
    pagina: temp.pagina ? String(temp.pagina) : null,
    data_criacao: temp.dataCriacao,
    processada: Boolean(temp.processada)
  };
}

function mapearTempDoDB(row: any): NotaTemporaria {
  return {
    id: row.id,
    pensamento: row.pensamento,
    fonte: row.fonte,
    livroId: row.livro_id || undefined,
    pagina: row.pagina || undefined,
    dataCriacao: row.data_criacao || new Date().toISOString(),
    processada: Boolean(row.processada)
  };
}

export async function sincronizarDoSupabase(): Promise<{
  notas: NotaZettel[];
  temporarias: NotaTemporaria[];
} | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const [notasRes, tempRes] = await Promise.all([
      supabase.from('notas_zettel').select('*').order('data_atualizacao', { ascending: false }),
      supabase.from('notas_temporarias').select('*').order('data_criacao', { ascending: false })
    ]);

    if (notasRes.error) {
      console.warn('Erro ao carregar notas do Supabase:', notasRes.error);
      return null;
    }

    const notas = (notasRes.data || []).map(mapearDoDB);
    const temporarias = (tempRes.data || []).map(mapearTempDoDB);

    return { notas, temporarias };
  } catch (err) {
    console.error('Falha de rede com o Supabase:', err);
    return null;
  }
}

export async function salvarNotaNoSupabase(nota: NotaZettel): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('notas_zettel').upsert(mapearParaDB(nota));
    if (error) console.error('Erro ao salvar nota no Supabase:', error);
    return !error;
  } catch (e) {
    console.error('Falha ao sincronizar com Supabase:', e);
    return false;
  }
}

export async function removerNotaDoSupabase(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('notas_zettel').delete().eq('id', id);
    if (error) console.error('Erro ao remover nota no Supabase:', error);
    return !error;
  } catch (e) {
    console.error('Falha ao remover do Supabase:', e);
    return false;
  }
}

export async function salvarTemporariaNoSupabase(temp: NotaTemporaria): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('notas_temporarias').upsert(mapearTempParaDB(temp));
    if (error) console.error('Erro ao salvar temporaria no Supabase:', error);
    return !error;
  } catch (e) {
    console.error('Falha ao salvar temporaria no Supabase:', e);
    return false;
  }
}

export async function removerTemporariaDoSupabase(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('notas_temporarias').delete().eq('id', id);
    if (error) console.error('Erro ao remover temporaria no Supabase:', error);
    return !error;
  } catch (e) {
    console.error('Falha ao remover temporaria do Supabase:', e);
    return false;
  }
}

// -------------------------------------------------------------
// AGENDA / CADERNO REAL (DIÁRIO INTELECTUAL) NO SUPABASE
// -------------------------------------------------------------

function isTabelaAusenteError(error: any): boolean {
  if (!error) return false;
  return error.code === '42P01' || error.code === 'PGRST205' || String(error.message || '').includes('schema cache');
}

function mapearVolumeParaDB(vol: CadernoVolume) {
  return {
    id: vol.id,
    titulo: vol.titulo,
    data_inicio: vol.dataInicio,
    data_fim: vol.dataFim || null,
    ativo: Boolean(vol.ativo),
    descricao: vol.descricao || null,
    criado_em: vol.criadoEm || new Date().toISOString(),
    data_atualizacao: new Date().toISOString()
  };
}

function mapearVolumeDoDB(row: any): CadernoVolume {
  return {
    id: row.id,
    titulo: row.titulo,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim ?? null,
    ativo: Boolean(row.ativo),
    descricao: row.descricao || undefined,
    criadoEm: row.criado_em || new Date().toISOString()
  };
}

function mapearCheckinParaDB(c: CheckinSemanal) {
  return {
    id: c.id,
    semana_id: c.semanaId,
    caderno_id: c.cadernoId,
    data_inicio: c.dataInicio,
    data_fim: c.dataFim,
    pagina_numero: c.paginaNumero || 1,
    paragrafo_intencao: c.paragrafoIntencao || '',
    foco_tarefas: c.focoTarefas || [],
    foco_compromissos: c.focoCompromissos || [],
    foco_metas: c.focoMetas || [],
    concluido: Boolean(c.concluido),
    criado_em: c.criadoEm || new Date().toISOString(),
    data_atualizacao: new Date().toISOString()
  };
}

function mapearCheckinDoDB(row: any): CheckinSemanal {
  return {
    id: row.id,
    semanaId: row.semana_id,
    cadernoId: row.caderno_id,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
    paginaNumero: Number(row.pagina_numero || 1),
    paragrafoIntencao: row.paragrafo_intencao || '',
    focoTarefas: Array.isArray(row.foco_tarefas) ? row.foco_tarefas : [],
    focoCompromissos: Array.isArray(row.foco_compromissos) ? row.foco_compromissos : [],
    focoMetas: Array.isArray(row.foco_metas) ? row.foco_metas : [],
    concluido: Boolean(row.concluido),
    criadoEm: row.criado_em || new Date().toISOString()
  };
}

function mapearDiaLogParaDB(d: DiaLog) {
  return {
    id: d.id,
    data: d.data,
    semana_id: d.semanaId,
    caderno_id: d.cadernoId,
    pagina_numero: d.paginaNumero || 1,
    revisado: Boolean(d.revisado),
    data_revisao: d.dataRevisao || null,
    itens: d.itens || [],
    termometro: d.termometro || { texto: '', humor: '', atualizadoEm: '' },
    data_atualizacao: new Date().toISOString()
  };
}

function mapearDiaLogDoDB(row: any): DiaLog {
  return {
    id: row.id,
    data: row.data,
    semanaId: row.semana_id,
    cadernoId: row.caderno_id,
    paginaNumero: Number(row.pagina_numero || 1),
    revisado: Boolean(row.revisado),
    dataRevisao: row.data_revisao ?? null,
    itens: Array.isArray(row.itens) ? row.itens : [],
    termometro: row.termometro && typeof row.termometro === 'object'
      ? {
          texto: row.termometro.texto || '',
          humor: row.termometro.humor || '',
          atualizadoEm: row.termometro.atualizadoEm || ''
        }
      : { texto: '', humor: '', atualizadoEm: '' }
  };
}

function mapearCheckoutParaDB(c: CheckoutSemanal) {
  return {
    id: c.id,
    semana_id: c.semanaId,
    caderno_id: c.cadernoId,
    pagina_numero: c.paginaNumero || 1,
    balanco_bom: c.balancoBom || '',
    balanco_ruim: c.balancoRuim || '',
    concluido: Boolean(c.concluido),
    data_fechamento: c.dataFechamento || null,
    data_atualizacao: new Date().toISOString()
  };
}

function mapearCheckoutDoDB(row: any): CheckoutSemanal {
  return {
    id: row.id,
    semanaId: row.semana_id,
    cadernoId: row.caderno_id,
    paginaNumero: Number(row.pagina_numero || 1),
    balancoBom: row.balanco_bom || '',
    balancoRuim: row.balanco_ruim || '',
    concluido: Boolean(row.concluido),
    dataFechamento: row.data_fechamento || undefined
  };
}

function mapearPaginaLivreParaDB(p: PaginaLivreCaderno) {
  return {
    id: p.id,
    caderno_id: p.cadernoId,
    pagina_numero: p.paginaNumero || 1,
    titulo: p.titulo,
    conteudo: p.conteudo || '',
    data_criacao: p.dataCriacao || new Date().toISOString(),
    data_atualizacao: p.dataAtualizacao || new Date().toISOString()
  };
}

function mapearPaginaLivreDoDB(row: any): PaginaLivreCaderno {
  return {
    id: row.id,
    cadernoId: row.caderno_id,
    paginaNumero: Number(row.pagina_numero || 1),
    titulo: row.titulo,
    conteudo: row.conteudo || '',
    dataCriacao: row.data_criacao || new Date().toISOString(),
    dataAtualizacao: row.data_atualizacao || new Date().toISOString()
  };
}

export interface DadosAgendaSupabase {
  tabelaAusente: boolean;
  volumes: CadernoVolume[];
  checkins: CheckinSemanal[];
  diasLogs: DiaLog[];
  checkouts: CheckoutSemanal[];
  paginasLivres: PaginaLivreCaderno[];
}

export async function sincronizarAgendaDoSupabase(): Promise<DadosAgendaSupabase | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const [volRes, checkinRes, diasRes, checkoutRes, pagRes] = await Promise.all([
      supabase.from('cadernos_volumes').select('*').order('criado_em', { ascending: true }),
      supabase.from('checkins_semanais').select('*').order('data_inicio', { ascending: true }),
      supabase.from('dias_logs').select('*').order('data', { ascending: true }),
      supabase.from('checkouts_semanais').select('*'),
      supabase.from('paginas_livres_caderno').select('*').order('pagina_numero', { ascending: true })
    ]);

    const errors = [volRes.error, checkinRes.error, diasRes.error, checkoutRes.error, pagRes.error].filter(Boolean);
    if (errors.some(isTabelaAusenteError)) {
      return {
        tabelaAusente: true,
        volumes: [],
        checkins: [],
        diasLogs: [],
        checkouts: [],
        paginasLivres: []
      };
    }

    if (errors.length > 0) {
      console.warn('Erro ao carregar agenda do Supabase:', errors[0]);
      return null;
    }

    return {
      tabelaAusente: false,
      volumes: (volRes.data || []).map(mapearVolumeDoDB),
      checkins: (checkinRes.data || []).map(mapearCheckinDoDB),
      diasLogs: (diasRes.data || []).map(mapearDiaLogDoDB),
      checkouts: (checkoutRes.data || []).map(mapearCheckoutDoDB),
      paginasLivres: (pagRes.data || []).map(mapearPaginaLivreDoDB)
    };
  } catch (err) {
    console.error('Falha de rede ao sincronizar agenda com o Supabase:', err);
    return null;
  }
}

export async function salvarVolumeNoSupabase(volume: CadernoVolume): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('cadernos_volumes').upsert(mapearVolumeParaDB(volume));
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao salvar volume no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}

export async function salvarVolumesNoSupabase(volumes: CadernoVolume[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || volumes.length === 0) return false;
  try {
    const { error } = await supabase.from('cadernos_volumes').upsert(volumes.map(mapearVolumeParaDB));
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao salvar volumes no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}

export async function removerVolumeDoSupabase(cadernoId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    await Promise.all([
      supabase.from('checkins_semanais').delete().eq('caderno_id', cadernoId),
      supabase.from('dias_logs').delete().eq('caderno_id', cadernoId),
      supabase.from('checkouts_semanais').delete().eq('caderno_id', cadernoId),
      supabase.from('paginas_livres_caderno').delete().eq('caderno_id', cadernoId)
    ]);
    const { error } = await supabase.from('cadernos_volumes').delete().eq('id', cadernoId);
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao remover volume no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}

export async function salvarCheckinNoSupabase(checkin: CheckinSemanal): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('checkins_semanais').upsert(mapearCheckinParaDB(checkin));
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao salvar checkin no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}

export async function salvarCheckoutNoSupabase(checkout: CheckoutSemanal): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('checkouts_semanais').upsert(mapearCheckoutParaDB(checkout));
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao salvar checkout no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}

export async function salvarDiaLogNoSupabase(dia: DiaLog): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('dias_logs').upsert(mapearDiaLogParaDB(dia));
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao salvar dia_log no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}

export async function salvarDiasLogsNoSupabase(dias: DiaLog[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || dias.length === 0) return false;
  try {
    const { error } = await supabase.from('dias_logs').upsert(dias.map(mapearDiaLogParaDB));
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao salvar dias_logs no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}

export async function salvarPaginaLivreNoSupabase(pagina: PaginaLivreCaderno): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('paginas_livres_caderno').upsert(mapearPaginaLivreParaDB(pagina));
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao salvar página livre no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}

export async function removerPaginaLivreDoSupabase(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('paginas_livres_caderno').delete().eq('id', id);
    if (error && !isTabelaAusenteError(error)) console.error('Erro ao remover página livre no Supabase:', error);
    return !error;
  } catch {
    return false;
  }
}
