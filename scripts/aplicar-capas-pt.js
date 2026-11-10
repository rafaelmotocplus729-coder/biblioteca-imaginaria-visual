import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enriquecidoPath = path.resolve(__dirname, '../data/enriquecido.json');
const pendenciasPath = path.resolve(__dirname, '../data/pendencias.json');
const livros = JSON.parse(fs.readFileSync(enriquecidoPath, 'utf8'));

// Mapeamento estrito de capas em português autênticas (ISBNs brasileiros e IDs confirmados em PT)
// Para #2 e #36, são mantidas as capas em inglês originais conforme PRD
const CAPAS_CONFIRMADAS_PT = {
  1: 'https://covers.openlibrary.org/b/isbn/9788588062894-L.jpg', // Como Ler Livros (É Realizações)
  2: 'https://covers.openlibrary.org/b/isbn/9780521189064-L.jpg', // English Grammar in Use [EN]
  3: 'https://covers.openlibrary.org/b/isbn/9788535914849-L.jpg', // 1984 (Companhia das Letras)
  4: 'https://covers.openlibrary.org/b/id/12369687-L.jpg',        // Vidas Secas (Record)
  5: '/capas/5.webp',                                             // Em Busca de Sentido (Vozes)
  6: 'https://covers.openlibrary.org/b/isbn/9788571104808-L.jpg', // Cultura: um conceito antropológico (Zahar)
  7: '/capas/7.webp',                                             // Armas, Germes e Aço (Record)
  8: '/capas/8.jpg',                                              // Os Problemas da Filosofia (Edições 70)
  9: '/capas/9.jpg',                                              // Apologia de Sócrates (L&PM)
  10: '/capas/10.webp',                                           // Ortodoxia (Ecclesiae)
  11: '/capas/11.webp',                                           // Economia numa Única Lição (Instituto Mises / Record)
  12: 'https://covers.openlibrary.org/b/isbn/9788585934231-L.jpg', // Manifesto Comunista (Boitempo)
  13: 'https://covers.openlibrary.org/b/isbn/9788501115591-L.jpg', // O Mito de Sísifo (Record)
  14: '/capas/14.webp',                                           // O Existencialismo é um Humanismo (Vozes)
  15: 'https://covers.openlibrary.org/b/isbn/9788573263596-L.jpg', // A Morte de Ivan Ilitch (Editora 34)
  16: 'https://covers.openlibrary.org/b/id/123152-L.jpg',          // Memórias Póstumas de Brás Cubas (Edição BR)
  17: 'https://covers.openlibrary.org/b/isbn/9788535928136-L.jpg', // Raízes do Brasil (Companhia das Letras)
  18: 'https://covers.openlibrary.org/b/isbn/9788571644519-L.jpg', // O Povo Brasileiro (Companhia das Letras)
  19: 'https://covers.openlibrary.org/b/isbn/9788571106093-L.jpg', // Apologia da História (Zahar)
  20: 'https://covers.openlibrary.org/b/isbn/9788539003839-L.jpg', // Rápido e Devagar (Objetiva)
  21: '/capas/21.webp',                                           // O Homem e seus Símbolos (HarperCollins)
  22: '/capas/22.jpg',                                            // Ciência e Política: Duas Vocações (Martin Claret)
  23: '/capas/23.webp',                                           // 23 Coisas que Não Nos Contaram sobre o Capitalismo (Pensamento)
  24: 'https://covers.openlibrary.org/b/isbn/9788515020164-L.jpg', // Catecismo da Igreja Católica (Loyola)
  25: '/capas/25.jpg',                                            // A República (Perspectiva / Martin Claret)
  26: '/capas/26.jpg',                                            // Ética a Nicômaco (Edipro)
  27: '/capas/27.jpg',                                            // Confissões (Penguin-Companhia)
  28: '/capas/28.webp',                                           // Santos e Pecadores: História dos Papas (Edições 70)
  29: '/capas/29.webp',                                           // O Suicídio (Edipro)
  30: '/capas/30.jpg',                                            // O Futuro de uma Ilusão (Companhia das Letras)
  31: '/capas/31.webp',                                           // Ciência e Comportamento Humano (Martins Fontes)
  32: '/capas/32.webp',                                           // Leviatã (Martin Claret)
  33: '/capas/33.webp',                                           // Discurso sobre a Origem da Desigualdade (L&PM)
  34: 'https://covers.openlibrary.org/b/isbn/9788526008694-L.jpg', // Casa-Grande & Senzala (Global)
  35: 'https://covers.openlibrary.org/b/isbn/9788571645851-L.jpg', // Tristes Trópicos (Companhia das Letras)
  36: 'https://covers.openlibrary.org/b/isbn/9780141393063-L.jpg', // Politics and the English Language [EN]
  37: '/capas/37.webp',                                           // Pensamentos (Kírion / Martins Fontes)
  38: 'https://covers.openlibrary.org/b/isbn/9788573260793-L.jpg', // Os Irmãos Karamázov (Editora 34)
  39: 'https://covers.openlibrary.org/b/isbn/9788542208801-L.jpg', // Silêncio (Tusquets)
  40: '/capas/40.webp',                                           // Rerum Novarum (Paulus)
  41: '/capas/41.webp',                                           // A Riqueza das Nações (Ediouro / WMF Martins Fontes)
  42: '/capas/42.webp',                                           // O Caminho da Servidão (LVM)
  43: '/capas/43.webp',                                           // A Grande Transformação (Contraponto)
  44: '/capas/44.webp',                                           // Reflexões sobre a Revolução na França (Vide Editorial)
  45: '/capas/45.jpg',                                            // A Ética Protestante e o Espírito do Capitalismo (Martin Claret)
  46: 'https://covers.openlibrary.org/b/id/15210532-L.jpg',        // Formação Econômica do Brasil (Cia das Letras)
  47: '/capas/47.webp',                                           // Modernidade Líquida (Zahar)
  48: 'https://covers.openlibrary.org/b/isbn/9788521803935-L.jpg', // A Condição Humana (Forense Universitária)
  49: '/capas/49.webp',                                           // História da Guerra do Peloponeso (WMF Martins Fontes)
  50: '/capas/50.webp',                                           // Fundamentação da Metafísica dos Costumes (Martin Claret)
  51: '/capas/51.jpg',                                            // Temor e Tremor (Relógio D'\''Água / Vozes)
  52: 'https://covers.openlibrary.org/b/isbn/9788571648050-L.jpg', // Genealogia da Moral (Companhia das Letras)
  53: '/capas/53.webp',                                           // Suma Teológica (Ecclesiae / Loyola)
  54: 'https://covers.openlibrary.org/b/isbn/9788573261202-L.jpg', // A Divina Comédia (Editora 34)
  55: '/capas/55.webp',                                           // O Capital, Livro 1 (Boitempo)
  56: 'https://covers.openlibrary.org/b/isbn/9788532605085-L.jpg', // Vigiar e Punir (Vozes)
  57: '/capas/57.webp',                                           // A Sociedade contra o Estado (Ubu)
  58: 'https://covers.openlibrary.org/b/id/6390023-L.jpg',          // Os Donos do Poder (Globo)
  59: 'https://covers.openlibrary.org/b/isbn/9788535932027-L.jpg', // Grande Sertão: Veredas (Cia das Letras)
  60: '/capas/60.jpg'                                             // A Interpretação dos Sonhos (L&PM)
};

