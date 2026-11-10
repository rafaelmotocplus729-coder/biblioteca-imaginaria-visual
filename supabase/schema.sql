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
