import React, { useState, useMemo, useEffect } from 'react';
import { useBibliotecaStore } from './store/useBibliotecaStore';
import { Navbar } from './components/Navbar';
import { PainelAgora } from './components/PainelAgora';
import { BarraFiltros } from './components/BarraFiltros';
import { Estante } from './components/Estante';
import { GrafoVisualizacao } from './components/GrafoVisualizacao';
import { ModalLivro } from './components/ModalLivro';
import { ModalRevisaoSemestral } from './components/ModalRevisaoSemestral';
import { ModalBackup } from './components/ModalBackup';
import { CommandPalette } from './components/CommandPalette';
import { ComparadorDialetico } from './components/ComparadorDialetico';
import { CadernoNotasModal } from './components/CadernoNotasModal';
import { ZettelkastenView } from './components/ZettelkastenView';
import { LinhaDoTempo } from './components/LinhaDoTempo';

export const App: React.FC = () => {
  const {
    livros,
    relacoes,
    progressos,
    sessoesRevisao,
    filtros,
    modoVisualizacao,
    modoEscuro,
    modoConflitos,
    livroSelecionadoId,
    horasPorSemana,
    avisoLeituraSimultanea,
    setEstadoLeitura,
    setNotas,
    setGuiaLeitura,
    setEdicaoEscolhida,
    adicionarRelacao,
    editarRelacao,
    removerRelacao,
    setFiltros,
    limparFiltros,
    setModoVisualizacao,
    toggleModoEscuro,
    toggleModoConflitos,
    selecionarLivro,
    setHorasPorSemana,
    salvarSessaoRevisao,
    exportarJSON,
    importarJSON,
    exportarMarkdown,
    exportarCSV,
    exportarZettelkastenMarkdown
  } = useBibliotecaStore();

  const [visaoAtiva, setVisaoAtiva] = useState<'estante' | 'grafo' | 'linha-tempo' | 'zettelkasten'>('estante');
  const [modalRevisaoAberto, setModalRevisaoAberto] = useState(false);
  const [modalBackupAberto, setModalBackupAberto] = useState(false);
  const [modalBuscaAberto, setModalBuscaAberto] = useState(false);
  const [modalComparadorAberto, setModalComparadorAberto] = useState(false);
  const [comparadorLivroAId, setComparadorLivroAId] = useState<number>(42); // Hayek
  const [comparadorLivroBId, setComparadorLivroBId] = useState<number>(43); // Polanyi
  const [modalCadernoAberto, setModalCadernoAberto] = useState(false);

  // Manipulador de abertura de comparador dialético
  const handleAbrirComparador = (livroA?: number, livroB?: number) => {
    if (livroA) setComparadorLivroAId(livroA);
    if (livroB) setComparadorLivroBId(livroB);
    setModalComparadorAberto(true);
  };

  // Atalhos Globais de Teclado (Cmd+K, E, G, C, D, 1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Cmd+K ou Ctrl+K abre a paleta de comandos
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setModalBuscaAberto((prev) => !prev);
        return;
      }

      if (isInput) return;

      // Ignora atalhos de navegação de tecla única quando teclas modificadoras (Ctrl, Meta, Alt) estiverem pressionadas
      // Isso impede que atalhos como Ctrl+E, Ctrl+Z, Ctrl+C, Ctrl+D etc. alternem visões indevidamente
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Tecla / para busca rápida
      if (e.key === '/') {
        e.preventDefault();
        setModalBuscaAberto(true);
      } else if (e.key === 'e' || e.key === 'E') {
        setVisaoAtiva('estante');
      } else if (e.key === 'g' || e.key === 'G') {
        setVisaoAtiva('grafo');
      } else if (e.key === 't' || e.key === 'T') {
        setVisaoAtiva('linha-tempo');
      } else if (e.key === 'z' || e.key === 'Z') {
        setVisaoAtiva('zettelkasten');
      } else if (e.key === 'c' || e.key === 'C') {
        setModoVisualizacao(modoVisualizacao === 'capa' ? 'lombada' : 'capa');
      } else if (e.key === 'd' || e.key === 'D') {
        toggleModoEscuro();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const nivelNum = Number(e.key);
        setFiltros({ nivel: filtros.nivel === nivelNum ? undefined : nivelNum });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modoVisualizacao, setModoVisualizacao, toggleModoEscuro, setFiltros, filtros.nivel]);

  // Lista única de todas as áreas
  const todasAreas = useMemo(() => {
    return Array.from(new Set(livros.map((l) => l.area))).sort();
  }, [livros]);

  // Filtragem combinada das obras
  const livrosFiltrados = useMemo(() => {
    return livros.filter((livro) => {
      // 1. Busca textual (autor, título, ou palavra da tese)
      if (filtros.textoBusca) {
        const busca = filtros.textoBusca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matchTitulo = livro.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(busca);
        const matchAutor = livro.autor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(busca);
        const matchTese = livro.tese.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(busca);
        if (!matchTitulo && !matchAutor && !matchTese) return false;
      }

      // 2. Filtro de Nível
      if (filtros.nivel !== undefined && livro.nivel !== filtros.nivel) {
        return false;
      }

      // 3. Filtro de Área
      if (filtros.area && livro.area !== filtros.area) {
        return false;
      }

      // 4. Filtro de Classe
      if (filtros.classe && livro.classe !== filtros.classe) {
        return false;
      }

      // 5. Filtro de Estado
      if (filtros.estado) {
        const estadoAtual = progressos[livro.id]?.estado || 'nao_iniciado';
        if (estadoAtual !== filtros.estado) return false;
      }

      // 6. Apenas Obra de Vida
      if (filtros.apenasObraDeVida && !livro.obra_de_vida) {
        return false;
      }

      // 7. Idioma
      if (filtros.idioma && livro.idioma_leitura !== filtros.idioma) {
        return false;
      }

      return true;
    });
  }, [livros, progressos, filtros]);

  const livroSelecionado = useMemo(() => {
    if (!livroSelecionadoId) return null;
    return livros.find((l) => l.id === livroSelecionadoId) || null;
  }, [livros, livroSelecionadoId]);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${modoEscuro ? 'dark' : ''}`}>
      {/* Barra de Navegação Superior */}
      <Navbar
        visaoAtiva={visaoAtiva}
        onMudarVisao={setVisaoAtiva}
        modoVisualizacao={modoVisualizacao}
        onMudarModoVisualizacao={setModoVisualizacao}
        modoEscuro={modoEscuro}
        onToggleModoEscuro={toggleModoEscuro}
        onAbrirRevisao={() => setModalRevisaoAberto(true)}
        onAbrirBackup={() => setModalBackupAberto(true)}
        onAbrirBusca={() => setModalBuscaAberto(true)}
        onAbrirComparador={() => handleAbrirComparador()}
        onAbrirCaderno={() => setModalCadernoAberto(true)}
      />

      {/* Conteúdo Principal */}
      <main className={`flex-1 w-full mx-auto transition-all duration-300 ${
        visaoAtiva === 'zettelkasten' || visaoAtiva === 'linha-tempo' || visaoAtiva === 'grafo'
          ? 'max-w-[2200px] w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4'
          : 'max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 py-6 sm:py-8'
      }`}>
        {visaoAtiva === 'estante' ? (
          <>
            {/* Painel "Agora" com Leitura em Andamento e Sugestão */}
            <PainelAgora
              livros={livros}
              progressos={progressos}
              relacoes={relacoes}
              horasPorSemana={horasPorSemana}
              avisoLeituraSimultanea={avisoLeituraSimultanea}
              onSelecionarLivro={selecionarLivro}
              onAlterarHorasPorSemana={setHorasPorSemana}
            />

            {/* Barra de Filtros Combináveis e Busca */}
            <BarraFiltros
              filtros={filtros}
              onAtualizarFiltros={setFiltros}
              onLimparFiltros={limparFiltros}
              totalLivros={livros.length}
              livrosFiltrados={livrosFiltrados.length}
              todasAreas={todasAreas}
            />

            {/* Estante Horizontal por Nível (1 a 5) */}
            <Estante
              livros={livrosFiltrados}
              progressos={progressos}
              modoVisualizacao={modoVisualizacao}
              onSelecionarLivro={selecionarLivro}
              filtroNivel={filtros.nivel}
            />
          </>
        ) : visaoAtiva === 'grafo' ? (
          /* Grafo em Rede Interativo com D3 */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                  Grafo em Rede da Biblioteca
                </h2>
                <p className="text-xs text-slate-500">
                  A biblioteca é um grafo em movimento: arraste nós, use o zoom, filtre conflitos ou clique para explorar contrapontos e preparar novas conexões.
                </p>
              </div>
            </div>

            <GrafoVisualizacao
              livros={livros}
              relacoes={relacoes}
              modoConflitos={modoConflitos}
              onToggleModoConflitos={toggleModoConflitos}
              onAdicionarRelacao={adicionarRelacao}
              onEditarRelacao={editarRelacao}
              onRemoverRelacao={removerRelacao}
              onSelecionarLivro={selecionarLivro}
            />
          </div>
        ) : visaoAtiva === 'linha-tempo' ? (
          /* Linha do Tempo Cronológica Histórica & Régua das 6 Grandes Eras */
          <LinhaDoTempo
            livros={livros}
            progressos={progressos}
            onSelecionarLivro={selecionarLivro}
          />
        ) : (
          /* Zettelkasten de Estudos (Método Luhmann / Ahrens / Rodrigo Leão) */
          <ZettelkastenView onSelecionarLivroEstante={selecionarLivro} />
        )}
      </main>

      {/* Modal / Página de Detalhe do Livro (Seção 7.2) */}
      {livroSelecionado && (
        <ModalLivro
          livro={livroSelecionado}
          todosLivros={livros}
          todasRelacoes={relacoes}
          progresso={progressos[livroSelecionado.id]}
          onClose={() => selecionarLivro(null)}
          onSelecionarOutroLivro={selecionarLivro}
          onAtualizarEstado={setEstadoLeitura}
          onAtualizarNotas={setNotas}
          onAtualizarGuia={setGuiaLeitura}
          onEscolherEdicao={setEdicaoEscolhida}
          onAbrirComparador={handleAbrirComparador}
        />
      )}

      {/* Modal de Revisão Semestral (Seção 7.5) */}
      {modalRevisaoAberto && (
        <ModalRevisaoSemestral
          livros={livros}
          progressos={progressos}
          historicoRevisoes={sessoesRevisao}
          onSalvarRevisao={salvarSessaoRevisao}
          onClose={() => setModalRevisaoAberto(false)}
        />
      )}

      {/* Modal de Backup / Importar / Exportar (Seção 7.7) */}
      {modalBackupAberto && (
        <ModalBackup
          onExportarJSON={exportarJSON}
          onImportarJSON={importarJSON}
          onExportarMarkdown={exportarMarkdown}
          onExportarCSV={exportarCSV}
          onExportarZettelkasten={exportarZettelkastenMarkdown}
          onClose={() => setModalBackupAberto(false)}
        />
      )}

      {/* Paleta de Comandos Global Cmd+K / Ctrl+K */}
      <CommandPalette
        isOpen={modalBuscaAberto}
        onClose={() => setModalBuscaAberto(false)}
        livros={livros}
        progressos={progressos}
        onSelecionarLivro={selecionarLivro}
        visaoAtiva={visaoAtiva}
        onMudarVisao={setVisaoAtiva}
        modoVisualizacao={modoVisualizacao}
        onMudarModoVisualizacao={setModoVisualizacao}
        modoEscuro={modoEscuro}
        onToggleModoEscuro={toggleModoEscuro}
        onAbrirRevisao={() => setModalRevisaoAberto(true)}
        onAbrirBackup={() => setModalBackupAberto(true)}
        onAbrirComparador={handleAbrirComparador}
        onAbrirCaderno={() => setModalCadernoAberto(true)}
        onFiltrarNivel={(lvl) => setFiltros({ nivel: lvl })}
      />

      {/* Comparador Dialético Lado a Lado (Confronto de Obras) */}
      <ComparadorDialetico
        isOpen={modalComparadorAberto}
        onClose={() => setModalComparadorAberto(false)}
        livros={livros}
        relacoes={relacoes}
        progressos={progressos}
        livroInicialAId={comparadorLivroAId}
        livroInicialBId={comparadorLivroBId}
        onAtualizarNotas={setNotas}
        onSelecionarLivro={selecionarLivro}
      />

      {/* Caderno Geral de Notas e Citações */}
      <CadernoNotasModal
        isOpen={modalCadernoAberto}
        onClose={() => setModalCadernoAberto(false)}
        livros={livros}
        progressos={progressos}
        onSelecionarLivro={selecionarLivro}
        onAtualizarNotas={setNotas}
      />
    </div>
  );
};
