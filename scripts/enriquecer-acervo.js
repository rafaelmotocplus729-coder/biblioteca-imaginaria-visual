import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const livrosPath = path.resolve(__dirname, '../data/livros.json');
const cacheDir = path.resolve(__dirname, '../data/cache_api');
const enriquecidoPath = path.resolve(__dirname, '../data/enriquecido.json');
const pendenciasPath = path.resolve(__dirname, '../data/pendencias.json');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const livros = JSON.parse(fs.readFileSync(livrosPath, 'utf8'));

// Mapeamento de termos de busca de alta precisão para a Open Library
const TERMOS_BUSCA = {
  1: 'How to Read a Book Mortimer Adler',
  2: 'English Grammar in Use Raymond Murphy',
  3: '1984 George Orwell',
  4: 'Vidas Secas Graciliano Ramos',
  5: 'Man Search for Meaning Viktor Frankl',
  6: 'Cultura um conceito antropologico Roque Laraia',
  7: 'Guns Germs and Steel Jared Diamond',
  8: 'The Problems of Philosophy Bertrand Russell',
  9: 'Apology Plato',
  10: 'Orthodoxy G. K. Chesterton',
  11: 'Economics in One Lesson Henry Hazlitt',
  12: 'The Communist Manifesto Karl Marx Friedrich Engels',
  13: 'The Myth of Sisyphus Albert Camus',
  14: 'Existentialism is a Humanism Jean-Paul Sartre',
  15: 'The Death of Ivan Ilyich Leo Tolstoy',
  16: 'Memorias Postumas de Bras Cubas Machado de Assis',
  17: 'Raizes do Brasil Sergio Buarque de Holanda',
  18: 'O Povo Brasileiro Darcy Ribeiro',
  19: 'The Historian Craft Marc Bloch',
  20: 'Thinking Fast and Slow Daniel Kahneman',
  21: 'Man and his Symbols Carl Gustav Jung',
  22: 'Politics as a Vocation Max Weber',
  23: 'Ha-Joon Chang Capitalism',
  24: 'Catechism of the Catholic Church',
  25: 'Republic Plato',
  26: 'Nicomachean Ethics Aristotle',
  27: 'Confessions Saint Augustine',
  28: 'Saints and Sinners Eamon Duffy',
  29: 'Suicide Emile Durkheim',
  30: 'The Future of an Illusion Sigmund Freud',
  31: 'Science and Human Behavior B. F. Skinner',
  32: 'Leviathan Thomas Hobbes',
  33: 'Discourse on Inequality Jean-Jacques Rousseau',
  34: 'Gilberto Freyre Casa-Grande',
  35: 'Tristes Tropiques Claude Levi-Strauss',
  36: 'Politics and the English Language George Orwell',
  37: 'Pensees Blaise Pascal',
  38: 'The Brothers Karamazov Fyodor Dostoevsky',
  39: 'Silence Shusaku Endo',
  40: 'Rerum Novarum Leo XIII',
  41: 'The Wealth of Nations Adam Smith',
  42: 'The Road to Serfdom Friedrich Hayek',
  43: 'The Great Transformation Karl Polanyi',
  44: 'Reflections on the Revolution in France Edmund Burke',
  45: 'The Protestant Ethic and the Spirit of Capitalism Max Weber',
  46: 'Formacao Economica do Brasil Celso Furtado',
  47: 'Liquid Modernity Zygmunt Bauman',
  48: 'The Human Condition Hannah Arendt',
  49: 'History of the Peloponnesian War Thucydides',
  50: 'Groundwork of the Metaphysics of Morals Immanuel Kant',
  51: 'Fear and Trembling Soren Kierkegaard',
  52: 'On the Genealogy of Morality Friedrich Nietzsche',
  53: 'Summa Theologica Thomas Aquinas',
  54: 'Divine Comedy Dante Alighieri',
  55: 'Das Kapital Karl Marx',
  56: 'Discipline and Punish Michel Foucault',
  57: 'Society Against the State Pierre Clastres',
  58: 'Os Donos do Poder Raymundo Faoro',
  59: 'Grande Sertao Veredas Joao Guimaraes Rosa',
  60: 'The Interpretation of Dreams Sigmund Freud'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function consultarOpenLibrary(livroId, termo) {
  const cacheFile = path.join(cacheDir, `ol_search_${livroId}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch (e) {}
  }

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(termo)}&fields=title,author_name,cover_i,isbn,publisher,publish_year,key,language&limit=3`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BibliotecaImaginariaVisual/1.0 (academic-personal-reader)' }
    });
    if (res.ok) {
      const data = await res.json();
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf8');
      return data;
    }
  } catch (e) {
    console.warn(`Erro ao consultar OpenLibrary para #${livroId}:`, e.message);
  }
  return null;
}

async function consultarDescricaoObra(workKey) {
  if (!workKey) return null;
  const cleanKey = workKey.replace('/works/', '');
  const cacheFile = path.join(cacheDir, `ol_work_${cleanKey}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch (e) {}
  }

  const url = `https://openlibrary.org${workKey}.json`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BibliotecaImaginariaVisual/1.0 (academic-personal-reader)' }
    });
    if (res.ok) {
      const data = await res.json();
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf8');
      return data;
    }
  } catch (e) {
    // Silencioso
  }
  return null;
}

