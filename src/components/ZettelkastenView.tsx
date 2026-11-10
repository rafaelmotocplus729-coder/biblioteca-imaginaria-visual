import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  BookOpen,
  Trash2,
  CheckCircle2,
  Edit3,
  LayoutGrid,
  Lightbulb,
  ArrowRight,
  X,
  Copy,
  Check,
  Tag,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Highlighter,
  BookMarked,
  FileText,
  FolderPlus,
  FilePlus,
  Upload,
  Book
} from 'lucide-react';

interface ZettelkastenViewProps {
  onSelecionarLivroEstante?: (livroId: number) => void;
}

// Catálogo de Fundos Clássicos / Chiaroscuro de Alta Resolução
interface WallpaperPreset {
  id: string;
  nome: string;
  descricao: string;
  url: string;
  autor: string;
}

const PRESETS_WALLPAPERS: WallpaperPreset[] = [
  {
    id: 'caravaggio',
    nome: 'Claroscuro Barroco (Caravaggio)',
    descricao: 'Pintura a óleo clássica com iluminação dramática e luz de velas quente',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=2000&auto=format&fit=crop',
    autor: 'Artes Clássicas / Galeria'
  },
  {
    id: 'rembrandt',
    nome: 'Filósofo no Ateliê (Rembrandt)',
    descricao: 'Tons sépia e dourados profundos com textura de tela centenária',
    url: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=2000&auto=format&fit=crop',
    autor: 'Gabinete de Estudos'
  },
  {
    id: 'ateneas',
    nome: 'A Escola de Atenas (Rafael)',
    descricao: 'Arquitetura renascentista monumental e mestres da filosofia',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=2000&auto=format&fit=crop',
    autor: 'Afresco do Vaticano'
  },
  {
    id: 'biblioteca',
    nome: 'Biblioteca Noturna de Oxford',
    descricao: 'Estantes clássicas de carvalho escuro e encadernações em couro nobre',
    url: 'https://images.unsplash.com/photo-1507842229451-9f7506652c0a?q=80&w=2000&auto=format&fit=crop',
    autor: 'Acervo Histórico'
  },
  {
    id: 'monk',
    nome: 'Monge Contemplativo (Friedrich)',
    descricao: 'Crepúsculo místico e horizonte filosófico sublime',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
    autor: 'Romantismo Alemão'
  },
  {
    id: 'pergaminho',
    nome: 'Pergaminho & Cartografia Antiga',
    descricao: 'Textura suave de velino antigo e mapas renascentistas',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=2000&auto=format&fit=crop',
    autor: 'Cartografia Histórica'
  },
  {
    id: 'solido',
    nome: 'Preto Sólido Obsidian (Sem Imagem)',
    descricao: 'Fundo minimalista escuro sem imagem com foco total no texto',
    url: '',
    autor: 'Minimalismo Puro'
  }
];