console.log('=== APLICANDO FILTRAGEM ESTRITA DE CAPAS EM PORTUGUÊS ===\n');

const pendencias = [];
let capasPtReais = 0;
let capasTipograficasPt = 0;

const livrosAtualizados = livros.map((livro) => {
  const capaPt = CAPAS_CONFIRMADAS_PT[livro.id];

  if (capaPt) {
    capasPtReais++;
    return {
      ...livro,
      capa_url: capaPt,
      status_busca: 'ok'
    };
  } else {
    // Sem capa em português disponível nas APIs públicas -> Aplicar capa tipográfica em português!
    capasTipograficasPt++;
    pendencias.push({
      id: livro.id,
      titulo: livro.titulo,
      autor: livro.autor,
      motivo: 'Capa da edição em português não encontrada nas APIs públicas. Aplicada capa tipográfica sóbria conforme Seção 6.5 do PRD.'
    });
    return {
      ...livro,
      capa_url: undefined, // Aciona a capa tipográfica em português com o título, autor e cor da área
      status_busca: 'parcial'
    };
  }
});

fs.writeFileSync(enriquecidoPath, JSON.stringify(livrosAtualizados, null, 2), 'utf8');
fs.writeFileSync(pendenciasPath, JSON.stringify(pendencias, null, 2), 'utf8');

console.log(`- Capas reais confirmadas em Português: ${capasPtReais}`);
console.log(`- Obras com capa tipográfica em Português: ${capasTipograficasPt}`);
console.log(`- Total de pendências registradas: ${pendencias.length}`);
console.log('\n✓ Nenhuma capa em língua estrangeira indesejada será exibida para leituras em português!');