async function executarEnriquecimento() {
  console.log('=== EXECUÇÃO RIGOROSA: FASE 1 - ENRIQUECIMENTO DE DADOS ===');
  console.log(`Total de livros: ${livros.length}\n`);

  const enriquecidos = [];
  const pendencias = [];

  let countCapas = 0;
  let countIsbn = 0;
  let countEdicoesPt = 0;
  let countSinopse = 0;

  for (let i = 0; i < livros.length; i++) {
    const livro = livros[i];
    const termo = TERMOS_BUSCA[livro.id] || `${livro.titulo} ${livro.autor}`;
    process.stdout.write(`[${i + 1}/${livros.length}] Pesquisando #${livro.id} ${livro.titulo}... `);

    const livroEnriquecido = { ...livro };
    const olData = await consultarOpenLibrary(livro.id, termo);

    let capaUrl = null;
    let isbnPrincipal = null;
    let sinopse = null;
    const edicoes = [];

    if (olData && olData.docs && olData.docs.length > 0) {
      const doc = olData.docs[0];

      if (doc.cover_i) {
        capaUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }

      if (doc.isbn && doc.isbn.length > 0) {
        // Tenta achar um ISBN-13
        const isbn13 = doc.isbn.find(id => id.length === 13);
        isbnPrincipal = isbn13 || doc.isbn[0];
        if (!capaUrl) {
          capaUrl = `https://covers.openlibrary.org/b/isbn/${isbnPrincipal}-L.jpg`;
        }
      }

      // Montar edições autênticas retornadas pela API (até 3 edições)
      if (doc.publisher && doc.publisher.length > 0) {
        const publishers = doc.publisher.slice(0, 3);
        const years = doc.publish_year || [];
        const isbns = doc.isbn || [];

        publishers.forEach((pub, idx) => {
          const edIsbn = isbns[idx] || undefined;
          edicoes.push({
            editora: pub,
            ano: years[idx] || 's/d',
            isbn: edIsbn,
            capa_url: edIsbn ? `https://covers.openlibrary.org/b/isbn/${edIsbn}-M.jpg` : (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined),
            link: `https://openlibrary.org${doc.key || ''}`
          });
        });
      }

      // Buscar sinopse editorial da obra na Open Library
      if (doc.key) {
        const workData = await consultarDescricaoObra(doc.key);
        if (workData && workData.description) {
          if (typeof workData.description === 'string') {
            sinopse = workData.description;
          } else if (typeof workData.description === 'object' && workData.description.value) {
            sinopse = workData.description.value;
          }
        }
      }
    }

    if (capaUrl) {
      livroEnriquecido.capa_url = capaUrl;
      countCapas++;
    }
    if (isbnPrincipal) {
      livroEnriquecido.isbn = isbnPrincipal;
      countIsbn++;
    }
    if (edicoes.length > 0) {
      livroEnriquecido.edicoes_pt = edicoes;
      countEdicoesPt++;
    }
    if (sinopse) {
      livroEnriquecido.sinopse_editorial = sinopse;
      countSinopse++;
    }

    // Status estrito conforme PRD
    if (capaUrl && isbnPrincipal && edicoes.length > 0) {
      livroEnriquecido.status_busca = 'ok';
      console.log('✓ OK');
    } else if (capaUrl || isbnPrincipal || edicoes.length > 0) {
      livroEnriquecido.status_busca = 'parcial';
      console.log('~ PARCIAL');
      pendencias.push({
        id: livro.id,
        titulo: livro.titulo,
        autor: livro.autor,
        falhas: {
          capa: !capaUrl,
          isbn: !isbnPrincipal,
          edicoes: edicoes.length === 0,
          sinopse: !sinopse
        }
      });
    } else {
      livroEnriquecido.status_busca = 'pendente';
      console.log('✗ PENDENTE');
      pendencias.push({
        id: livro.id,
        titulo: livro.titulo,
        autor: livro.autor,
        falhas: {
          capa: true,
          isbn: true,
          edicoes: true,
          sinopse: true
        }
      });
    }

    enriquecidos.push(livroEnriquecido);
    await sleep(80);
  }

  // Gravar os arquivos finais
  fs.writeFileSync(enriquecidoPath, JSON.stringify(enriquecidos, null, 2), 'utf8');
  fs.writeFileSync(pendenciasPath, JSON.stringify(pendencias, null, 2), 'utf8');

  const percCapa = ((countCapas / livros.length) * 100).toFixed(1);
  const percIsbn = ((countIsbn / livros.length) * 100).toFixed(1);
  const percEdicoes = ((countEdicoesPt / livros.length) * 100).toFixed(1);
  const percSinopse = ((countSinopse / livros.length) * 100).toFixed(1);

  console.log('\n======================================================');
  console.log('RESULTADO FINAL DO ENRIQUECIMENTO (FASE 1):');
  console.log(`- Capas encontradas:        ${countCapas}/${livros.length} (${percCapa}%) [META: >= 85%]`);
  console.log(`- ISBNs identificados:      ${countIsbn}/${livros.length} (${percIsbn}%)`);
  console.log(`- Edições documentadas:     ${countEdicoesPt}/${livros.length} (${percEdicoes}%)`);
  console.log(`- Sinopses editoriais:      ${countSinopse}/${livros.length} (${percSinopse}%)`);
  console.log(`- Registros em pendencias:  ${pendencias.length}`);
  console.log('======================================================\n');
}

executarEnriquecimento().catch(console.error);