export const ZettelkastenView: React.FC<ZettelkastenViewProps> = ({
  onSelecionarLivroEstante
}) => {
  const {
    livros,
    notasZettel,
    notasTemporarias,
    canvasZettel,
    notaZettelSelecionadaId,
    fundoZettelkasten,
    opacidadeFundoZettelkasten,
    desfoqueFundoZettelkasten,
    adicionarNotaZettel,
    atualizarNotaZettel,
    removerNotaZettel,
    selecionarNotaZettel,
    setFundoZettelkasten,
    setOpacidadeFundoZettelkasten,
    setDesfoqueFundoZettelkasten,
    adicionarNotaTemporaria,
    marcarNotaTemporariaProcessada,
    removerNotaTemporaria,
    criarNotaReferenciaDeLivro,
    criarNotaPermanenteRapida,
    exportarZettelkastenMarkdown
  } = useBibliotecaStore();

  // Estados de layout e visão
  const [visaoAtiva, setVisaoAtiva] = useState<'acervo' | 'inbox' | 'canvas'>('acervo');
  const [busca, setBusca] = useState('');
  const [propriedadesAberta, setPropriedadesAberta] = useState(true);
  const [backlinksAberto, setBacklinksAberto] = useState(false);

  // Estados de expansão de pastas na Árvore do Obsidian
  const [pastasAbertas, setPastasAbertas] = useState<Record<string, boolean>>({
    biblioteca: true,
    '00 - INÍCIO': true,
    '01 - ÍNDICE': true,
    '02 - REFERÊNCIAS': true,
    '03 - PERMANENTES': true,
    '04 - DIÁRIO INTELECTUAL': false,
    MODELO: false,
    Rascunho: false
  });

  // Modo de edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [conteudoEditando, setConteudoEditando] = useState('');
  const [tituloEditando, setTituloEditando] = useState('');

  // Modal de Personalização de Fundo / Wallpaper
  const [modalFundoAberto, setModalFundoAberto] = useState(false);
  const [customFundoUrl, setCustomFundoUrl] = useState('');

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
  const [linkCopiadoNotif, setLinkCopiadoNotif] = useState(false);

  // Ref do upload de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL ativa do Wallpaper selecionado
  const urlFundoAtivo = useMemo(() => {
    if (!fundoZettelkasten || fundoZettelkasten === 'solido') return '';
    const preset = PRESETS_WALLPAPERS.find((p) => p.id === fundoZettelkasten);
    if (preset) return preset.url;
    // URL personalizada ou data URL
    return fundoZettelkasten;
  }, [fundoZettelkasten]);

  // Nota ativa selecionada
  const notaAtiva = useMemo(() => {
    if (!notaZettelSelecionadaId && notasZettel.length > 0) {
      // Prioriza a nota de O Estrangeiro ou a primeira permanente
      const estrangeiro = notasZettel.find((n) => n.titulo.includes('O estrangeiro') || n.id === '1-202528122325');
      if (estrangeiro) return estrangeiro;
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

  // Alternar pasta aberta na árvore
  const togglePasta = (pasta: string) => {
    setPastasAbertas((prev) => ({ ...prev, [pasta]: !prev[pasta] }));
  };

  // Separar notas por pasta
  const notasPorPasta = useMemo(() => {
    const indices = notasZettel.filter((n) => n.tipo === 'indice' || n.pasta === '01 índice');
    const referencias = notasZettel.filter((n) => n.tipo === 'referencia' || n.pasta === '02 referências');
    const permanentes = notasZettel.filter((n) => n.tipo === 'permanente' || n.pasta === '03 permanentes');
    return { indices, referencias, permanentes };
  }, [notasZettel]);

  // Backlinks
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

  // Estatísticas de palavras e caracteres da nota ativa (como visto na barra inferior do Obsidian)
  const statsNota = useMemo(() => {
    if (!notaAtiva) return { palavras: 0, caracteres: 0 };
    const textoLimpo = notaAtiva.conteudo.replace(/[#*`_\[\]==]/g, '');
    const palavras = textoLimpo.trim().split(/\s+/).filter(Boolean).length;
    const caracteres = textoLimpo.length;
    return { palavras, caracteres };
  }, [notaAtiva]);

  // Salvar edição
  const handleSalvarEdicao = () => {
    if (!notaAtiva) return;
    atualizarNotaZettel(notaAtiva.id, {
      titulo: tituloEditando.trim() || notaAtiva.titulo,
      conteudo: conteudoEditando
    });
    setModoEdicao(false);
  };

  // Alternar tag #revisar
  const handleToggleRevisar = () => {
    if (!notaAtiva) return;
    const jaTem = notaAtiva.revisar;
    const novasTags = jaTem
      ? notaAtiva.tags.filter((t) => t !== 'revisar')
      : [...notaAtiva.tags, 'revisar'];
    atualizarNotaZettel(notaAtiva.id, {
      revisar: !jaTem,
      tags: novasTags
    });
  };

  // Inserção rápida de formatação no editor
  const handleInserirTexto = (texto: string) => {
    setConteudoEditando((prev) => prev + '\n' + texto);
  };

  // Inserção de texto destacado ==texto==
  const handleInserirMarcaTexto = () => {
    setConteudoEditando((prev) => prev + ' ==texto destacado com marca-texto== ');
  };

  // Clicar em Wikilink
  const handleClicarWikilink = (linkTexto: string) => {
    const limpo = linkTexto.replace(/\[\[|\]\]/g, '').trim();
    // Procura por nota correspondente
    const notaAlvo = notasZettel.find(
      (n) => n.titulo.toLowerCase() === limpo.toLowerCase() || n.titulo.toLowerCase().includes(limpo.toLowerCase())
    );
    if (notaAlvo) {
      selecionarNotaZettel(notaAlvo.id);
      setVisaoAtiva('acervo');
      return;
    }
    // Procura por livro da estante
    const livroAlvo = livros.find((l) => l.titulo.toLowerCase().includes(limpo.toLowerCase()));
    if (livroAlvo && onSelecionarLivroEstante) {
      onSelecionarLivroEstante(livroAlvo.id);
    }
  };

  // Copiar Wikilink da nota atual
  const handleCopiarWikilinkNota = () => {
    if (!notaAtiva) return;
    const wikilink = `[[${notaAtiva.titulo}]]`;
    navigator.clipboard.writeText(wikilink).then(() => {
      setLinkCopiadoNotif(true);
      setTimeout(() => setLinkCopiadoNotif(false), 2000);
    });
  };

  // Upload de Imagem Local para o Fundo
  const handleUploadImagemFundo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFundoZettelkasten(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar captura rápida (Inbox)
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
      fonte: fonteFinal || 'Leitura Geral',
      livroId: lId,
      pagina: inboxPagina.trim() || undefined
    });

    setInboxPensamento('');
    setInboxPagina('');
    setInboxFonteTexto('');
    setInboxLivroId('');
  };

  // Converter temporária em permanente
  const handleConverterEmPermanente = (temp: NotaTemporaria) => {
    setModalNovoTitulo(temp.pensamento);
    setModalNovoPagina(temp.pagina ? String(temp.pagina) : '');
    setModalNovoRef(temp.fonte);
    setModalNovoTipo('permanente');
    marcarNotaTemporariaProcessada(temp.id);
  };

  // Criar permanente pelo modal
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
    setVisaoAtiva('acervo');
    selecionarNotaZettel(nova.id);
  };

  // Criar referência pelo modal
  const handleCriarReferenciaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalNovoLivroId !== '') {
      const nova = criarNotaReferenciaDeLivro(Number(modalNovoLivroId));
      setModalNovoTipo(null);
      setModalNovoLivroId('');
      setVisaoAtiva('acervo');
      selecionarNotaZettel(nova.id);
      return;
    }

    if (!modalNovoTitulo.trim()) return;
    const agora = new Date();
    const stamp =
      agora.getFullYear().toString() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0');

    const temaNome =
      modalNovoTemaNum === 1
        ? '1 - LITERATURA'
        : modalNovoTemaNum === 2
        ? '2 - HISTÓRIA'
        : modalNovoTemaNum === 3
        ? '3 - PSICOLOGIA'
        : modalNovoTemaNum === 4
        ? '4 - RELIGIÃO'
        : '5 - FILOSOFIA';
    const tituloFinal = `${modalNovoTemaNum} - ${stamp} - ${modalNovoTitulo.trim()}`;

    const novaNota: NotaZettel = {
      id: stamp,
      titulo: tituloFinal,
      tipo: 'referencia',
      pasta: '02 referências',
      tags: ['nota de referência'],
      tema: `[[${temaNome}]]`,
      conteudo: `## REFERÊNCIAS\n${modalNovoTitulo.trim()}.\n\n## RELEVÂNCIAS\nFonte de estudo pessoal no acervo.\n\n## NOTAS RELACIONADAS\n- \n\n## RESUMO\n\n\n## CITAÇÕES E COMENTÁRIOS\n- #síntese p. 1: `,
      dataCriacao: agora.toISOString(),
      dataAtualizacao: agora.toISOString()
    };

    adicionarNotaZettel(novaNota);
    setModalNovoTipo(null);
    setModalNovoTitulo('');
    setVisaoAtiva('acervo');
    selecionarNotaZettel(novaNota.id);
  };

  // Criar índice pelo modal
  const handleCriarIndiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNovoTitulo.trim()) return;

    const agora = new Date();
    const stamp =
      agora.getFullYear().toString() +
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
    setVisaoAtiva('acervo');
    selecionarNotaZettel(novaNota.id);
  };

  // Exportar markdown
  const handleCopiarExportacao = () => {
    const md = exportarZettelkastenMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      setCopiadoNotif(true);
      setTimeout(() => setCopiadoNotif(false), 2500);
    });
  };

  // Renderizador de Markdown com suporte a ==marca-texto amarelo==, #síntese, #comentário, #citação e [[wikilinks]]
  const renderizarTextoFormatado = (texto: string) => {
    const linhas = texto.split('\n');
    return (
      <div className="space-y-4 font-sans leading-relaxed text-stone-200 text-sm sm:text-[15px]">
        {linhas.map((linha, idx) => {
          // Título H1
          if (linha.startsWith('# ')) {
            return (
              <h1
                key={idx}
                className="text-xl sm:text-2xl font-bold text-white pt-4 pb-2 border-b border-stone-800 tracking-tight"
              >
                {linha.replace('# ', '')}
              </h1>
            );
          }
          // Título H2 (como visto em image.png: REFERÊNCIAS, RELEVÂNCIAS, NOTAS RELACIONADAS)
          if (linha.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="text-sm sm:text-base font-bold uppercase tracking-wider text-stone-300 pt-5 pb-1 font-sans"
              >
                {linha.replace('## ', '')}
              </h2>
            );
          }
          // Título H3
          if (linha.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm font-bold text-stone-200 pt-2">
                {linha.replace('### ', '')}
              </h3>
            );
          }

          // Destaque de #síntese
          if (linha.includes('#síntese')) {
            const partes = linha.split('#síntese');
            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-emerald-950/40 border-l-3 border-emerald-500 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white shrink-0">
                  #síntese
                </span>
                <span className="flex-1 text-emerald-100">
                  {renderizarMarcacoesNaLinha(partes[1] || partes[0])}
                </span>
              </div>
            );
          }

          // Destaque de #comentário
          if (linha.includes('#comentário')) {
            const partes = linha.split('#comentário');
            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-sky-950/40 border-l-3 border-sky-500 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-700 text-white shrink-0">
                  #comentário
                </span>
                <span className="flex-1 text-sky-100">
                  {renderizarMarcacoesNaLinha(partes[1] || partes[0])}
                </span>
              </div>
            );
          }

          // Destaque de #citação
          if (linha.includes('#citação')) {
            const partes = linha.split('#citação');
            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-amber-950/40 border-l-3 border-amber-500 text-xs sm:text-sm italic flex items-start gap-2.5"
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-bold not-italic bg-amber-700 text-white shrink-0">
                  #citação
                </span>
                <span className="flex-1 text-amber-100">
                  {renderizarMarcacoesNaLinha(partes[1] || partes[0])}
                </span>
              </div>
            );
          }

          // Lista de itens
          if (linha.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm pl-2">
                <span className="text-stone-400 font-bold select-none">•</span>
                <span className="flex-1">{renderizarMarcacoesNaLinha(linha.replace('- ', ''))}</span>
              </div>
            );
          }

          // Linha em branco
          if (!linha.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Parágrafo regular
          return (
            <p key={idx} className="text-xs sm:text-sm leading-relaxed text-stone-300">
              {renderizarMarcacoesNaLinha(linha)}
            </p>
          );
        })}
      </div>
    );
  };

  // Parser combinado de ==marca-texto amarelo== e [[Wikilinks]]
  const renderizarMarcacoesNaLinha = (str: string) => {
    // Regex para pegar tanto [[Wikilink]] quanto ==destaque==
    const regex = /(==[^=]+==|\[\[[^\]\|]+(?:\|[^\]]+)?\]\])/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }

      const token = match[1];

      // Caso 1: Marca-texto amarelo ==texto== (como em image_4.png)
      if (token.startsWith('==') && token.endsWith('==')) {
        const textoDestacado = token.slice(2, -2);
        parts.push(
          <mark
            key={match.index}
            className="bg-yellow-400/35 text-yellow-200 px-1 py-0.5 rounded-sm border-b border-yellow-400/50 font-medium mx-0.5 select-text"
          >
            {textoDestacado}
          </mark>
        );
      }
      // Caso 2: [[Wikilink]]
      else if (token.startsWith('[[') && token.endsWith(']]')) {
        const linkText = token.slice(2, -2).split('|')[0];
        parts.push(
          <button
            key={match.index}
            onClick={() => handleClicarWikilink(linkText)}
            className="inline-flex items-center gap-1 px-1.5 py-0.2 mx-0.5 rounded text-xs font-medium text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 cursor-pointer"
            title={`Navegar para conexão: [[${linkText}]]`}
          >
            <LinkIcon className="w-2.5 h-2.5 text-amber-400" />
            <span>[[{linkText}]]</span>
          </button>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-[#141518] text-stone-200 shadow-2xl transition-all min-h-[820px] flex flex-col">
      {/* =========================================================================
          CAMADA DE FUNDO / WALLPAPER (COM REGULADOR DE OPACIDADE E DESFOQUE)
         ========================================================================= */}
      {urlFundoAtivo && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url('${urlFundoAtivo}')`,
            opacity: opacidadeFundoZettelkasten / 100,
            filter: `blur(${desfoqueFundoZettelkasten}px)`
          }}
        />
      )}
      {/* Vinheta escura para garantir contraste e leitura impecável */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#141518]/70 via-[#141518]/50 to-[#141518]/85 z-0" />

      {/* =========================================================================
          BARRA DE FERRAMENTAS SUPERIOR (ESTILO OBSIDIAN RIBBON TABS)
         ========================================================================= */}
      <div className="relative z-10 flex items-center justify-between border-b border-stone-800/80 bg-[#121316]/90 px-3 py-2 text-xs">
        {/* Abas Superiores (Guia Ativa do Documento) */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[70%]">
          {notaAtiva && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/90 border border-stone-700 text-stone-200 text-xs font-sans shadow-xs">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold truncate max-w-[200px] sm:max-w-[320px]">
                {notaAtiva.titulo}
              </span>
              <button
                onClick={() => selecionarNotaZettel(null)}
                className="text-stone-400 hover:text-stone-200 ml-1 cursor-pointer"
                title="Fechar aba"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Botão Nova Nota na barra */}
          <button
            onClick={() => {
              setModalNovoTipo('permanente');
              setModalNovoTitulo('');
              setModalNovoRef('');
              setModalNovoPagina('');
              setModalNovoRelacao('');
            }}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition cursor-pointer"
            title="Nova Nota Permanente"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ações Rápidas no Canto Superior Direito */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botão Personalizar Imagem de Fundo */}
          <button
            onClick={() => setModalFundoAberto(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800/70 hover:bg-stone-700 border border-stone-700/80 text-stone-300 text-xs transition cursor-pointer"
            title="Trocar a Imagem de Fundo (Wallpaper Chiaroscuro / Clássico)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Imagem de Fundo</span>
          </button>

          {/* Alternar Modo Leitura / Edição */}
          <button
            onClick={() => setModoEdicao((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              modoEdicao
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700 border-stone-700/80'
            }`}
            title={modoEdicao ? 'Alternar para Modo Leitura' : 'Alternar para Modo Edição'}
          >
            {modoEdicao ? <Book className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>

          {/* Copiar Wikilink [[Título]] */}
          {notaAtiva && (
            <button
              onClick={handleCopiarWikilinkNota}
              className="p-1.5 rounded-lg bg-stone-800/70 hover:bg-stone-700 border border-stone-700/80 text-stone-300 transition cursor-pointer"
              title="Copiar Wikilink [[Título]]"
            >
              {linkCopiadoNotif ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          )}

          {/* Alternar #revisar */}
          {notaAtiva && (
            <button
              onClick={handleToggleRevisar}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                notaAtiva.revisar
                  ? 'bg-amber-900/60 text-amber-300 border-amber-600'
                  : 'bg-stone-800/70 text-stone-400 hover:text-stone-200 border-stone-700/80'
              }`}
              title={notaAtiva.revisar ? 'Remover tag #revisar' : 'Marcar para #revisar'}
            >
              <Tag className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Excluir Nota */}
          {notaAtiva && (
            <button
              onClick={() => {
                if (confirm(`Excluir permanentemente "${notaAtiva.titulo}"?`)) {
                  removerNotaZettel(notaAtiva.id);
                }
              }}
              className="p-1.5 rounded-lg bg-stone-800/70 hover:bg-rose-950/60 hover:text-rose-400 border border-stone-700/80 text-stone-400 transition cursor-pointer"
              title="Excluir nota"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Exportar Markdown */}
          <button
            onClick={handleCopiarExportacao}
            className="p-1.5 rounded-lg bg-stone-800/70 hover:bg-stone-700 border border-stone-700/80 text-stone-300 text-xs transition cursor-pointer"
            title="Exportar Markdown para o Obsidian"
          >
            {copiadoNotif ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          CORPO PRINCIPAL: SIDEBAR OBSIDIAN + WORKSPACE DA NOTA
         ========================================================================= */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[750px]">
        {/* -------------------------------------------------------------
            COLUNA DA ESQUERDA: ÁRVORE DE PASTAS (EXACTA DO OBSIDIAN)
            (Como em image_2.png e image_3.png)
           ------------------------------------------------------------- */}
        <div className="lg:col-span-4 xl:col-span-3 border-r border-stone-800/80 bg-[#16171b]/95 backdrop-blur-md flex flex-col">
          {/* Topo da Sidebar com Ações de Pasta */}
          <div className="p-3 border-b border-stone-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-xs uppercase tracking-wider text-stone-300 font-sans">
                Biblioteca
              </span>
            </div>

            <div className="flex items-center gap-1 text-stone-400">
              <button
                onClick={() => {
                  setModalNovoTipo('permanente');
                  setModalNovoTitulo('');
                }}
                className="p-1 rounded hover:bg-stone-800 hover:text-stone-200 cursor-pointer"
                title="Nova Nota"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setModalNovoTipo('indice');
                  setModalNovoTitulo('');
                }}
                className="p-1 rounded hover:bg-stone-800 hover:text-stone-200 cursor-pointer"
                title="Nova Pasta / Macrotema"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setModalFundoAberto(true)}
                className="p-1 rounded hover:bg-stone-800 hover:text-stone-200 cursor-pointer"
                title="Configurar Imagem de Fundo"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Campo de Busca Rápida na Sidebar */}
          <div className="p-2.5 border-b border-stone-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar no cofre..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-stone-900 border border-stone-800 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600/70"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Árvore de Diretórios (Hierárquica como no Obsidian das imagens) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs select-none">
            {/* Raiz Biblioteca */}
            <div className="space-y-1">
              <div
                onClick={() => togglePasta('biblioteca')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-stone-800/50 cursor-pointer text-stone-300 font-bold"
              >
                {pastasAbertas.biblioteca ? (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span>Biblioteca</span>
              </div>

              {pastasAbertas.biblioteca && (
                <div className="pl-3.5 space-y-1 border-l border-stone-800 ml-2">
                  {/* 00 - INÍCIO */}
                  <div>
                    <div
                      onClick={() => togglePasta('00 - INÍCIO')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-stone-800/60 cursor-pointer text-stone-400 hover:text-stone-200"
                    >
                      {pastasAbertas['00 - INÍCIO'] ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <span>00 - INÍCIO</span>
                    </div>
                    {pastasAbertas['00 - INÍCIO'] && (
                      <div className="pl-4 space-y-0.5 mt-0.5">
                        <div
                          onClick={() => setVisaoAtiva('acervo')}
                          className="px-2 py-1 rounded hover:bg-stone-800/80 cursor-pointer text-stone-400 hover:text-stone-100 flex items-center gap-1.5"
                        >
                          <BookMarked className="w-3 h-3 text-amber-500" />
                          <span>Guia do Zettelkasten</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 01 - ÍNDICE */}
                  <div>
                    <div
                      onClick={() => togglePasta('01 - ÍNDICE')}
                      className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-800/60 cursor-pointer text-stone-300 font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        {pastasAbertas['01 - ÍNDICE'] ? (
                          <ChevronDown className="w-3 h-3 text-purple-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-purple-400" />
                        )}
                        <span>01 - ÍNDICE</span>
                      </div>
                      <span className="text-[10px] text-stone-500">{notasPorPasta.indices.length}</span>
                    </div>

                    {pastasAbertas['01 - ÍNDICE'] && (
                      <div className="pl-4 space-y-0.5 mt-0.5">
                        {notasPorPasta.indices.map((nota) => {
                          const isSel = notaAtiva?.id === nota.id;
                          return (
                            <div
                              key={nota.id}
                              onClick={() => {
                                selecionarNotaZettel(nota.id);
                                setVisaoAtiva('acervo');
                              }}
                              className={`px-2 py-1 rounded hover:bg-stone-800 cursor-pointer truncate flex items-center gap-1.5 ${
                                isSel ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-stone-400'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                              <span className="truncate">{nota.titulo}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 02 - REFERÊNCIAS */}
                  <div>
                    <div
                      onClick={() => togglePasta('02 - REFERÊNCIAS')}
                      className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-800/60 cursor-pointer text-stone-300 font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        {pastasAbertas['02 - REFERÊNCIAS'] ? (
                          <ChevronDown className="w-3 h-3 text-sky-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-sky-400" />
                        )}
                        <span>02 - REFERÊNCIAS</span>
                      </div>
                      <span className="text-[10px] text-stone-500">{notasPorPasta.referencias.length}</span>
                    </div>

                    {pastasAbertas['02 - REFERÊNCIAS'] && (
                      <div className="pl-4 space-y-0.5 mt-0.5">
                        {notasPorPasta.referencias.map((nota) => {
                          const isSel = notaAtiva?.id === nota.id;
                          return (
                            <div
                              key={nota.id}
                              onClick={() => {
                                selecionarNotaZettel(nota.id);
                                setVisaoAtiva('acervo');
                              }}
                              className={`px-2 py-1 rounded hover:bg-stone-800 cursor-pointer truncate flex items-center gap-1.5 ${
                                isSel ? 'bg-sky-950/60 text-sky-300 font-bold' : 'text-stone-400'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
                              <span className="truncate">{nota.titulo}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 03 - PERMANENTES */}
                  <div>
                    <div
                      onClick={() => togglePasta('03 - PERMANENTES')}
                      className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-800/60 cursor-pointer text-stone-300 font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        {pastasAbertas['03 - PERMANENTES'] ? (
                          <ChevronDown className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>03 - PERMANENTES</span>
                      </div>
                      <span className="text-[10px] text-stone-500">{notasPorPasta.permanentes.length}</span>
                    </div>

                    {pastasAbertas['03 - PERMANENTES'] && (
                      <div className="pl-4 space-y-0.5 mt-0.5 max-h-56 overflow-y-auto">
                        {notasPorPasta.permanentes.map((nota) => {
                          const isSel = notaAtiva?.id === nota.id;
                          return (
                            <div
                              key={nota.id}
                              onClick={() => {
                                selecionarNotaZettel(nota.id);
                                setVisaoAtiva('acervo');
                              }}
                              className={`px-2 py-1 rounded hover:bg-stone-800 cursor-pointer truncate flex items-center gap-1.5 ${
                                isSel ? 'bg-emerald-950/60 text-emerald-300 font-bold' : 'text-stone-400'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate">{nota.titulo}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 04 - DIÁRIO INTELECTUAL (INBOX 48H) */}
                  <div>
                    <div
                      onClick={() => {
                        togglePasta('04 - DIÁRIO INTELECTUAL');
                        setVisaoAtiva('inbox');
                      }}
                      className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-800/60 cursor-pointer text-amber-400 hover:text-amber-300 font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        {pastasAbertas['04 - DIÁRIO INTELECTUAL'] ? (
                          <ChevronDown className="w-3 h-3 text-amber-500" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-amber-500" />
                        )}
                        <span>04 - DIÁRIO INTELECTUAL</span>
                      </div>
                      {notasTemporarias.filter((t) => !t.processada).length > 0 && (
                        <span className="text-[10px] px-1.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700">
                          {notasTemporarias.filter((t) => !t.processada).length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* MODELO (TEMPLATES) */}
                  <div>
                    <div
                      onClick={() => togglePasta('MODELO')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-stone-800/60 cursor-pointer text-stone-400 hover:text-stone-200"
                    >
                      {pastasAbertas.MODELO ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <span>MODELO</span>
                    </div>
                    {pastasAbertas.MODELO && (
                      <div className="pl-4 space-y-0.5 mt-0.5 text-stone-500 text-[11px]">
                        <div
                          onClick={() => {
                            setModalNovoTipo('indice');
                            setModalNovoTitulo('');
                          }}
                          className="hover:text-stone-300 cursor-pointer py-0.5"
                        >
                          Template — Nota Índice
                        </div>
                        <div
                          onClick={() => {
                            setModalNovoTipo('referencia');
                            setModalNovoTitulo('');
                          }}
                          className="hover:text-stone-300 cursor-pointer py-0.5"
                        >
                          Template — Nota de Referência
                        </div>
                        <div
                          onClick={() => {
                            setModalNovoTipo('permanente');
                            setModalNovoTitulo('');
                          }}
                          className="hover:text-stone-300 cursor-pointer py-0.5"
                        >
                          Template — Nota Permanente
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rascunho / Canvas */}
                  <div>
                    <div
                      onClick={() => {
                        togglePasta('Rascunho');
                        setVisaoAtiva('canvas');
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-stone-800/60 cursor-pointer text-stone-400 hover:text-stone-200"
                    >
                      {pastasAbertas.Rascunho ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <span>Rascunho / Canvas</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            COLUNA DA DIREITA: ÁREA DO DOCUMENTO OBSIDIAN
            (Como em image.png e image_4.png)
           ------------------------------------------------------------- */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-between overflow-y-auto">
          {visaoAtiva === 'inbox' ? (
            /* SEÇÃO CAIXA DE ENTRADA 48H */
            <div className="p-6 sm:p-8 space-y-6">
              <div className="border-b border-stone-800 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  04 - DIÁRIO INTELECTUAL
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  Caixa de Entrada & Captura Rápida (&le; 48 Horas)
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Capture reflexões durante a leitura sem atrito. Processe em até 48h em notas permanentes e descarte.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Form de Captura */}
                <form onSubmit={handleSalvarCaptura} className="p-5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-stone-200 uppercase">Novo Registro Rápido</div>
                  <textarea
                    rows={4}
                    value={inboxPensamento}
                    onChange={(e) => setInboxPensamento(e.target.value)}
                    placeholder="Pensamento ou síntese da página..."
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={inboxLivroId}
                      onChange={(e) => setInboxLivroId(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-200"
                    >
                      <option value="">Fonte Externa...</option>
                      {livros.map((l) => (
                        <option key={l.id} value={l.id}>
                          #{l.id} {l.titulo}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={inboxPagina}
                      onChange={(e) => setInboxPagina(e.target.value)}
                      placeholder="Pág. (Ex: 84)"
                      className="w-full p-2 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-200"
                    />
                  </div>
                  {inboxLivroId === '' && (
                    <input
                      type="text"
                      value={inboxFonteTexto}
                      onChange={(e) => setInboxFonteTexto(e.target.value)}
                      placeholder="Nome da Fonte ou Livro..."
                      className="w-full p-2 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-200"
                    />
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Capturar Pensamento
                  </button>
                </form>

                {/* Lista de Temporárias */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-stone-400 uppercase">Notas na Fila</div>
                  {notasTemporarias.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        t.processada
                          ? 'bg-stone-900/40 border-stone-800/50 opacity-50'
                          : 'bg-stone-900 border-stone-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span>{t.fonte} {t.pagina ? `· p. ${t.pagina}` : ''}</span>
                        {!t.processada && (
                          <span className="text-amber-400 font-bold">&le; 48h</span>
                        )}
                      </div>
                      <p className="text-stone-200 italic font-serif">"{t.pensamento}"</p>
                      {!t.processada ? (
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleConverterEmPermanente(t)}
                            className="text-emerald-400 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Sintetizar em Permanente</span>
                          </button>
                          <button
                            onClick={() => removerNotaTemporaria(t.id)}
                            className="text-stone-500 hover:text-rose-400 cursor-pointer"
                            title="Descartar (Lixo)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Processada</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : visaoAtiva === 'canvas' ? (
            /* SEÇÃO CANVAS / ROTEIRO */
            <div className="p-6 sm:p-8 space-y-5">
              <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    Mesa de Articulação / Canvas
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-white mt-1">
                    {canvasZettel[0]?.titulo || 'Mesa de Articulação Conceitual'}
                  </h2>
                </div>
                <button
                  onClick={() => setVisaoAtiva('acervo')}
                  className="text-xs text-stone-400 hover:text-stone-200 underline"
                >
                  Voltar ao Leitor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/60 space-y-2">
                  <div className="text-xs font-bold text-sky-300 uppercase">1. Fontes Fichadas</div>
                  <div className="p-2.5 rounded bg-stone-900 border border-sky-900 text-xs">
                    <div className="font-bold text-stone-100">100 anos de solidão</div>
                    <div className="text-[11px] text-stone-400">Gabriel García Márquez</div>
                  </div>
                  <div className="p-2.5 rounded bg-stone-900 border border-sky-900 text-xs">
                    <div className="font-bold text-stone-100">O estrangeiro</div>
                    <div className="text-[11px] text-stone-400">Albert Camus</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-2">
                  <div className="text-xs font-bold text-emerald-300 uppercase">2. Ideias Conectadas</div>
                  <div className="p-2.5 rounded bg-stone-900 border border-emerald-900 text-xs">
                    <div className="font-bold text-emerald-300">Tempo circular como prisão</div>
                    <div className="text-[11px] text-stone-400">Repetição mecânica dos erros.</div>
                  </div>
                  <div className="p-2.5 rounded bg-stone-900 border border-emerald-900 text-xs">
                    <div className="font-bold text-emerald-300">O absurdo como experiência</div>
                    <div className="text-[11px] text-stone-400">A ausência de sentido e a consciência.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-2">
                  <div className="text-xs font-bold text-amber-300 uppercase">3. Tese Emergente</div>
                  <p className="text-xs text-stone-300 font-serif leading-relaxed">
                    "A ruptura lúcida do absurdo camusiano é a única vacina contra a amnésia trágica de Macondo."
                  </p>
                </div>
              </div>
            </div>
          ) : notaAtiva ? (
            /* =============================================================
               DOCUMENTO PRINCIPAL OBSIDIAN (EXATO DE image.png e image_4.png)
               ============================================================= */
            <div className="p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
              {/* Breadcrumb idêntico ao de image.png: Biblioteca / 02 - REFERÊNCIAS / 1 - ... */}
              <div className="text-[11px] font-sans text-stone-400 flex items-center gap-1.5 overflow-x-auto pb-1">
                <span>Biblioteca</span>
                <span>/</span>
                <span className="uppercase">{notaAtiva.pasta}</span>
                <span>/</span>
                <span className="text-stone-200 font-medium truncate">{notaAtiva.titulo}</span>
              </div>

              {/* Título Principal em Destaque */}
              <div>
                {modoEdicao ? (
                  <input
                    type="text"
                    value={tituloEditando}
                    onChange={(e) => setTituloEditando(e.target.value)}
                    className="w-full text-xl sm:text-2xl font-bold p-2 rounded-lg bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug font-sans">
                    {notaAtiva.titulo}
                  </h1>
                )}
              </div>

              {/* Caixa de "Propriedades" idêntica à de image.png */}
              <div className="border border-stone-800 bg-[#16171b]/80 rounded-xl p-3.5 space-y-2 font-sans text-xs">
                <div
                  onClick={() => setPropriedadesAberta((prev) => !prev)}
                  className="flex items-center justify-between text-stone-400 cursor-pointer font-medium hover:text-stone-200"
                >
                  <div className="flex items-center gap-1.5">
                    {propriedadesAberta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span>Propriedades</span>
                  </div>
                </div>

                {propriedadesAberta && (
                  <div className="pt-2 space-y-2 text-stone-300">
                    {/* Linha ID */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="w-24 text-stone-500 flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-stone-400">≡</span>
                        <span>ID</span>
                      </div>
                      <div className="font-mono text-stone-300">{notaAtiva.id}</div>
                    </div>

                    {/* Linha Tags */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="w-24 text-stone-500 flex items-center gap-1.5 shrink-0">
                        <Tag className="w-3 h-3 text-stone-400" />
                        <span>tags</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {notaAtiva.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full text-[11px] bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1"
                          >
                            <span>{t}</span>
                            <span className="text-stone-500 hover:text-stone-300 cursor-pointer text-[10px]">×</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Linha Tema */}
                    {notaAtiva.tema && (
                      <div className="flex items-center gap-4 text-xs">
                        <div className="w-24 text-stone-500 flex items-center gap-1.5 shrink-0">
                          <Folder className="w-3 h-3 text-stone-400" />
                          <span>Tema</span>
                        </div>
                        <button
                          onClick={() => handleClicarWikilink(notaAtiva.tema || '')}
                          className="font-semibold text-stone-200 underline hover:text-amber-300 cursor-pointer"
                        >
                          {notaAtiva.tema.replace(/\[\[|\]\]/g, '')}
                        </button>
                      </div>
                    )}

                    {/* Linha Referência (se permanente) */}
                    {notaAtiva.referencia && (
                      <div className="flex items-center gap-4 text-xs">
                        <div className="w-24 text-stone-500 flex items-center gap-1.5 shrink-0">
                          <BookOpen className="w-3 h-3 text-stone-400" />
                          <span>Referência</span>
                        </div>
                        <button
                          onClick={() => handleClicarWikilink(notaAtiva.referencia || '')}
                          className="font-semibold text-sky-400 underline hover:text-sky-300 cursor-pointer truncate max-w-md"
                        >
                          {notaAtiva.referencia.replace(/\[\[|\]\]/g, '')}
                        </button>
                      </div>
                    )}

                    {/* Linha Relação Afim */}
                    {notaAtiva.relacao && (
                      <div className="flex items-center gap-4 text-xs">
                        <div className="w-24 text-stone-500 flex items-center gap-1.5 shrink-0">
                          <Lightbulb className="w-3 h-3 text-stone-400" />
                          <span>Relação</span>
                        </div>
                        <button
                          onClick={() => handleClicarWikilink(notaAtiva.relacao || '')}
                          className="font-semibold text-emerald-400 underline hover:text-emerald-300 cursor-pointer truncate max-w-md"
                        >
                          {notaAtiva.relacao.replace(/\[\[|\]\]/g, '')}
                        </button>
                      </div>
                    )}

                    {/* Adicionar propriedade */}
                    <div className="pt-1 text-[11px] text-stone-500 hover:text-stone-300 cursor-pointer flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      <span>Adicionar propriedade</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Conteúdo da Nota (Modo Leitura ou Modo Edição) */}
              <div className="py-2">
                {modoEdicao ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-800 text-xs">
                      <button
                        type="button"
                        onClick={handleInserirMarcaTexto}
                        className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-medium flex items-center gap-1 cursor-pointer"
                        title="Destacar com marca-texto amarelo ==texto=="
                      >
                        <Highlighter className="w-3 h-3" />
                        <span>==Marca-texto==</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInserirTexto('- #síntese p. : ')}
                        className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 text-[11px] cursor-pointer"
                      >
                        + #síntese
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInserirTexto('- #comentário p. : ')}
                        className="px-2 py-1 rounded bg-sky-950 text-sky-300 text-[11px] cursor-pointer"
                      >
                        + #comentário
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInserirTexto('- #citação p. : ""')}
                        className="px-2 py-1 rounded bg-amber-950 text-amber-300 text-[11px] cursor-pointer"
                      >
                        + #citação
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInserirTexto('[[Nota Relacionada]]')}
                        className="px-2 py-1 rounded bg-stone-800 text-stone-200 text-[11px] cursor-pointer"
                      >
                        + [[Wikilink]]
                      </button>
                    </div>

                    <textarea
                      rows={18}
                      value={conteudoEditando}
                      onChange={(e) => setConteudoEditando(e.target.value)}
                      className="w-full p-4 font-mono text-xs sm:text-sm rounded-xl bg-stone-900/90 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setModoEdicao(false)}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:bg-stone-800"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSalvarEdicao}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                ) : (
                  renderizarTextoFormatado(notaAtiva.conteudo)
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-stone-500 text-sm space-y-2">
              <Lightbulb className="w-8 h-8 mx-auto text-stone-600" />
              <div>Selecione uma nota na árvore de diretórios ao lado para visualizar.</div>
            </div>
          )}

          {/* =============================================================
              BARRA DE STATUS INFERIOR DO OBSIDIAN
              (Como em image.png e image_4.png: 0 link inverso | 726 palavras | 4.531 caracteres | Canvas mindmap: 80)
             ============================================================= */}
          <div className="border-t border-stone-800/90 bg-[#121316]/95 px-4 py-2 flex items-center justify-between text-[11px] text-stone-400 font-sans z-10">
            {/* Esquerda: Links inversos */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBacklinksAberto((prev) => !prev)}
                className="hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                title="Exibir Conexões Reversas / Backlinks"
              >
                <LinkIcon className="w-3 h-3 text-amber-500" />
                <span>
                  {backlinks.length} {backlinks.length === 1 ? 'link inverso' : 'links inversos'}
                </span>
              </button>
            </div>

            {/* Direita: Contadores de palavras, caracteres e canvas */}
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>{statsNota.palavras.toLocaleString('pt-BR')} palavras</span>
              <span className="text-stone-600">|</span>
              <span>{statsNota.caracteres.toLocaleString('pt-BR')} caracteres</span>
              <span className="text-stone-600">|</span>
              <span className="flex items-center gap-1 text-stone-300">
                <LayoutGrid className="w-3 h-3 text-purple-400" />
                <span>Canvas mindmap: 80</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GAVETA DE BACKLINKS (QUANDO CLICADO EM 'LINKS INVERSOS')
         ========================================================================= */}
      {backlinksAberto && notaAtiva && (
        <div className="fixed bottom-10 right-4 w-96 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-4 z-40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
              <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Conexões Reversas ({backlinks.length})</span>
            </div>
            <button
              onClick={() => setBacklinksAberto(false)}
              className="text-stone-400 hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {backlinks.length === 0 ? (
            <div className="text-xs text-stone-500 italic py-2">
              Nenhuma outra nota cita [[{notaAtiva.titulo}]] diretamente ainda.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {backlinks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    selecionarNotaZettel(b.id);
                    setBacklinksAberto(false);
                  }}
                  className="p-2 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-xs cursor-pointer text-stone-200 hover:text-amber-300"
                >
                  <div className="font-semibold">{b.titulo}</div>
                  <div className="text-[10px] text-stone-500 truncate">{b.pasta}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL DE PERSONALIZAÇÃO DA IMAGEM DE FUNDO (WALLPAPER CHIAROSCURO)
          (Atende a solicitação explícita do usuário: 'coloque ser possível trocar também o fundo da imagem')
         ========================================================================= */}
      {modalFundoAberto && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18191d] border border-stone-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-stone-200">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-white">
                  Personalizar Imagem de Fundo do Zettelkasten
                </h3>
              </div>
              <button
                onClick={() => setModalFundoAberto(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Galeria de Presets Clássicos / Chiaroscuro */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                Selecione uma Obra Clássica de Fundo:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {PRESETS_WALLPAPERS.map((preset) => {
                  const isSelected = fundoZettelkasten === preset.id || (!fundoZettelkasten && preset.id === 'caravaggio');
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setFundoZettelkasten(preset.id)}
                      className={`relative rounded-xl overflow-hidden border p-2 cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/30 ring-2 ring-amber-500/50'
                          : 'border-stone-800 bg-stone-900/80 hover:border-stone-600'
                      }`}
                    >
                      {preset.url ? (
                        <div
                          className="h-16 w-full rounded-lg bg-cover bg-center mb-1.5 border border-stone-800"
                          style={{ backgroundImage: `url('${preset.url}')` }}
                        />
                      ) : (
                        <div className="h-16 w-full rounded-lg bg-stone-950 mb-1.5 flex items-center justify-center text-[10px] text-stone-500 border border-stone-800">
                          Preto Puro
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-stone-100 truncate">{preset.nome}</div>
                        <div className="text-[10px] text-stone-500 truncate">{preset.autor}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inserir URL personalizada ou Fazer Upload do PC */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                Ou use Imagem Própria (URL ou Arquivo Local):
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFundoUrl}
                  onChange={(e) => setCustomFundoUrl(e.target.value)}
                  placeholder="https://...cole a URL da imagem aqui"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customFundoUrl.trim()) {
                      setFundoZettelkasten(customFundoUrl.trim());
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200"
                >
                  Aplicar URL
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-700 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                  title="Fazer Upload de arquivo de imagem do computador"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImagemFundo}
                  className="hidden"
                />
              </div>
            </div>

            {/* Ajustes de Opacidade e Desfoque */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-stone-800">
              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Opacidade do Fundo</span>
                  <span className="font-mono font-bold text-amber-400">{opacidadeFundoZettelkasten}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  step="1"
                  value={opacidadeFundoZettelkasten}
                  onChange={(e) => setOpacidadeFundoZettelkasten(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[10px] text-stone-500 mt-0.5">Recomendado: 20% - 30%</div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Desfoque (Blur)</span>
                  <span className="font-mono font-bold text-amber-400">{desfoqueFundoZettelkasten}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={desfoqueFundoZettelkasten}
                  onChange={(e) => setDesfoqueFundoZettelkasten(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[10px] text-stone-500 mt-0.5">Recomendado: 0px - 2px</div>
              </div>
            </div>

            {/* Botão Concluir */}
            <div className="pt-3 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setModalFundoAberto(false)}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Concluir e Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAIS DE CRIAÇÃO (PERMANENTE / REFERÊNCIA / ÍNDICE)
         ========================================================================= */}
      {modalNovoTipo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18191d] border border-stone-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white">
                {modalNovoTipo === 'permanente' && 'Nova Nota Permanente (1 Ideia Atômica)'}
                {modalNovoTipo === 'referencia' && 'Nova Nota de Referência (Fonte/Livro)'}
                {modalNovoTipo === 'indice' && 'Nova Nota de Índice (Macrotema)'}
              </h3>
              <button onClick={() => setModalNovoTipo(null)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalNovoTipo === 'permanente' && (
              <form onSubmit={handleCriarPermanenteSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Título Sintético do Conceito
                  </label>
                  <input
                    type="text"
                    value={modalNovoTitulo}
                    onChange={(e) => setModalNovoTitulo(e.target.value)}
                    placeholder="Ex: O absurdo como divórcio entre sentido e o mundo"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Macrotema</label>
                    <select
                      value={modalNovoTemaNum}
                      onChange={(e) => setModalNovoTemaNum(Number(e.target.value))}
                      className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100"
                    >
                      <option value={1}>1 - LITERATURA</option>
                      <option value={2}>2 - HISTÓRIA</option>
                      <option value={3}>3 - PSICOLOGIA</option>
                      <option value={4}>4 - RELIGIÃO</option>
                      <option value={5}>5 - FILOSOFIA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Página</label>
                    <input
                      type="text"
                      value={modalNovoPagina}
                      onChange={(e) => setModalNovoPagina(e.target.value)}
                      placeholder="Ex: 84"
                      className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Referência (Fonte)</label>
                  <input
                    type="text"
                    value={modalNovoRef}
                    onChange={(e) => setModalNovoRef(e.target.value)}
                    placeholder="Ex: [[1 - 261220251138 - O estrangeiro]]"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Relação Afim</label>
                  <input
                    type="text"
                    value={modalNovoRelacao}
                    onChange={(e) => setModalNovoRelacao(e.target.value)}
                    placeholder="Ex: [[Outra Nota Permanente]]"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovoTipo(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-stone-400 hover:bg-stone-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white"
                  >
                    Criar Nota Permanente
                  </button>
                </div>
              </form>
            )}

            {modalNovoTipo === 'referencia' && (
              <form onSubmit={handleCriarReferenciaSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Fichar Livro da Estante (1 Clique)
                  </label>
                  <select
                    value={modalNovoLivroId}
                    onChange={(e) => setModalNovoLivroId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100"
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
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Título da Fonte Externa
                    </label>
                    <input
                      type="text"
                      value={modalNovoTitulo}
                      onChange={(e) => setModalNovoTitulo(e.target.value)}
                      placeholder="Ex: Crime e Castigo ou Ensaio sobre a Cegueira"
                      className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100"
                      required
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovoTipo(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-stone-400 hover:bg-stone-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-600 text-white"
                  >
                    Criar Nota de Referência
                  </button>
                </div>
              </form>
            )}

            {modalNovoTipo === 'indice' && (
              <form onSubmit={handleCriarIndiceSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Nome do Macrotema / Índice
                  </label>
                  <input
                    type="text"
                    value={modalNovoTitulo}
                    onChange={(e) => setModalNovoTitulo(e.target.value)}
                    placeholder="Ex: 6 - SOCIOLOGIA ou 7 - POLÍTICA"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-950 border border-stone-800 text-stone-100"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovoTipo(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-stone-400 hover:bg-stone-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white"
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
