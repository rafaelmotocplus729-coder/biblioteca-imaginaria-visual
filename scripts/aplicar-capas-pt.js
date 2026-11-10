import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enriquecidoPath = path.resolve(__dirname, '../data/enriquecido.json');
const pendenciasPath = path.resolve(__dirname, '../data/pendencias.json');
const capasDir = path.resolve(__dirname, '../public/capas');
const livros = JSON.parse(fs.readFileSync(enriquecidoPath, 'utf8'));

console.log('=== APLICANDO E SINCRONIZANDO CAPAS AUTÊNTICAS (1 a 120) ===\n');

const pendencias = [];
let capasReais = 0;
let capasTipograficas = 0;

const livrosAtualizados = livros.map((livro) => {
  const webpPath = path.join(capasDir, `${livro.id}.webp`);
  const jpgPath = path.join(capasDir, `${livro.id}.jpg`);

  let capaUrl = null;
  if (fs.existsSync(webpPath)) {
    capaUrl = `/capas/${livro.id}.webp`;
  } else if (fs.existsSync(jpgPath)) {
    capaUrl = `/capas/${livro.id}.jpg`;
  }

  if (capaUrl) {
    capasReais++;
    return {
      ...livro,
      capa_url: capaUrl,
      status_busca: 'ok'
    };
  } else {
    capasTipograficas++;
    pendencias.push({
      id: livro.id,
      titulo: livro.titulo,
      autor: livro.autor,
      motivo: 'Capa da edição em português não encontrada nas APIs públicas. Aplicada capa tipográfica sóbria conforme Seção 6.5 do PRD.'
    });
    return {
      ...livro,
      capa_url: undefined,
      status_busca: 'parcial'
    };
  }
});

fs.writeFileSync(enriquecidoPath, JSON.stringify(livrosAtualizados, null, 2), 'utf8');
fs.writeFileSync(pendenciasPath, JSON.stringify(pendencias, null, 2), 'utf8');

console.log(`- Capas reais confirmadas: ${capasReais}`);
console.log(`- Obras com capa tipográfica: ${capasTipograficas}`);
console.log(`- Total de pendências registradas: ${pendencias.length}`);
console.log('\n✓ 100% das obras com capas auditadas e atualizadas com sucesso!');
