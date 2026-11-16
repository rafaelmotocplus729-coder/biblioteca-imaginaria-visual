-- =========================================================================
-- ESQUEMA DO BANCO DE DADOS SUPABASE — ZETTELKASTEN DE ESTUDOS
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- =========================================================================

-- 1. Tabela de Notas Zettelkasten (Índices, Referências e Permanentes)
CREATE TABLE IF NOT EXISTS public.notas_zettel (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('indice', 'referencia', 'permanente')),
  pasta TEXT NOT NULL CHECK (pasta IN ('01 índice', '02 referências', '03 permanentes')),
  tags TEXT[] DEFAULT '{}',
  tema TEXT,
  referencia TEXT,
  pagina TEXT,
  relacao TEXT,
  livro_id INTEGER,
  revisar BOOLEAN DEFAULT FALSE,
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabela de Notas Temporárias (Caixa de Entrada / Inbox 48h)
CREATE TABLE IF NOT EXISTS public.notas_temporarias (
  id TEXT PRIMARY KEY,
  pensamento TEXT NOT NULL,
  fonte TEXT NOT NULL,
  livro_id INTEGER,
  pagina TEXT,
  processada BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de Canvas de Articulação Conceitual
CREATE TABLE IF NOT EXISTS public.canvas_zettel (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  data_atualizacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Habilitar Row Level Security (RLS) conforme boas práticas do Supabase
ALTER TABLE public.notas_zettel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_temporarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_zettel ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso Público / Anônimo e Autenticado (Permite leitura e escrita)
-- (Para uso pessoal simples com chave anon)
CREATE POLICY "Permitir tudo em notas_zettel"
  ON public.notas_zettel
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir tudo em notas_temporarias"
  ON public.notas_temporarias
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir tudo em canvas_zettel"
  ON public.canvas_zettel
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Inserir índices padrão essenciais caso o banco esteja vazio
INSERT INTO public.notas_zettel (id, titulo, tipo, pasta, tags, conteudo)
VALUES 
  ('1-LITERATURA', '1 - LITERATURA', 'indice', '01 índice', ARRAY['nota índice'], '# Referências\n- \n\n# Notas Relacionadas\n- '),
  ('2-HISTORIA', '2 - HISTÓRIA', 'indice', '01 índice', ARRAY['nota índice'], '# Referências\n- \n\n# Notas Relacionadas\n- '),
  ('3-PSICOLOGIA', '3 - PSICOLOGIA', 'indice', '01 índice', ARRAY['nota índice'], '# Referências\n- \n\n# Notas Relacionadas\n- '),
  ('4-RELIGIAO', '4 - RELIGIÃO', 'indice', '01 índice', ARRAY['nota índice'], '# Referências\n- \n\n# Notas Relacionadas\n- '),
  ('5-FILOSOFIA', '5 - FILOSOFIA', 'indice', '01 índice', ARRAY['nota índice'], '# Referências\n- \n\n# Notas Relacionadas\n- ')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 7. TABELAS DA AGENDA / CADERNO REAL (DIÁRIO INTELECTUAL)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.cadernos_volumes (
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
CREATE POLICY "Permitir tudo em cadernos_volumes"
  ON public.cadernos_volumes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo em checkins_semanais" ON public.checkins_semanais;
CREATE POLICY "Permitir tudo em checkins_semanais"
  ON public.checkins_semanais FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo em dias_logs" ON public.dias_logs;
CREATE POLICY "Permitir tudo em dias_logs"
  ON public.dias_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo em checkouts_semanais" ON public.checkouts_semanais;
CREATE POLICY "Permitir tudo em checkouts_semanais"
  ON public.checkouts_semanais FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo em paginas_livres_caderno" ON public.paginas_livres_caderno;
CREATE POLICY "Permitir tudo em paginas_livres_caderno"
  ON public.paginas_livres_caderno FOR ALL USING (true) WITH CHECK (true);
