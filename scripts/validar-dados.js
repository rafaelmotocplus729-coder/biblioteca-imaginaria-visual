import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const livrosPath = path.resolve(__dirname, '../data/livros.json');
const relacoesPath = path.resolve(__dirname, '../data/relacoes.json');

console.log('=== VALIDAÇÃO FASE 0: FUNDAÇÃO ===');

if (!fs.existsSync(livrosPath)) {
  console.error(`ERRO: Arquivo ${livrosPath} não encontrado!`);
  process.exit(1);
}

const livros = JSON.parse(fs.readFileSync(livrosPath, 'utf8'));

if (!Array.isArray(livros)) {
  console.error('ERRO: data/livros.json deve ser uma lista de livros.');
  process.exit(1);
}

console.log(`✓ Total de livros carregados: ${livros.length}`);
if (livros.length !== 60) {
  console.error(`ERRO: Esperados 60 livros, encontrados ${livros.length}.`);
  process.exit(1);
}

const camposObrigatorios = [
  'id', 'nivel', 'ordem_no_nivel', 'autor', 'titulo',
  'ano', 'area', 'classe', 'resumo_permitido', 'obra_de_vida',
  'tese', 'acrescenta', 'por_que_antes_do_proximo', 'idioma_leitura'
];

const contagemNivel = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
const contagemClasse = { OBRA: 0, MAPA: 0, PORTA: 0 };
const contagemArea = {};
const ids = new Set();

for (const livro of livros) {
  for (const campo of camposObrigatorios) {
    if (livro[campo] === undefined || livro[campo] === null || livro[campo] === '') {
      console.error(`ERRO: Livro #${livro.id || '?'} está sem o campo obrigatório "${campo}"!`);
      process.exit(1);
    }
  }

  if (ids.has(livro.id)) {
    console.error(`ERRO: ID duplicado #${livro.id}`);
    process.exit(1);
  }
  ids.add(livro.id);

  if (livro.nivel < 1 || livro.nivel > 5) {
    console.error(`ERRO: Livro #${livro.id} tem nível inválido ${livro.nivel}`);
    process.exit(1);
  }
  contagemNivel[livro.nivel]++;

  if (!['OBRA', 'MAPA', 'PORTA'].includes(livro.classe)) {
    console.error(`ERRO: Livro #${livro.id} tem classe inválida ${livro.classe}`);
    process.exit(1);
  }
  contagemClasse[livro.classe]++;

  contagemArea[livro.area] = (contagemArea[livro.area] || 0) + 1;
}

console.log('\n--- Contagem por Nível ---');
for (let n = 1; n <= 5; n++) {
  console.log(`Nível ${n}: ${contagemNivel[n]} livros`);
  if (contagemNivel[n] !== 12) {
    console.error(`ERRO: Nível ${n} deveria ter 12 livros, mas tem ${contagemNivel[n]}`);
    process.exit(1);
  }
}
console.log('✓ Distribuição por nível verificada com sucesso: (12 / 12 / 12 / 12 / 12)');

console.log('\n--- Contagem por Classe ---');
console.log(`OBRA:  ${contagemClasse.OBRA}`);
console.log(`MAPA:  ${contagemClasse.MAPA}`);
console.log(`PORTA: ${contagemClasse.PORTA}`);

console.log('\n--- Contagem por Área ---');
Object.entries(contagemArea).sort().forEach(([area, qtd]) => {
  console.log(`- ${area}: ${qtd}`);
});

// Validação de relações
if (fs.existsSync(relacoesPath)) {
  const relacoes = JSON.parse(fs.readFileSync(relacoesPath, 'utf8'));
  console.log(`\n✓ Total de relações no grafo: ${relacoes.length}`);
  const contagemTipo = { prepara: 0, contraponto: 0, mesmo_tema: 0 };
  for (const rel of relacoes) {
    if (!ids.has(rel.de) || !ids.has(rel.para)) {
      console.error(`ERRO: Relação com IDs inexistentes: ${rel.de} -> ${rel.para}`);
      process.exit(1);
    }
    contagemTipo[rel.tipo] = (contagemTipo[rel.tipo] || 0) + 1;
  }
  console.log(`- Prepara: ${contagemTipo.prepara}`);
  console.log(`- Contraponto: ${contagemTipo.contraponto}`);
  console.log(`- Mesmo Tema: ${contagemTipo.mesmo_tema}`);
}

console.log('\n====================================');
console.log('TODAS AS VALIDAÇÕES DA FASE 0 PASSARAM!');
console.log('====================================');
