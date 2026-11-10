import React, { useState, useMemo } from 'react';
import { useBibliotecaStore } from './store/useBibliotecaStore';
import { Navbar } from './components/Navbar';
import { PainelAgora } from './components/PainelAgora';
import { BarraFiltros } from './components/BarraFiltros';
import { Estante } from './components/Estante';
import { GrafoVisualizacao } from './components/GrafoVisualizacao';
import { ModalLivro } from './components/ModalLivro';
import { ModalRevisaoSemestral } from './components/ModalRevisaoSemestral';
import { ModalBackup } from './components/ModalBackup';

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
    exportarCSV
  } = useBibliotecaStore();

  const [visaoAtiva, setVisaoAtiva] = useState<'estante' | 'grafo'>('estante');
  const [modalRevisaoAberto, setModalRevisaoAberto] = useState(false);
  const [modalBackupAberto, setModalBackupAberto] = useState(false);

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
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
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
        ) : (
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
          onClose={() => setModalBackupAberto(false)}
        />
      )}
    </div>
  );
};
