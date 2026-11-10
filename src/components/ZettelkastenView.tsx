import React, { useState, useMemo, useEffect } from 'react';
import {
  NotaZettel,
  NotaTemporaria
} from '../types';
import { useBibliotecaStore } from '../store/useBibliotecaStore';
import {
  Folder,
  Plus,
  Search,
  Link as LinkIcon,
  Clock,
  Sparkles,
  BookOpen,
  Trash2,
  CheckCircle2,
  Edit3,
  LayoutGrid,
  Lightbulb,
  ArrowRight,
  X,
  Copy,
  Check
} from 'lucide-react';

interface ZettelkastenViewProps {
  onSelecionarLivroEstante?: (livroId: number) => void;
}

export const ZettelkastenView: React.FC<ZettelkastenViewProps> = ({
  onSelecionarLivroEstante
}) => {
  const {
    livros,
    notasZettel,
    notasTemporarias,
    canvasZettel,
    notaZettelSelecionadaId,
    adicionarNotaZettel,
    atualizarNotaZettel,
    removerNotaZettel,
    selecionarNotaZettel,
    adicionarNotaTemporaria,
    marcarNotaTemporariaProcessada,
    removerNotaTemporaria,
    criarNotaReferenciaDeLivro,
    criarNotaPermanenteRapida,
    exportarZettelkastenMarkdown
  } = useBibliotecaStore();

  // Estados de navegação interna do Zettelkasten
  const [pastaAtiva, setPastaAtiva] = useState<'todas' | '01 índice' | '02 referências' | '03 permanentes' | 'inbox' | 'grafo' | 'canvas'>('todas');
  const [busca, setBusca] = useState('');
  const [filtroTag, setFiltroTag] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [conteudoEditando, setConteudoEditando] = useState('');
  const [tituloEditando, setTituloEditando] = useState('');

  // Modais de Criação
  const [modalNovoTipo, setModalNovoTipo] = useState<'permanente' | 'referencia' | 'indice' | null>(null);
  const [modalNovoTitulo, setModalNovoTitulo] = useState('');
  const [modalNovoTemaNum, setModalNovoTemaNum] = useState<number>(1);
  const [modalNovoLivroId, setModalNovoLivroId] = useState<number | ''>('');
  const [modalNovoRef, setModalNovoRef] = useState('');
  const [modalNovoPagina, setModalNovoPagina] = useState('');
  const [modalNovoRelacao, setModalNovoRelacao] = useState('');

  // Formulário de Captura Rápida (Inbox 48h)
  const [inboxPensamento, setInboxPensamento] = useState('');
  const [inboxLivroId, setInboxLivroId] = useState<number | ''>('');
  const [inboxFonteTexto, setInboxFonteTexto] = useState('');
  const [inboxPagina, setInboxPagina] = useState('');
  const [copiadoNotif, setCopiadoNotif] = useState(false);

  // Nota ativa selecionada
  const notaAtiva = useMemo(() => {
    if (!notaZettelSelecionadaId && notasZettel.length > 0) {
      // Prioriza a primeira permanente
      const primeiraPerm = notasZettel.find((n) => n.tipo === 'permanente');
      return primeiraPerm || notasZettel[0];
    }
    return notasZettel.find((n) => n.id === notaZettelSelecionadaId) || null;
  }, [notasZettel, notaZettelSelecionadaId]);

  // Sincroniza estado de edição ao mudar a nota ativa
  useEffect(() => {
    if (notaAtiva) {
      setConteudoEditando(notaAtiva.conteudo);
      setTituloEditando(notaAtiva.titulo);
      setModoEdicao(false);
    }
  }, [notaAtiva?.id]);

  // Lista de notas filtradas
  const notasFiltradas = useMemo(() => {
    return notasZettel.filter((n) => {
      // Filtro de pasta
      if (pastaAtiva !== 'todas' && pastaAtiva !== 'inbox' && pastaAtiva !== 'grafo' && pastaAtiva !== 'canvas') {
        if (n.pasta !== pastaAtiva) return false;
      }
      // Filtro de tag
      if (filtroTag && !n.tags.includes(filtroTag)) return false;

      // Busca textual
      if (!busca.trim()) return true;
      const q = busca.toLowerCase();
      const matchTitulo = n.titulo.toLowerCase().includes(q);
      const matchConteudo = n.conteudo.toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitulo || matchConteudo || matchTags;
    });
  }, [notasZettel, pastaAtiva, filtroTag, busca]);

  // Backlinks: descobre quem cita a nota ativa
  const backlinks = useMemo(() => {
    if (!notaAtiva) return [];
    const nomeOuLink = notaAtiva.titulo;
    return notasZettel.filter((n) => {
      if (n.id === notaAtiva.id) return false;
      return (
        n.conteudo.includes(`[[${nomeOuLink}]]`) ||
        n.referencia === `[[${nomeOuLink}]]` ||
        n.relacao === `[[${nomeOuLink}]]` ||
        n.tema === `[[${nomeOuLink}]]`
      );
    });
  }, [notasZettel, notaAtiva]);

  // Métricas do acervo
  const metricas = useMemo(() => {
    const indices = notasZettel.filter((n) => n.tipo === 'indice').length;
    const referencias = notasZettel.filter((n) => n.tipo === 'referencia').length;
    const permanentes = notasZettel.filter((n) => n.tipo === 'permanente').length;
    const pendentesInbox = notasTemporarias.filter((t) => !t.processada).length;
    const ratio = referencias > 0 ? (permanentes / referencias).toFixed(1) : '0';
    return { indices, referencias, permanentes, pendentesInbox, ratio };
  }, [notasZettel, notasTemporarias]);

  // Manipulador de salvar edição
  const handleSalvarEdicao = () => {
    if (!notaAtiva) return;
    atualizarNotaZettel(notaAtiva.id, {
      titulo: tituloEditando.trim() || notaAtiva.titulo,
      conteudo: conteudoEditando
    });
    setModoEdicao(false);
  };

  // Manipulador de inserção de tags/marcadores no editor
  const handleInserirTexto = (texto: string) => {
    setConteudoEditando((prev) => prev + '\n' + texto);
  };

  // Manipulador de navegação por Wikilink
  const handleClicarWikilink = (linkTexto: string) => {
    const limpo = linkTexto.replace(/\[\[|\]\]/g, '').trim();
    // Procura por nota com esse título
    const notaAlvo = notasZettel.find((n) => n.titulo.toLowerCase() === limpo.toLowerCase());
    if (notaAlvo) {
      selecionarNotaZettel(notaAlvo.id);
      return;
    }
    // Procura por livro da biblioteca correspondente
    const livroAlvo = livros.find((l) => l.titulo.toLowerCase().includes(limpo.toLowerCase()));
    if (livroAlvo && onSelecionarLivroEstante) {
      onSelecionarLivroEstante(livroAlvo.id);
    }
  };

  // Manipulador de envio de captura rápida (Inbox)
  const handleSalvarCaptura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboxPensamento.trim()) return;

    let fonteFinal = inboxFonteTexto.trim();
    let lId: number | undefined = undefined;
    if (inboxLivroId !== '') {
      const liv = livros.find((l) => l.id === Number(inboxLivroId));
      if (liv) {
        fonteFinal = liv.titulo;
        lId = liv.id;
      }
    }

    adicionarNotaTemporaria({
      pensamento: inboxPensamento.trim(),
      fonte: fonteFinal || 'Leitura geral',
      livroId: lId,
      pagina: inboxPagina.trim() || undefined
    });

    setInboxPensamento('');
    setInboxPagina('');
    setInboxFonteTexto('');
    setInboxLivroId('');
  };

  // Manipulador de conversão de temporária em permanente
  const handleConverterEmPermanente = (temp: NotaTemporaria) => {
    setModalNovoTitulo(temp.pensamento);
    setModalNovoPagina(temp.pagina ? String(temp.pagina) : '');
    setModalNovoRef(temp.fonte);
    setModalNovoTipo('permanente');
    marcarNotaTemporariaProcessada(temp.id);
  };

  // Manipulador de criar nota permanente pelo modal
  const handleCriarPermanenteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNovoTitulo.trim()) return;

    const nova = criarNotaPermanenteRapida(
      modalNovoTemaNum,
      modalNovoTitulo.trim(),
      modalNovoRef.trim(),
      modalNovoPagina.trim(),
      modalNovoRelacao.trim()
    );

    setModalNovoTipo(null);
    setModalNovoTitulo('');
    setModalNovoRef('');
    setModalNovoPagina('');
    setModalNovoRelacao('');
    selecionarNotaZettel(nova.id);
  };

  // Manipulador de criar nota de referência pelo modal
  const handleCriarReferenciaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalNovoLivroId !== '') {
      const nova = criarNotaReferenciaDeLivro(Number(modalNovoLivroId));
      setModalNovoTipo(null);
      setModalNovoLivroId('');
      selecionarNotaZettel(nova.id);
      return;
    }

    if (!modalNovoTitulo.trim()) return;
    const agora = new Date();
    const stamp = agora.getFullYear().toString() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0');

    const temaNome = modalNovoTemaNum === 1 ? '1 Literatura' : (modalNovoTemaNum === 2 ? '2 Filosofia' : '3 Método e Produtividade Intelectual');
    const tituloFinal = `${modalNovoTemaNum}-${stamp} - ${modalNovoTitulo.trim()}`;

    const novaNota: NotaZettel = {
      id: stamp,
      titulo: tituloFinal,
      tipo: 'referencia',
      pasta: '02 referências',
      tags: ['nota de referência'],
      tema: `[[${temaNome}]]`,
      conteudo: `## Referência\n${modalNovoTitulo.trim()}.\n\n## Relevância\nFonte de estudo pessoal.\n\n## Notas Relacionadas\n- \n\n## Resumo\n\n\n## Citações e Comentários\n- #síntese p. 1: `,
      dataCriacao: agora.toISOString(),
      dataAtualizacao: agora.toISOString()
    };

    adicionarNotaZettel(novaNota);
    setModalNovoTipo(null);
    setModalNovoTitulo('');
    selecionarNotaZettel(novaNota.id);
  };

  // Manipulador de criar nota índice pelo modal
  const handleCriarIndiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNovoTitulo.trim()) return;

    const agora = new Date();
    const stamp = agora.getFullYear().toString() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0');

    const novaNota: NotaZettel = {
      id: stamp,
      titulo: modalNovoTitulo.trim(),
      tipo: 'indice',
      pasta: '01 índice',
      tags: ['nota índice'],
      conteudo: `# Referências\n- \n\n# Notas Relacionadas\n- `,
      dataCriacao: agora.toISOString(),
      dataAtualizacao: agora.toISOString()
    };

    adicionarNotaZettel(novaNota);
    setModalNovoTipo(null);
    setModalNovoTitulo('');
    selecionarNotaZettel(novaNota.id);
  };

  // Exportar cópia de markdown
  const handleCopiarExportacao = () => {
    const md = exportarZettelkastenMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      setCopiadoNotif(true);
      setTimeout(() => setCopiadoNotif(false), 2500);
    });
  };

  // Renderizador com formatação de tags e wikilinks
  const renderizarTextoFormatado = (texto: string) => {
    const linhas = texto.split('\n');
    return (
      <div className="space-y-2 leading-relaxed font-serif text-stone-800 dark:text-stone-200">
        {linhas.map((linha, idx) => {
          // Títulos Markdown
          if (linha.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 pt-3 pb-1 border-b border-stone-200 dark:border-stone-800">
                {linha.replace('# ', '')}
              </h1>
            );
          }
          if (linha.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base font-bold font-serif text-amber-900 dark:text-amber-300 pt-3 pb-1">
                {linha.replace('## ', '')}
              </h2>
            );
          }
          if (linha.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm font-bold font-serif text-stone-800 dark:text-stone-200 pt-2">
                {linha.replace('### ', '')}
              </h3>
            );
          }

          // Destaque de #síntese (regra do método)
          if (linha.includes('#síntese')) {
            const partes = linha.split('#síntese');
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-xs sm:text-sm font-sans flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                  #síntese
                </span>
                <span className="flex-1">
                  {renderizarWikilinksNaLinha(partes[1] || partes[0])}
                </span>
              </div>
            );
          }

          // Destaque de #comentário
          if (linha.includes('#comentário')) {
            const partes = linha.split('#comentário');
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/40 border-l-4 border-sky-500 text-xs sm:text-sm font-sans flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white shrink-0">
                  #comentário
                </span>
                <span className="flex-1">
                  {renderizarWikilinksNaLinha(partes[1] || partes[0])}
                </span>
              </div>
            );
          }

          // Destaque de #citação (exceção no método)
          if (linha.includes('#citação')) {
            const partes = linha.split('#citação');
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border-l-4 border-amber-500 text-xs sm:text-sm italic font-serif flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold not-italic bg-amber-600 text-white shrink-0 font-sans">
                  #citação
                </span>
                <span className="flex-1">
                  {renderizarWikilinksNaLinha(partes[1] || partes[0])}
                </span>
              </div>
            );
          }

          // Lista de itens
          if (linha.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm pl-2">
                <span className="text-amber-600 font-bold">•</span>
                <span className="flex-1">{renderizarWikilinksNaLinha(linha.replace('- ', ''))}</span>
              </div>
            );
          }

          // Linha em branco
          if (!linha.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Parágrafo comum com wikilinks
          return (
            <p key={idx} className="text-xs sm:text-sm leading-relaxed">
              {renderizarWikilinksNaLinha(linha)}
            </p>
          );
        })}
      </div>
    );
  };

  // Parser de [[Wikilinks]] inline
  const renderizarWikilinksNaLinha = (str: string) => {
    const regex = /\[\[([^\]\|]+)(?:\|[^\]]+)?\]\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const linkText = match[1];
      parts.push(
        <button
          key={match.index}
          onClick={() => handleClicarWikilink(linkText)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 rounded text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:border-amber-500 hover:bg-amber-200 transition-colors cursor-pointer"
          title={`Ir para nota ou livro: [[${linkText}]]`}
        >
          <LinkIcon className="w-2.5 h-2.5 text-amber-600" />
          <span>[[{linkText}]]</span>
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Header do Zettelkasten com Métricas e Botões Rápidos */}
      <div className="bg-library-paper dark:bg-library-darkPaper rounded-xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Método Rodrigo Leão · Luhmann
              </span>
              <span className="text-xs text-stone-500">
                Conexões &gt; Categorias · Atomicidade · Regra das 48h
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Zettelkasten de Estudos
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Transforme o que você lê em ideias atômicas suas, conectadas entre si para produzir ensaios sem a sensação de Sísifo.
            </p>
          </div>

          {/* Botões Rápidos de Criação (1 Clique) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setModalNovoTipo('permanente');
                setModalNovoTitulo('');
                setModalNovoRef('');
                setModalNovoPagina('');
                setModalNovoRelacao('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition"
              title="Nova ideia atômica autônoma"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Permanente</span>
            </button>

            <button
              onClick={() => {
                setModalNovoTipo('referencia');
                setModalNovoTitulo('');
                setModalNovoLivroId('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-600 text-white shadow-sm transition"
              title="Fichar livro ou fonte com ABNT e sínteses"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>+ Referência</span>
            </button>

            <button
              onClick={() => {
                setModalNovoTipo('indice');
                setModalNovoTitulo('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white shadow-sm transition"
              title="Criar macrotema organizador"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>+ Índice</span>
            </button>

            <button
              onClick={() => setPastaAtiva('inbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                metricas.pendentesInbox > 0
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-400 animate-pulse'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
              }`}
              title="Captura rápida sem interromper o estudo"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Inbox ({metricas.pendentesInbox})</span>
            </button>

            <button
              onClick={handleCopiarExportacao}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 transition"
              title="Exportar todas as notas no formato Markdown do Obsidian"
            >
              {copiadoNotif ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiadoNotif ? 'Copiado!' : 'Exportar .md'}</span>
            </button>
          </div>
        </div>

        {/* Barra de Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 mt-4 border-t border-stone-200 dark:border-stone-800 text-xs">
          <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 text-[10px] uppercase font-sans">Notas de Índice</span>
            <div className="text-base font-bold font-serif text-purple-700 dark:text-purple-400">{metricas.indices}</div>
          </div>
          <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 text-[10px] uppercase font-sans">Referências (Fontes)</span>
            <div className="text-base font-bold font-serif text-sky-700 dark:text-sky-400">{metricas.referencias}</div>
          </div>
          <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 text-[10px] uppercase font-sans">Permanentes (Minhas)</span>
            <div className="text-base font-bold font-serif text-emerald-700 dark:text-emerald-400">{metricas.permanentes}</div>
          </div>
          <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 text-[10px] uppercase font-sans">Média Perm./Fonte</span>
            <div className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
              {metricas.ratio} <span className="text-[10px] text-stone-500 font-sans">(Meta ≥ 3)</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 text-[10px] uppercase font-sans">Inbox &lt; 48h</span>
            <div className="text-base font-bold font-serif text-amber-700 dark:text-amber-400">
              {metricas.pendentesInbox} pendente{metricas.pendentesInbox !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Navegação de Pastas / Modos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setPastaAtiva('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pastaAtiva === 'todas'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            Todas ({notasZettel.length})
          </button>
          <button
            onClick={() => setPastaAtiva('01 índice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pastaAtiva === '01 índice'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-purple-500" />
            <span>01 índice</span>
          </button>
          <button
            onClick={() => setPastaAtiva('02 referências')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pastaAtiva === '02 referências'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>02 referências</span>
          </button>
          <button
            onClick={() => setPastaAtiva('03 permanentes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pastaAtiva === '03 permanentes'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
            <span>03 permanentes</span>
          </button>
          <button
            onClick={() => setPastaAtiva('inbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pastaAtiva === 'inbox'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Caixa de Entrada 48h</span>
          </button>
          <button
            onClick={() => setPastaAtiva('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pastaAtiva === 'canvas'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
            <span>Canvas de Ideias</span>
          </button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por ideia, título ou tag..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL (Conforme Pasta/Modo) */}
      {pastaAtiva === 'inbox' ? (
        /* SEÇÃO CAIXA DE ENTRADA (Captura Rápida 48h) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Formulário de Captura Rápida */}
          <div className="bg-library-paper dark:bg-library-darkPaper p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                Regra das 48 Horas
              </span>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
                Capturar sem Interromper o Estudo
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Apenas o pensamento essencial e o número da página. Notas temporárias são processadas em até 48h e depois descartadas.
              </p>
            </div>

            <form onSubmit={handleSalvarCaptura} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Pensamento Rápido / Insight
                </label>
                <textarea
                  rows={3}
                  value={inboxPensamento}
                  onChange={(e) => setInboxPensamento(e.target.value)}
                  placeholder="Ex: A circularidade do tempo impede a aprendizagem histórica..."
                  className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Livro da Biblioteca
                  </label>
                  <select
                    value={inboxLivroId}
                    onChange={(e) => setInboxLivroId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                  >
                    <option value="">Outra Fonte / Manual</option>
                    {livros.map((l) => (
                      <option key={l.id} value={l.id}>
                        #{l.id} {l.titulo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nº da Página
                  </label>
                  <input
                    type="text"
                    value={inboxPagina}
                    onChange={(e) => setInboxPagina(e.target.value)}
                    placeholder="Ex: 84"
                    className="w-full p-2 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {inboxLivroId === '' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nome da Fonte Externa
                  </label>
                  <input
                    type="text"
                    value={inboxFonteTexto}
                    onChange={(e) => setInboxFonteTexto(e.target.value)}
                    placeholder="Ex: Artigo, Podcast ou Livro fora da lista"
                    className="w-full p-2 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition"
              >
                Capturar (Salvar no Inbox)
              </button>
            </form>
          </div>

          {/* Lista de Notas Temporárias Pendentes */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Notas Temporárias para Processamento (&le; 48h)
              </h3>
              <span className="text-xs text-stone-500">
                {notasTemporarias.filter((t) => !t.processada).length} nota(s) ativa(s)
              </span>
            </div>

            {notasTemporarias.length === 0 ? (
              <div className="p-8 text-center bg-library-paper dark:bg-library-darkPaper rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                Inbox vazio! Todas as notas temporárias foram processadas ou descartadas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notasTemporarias.map((temp) => {
                  const horasPassadas = Math.floor(
                    (Date.now() - new Date(temp.dataCriacao).getTime()) / (1000 * 60 * 60)
                  );
                  const horasRestantes = Math.max(0, 48 - horasPassadas);
                  const isCritico = horasRestantes < 12;

                  return (
                    <div
                      key={temp.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        temp.processada
                          ? 'bg-stone-100/60 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800 opacity-60'
                          : 'bg-library-paper dark:bg-library-darkPaper border-stone-300 dark:border-stone-700 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            {temp.fonte} {temp.pagina ? `· p. ${temp.pagina}` : ''}
                          </span>
                          {!temp.processada && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isCritico
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-400'
                                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                              }`}
                            >
                              {horasRestantes}h restantes
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-serif text-stone-900 dark:text-stone-100 leading-relaxed">
                          "{temp.pensamento}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                        {!temp.processada ? (
                          <>
                            <button
                              onClick={() => handleConverterEmPermanente(temp)}
                              className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>Converter em Permanente</span>
                            </button>
                            <button
                              onClick={() => removerNotaTemporaria(temp.id)}
                              className="p-1 rounded text-stone-400 hover:text-rose-600 transition"
                              title="Descartar nota temporária (Lixo)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-stone-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Processada em Nota Permanente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : pastaAtiva === 'canvas' ? (
        /* SEÇÃO OBSIDIAN CANVAS (Mesa Visual de Articulação) */
        <div className="bg-library-paper dark:bg-library-darkPaper p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                Obsidian Canvas Nativo
              </span>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
                {canvasZettel[0]?.titulo || 'Mesa de Articulação Conceitual'}
              </h3>
              <p className="text-xs text-stone-500">
                {canvasZettel[0]?.descricao || 'Espalhe suas notas permanentes e deixe o roteiro ou ensaio emergir.'}
              </p>
            </div>
            <div className="text-xs text-stone-500 font-sans">
              4 Cartões Articulados · 1 Síntese Emergente
            </div>
          </div>

          {/* Mesa Visual do Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Bloco 1: Fontes */}
            <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 space-y-3">
              <div className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Fontes Fichadas (02)</span>
              </div>
              <div
                onClick={() => {
                  const n = notasZettel.find((x) => x.titulo.includes('100 anos de solidão'));
                  if (n) {
                    selecionarNotaZettel(n.id);
                    setPastaAtiva('todas');
                  }
                }}
                className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-sky-300 dark:border-sky-800 shadow-xs cursor-pointer hover:border-sky-500 transition"
              >
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">100 anos de solidão</div>
                <div className="text-[11px] text-stone-500 mt-1">Gabriel García Márquez · Macondo e a circularidade trágica.</div>
              </div>
              <div
                onClick={() => {
                  const n = notasZettel.find((x) => x.titulo.includes('O Mito de Sísifo'));
                  if (n) {
                    selecionarNotaZettel(n.id);
                    setPastaAtiva('todas');
                  }
                }}
                className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-sky-300 dark:border-sky-800 shadow-xs cursor-pointer hover:border-sky-500 transition"
              >
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">O Mito de Sísifo</div>
                <div className="text-[11px] text-stone-500 mt-1">Albert Camus · O confronto lúcido entre consciência e o absurdo.</div>
              </div>
            </div>

            {/* Bloco 2: Notas Permanentes */}
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ideias Atômicas Conectadas (03)</span>
              </div>
              <div
                onClick={() => {
                  const n = notasZettel.find((x) => x.titulo.includes('Tempo circular'));
                  if (n) {
                    selecionarNotaZettel(n.id);
                    setPastaAtiva('todas');
                  }
                }}
                className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800 shadow-xs cursor-pointer hover:border-emerald-500 transition"
              >
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Tempo circular como prisão histórica</div>
                <div className="text-[11px] text-stone-500 mt-1">A amnésia repete cegamente os mesmos erros.</div>
              </div>
              <div
                onClick={() => {
                  const n = notasZettel.find((x) => x.titulo.includes('revolta como resposta lúcida'));
                  if (n) {
                    selecionarNotaZettel(n.id);
                    setPastaAtiva('todas');
                  }
                }}
                className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800 shadow-xs cursor-pointer hover:border-emerald-500 transition"
              >
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">A revolta lúcida contra o absurdo</div>
                <div className="text-[11px] text-stone-500 mt-1">Sísifo empurra a pedra sabendo do destino, vencendo os deuses pela consciência.</div>
              </div>
            </div>

            {/* Bloco 3: Síntese do Ensaio */}
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-3">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Síntese Emergente (Roteiro do Ensaio)</span>
              </div>
              <div className="text-xs text-stone-800 dark:text-stone-200 space-y-2 leading-relaxed">
                <p>
                  <strong>Tese Central:</strong> O contraste vital entre o ciclo sem consciência (tragédia de Macondo) e a repetição com consciência lúcida (triunfo de Sísifo).
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 text-[11px]">
                  <li>1. A rotina como morte espiritual ou como despertar lúcido.</li>
                  <li>2. Amnésia histórica vs Revolta consciente contínua.</li>
                  <li>3. A criação estética (Realismo Mágico e Absurdo) como afirmação da liberdade.</li>
                </ul>
                <div className="p-2.5 rounded bg-amber-100/70 dark:bg-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                  Pronto! Um artigo ou ensaio original gerado sem precisar abrir os livros novamente.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SEÇÃO PADRÃO: 2 COLUNAS (LISTA DE NOTAS + VISUALIZADOR/EDITOR) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Coluna da Esquerda: Lista de Notas (4 colunas no lg) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>{notasFiltradas.length} nota(s) encontrada(s)</span>
              {filtroTag && (
                <button
                  onClick={() => setFiltroTag(null)}
                  className="text-amber-700 dark:text-amber-400 underline"
                >
                  Limpar tag #{filtroTag}
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {notasFiltradas.map((nota) => {
                const isSelected = notaAtiva?.id === nota.id;
                let badgeCor = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
                if (nota.tipo === 'referencia') badgeCor = 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
                if (nota.tipo === 'permanente') badgeCor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';

                return (
                  <div
                    key={nota.id}
                    onClick={() => selecionarNotaZettel(nota.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm'
                        : 'bg-library-paper dark:bg-library-darkPaper border-stone-200 dark:border-stone-800 hover:border-amber-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeCor}`}>
                          {nota.pasta}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">{nota.id}</span>
                      </div>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2">
                        {nota.titulo}
                      </h4>
                      <p className="text-[11px] font-serif text-stone-500 line-clamp-2 mt-1">
                        {nota.conteudo.replace(/#|\[\[|\]\]/g, '')}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-500 font-sans">
                      <div className="flex items-center gap-1.5">
                        {nota.tags.map((t) => (
                          <span
                            key={t}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiltroTag(t);
                            }}
                            className={`px-1 rounded ${
                              t === 'revisar'
                                ? 'bg-amber-200 text-amber-900 font-bold'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span>
                        {nota.tipo === 'referencia' && nota.livroId ? `Livro #${nota.livroId}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna da Direita: Leitor / Editor da Nota Ativa (7 colunas no lg) */}
          <div className="lg:col-span-7">
            {notaAtiva ? (
              <div className="bg-library-paper dark:bg-library-darkPaper p-5 sm:p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col min-h-[680px]">
                {/* Cabeçalho da Nota */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {notaAtiva.pasta}
                      </span>
                      <span className="text-xs font-mono text-stone-400">ID: {notaAtiva.id}</span>
                      {notaAtiva.revisar && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-200 text-amber-900">
                          #revisar
                        </span>
                      )}
                    </div>
                    {modoEdicao ? (
                      <input
                        type="text"
                        value={tituloEditando}
                        onChange={(e) => setTituloEditando(e.target.value)}
                        className="w-full text-lg font-serif font-bold p-1 rounded bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                      />
                    ) : (
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                        {notaAtiva.titulo}
                      </h2>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {modoEdicao ? (
                      <button
                        onClick={handleSalvarEdicao}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-600 transition"
                      >
                        Salvar
                      </button>
                    ) : (
                      <button
                        onClick={() => setModoEdicao(true)}
                        className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition"
                        title="Editar conteúdo da nota"
                      >
                        <Edit3 className="w-4 h-4 text-amber-700" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Excluir permanentemente a nota "${notaAtiva.titulo}"?`)) {
                          removerNotaZettel(notaAtiva.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                      title="Excluir nota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metadados Frontmatter (Estilo Obsidian Properties) */}
                <div className="my-3 p-3 rounded-lg bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 text-xs space-y-1.5 font-sans">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">ID Único</span>
                      <span className="font-mono text-stone-700 dark:text-stone-300">{notaAtiva.id}</span>
                    </div>
                    {notaAtiva.tema && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Tema (Índice)</span>
                        <button
                          onClick={() => handleClicarWikilink(notaAtiva.tema || '')}
                          className="font-semibold text-purple-700 dark:text-purple-400 hover:underline"
                        >
                          {notaAtiva.tema}
                        </button>
                      </div>
                    )}
                    {notaAtiva.referencia && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Referência (Fonte)</span>
                        <button
                          onClick={() => handleClicarWikilink(notaAtiva.referencia || '')}
                          className="font-semibold text-sky-700 dark:text-sky-400 hover:underline truncate block"
                        >
                          {notaAtiva.referencia}
                        </button>
                      </div>
                    )}
                    {notaAtiva.relacao && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Relação Afim</span>
                        <button
                          onClick={() => handleClicarWikilink(notaAtiva.relacao || '')}
                          className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline truncate block"
                        >
                          {notaAtiva.relacao}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Corpo da Nota (Leitura ou Edição) */}
                <div className="flex-1 py-2">
                  {modoEdicao ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-stone-200 dark:border-stone-800 text-xs">
                        <span className="text-stone-400 text-[10px]">Atalhos rápidos:</span>
                        <button
                          type="button"
                          onClick={() => handleInserirTexto('- #síntese p. : ')}
                          className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]"
                        >
                          + #síntese
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInserirTexto('- #comentário p. : ')}
                          className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[11px]"
                        >
                          + #comentário
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInserirTexto('- #citação p. : ""')}
                          className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]"
                        >
                          + #citação
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInserirTexto('[[Nota Relacionada]]')}
                          className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-[11px]"
                        >
                          + [[Wikilink]]
                        </button>
                      </div>
                      <textarea
                        rows={16}
                        value={conteudoEditando}
                        onChange={(e) => setConteudoEditando(e.target.value)}
                        className="w-full p-3 font-mono text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600 leading-relaxed"
                      />
                    </div>
                  ) : (
                    renderizarTextoFormatado(notaAtiva.conteudo)
                  )}
                </div>

                {/* Backlinks (Quem cita esta nota) */}
                <div className="mt-auto pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider font-sans">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Conexões Reversas / Backlinks ({backlinks.length})</span>
                  </div>
                  {backlinks.length === 0 ? (
                    <div className="text-xs text-stone-400 italic">
                      Nenhuma outra nota cita esta ideia diretamente ainda.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {backlinks.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => selecionarNotaZettel(b.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-amber-500 text-stone-800 dark:text-stone-200 transition"
                        >
                          <span className="text-[10px] text-amber-600 font-bold">←</span>
                          <span>{b.titulo}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-library-paper dark:bg-library-darkPaper p-12 rounded-xl border border-stone-200 dark:border-stone-800 text-center text-stone-400 text-xs">
                Selecione uma nota na lista ao lado ou crie uma nova para começar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAIS DE CRIAÇÃO RÁPIDA (PERMANENTE / REFERÊNCIA / ÍNDICE) */}
      {modalNovoTipo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-library-paper dark:bg-library-darkPaper w-full max-w-lg rounded-xl shadow-2xl border border-stone-300 dark:border-stone-700 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                {modalNovoTipo === 'permanente' && 'Nova Nota Permanente (1 Ideia Atômica)'}
                {modalNovoTipo === 'referencia' && 'Nova Nota de Referência (Fonte/Livro)'}
                {modalNovoTipo === 'indice' && 'Nova Nota de Índice (Macrotema)'}
              </h3>
              <button
                onClick={() => setModalNovoTipo(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalNovoTipo === 'permanente' && (
              <form onSubmit={handleCriarPermanenteSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Título Sintético do Conceito
                  </label>
                  <input
                    type="text"
                    value={modalNovoTitulo}
                    onChange={(e) => setModalNovoTitulo(e.target.value)}
                    placeholder="Ex: Tempo circular como prisão da repetição histórica"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600 font-serif"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Macrotema / Índice
                    </label>
                    <select
                      value={modalNovoTemaNum}
                      onChange={(e) => setModalNovoTemaNum(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    >
                      <option value={1}>1 Literatura</option>
                      <option value={2}>2 Filosofia</option>
                      <option value={3}>3 Método e Produtividade Intelectual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Nº da Página (opcional)
                    </label>
                    <input
                      type="text"
                      value={modalNovoPagina}
                      onChange={(e) => setModalNovoPagina(e.target.value)}
                      placeholder="Ex: 84"
                      className="w-full p-2 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Referência da Fonte
                  </label>
                  <input
                    type="text"
                    value={modalNovoRef}
                    onChange={(e) => setModalNovoRef(e.target.value)}
                    placeholder="Ex: [[1-202501152223 - 100 anos de solidão]]"
                    className="w-full p-2 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Conectar com outra Nota Permanente afim (Relação)
                  </label>
                  <input
                    type="text"
                    value={modalNovoRelacao}
                    onChange={(e) => setModalNovoRelacao(e.target.value)}
                    placeholder="Ex: [[Outra Nota Permanente]]"
                    className="w-full p-2 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovoTipo(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm"
                  >
                    Criar Nota Permanente
                  </button>
                </div>
              </form>
            )}

            {modalNovoTipo === 'referencia' && (
              <form onSubmit={handleCriarReferenciaSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Fichar Livro da Biblioteca (1 Clique)
                  </label>
                  <select
                    value={modalNovoLivroId}
                    onChange={(e) => setModalNovoLivroId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  >
                    <option value="">Digitar título / fonte manualmente abaixo...</option>
                    {livros.map((l) => (
                      <option key={l.id} value={l.id}>
                        Nível {l.nivel} · #{l.id} {l.titulo} — {l.autor}
                      </option>
                    ))}
                  </select>
                </div>

                {modalNovoLivroId === '' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Título da Fonte Externa
                      </label>
                      <input
                        type="text"
                        value={modalNovoTitulo}
                        onChange={(e) => setModalNovoTitulo(e.target.value)}
                        placeholder="Ex: Como Ler Livros ou 100 anos de solidão"
                        className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Macrotema / Índice
                      </label>
                      <select
                        value={modalNovoTemaNum}
                        onChange={(e) => setModalNovoTemaNum(Number(e.target.value))}
                        className="w-full p-2 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      >
                        <option value={1}>1 Literatura</option>
                        <option value={2}>2 Filosofia</option>
                        <option value={3}>3 Método e Produtividade Intelectual</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovoTipo(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-600 text-white shadow-sm"
                  >
                    Criar Nota de Referência
                  </button>
                </div>
              </form>
            )}

            {modalNovoTipo === 'indice' && (
              <form onSubmit={handleCriarIndiceSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nome do Macrotema / Índice
                  </label>
                  <input
                    type="text"
                    value={modalNovoTitulo}
                    onChange={(e) => setModalNovoTitulo(e.target.value)}
                    placeholder="Ex: 4 Psicologia ou 5 Teologia"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-serif"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovoTipo(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white shadow-sm"
                  >
                    Criar Nota Índice
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
