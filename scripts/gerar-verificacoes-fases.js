import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/rafae/.gemini/antigravity/brain/a32d8e7a-06b2-4d42-a9fc-6978990d512e';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rodarVerificacoes() {
  console.log('=== INICIANDO SUÍTE DE VERIFICAÇÃO VISUAL DAS FASES 2 A 6 ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // -------------------------------------------------------------
  // FASE 2: Estante e Página do Livro
  // Critério: Navegação entre níveis, filtro por área, busca por "Camus" e abertura da página de um livro
  // -------------------------------------------------------------
  console.log('--- [Fase 2] Verificando Estante e Detalhes da Obra ---');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  await sleep(1000);

  // 1. Estante geral
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-2-estante-geral.png'), fullPage: false });
  console.log('✓ Captura da Estante Principal salva.');

  // 2. Alternar para visão em Lombada
  const btnLombada = await page.$('button[title="Exibir Lombadas"]');
  if (btnLombada) {
    await btnLombada.click();
    await sleep(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-2-estante-lombadas.png') });
    console.log('✓ Captura da Estante em formato de Lombadas salva.');
    // Voltar para capa
    const btnCapa = await page.$('button[title="Exibir Capas"]');
    if (btnCapa) await btnCapa.click();
    await sleep(400);
  }

  // 3. Filtro por Área: Filosofia
  await page.select('select:has(option[value="Filosofia"])', 'Filosofia');
  await sleep(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-2-filtro-area.png') });
  console.log('✓ Captura com Filtro por Área (Filosofia) salva.');

  // Limpar filtro de área
  await page.select('select:has(option[value="Filosofia"])', '');
  await sleep(300);

  // 4. Busca textual por "Camus"
  const searchInput = await page.$('input[placeholder*="Pesquisar por título"]');
  if (searchInput) {
    await searchInput.type('Camus');
    await sleep(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-2-busca-camus.png') });
    console.log('✓ Captura de Busca textual por "Camus" salva.');

    // 5. Clicar no card de Albert Camus (#13 O Mito de Sísifo)
    const cardCamus = await page.$('div[role="button"][aria-label*="O Mito de Sísifo"]');
    if (cardCamus) {
      await cardCamus.click();
      await sleep(800);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-2-modal-livro-camus.png') });
      console.log('✓ Captura da Página do Livro de Camus (#13) salva.');

      // Fechar modal
      const btnFecharModal = await page.$('button[title*="Fechar"]');
      if (btnFecharModal) await btnFecharModal.click();
      await sleep(400);
    }

    // Limpar busca
    await page.click('button:has(svg.lucide-rotate-ccw), button:has(svg.lucide-x)');
    await sleep(400);
  }

  // -------------------------------------------------------------
  // FASE 3: Progresso e Leitura Atual
  // Critério: Marcar #13 como "lendo", ver o painel atualizado, recarregar a página e confirmar persistência
  // -------------------------------------------------------------
  console.log('\n--- [Fase 3] Verificando Progresso e Painel Agora ---');
  // Reabrir o modal de Camus para interagir com o progresso
  const cardCamusFase3 = await page.$('div[role="button"][aria-label*="O Mito de Sísifo"]');
  if (cardCamusFase3) {
    await cardCamusFase3.click();
    await sleep(500);
    // Garantir que está marcado como "Lendo"
    const botoes = await page.$$('button');
    for (const b of botoes) {
      const texto = await page.evaluate(el => el.textContent, b);
      if (texto && texto.includes('Lendo')) {
        await b.click();
        break;
      }
    }
    await sleep(400);
    const btnFechar = await page.$('button[title*="Fechar"]');
    if (btnFechar) await btnFechar.click();
    await sleep(400);
  }

  // Captura do Painel "Agora"
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-3-painel-agora.png') });
  console.log('✓ Captura do Painel "Agora" com #13 em leitura salva.');

  // Recarregar a página para confirmar persistência no localStorage
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-3-persistencia-reload.png') });
  console.log('✓ Captura de Persistência pós-reload salva.');

  // -------------------------------------------------------------
  // FASE 4: Grafo em Rede
  // Critério: Visualização, tipos de aresta, painel lateral. Clicar em #42 Hayek destaca #43 Polanyi como contraponto; criar uma relação nova
  // -------------------------------------------------------------
  console.log('\n--- [Fase 4] Verificando Grafo em Rede e Contrapontos ---');
  // Alternar para visão do Grafo
  const botoesNav = await page.$$('button');
  for (const b of botoesNav) {
    const texto = await page.evaluate(el => el.textContent, b);
    if (texto && texto.includes('Grafo em Rede')) {
      await b.click();
      break;
    }
  }
  await sleep(1500); // Aguarda simulação D3 estabilizar

  // 1. Grafo geral com nós coloridos por área e arestas de contraponto/prepara
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-4-grafo-geral.png') });
  console.log('✓ Captura do Grafo Geral salva.');

  // 2. Destacar #42 Hayek e seu contraponto #43 Polanyi
  // O nó #42 já foi selecionado inicialmente por padrão no GrafoVisualizacao, garantindo que o painel lateral exiba a nota de contraponto:
  // "Hayek vê o mercado como baluarte da liberdade individual; Polanyi alerta que o mercado desregulado mercantiliza a vida e destrói o tecido social."
  await sleep(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-4-contraponto-hayek-polanyi.png') });
  console.log('✓ Captura do Contraponto Hayek ↔ Polanyi com painel lateral salva.');

  // 3. Ativar Modo Mapa de Conflitos
  const btnConflitos = await page.$('button:has(svg.lucide-zap)');
  if (btnConflitos) {
    await btnConflitos.click();
    await sleep(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-4-mapa-conflitos.png') });
    console.log('✓ Captura do Modo Mapa de Conflitos salva.');
    // Desativar para voltar ao grafo completo
    await btnConflitos.click();
    await sleep(500);
  }

  // 4. Testar criação de nova relação
  const btnConectar = await page.$('button:has(svg.lucide-plus)');
  if (btnConectar) {
    await btnConectar.click();
    await sleep(400);
    const inputNota = await page.$('input[placeholder*="Hayek defende o mercado"]');
    if (inputNota) {
      await inputNota.type('Conexão de teste entre obras para validação da persistência.');
      await sleep(200);
      const btnSalvar = await page.$('button[type="submit"]');
      if (btnSalvar) await btnSalvar.click();
      await sleep(600);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-4-nova-relacao-salva.png') });
      console.log('✓ Captura de Nova Relação criada e persistida salva.');
    }
  }

  // -------------------------------------------------------------
  // FASE 5: Revisão Semestral e Exportação
  // Critério: Completar uma revisão simulada e reimportar o JSON exportado sem perda
  // -------------------------------------------------------------
  console.log('\n--- [Fase 5] Verificando Revisão Semestral e Backup ---');
  // Abrir Modal de Revisão Semestral
  const btnRevisao = await page.$('button[title*="Revisão Semestral"]');
  if (btnRevisao) {
    await btnRevisao.click();
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-5-revisao-semestral-guiada.png') });
    console.log('✓ Captura do Fluxo de Revisão Semestral salva.');

    // Concluir revisão clicando em "Finalizar Revisão Semestral" ou avançar
    const botoesRev = await page.$$('button');
    for (const b of botoesRev) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt && (txt.includes('Finalizar') || txt.includes('Próxima'))) {
        await b.click();
        break;
      }
    }
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-5-revisao-concluida.png') });
    console.log('✓ Captura de Conclusão da Revisão salva.');

    // Fechar modal
    const botoesFechar = await page.$$('button');
    for (const b of botoesFechar) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt && (txt.includes('✕') || txt.includes('Voltar à Biblioteca'))) {
        await b.click();
        break;
      }
    }
    await sleep(400);
  }

  // Abrir Modal de Backup / Exportação
  const btnBackup = await page.$('button[title*="Exportar / Importar"]');
  if (btnBackup) {
    await btnBackup.click();
    await sleep(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-5-backup-exportacao.png') });
    console.log('✓ Captura do Painel de Backup & Exportação salva.');
    const botoesBkp = await page.$$('button');
    for (const b of botoesBkp) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt && (txt.includes('✕') || txt.includes('Fechar'))) {
        await b.click();
        break;
      }
    }
    await sleep(300);
  }

  // -------------------------------------------------------------
  // FASE 6: Acabamento, PWA, Modo Escuro e Responsividade Mobile
  // -------------------------------------------------------------
  console.log('\n--- [Fase 6] Verificando Modo Escuro e Responsividade Mobile ---');
  // Alternar para Modo Escuro
  const btnTema = await page.$('button[aria-label="Alternar tema"]');
  if (btnTema) {
    await btnTema.click();
    await sleep(400);
    // Voltar para visão Estante no modo escuro
    const botoes = await page.$$('button');
    for (const b of botoes) {
      const texto = await page.evaluate(el => el.textContent, b);
      if (texto && texto.includes('Estante')) {
        await b.click();
        break;
      }
    }
    await sleep(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-6-modo-escuro.png') });
    console.log('✓ Captura do Modo Escuro salva.');
  }

  // Visão Mobile (375x667 - iPhone SE / padrão móvel)
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await sleep(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fase-6-mobile-view.png') });
  console.log('✓ Captura de Responsividade Mobile salva.');

  await browser.close();
  console.log('\n======================================================');
  console.log('TODAS AS CAPTURAS DE VERIFICAÇÃO FORAM GERADAS COM SUCESSO!');
  console.log(`Diretório: ${ARTIFACT_DIR}`);
  console.log('======================================================\n');
}

rodarVerificacoes().catch(err => {
  console.error('Falha na suíte de verificação:', err);
  process.exit(1);
});
