import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://meeinyzahufzttyqouwg.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.log('\n❌ Chave do Supabase não fornecida.');
  console.log('Para executar:');
  console.log('VITE_SUPABASE_ANON_KEY="sua-chave-anon" node scripts/setup-supabase.js\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NOTAS_INDICE = [
  {
    id: '1-LITERATURA',
    titulo: '1 - LITERATURA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: '# Referências\n- \n\n# Notas Relacionadas\n- '
  },
  {
    id: '2-HISTORIA',
    titulo: '2 - HISTÓRIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: '# Referências\n- \n\n# Notas Relacionadas\n- '
  },
  {
    id: '3-PSICOLOGIA',
    titulo: '3 - PSICOLOGIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: '# Referências\n- \n\n# Notas Relacionadas\n- '
  },
  {
    id: '4-RELIGIAO',
    titulo: '4 - RELIGIÃO',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: '# Referências\n- \n\n# Notas Relacionadas\n- '
  },
  {
    id: '5-FILOSOFIA',
    titulo: '5 - FILOSOFIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: '# Referências\n- \n\n# Notas Relacionadas\n- '
  }
];

async function main() {
  console.log(`Conectando em ${SUPABASE_URL}...`);
  
  // Tentar inserir os 5 índices fundamentais
  const { data, error } = await supabase.from('notas_zettel').upsert(NOTAS_INDICE);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('⚠️ Tabela "notas_zettel" ainda não existe no Postgres.');
      console.log('Execute o script supabase/schema.sql no SQL Editor:');
      console.log('https://supabase.com/dashboard/project/meeinyzahufzttyqouwg/sql/new');
      process.exit(1);
    }
    console.error('Erro ao inserir índices:', error.message);
    process.exit(1);
  }

  console.log('✅ Sucesso! Os 5 macrotemas fundamentais foram inicializados no Supabase!');
}

main();
