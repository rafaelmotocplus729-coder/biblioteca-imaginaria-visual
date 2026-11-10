import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NotaZettel, NotaTemporaria } from '../types';

const STORAGE_URL_KEY = 'zettel_supabase_url';
const STORAGE_KEY_KEY = 'zettel_supabase_anon_key';

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
    url: localUrl || envUrl,
    anonKey: localKey || envKey
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
