import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  NotaZettel,
  NotaTemporaria,
  TipoRelacaoDialetica
} from '../types';
import { useBibliotecaStore } from '../store/useBibliotecaStore';
import { getStoredSupabaseConfig } from '../lib/supabase';
import { DrawerNovaPermanente } from './DrawerNovaPermanente';
import { MenuFlutuanteSelecao } from './MenuFlutuanteSelecao';
import { CaixaEntradaInbox } from './zettelkasten/CaixaEntradaInbox';
import { DiarioCadernoReal } from './diario/DiarioCadernoReal';
import {
  Folder,
  Search,
  Link as LinkIcon,
  BookOpen,
  BookMarked,
  Inbox,
  Trash2,
  Edit3,
  LayoutGrid,
  Lightbulb,
  X,
  Copy,
  Check,
  Tag,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Highlighter,
  FileText,
  FolderPlus,
  FilePlus,
  Upload,
  Book,
  PanelLeftClose,
  PanelLeft,
  Compass,
  Cloud,
  CloudOff,
  RefreshCw,
  Database,
  Plus,
  Columns,
  Quote,
  Sparkles,
  Bold,
  Italic
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
    autor: 'Galeria Clássica'
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
    autor: 'Afresco Renascentista'
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
    nome: 'Puro / Sem Imagem',
    descricao: 'Superfície limpa e neutra que acompanha o tema da biblioteca',
    url: '',
    autor: 'Minimalismo Clássico'
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
    supabaseStatus,
    supabaseMensagem,
    adicionarNotaZettel,
    atualizarNotaZettel,
    removerNotaZettel,
    selecionarNotaZettel,
    setFundoZettelkasten,
    setOpacidadeFundoZettelkasten,
    setDesfoqueFundoZettelkasten,
    marcarNotaTemporariaProcessada,
    criarNotaReferenciaDeLivro,
    criarNotaPermanenteRapida,
    exportarZettelkastenMarkdown,
    sincronizarSupabase,
    conectarSupabase,
    desconectarSupabase,
    limparMockupsZettelkasten
  } = useBibliotecaStore();

  // Estados de layout e visão
  const [visaoAtiva, setVisaoAtiva] = useState<'acervo' | 'inbox' | 'diario' | 'canvas'>('acervo');
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [busca, setBusca] = useState('');
  const [propriedadesAberta, setPropriedadesAberta] = useState(true);
  const [backlinksAberto, setBacklinksAberto] = useState(false);

  // Estados de expansão de pastas na Árvore do Obsidian
  const [pastasAbertas, setPastasAbertas] = useState<Record<string, boolean>>({
    biblioteca: true,
    '00 - INÍCIO': false,
    '01 - ÍNDICE': true,
    '02 - REFERÊNCIAS': true,
    '03 - PERMANENTES': true,
    '04 - CAIXA DE ENTRADA': false,
    '05 - DIÁRIO INTELECTUAL': false,
    MODELO: false,
    Rascunho: false
  });

  // Modo de edição de conteúdo e título
  const [modoEdicao, setModoEdicao] = useState(false);
  const [conteudoEditando, setConteudoEditando] = useState('');
  const [tituloEditando, setTituloEditando] = useState('');
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Edição direta de propriedades (Frontmatter)
  const [editandoPropriedades, setEditandoPropriedades] = useState(false);
  const [propTema, setPropTema] = useState('');
  const [propRef, setPropRef] = useState('');
  const [propRelacao, setPropRelacao] = useState('');
  const [propPagina, setPropPagina] = useState('');
  const [propTagsStr, setPropTagsStr] = useState('');

  // Modal de Personalização de Fundo / Wallpaper
  const [modalFundoAberto, setModalFundoAberto] = useState(false);
  const [customFundoUrl, setCustomFundoUrl] = useState('');

  // Modal de Conexão com o Supabase
  const [modalSupabaseAberto, setModalSupabaseAberto] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [supabaseTestando, setSupabaseTestando] = useState(false);
  const [supabaseFeedback, setSupabaseFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [abaSupabase, setAbaSupabase] = useState<'conexao' | 'sql'>('conexao');
  const [sqlCopiado, setSqlCopiado] = useState(false);

  // Drawer Não-Bloqueante de Criação Rápida (Permanente, Referência, Índice)
  const [drawerNovoAberto, setDrawerNovoAberto] = useState(false);
  const [drawerNovoTipo, setDrawerNovoTipo] = useState<'permanente' | 'referencia' | 'indice'>('permanente');
  const [drawerNovoRef, setDrawerNovoRef] = useState('');
  const [drawerNovoPagina, setDrawerNovoPagina] = useState('');
  const [drawerNovoCitacao, setDrawerNovoCitacao] = useState('');

  // Modo Split View (Lado a Lado para Monitores Grandes)
  const [splitViewAtivo, setSplitViewAtivo] = useState(true);
  const [notaSecundariaId, setNotaSecundariaId] = useState<string | null>(null);
  const [modoEdicaoSecundaria, setModoEdicaoSecundaria] = useState(false);
  const [conteudoSecundariaEditando, setConteudoSecundariaEditando] = useState('');
  const [tituloSecundariaEditando, setTituloSecundariaEditando] = useState('');
  const [salvoFeedbackSecundaria, setSalvoFeedbackSecundaria] = useState(false);

  // Menu Flutuante Contextual de Seleção de Texto (Marca-texto, Citação, Criar Permanente)
  const [menuFlutuantePos, setMenuFlutuantePos] = useState<{ x: number; y: number } | null>(null);
  const [textoSelecionado, setTextoSelecionado] = useState('');

  // Refs de Textarea para Formatação Inteligente
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaSecundariaRef = useRef<HTMLTextAreaElement>(null);

  // Modal rápido de conectar com outra permanente
  const [modalConectarAberto, setModalConectarAberto] = useState(false);
  const [notaConectarId, setNotaConectarId] = useState('');

  const [copiadoNotif, setCopiadoNotif] = useState(false);
  const [linkCopiadoNotif, setLinkCopiadoNotif] = useState(false);

  // Ref do upload de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronização automática com Supabase ao carregar a visão
  useEffect(() => {
    sincronizarSupabase();
  }, []);

  // Carregar credenciais salvas ao abrir o modal do Supabase
  useEffect(() => {
    if (modalSupabaseAberto) {
      const cfg = getStoredSupabaseConfig();
      setSupabaseUrlInput(cfg.url);
      setSupabaseKeyInput(cfg.anonKey);
      setSupabaseFeedback(null);
    }
  }, [modalSupabaseAberto]);

  // URL ativa do Wallpaper selecionado
  const urlFundoAtivo = useMemo(() => {
    if (!fundoZettelkasten || fundoZettelkasten === 'solido') return '';
    const preset = PRESETS_WALLPAPERS.find((p) => p.id === fundoZettelkasten);
    if (preset) return preset.url;
    return fundoZettelkasten;
  }, [fundoZettelkasten]);

  // Nota ativa selecionada (prioriza a nota selecionada ou a primeira disponível no cofre)
  const notaAtiva = useMemo(() => {
    if (notaZettelSelecionadaId) {
      const encontrada = notasZettel.find((n) => n.id === notaZettelSelecionadaId);
      if (encontrada) return encontrada;
    }
    // Se não houver seleção, abre a primeira permanente ou primeira referência ou primeiro índice
    const perm = notasZettel.find((n) => n.tipo === 'permanente');
    if (perm) return perm;
    const ref = notasZettel.find((n) => n.tipo === 'referencia');
    if (ref) return ref;
    return notasZettel[0] || null;
  }, [notasZettel, notaZettelSelecionadaId]);

  // Sincroniza estado de edição ao mudar a nota ativa
  useEffect(() => {
    if (notaAtiva) {
      setConteudoEditando(notaAtiva.conteudo);
      setTituloEditando(notaAtiva.titulo);
      setPropTema(notaAtiva.tema ? notaAtiva.tema.replace(/\[\[|\]\]/g, '') : '');
      setPropRef(notaAtiva.referencia ? notaAtiva.referencia.replace(/\[\[|\]\]/g, '') : '');
      setPropRelacao(notaAtiva.relacao ? notaAtiva.relacao.replace(/\[\[|\]\]/g, '') : '');
      setPropPagina(notaAtiva.pagina ? String(notaAtiva.pagina) : '');
      setPropTagsStr((notaAtiva.tags || []).join(', '));
      setModoEdicao(false);
      setEditandoPropriedades(false);
    }
  }, [notaAtiva?.id]);

  // Nota secundária no painel direito do Split View (Lado a Lado)
  const notaSecundaria = useMemo(() => {
    if (notaSecundariaId) {
      const encontrada = notasZettel.find((n) => n.id === notaSecundariaId);
      if (encontrada && encontrada.id !== notaAtiva?.id) return encontrada;
    }
    // Se a nota ativa for referência, busca permanente filha dela
    if (notaAtiva && notaAtiva.tipo === 'referencia') {
      const permFilha = notasZettel.find(
        (n) => n.tipo === 'permanente' && n.referencia && n.referencia.includes(notaAtiva.titulo)
      );
      if (permFilha && permFilha.id !== notaAtiva.id) return permFilha;
    }
    // Procura primeira permanente diferente da nota ativa
    const outraPerm = notasZettel.find((n) => n.tipo === 'permanente' && n.id !== notaAtiva?.id);
    if (outraPerm) return outraPerm;
    // Se não houver permanente, qualquer outra nota diferente da ativa
    const outraQualquer = notasZettel.find((n) => n.id !== notaAtiva?.id);
    return outraQualquer || null;
  }, [notasZettel, notaSecundariaId, notaAtiva?.id, notaAtiva?.titulo]);

  // Sincroniza estado de edição da nota secundária
  useEffect(() => {
    if (notaSecundaria) {
      setConteudoSecundariaEditando(notaSecundaria.conteudo);
      setTituloSecundariaEditando(notaSecundaria.titulo);
      setModoEdicaoSecundaria(false);
    }
  }, [notaSecundaria?.id]);

  // Alternar pasta aberta na árvore
  const togglePasta = (pasta: string) => {
    setPastasAbertas((prev) => ({ ...prev, [pasta]: !prev[pasta] }));
  };

  // Separar notas por pasta
  const notasPorPasta = useMemo(() => {
    const q = busca.toLowerCase().trim();
    const filtrar = (lista: NotaZettel[]) => {
      if (!q) return lista;
      return lista.filter(
        (n) =>
          n.titulo.toLowerCase().includes(q) ||
          n.conteudo.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    };

    const indices = filtrar(notasZettel.filter((n) => n.tipo === 'indice' || n.pasta === '01 índice'));
    const referencias = filtrar(notasZettel.filter((n) => n.tipo === 'referencia' || n.pasta === '02 referências'));
    const permanentes = filtrar(notasZettel.filter((n) => n.tipo === 'permanente' || n.pasta === '03 permanentes'));
    return { indices, referencias, permanentes };
  }, [notasZettel, busca]);

  // Listas de apoio para selects
  const todasReferencias = useMemo(() => {
    return notasZettel.filter((n) => n.tipo === 'referencia');
  }, [notasZettel]);

  const todasPermanentes = useMemo(() => {
    return notasZettel.filter((n) => n.tipo === 'permanente');
  }, [notasZettel]);

  const todosIndices = useMemo(() => {
    return notasZettel.filter((n) => n.tipo === 'indice');
  }, [notasZettel]);

  // Backlinks (Conexões Reversas)
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

  // Estatísticas de palavras e caracteres da nota ativa
  const statsNota = useMemo(() => {
    if (!notaAtiva) return { palavras: 0, caracteres: 0 };
    const textoLimpo = notaAtiva.conteudo.replace(/[#*`_\[\]==]/g, '');
    const palavras = textoLimpo.trim().split(/\s+/).filter(Boolean).length;
    const caracteres = textoLimpo.length;
    return { palavras, caracteres };
  }, [notaAtiva]);

  // Salvar edição de texto
  const handleSalvarEdicao = () => {
    if (!notaAtiva) return;
    atualizarNotaZettel(notaAtiva.id, {
      titulo: tituloEditando.trim() || notaAtiva.titulo,
      conteudo: conteudoEditando
    });
    setModoEdicao(false);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2000);
  };

  // Salvar propriedades editadas
  const handleSalvarPropriedades = () => {
    if (!notaAtiva) return;
    const tagsArray = propTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    atualizarNotaZettel(notaAtiva.id, {
      tema: propTema.trim() ? `[[${propTema.trim()}]]` : undefined,
      referencia: propRef.trim() ? `[[${propRef.trim()}]]` : undefined,
      relacao: propRelacao.trim() ? `[[${propRelacao.trim()}]]` : undefined,
      pagina: propPagina.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : notaAtiva.tags
    });
    setEditandoPropriedades(false);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2000);
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

  // Formatação inteligente que opera sobre a seleção do cursor no editor
  const aplicarFormatacaoNoEditor = (
    tipo: 'marcatexto' | 'sintese' | 'comentario' | 'citacao' | 'wikilink' | 'negrito' | 'italico',
    secundario = false
  ) => {
    const textarea = secundario ? textareaSecundariaRef.current : textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = secundario ? conteudoSecundariaEditando : conteudoEditando;
    const selectedText = val.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (tipo) {
      case 'marcatexto':
        if (selectedText) {
          replacement = `==${selectedText}==`;
          cursorOffset = replacement.length;
        } else {
          replacement = `==trecho destacado==`;
          cursorOffset = replacement.length;
        }
        break;
      case 'citacao':
        if (selectedText) {
          replacement = `\n- #citação p. : "${selectedText}"\n`;
        } else {
          replacement = `\n- #citação p. : ""\n`;
        }
        cursorOffset = replacement.length;
        break;
      case 'sintese':
        if (selectedText) {
          replacement = `\n- #síntese: ${selectedText}\n`;
        } else {
          replacement = `\n- #síntese: \n`;
        }
        cursorOffset = replacement.length;
        break;
      case 'comentario':
        if (selectedText) {
          replacement = `\n- #comentário: ${selectedText}\n`;
        } else {
          replacement = `\n- #comentário: \n`;
        }
        cursorOffset = replacement.length;
        break;
      case 'wikilink':
        if (selectedText) {
          replacement = `[[${selectedText}]]`;
        } else {
          replacement = `[[Nova Conexão]]`;
        }
        cursorOffset = replacement.length;
        break;
      case 'negrito':
        if (selectedText) {
          replacement = `**${selectedText}**`;
        } else {
          replacement = `**negrito**`;
        }
        cursorOffset = replacement.length;
        break;
      case 'italico':
        if (selectedText) {
          replacement = `*${selectedText}*`;
        } else {
          replacement = `*itálico*`;
        }
        cursorOffset = replacement.length;
        break;
    }

    const novoConteudo = val.substring(0, start) + replacement + val.substring(end);
    if (secundario) {
      setConteudoSecundariaEditando(novoConteudo);
    } else {
      setConteudoEditando(novoConteudo);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  // Atalhos de teclado no editor (Ctrl+H, Ctrl+Q, Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+Enter)
  const handleKeyDownTextarea = (e: React.KeyboardEvent<HTMLTextAreaElement>, secundario = false) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        aplicarFormatacaoNoEditor('marcatexto', secundario);
      } else if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        aplicarFormatacaoNoEditor('citacao', secundario);
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        aplicarFormatacaoNoEditor('negrito', secundario);
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        aplicarFormatacaoNoEditor('italico', secundario);
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        aplicarFormatacaoNoEditor('wikilink', secundario);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (secundario) {
          handleSalvarEdicaoSecundaria();
        } else {
          handleSalvarEdicao();
        }
      }
    }
  };

  // Salvar edição no painel secundário
  const handleSalvarEdicaoSecundaria = () => {
    if (!notaSecundaria) return;
    atualizarNotaZettel(notaSecundaria.id, {
      titulo: tituloSecundariaEditando.trim() || notaSecundaria.titulo,
      conteudo: conteudoSecundariaEditando
    });
    setModoEdicaoSecundaria(false);
    setSalvoFeedbackSecundaria(true);
    setTimeout(() => setSalvoFeedbackSecundaria(false), 2000);
  };

  // Captura de seleção de texto para menu contextual flutuante
  const handleMouseUpSelecao = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setMenuFlutuantePos(null);
        setTextoSelecionado('');
        return;
      }
      const texto = sel.toString().trim();
      if (texto.length < 2) {
        setMenuFlutuantePos(null);
        setTextoSelecionado('');
        return;
      }

      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMenuFlutuantePos({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
        setTextoSelecionado(texto);
      } catch {
        // Ignora erro de seleção
      }
    }, 10);
  };

  // Destacar trecho selecionado com marca-texto amarelo
  const handleDestacarSelecao = () => {
    if (!textoSelecionado || !notaAtiva) return;
    if (modoEdicao && textareaRef.current) {
      aplicarFormatacaoNoEditor('marcatexto', false);
      setMenuFlutuantePos(null);
      return;
    }
    const conteudoAtual = notaAtiva.conteudo;
    if (conteudoAtual.includes(textoSelecionado)) {
      const novoConteudo = conteudoAtual.replace(textoSelecionado, `==${textoSelecionado}==`);
      atualizarNotaZettel(notaAtiva.id, { conteudo: novoConteudo });
      setSalvoFeedback(true);
      setTimeout(() => setSalvoFeedback(false), 2000);
    }
    setMenuFlutuantePos(null);
    window.getSelection()?.removeAllRanges();
  };

  // Formatar trecho selecionado como citação
  const handleCitarSelecao = () => {
    if (!textoSelecionado || !notaAtiva) return;
    if (modoEdicao && textareaRef.current) {
      aplicarFormatacaoNoEditor('citacao', false);
      setMenuFlutuantePos(null);
      return;
    }
    const pag = notaAtiva.pagina ? ` p. ${notaAtiva.pagina}` : '';
    const novaLinhaCitacao = `\n- #citação${pag}: "${textoSelecionado}"\n`;
    const novoConteudo = notaAtiva.conteudo + novaLinhaCitacao;
    atualizarNotaZettel(notaAtiva.id, { conteudo: novoConteudo });
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2000);
    setMenuFlutuantePos(null);
    window.getSelection()?.removeAllRanges();
  };

  // Extrair trecho selecionado diretamente para uma nova Nota Permanente
  const handleExtrairSelecaoParaPermanente = () => {
    if (!textoSelecionado || !notaAtiva) return;
    abrirCriadorPermanente({
      citacao: textoSelecionado,
      ref: notaAtiva.titulo,
      pagina: notaAtiva.pagina ? String(notaAtiva.pagina) : ''
    });
    setMenuFlutuantePos(null);
    window.getSelection()?.removeAllRanges();
  };

  // Copiar trecho com fonte
  const handleCopiarSelecao = () => {
    if (!textoSelecionado || !notaAtiva) return;
    const textoCopiar = `"${textoSelecionado}"\n— [[${notaAtiva.titulo}]]${notaAtiva.pagina ? `, p. ${notaAtiva.pagina}` : ''}`;
    navigator.clipboard.writeText(textoCopiar).then(() => {
      setLinkCopiadoNotif(true);
      setTimeout(() => setLinkCopiadoNotif(false), 2000);
    });
    setMenuFlutuantePos(null);
  };

  // Abrir Drawer não-bloqueante
  const abrirCriadorPermanente = (opts?: {
    tipo?: 'permanente' | 'referencia' | 'indice';
    ref?: string;
    pagina?: string;
    citacao?: string;
  }) => {
    setDrawerNovoTipo(opts?.tipo || 'permanente');
    setDrawerNovoRef(opts?.ref !== undefined ? opts.ref : (notaAtiva?.tipo === 'referencia' ? notaAtiva.titulo : ''));
    setDrawerNovoPagina(opts?.pagina || (notaAtiva?.pagina ? String(notaAtiva.pagina) : ''));
    setDrawerNovoCitacao(opts?.citacao || '');
    setDrawerNovoAberto(true);
  };

  // Salvar nota permanente criada pelo drawer
  const handleSalvarNovaPermanente = (dados: {
    numTema: number;
    titulo: string;
    referencia: string;
    pagina?: string;
    relacao?: string;
    tipoRelacao?: TipoRelacaoDialetica;
    justificativaRelacao?: string;
    citacaoOriginal?: string;
    conteudoInicial?: string;
  }) => {
    const nova = criarNotaPermanenteRapida(
      dados.numTema,
      dados.titulo,
      dados.referencia,
      dados.pagina,
      dados.relacao,
      dados.conteudoInicial,
      dados.tipoRelacao,
      dados.citacaoOriginal,
      dados.justificativaRelacao
    );

    // Se estiver em split view, abre a nova permanente no painel direito
    if (splitViewAtivo) {
      setNotaSecundariaId(nova.id);
    } else {
      selecionarNotaZettel(nova.id);
    }
    setVisaoAtiva('acervo');
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2500);
  };

  // Salvar referência criada pelo drawer
  const handleCriarReferenciaDrawer = (dados: { livroId?: number; titulo?: string; temaNum: number }) => {
    if (dados.livroId !== undefined) {
      const nova = criarNotaReferenciaDeLivro(dados.livroId);
      setVisaoAtiva('acervo');
      selecionarNotaZettel(nova.id);
      return;
    }

    if (!dados.titulo) return;
    const agora = new Date();
    const stamp =
      agora.getFullYear().toString() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0');

    const temaNome =
      dados.temaNum === 1
        ? '1 - LITERATURA'
        : dados.temaNum === 2
        ? '2 - HISTÓRIA'
        : dados.temaNum === 3
        ? '3 - PSICOLOGIA'
        : dados.temaNum === 4
        ? '4 - RELIGIÃO'
        : '5 - FILOSOFIA';
    const tituloFinal = `${dados.temaNum} - ${stamp} - ${dados.titulo.trim()}`;

    const novaNota: NotaZettel = {
      id: stamp,
      titulo: tituloFinal,
      tipo: 'referencia',
      pasta: '02 referências',
      tags: ['nota de referência'],
      tema: `[[${temaNome}]]`,
      conteudo: `## REFERÊNCIAS\n${dados.titulo.trim()}.\n\n## RELEVÂNCIAS\nFonte de estudo pessoal no acervo.\n\n## NOTAS RELACIONADAS\n- \n\n## RESUMO\n\n\n## CITAÇÕES E COMENTÁRIOS\n- #síntese p. 1: `,
      dataCriacao: agora.toISOString(),
      dataAtualizacao: agora.toISOString()
    };

    adicionarNotaZettel(novaNota);
    setVisaoAtiva('acervo');
    selecionarNotaZettel(novaNota.id);
  };

  // Salvar índice criado pelo drawer
  const handleCriarIndiceDrawer = (dados: { titulo: string }) => {
    const agora = new Date();
    const stamp =
      agora.getFullYear().toString() +
      String(agora.getMonth() + 1).padStart(2, '0') +
      String(agora.getDate()).padStart(2, '0') +
      String(agora.getHours()).padStart(2, '0') +
      String(agora.getMinutes()).padStart(2, '0');

    const novaNota: NotaZettel = {
      id: stamp,
      titulo: dados.titulo.trim(),
      tipo: 'indice',
      pasta: '01 índice',
      tags: ['nota índice'],
      conteudo: `# Referências\n- \n\n# Notas Relacionadas\n- `,
      dataCriacao: agora.toISOString(),
      dataAtualizacao: agora.toISOString()
    };

    adicionarNotaZettel(novaNota);
    setVisaoAtiva('acervo');
    selecionarNotaZettel(novaNota.id);
  };

  // Clicar em Wikilink
  const handleClicarWikilink = (linkTexto: string) => {
    const limpo = linkTexto.replace(/\[\[|\]\]/g, '').trim();
    const notaAlvo = notasZettel.find(
      (n) => n.titulo.toLowerCase() === limpo.toLowerCase() || n.titulo.toLowerCase().includes(limpo.toLowerCase())
    );
    if (notaAlvo) {
      if (splitViewAtivo && notaAlvo.tipo === 'permanente') {
        setNotaSecundariaId(notaAlvo.id);
      } else {
        selecionarNotaZettel(notaAlvo.id);
      }
      setVisaoAtiva('acervo');
      return;
    }
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

  // Converter temporária em permanente
  const handleConverterEmPermanente = (temp: NotaTemporaria) => {
    abrirCriadorPermanente({
      citacao: temp.pensamento,
      pagina: temp.pagina ? String(temp.pagina) : '',
      ref: temp.fonte
    });
    marcarNotaTemporariaProcessada(temp.id);
  };

  // Iniciar criação de permanente a partir da referência ativa
  const handleCriarPermanenteDeReferenciaAtiva = () => {
    if (!notaAtiva) return;
    abrirCriadorPermanente({
      ref: notaAtiva.titulo,
      pagina: notaAtiva.pagina ? String(notaAtiva.pagina) : ''
    });
  };

  // Conectar com outra nota permanente existente
  const handleSalvarConexaoPermanente = () => {
    if (!notaAtiva || !notaConectarId) return;
    const outra = notasZettel.find((n) => n.id === notaConectarId);
    if (!outra) return;

    atualizarNotaZettel(notaAtiva.id, {
      relacao: `[[${outra.titulo}]]`
    });

    // Se a outra nota não tiver relação, adiciona de volta para link bidirecional
    if (!outra.relacao) {
      atualizarNotaZettel(outra.id, {
        relacao: `[[${notaAtiva.titulo}]]`
      });
    }

    setModalConectarAberto(false);
    setNotaConectarId('');
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2000);
  };

  // Testar e conectar Supabase
  const handleConectarSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseTestando(true);
    setSupabaseFeedback(null);
    const resultado = await conectarSupabase(supabaseUrlInput, supabaseKeyInput);
    setSupabaseTestando(false);
    setSupabaseFeedback({ ok: resultado.ok, msg: resultado.mensagem });
  };

  // Exportar markdown
  const handleCopiarExportacao = () => {
    const md = exportarZettelkastenMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      setCopiadoNotif(true);
      setTimeout(() => setCopiadoNotif(false), 2500);
    });
  };

  // Copiar script SQL
  const handleCopiarSQL = () => {
    const sql = `-- Script do Supabase para Zettelkasten
CREATE TABLE IF NOT EXISTS public.notas_zettel (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('indice', 'referencia', 'permanente')),
  pasta TEXT NOT NULL CHECK (pasta IN ('01 índice', '02 referências', '03 permanentes')),
  tags TEXT[] DEFAULT '{}',
  tema TEXT,
  referencia TEXT,
  pagina TEXT,
  relacao TEXT,
  livro_id INTEGER,
  revisar BOOLEAN DEFAULT FALSE,
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notas_temporarias (
  id TEXT PRIMARY KEY,
  pensamento TEXT NOT NULL,
  fonte TEXT NOT NULL,
  livro_id INTEGER,
  pagina TEXT,
  processada BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.notas_zettel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_temporarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Livre Zettel" ON public.notas_zettel FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Livre Temp" ON public.notas_temporarias FOR ALL USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sql).then(() => {
      setSqlCopiado(true);
      setTimeout(() => setSqlCopiado(false), 2000);
    });
  };

  // Parser combinado de ==marca-texto amarelo== e [[Wikilinks]]
  const renderizarMarcacoesNaLinha = (str: string) => {
    const regex = /(==[^=]+==|\[\[[^\]\|]+(?:\|[^\]]+)?\]\])/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }

      const token = match[1];

      // Caso 1: Marca-texto amarelo ==texto==
      if (token.startsWith('==') && token.endsWith('==')) {
        const textoDestacado = token.slice(2, -2);
        parts.push(
          <mark
            key={match.index}
            className="bg-amber-200/80 dark:bg-yellow-500/25 text-stone-950 dark:text-yellow-100 px-1 py-0.5 rounded-xs border-b border-amber-400 dark:border-yellow-400/50 font-medium mx-0.5 select-text"
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
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 rounded text-xs font-sans font-medium text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition cursor-pointer"
            title={`Navegar para: [[${linkText}]]`}
          >
            <LinkIcon className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
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

  // Renderizador de Markdown Editorial Antiquarian
  const renderizarTextoFormatado = (texto: string, notaReferencial?: NotaZettel | null) => {
    const linhas = texto.split('\n');
    const notaContexto = notaReferencial || notaAtiva;

    return (
      <div
        className="space-y-4 font-serif leading-relaxed text-stone-800 dark:text-stone-200 text-sm sm:text-base select-text"
        onMouseUp={handleMouseUpSelecao}
      >
        {linhas.map((linha, idx) => {
          if (linha.startsWith('# ')) {
            return (
              <h1
                key={idx}
                className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 pt-4 pb-2 border-b border-stone-200 dark:border-stone-800 tracking-tight"
              >
                {linha.replace('# ', '')}
              </h1>
            );
          }
          if (linha.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 pt-5 pb-1 font-sans flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>{linha.replace('## ', '')}</span>
              </h2>
            );
          }
          if (linha.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm font-bold font-serif text-stone-900 dark:text-stone-200 pt-2">
                {linha.replace('### ', '')}
              </h3>
            );
          }

          // BLOCO EDITORIAL ANTIQUARIAN PARA CITAÇÕES (#citação ou > )
          if (linha.includes('#citação') || linha.trim().startsWith('>')) {
            let trechoLimpo = linha;
            let paginaEncontrada = '';

            // Extrai página se houver no formato p. 84 ou p.12 ou página 84
            const matchPagina = linha.match(/(?:pág\.|pág|pag\.|pag|p\.|p)\s*(\d+)/i);
            if (matchPagina) {
              paginaEncontrada = matchPagina[1];
            } else if (notaContexto?.pagina) {
              paginaEncontrada = String(notaContexto.pagina);
            }

            // Limpa prefixos
            trechoLimpo = trechoLimpo
              .replace(/^-?\s*#citação\s*(?:p\.\s*\d+)?\s*:?\s*/i, '')
              .replace(/^>\s*/, '')
              .replace(/—.*$/, '')
              .trim();

            if (trechoLimpo.startsWith('"') && trechoLimpo.endsWith('"')) {
              trechoLimpo = trechoLimpo.slice(1, -1).trim();
            }

            return (
              <div
                key={idx}
                className="group relative my-3.5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-stone-50/30 dark:from-[#1d1b16] dark:via-[#19191d] dark:to-[#16171b] border-l-4 border-amber-600 dark:border-amber-500 shadow-2xs hover:shadow-md transition-all duration-200"
              >
                {/* Aspas clássicas decorativas */}
                <span className="absolute right-4 top-2 font-serif text-5xl text-amber-600/15 dark:text-amber-400/10 select-none pointer-events-none leading-none">
                  “
                </span>

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-2 text-[11px] font-sans font-bold text-amber-800 dark:text-amber-300">
                    <span className="px-2 py-0.5 rounded-md bg-amber-700 text-white text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                      <Quote className="w-2.5 h-2.5" />
                      <span>Citação</span>
                    </span>
                    {paginaEncontrada && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-200/70 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800 text-[10px] font-mono font-semibold">
                        Página {paginaEncontrada}
                      </span>
                    )}
                  </div>

                  {/* Texto da Citação em Itálico Serifado */}
                  <blockquote className="font-serif italic text-sm sm:text-base text-stone-900 dark:text-amber-100/95 leading-relaxed pl-0.5">
                    "{renderizarMarcacoesNaLinha(trechoLimpo)}"
                  </blockquote>

                  {/* Rodapé da Citação com Ação Direta de Extração */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/50 dark:border-amber-900/40 text-xs font-sans">
                    <span className="text-[11px] text-stone-500 truncate max-w-xs">
                      Fonte: <strong className="text-stone-700 dark:text-stone-300">{notaContexto?.titulo || 'Referência'}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        abrirCriadorPermanente({
                          citacao: trechoLimpo,
                          pagina: paginaEncontrada,
                          ref: notaContexto?.titulo
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      title="Transformar esta citação na semente de uma nova nota permanente"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>+ Gerar Permanente desta Citação</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (linha.includes('#síntese')) {
            const partes = linha.split('#síntese');
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border-l-3 border-emerald-600 text-xs sm:text-sm font-sans flex items-start gap-2.5 shadow-2xs"
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white shrink-0">
                  #síntese
                </span>
                <span className="flex-1 font-serif text-stone-900 dark:text-emerald-100">
                  {renderizarMarcacoesNaLinha(partes[1] || partes[0])}
                </span>
              </div>
            );
          }

          if (linha.includes('#comentário')) {
            const partes = linha.split('#comentário');
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border-l-3 border-sky-600 text-xs sm:text-sm font-sans flex items-start gap-2.5 shadow-2xs"
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-700 text-white shrink-0">
                  #comentário
                </span>
                <span className="flex-1 font-serif text-stone-900 dark:text-sky-100">
                  {renderizarMarcacoesNaLinha(partes[1] || partes[0])}
                </span>
              </div>
            );
          }

          if (linha.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm pl-2">
                <span className="text-amber-700 dark:text-amber-400 font-bold select-none">•</span>
                <span className="flex-1">{renderizarMarcacoesNaLinha(linha.replace('- ', ''))}</span>
              </div>
            );
          }

          if (!linha.trim()) {
            return <div key={idx} className="h-2" />;
          }

          return (
            <p key={idx} className="text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-300">
              {renderizarMarcacoesNaLinha(linha)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#16171b] text-stone-900 dark:text-stone-100 shadow-sm transition-colors min-h-[840px] flex flex-col">
      {/* CAMADA DE FUNDO / WALLPAPER */}
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
      {urlFundoAtivo && (
        <div className="absolute inset-0 pointer-events-none bg-white/75 dark:bg-[#141518]/85 backdrop-blur-[0.5px] z-0" />
      )}

      {/* BARRA DE FERRAMENTAS SUPERIOR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-[#121316]/90 backdrop-blur px-3 py-2 text-xs gap-2">
        {/* Lado Esquerdo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarAberta((prev) => !prev)}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
            title={sidebarAberta ? 'Recolher Painel de Pastas' : 'Expandir Painel de Pastas'}
          >
            {sidebarAberta ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          {/* Abas */}
          <div className="flex items-center bg-stone-200/70 dark:bg-stone-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setVisaoAtiva('acervo')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                visaoAtiva === 'acervo'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Notas ({notasZettel.length})</span>
            </button>
            <button
              onClick={() => setVisaoAtiva('inbox')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition relative ${
                visaoAtiva === 'inbox'
                  ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="04 - Caixa de Entrada & Captura Rápida (48h)"
            >
              <Inbox className="w-3.5 h-3.5 text-amber-600" />
              <span>04 Caixa de Entrada</span>
              {notasTemporarias.filter((t) => !t.processada).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setVisaoAtiva('diario')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition relative ${
                visaoAtiva === 'diario'
                  ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-200 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="05 - O Diário Intelectual (Caderno Real)"
            >
              <BookMarked className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>05 Diário Intelectual</span>
            </button>
            <button
              onClick={() => setVisaoAtiva('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                visaoAtiva === 'canvas'
                  ? 'bg-white dark:bg-stone-700 text-purple-800 dark:text-purple-300 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-purple-600" />
              <span>Canvas</span>
            </button>
          </div>

          {/* Botão Split View / Painel Duplo (Lado a Lado para Monitores Grandes) */}
          <button
            onClick={() => setSplitViewAtivo((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer ${
              splitViewAtivo
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
            title={
              splitViewAtivo
                ? 'Desativar Painel Duplo (Retornar para visão única)'
                : 'Ativar Painel Duplo (Fonte/Referência à esquerda + Rascunho/Permanente à direita)'
            }
          >
            <Columns className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline font-medium">Painel Duplo</span>
          </button>

          {/* Botão Principal de Inserção Rápida */}
          <button
            onClick={() => abrirCriadorPermanente()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            title="Criar nova nota permanente com suas próprias palavras"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Nota</span>
          </button>
        </div>

        {/* Lado Direito: Status Supabase, Fundo, Edição, etc. */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Indicador de Status do Supabase */}
          <button
            onClick={() => setModalSupabaseAberto(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
              supabaseStatus === 'conectado'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : supabaseStatus === 'sincronizando'
                ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300'
                : supabaseStatus === 'erro'
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
            title={supabaseMensagem || 'Configurar conexão Supabase'}
          >
            {supabaseStatus === 'conectado' ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            ) : supabaseStatus === 'sincronizando' ? (
              <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            ) : supabaseStatus === 'erro' ? (
              <CloudOff className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <Database className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span className="hidden sm:inline font-medium">
              {supabaseStatus === 'conectado' ? 'Supabase Nuvem' : 'Conectar Supabase'}
            </span>
          </button>

          {/* Sincronizar Agora */}
          {supabaseStatus === 'conectado' && (
            <button
              onClick={() => sincronizarSupabase()}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer"
              title="Sincronizar com o Supabase agora"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            </button>
          )}

          {/* Imagem de Fundo */}
          <button
            onClick={() => setModalFundoAberto(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs transition cursor-pointer"
            title="Escolher Imagem de Fundo (Pintura Clássica)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
          </button>

          {/* Alternar Modo Leitura / Edição */}
          {notaAtiva && (
            <button
              onClick={() => setModoEdicao((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                modoEdicao
                  ? 'bg-amber-700 text-white border-amber-600'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700'
              }`}
              title={modoEdicao ? 'Alternar para Modo Leitura' : 'Alternar para Modo Edição'}
            >
              {modoEdicao ? <Book className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Copiar Wikilink [[Título]] */}
          {notaAtiva && (
            <button
              onClick={handleCopiarWikilinkNota}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer"
              title="Copiar Wikilink [[Título]]"
            >
              {linkCopiadoNotif ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>
          )}

          {/* Alternar #revisar */}
          {notaAtiva && (
            <button
              onClick={handleToggleRevisar}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                notaAtiva.revisar
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700'
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
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 border border-stone-200 dark:border-stone-700 text-stone-500 transition cursor-pointer"
              title="Excluir nota"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Exportar Markdown */}
          <button
            onClick={handleCopiarExportacao}
            className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer"
            title="Exportar Markdown para o Obsidian"
          >
            {copiadoNotif ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* CORPO PRINCIPAL */}
      <div className="relative z-10 flex-1 flex overflow-hidden min-h-[760px]">
        {/* SIDEBAR RETRÁTIL */}
        {sidebarAberta && (
          <aside className="w-64 sm:w-72 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-[#131417]/95 backdrop-blur flex flex-col transition-all">
            {/* Topo da Sidebar com Ações */}
            <div className="p-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                <Folder className="w-3.5 h-3.5 text-amber-600" />
                <span>Biblioteca</span>
              </div>
              <div className="flex items-center gap-1 text-stone-500">
                <button
                  onClick={() => abrirCriadorPermanente({ tipo: 'permanente' })}
                  className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Nova Nota Permanente"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => abrirCriadorPermanente({ tipo: 'indice' })}
                  className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Novo Macrotema"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Busca Rápida na Árvore */}
            <div className="p-2 border-b border-stone-200 dark:border-stone-800">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Filtrar notas..."
                  className="w-full pl-7 pr-2.5 py-1 text-xs rounded-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Lista em Árvore */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs select-none">
              <div className="space-y-1">
                {/* 00 - INÍCIO */}
                <div>
                  <div
                    onClick={() => togglePasta('00 - INÍCIO')}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60 cursor-pointer text-stone-600 dark:text-stone-400"
                  >
                    {pastasAbertas['00 - INÍCIO'] ? (
                      <ChevronDown className="w-3 h-3 text-stone-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    )}
                    <span>00 - INÍCIO</span>
                  </div>
                  {pastasAbertas['00 - INÍCIO'] && (
                    <div className="pl-4 space-y-0.5 mt-0.5">
                      <div
                        onClick={() => setVisaoAtiva('acervo')}
                        className="px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer text-stone-600 dark:text-stone-300 flex items-center gap-1.5"
                      >
                        <Compass className="w-3 h-3 text-amber-600" />
                        <span>Guia do Zettelkasten</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 01 - ÍNDICE */}
                <div>
                  <div
                    onClick={() => togglePasta('01 - ÍNDICE')}
                    className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60 cursor-pointer text-stone-700 dark:text-stone-300 font-medium"
                  >
                    <div className="flex items-center gap-1.5">
                      {pastasAbertas['01 - ÍNDICE'] ? (
                        <ChevronDown className="w-3 h-3 text-purple-600" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-purple-600" />
                      )}
                      <span>01 - ÍNDICE</span>
                    </div>
                    <span className="text-[10px] text-stone-400">{notasPorPasta.indices.length}</span>
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
                            className={`px-2 py-1 rounded hover:bg-stone-200/70 dark:hover:bg-stone-800 cursor-pointer truncate flex items-center gap-1.5 ${
                              isSel
                                ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300 font-bold'
                                : 'text-stone-600 dark:text-stone-400'
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
                    className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60 cursor-pointer text-stone-700 dark:text-stone-300 font-medium"
                  >
                    <div className="flex items-center gap-1.5">
                      {pastasAbertas['02 - REFERÊNCIAS'] ? (
                        <ChevronDown className="w-3 h-3 text-sky-600" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-sky-600" />
                      )}
                      <span>02 - REFERÊNCIAS</span>
                    </div>
                    <span className="text-[10px] text-stone-400">{notasPorPasta.referencias.length}</span>
                  </div>

                  {pastasAbertas['02 - REFERÊNCIAS'] && (
                    <div className="pl-4 space-y-0.5 mt-0.5">
                      {notasPorPasta.referencias.length === 0 ? (
                        <div className="px-2 py-1 text-[11px] text-stone-400 italic">
                          Nenhuma fonte fichada ainda.
                        </div>
                      ) : (
                        notasPorPasta.referencias.map((nota) => {
                          const isSel = notaAtiva?.id === nota.id;
                          return (
                            <div
                              key={nota.id}
                              onClick={() => {
                                selecionarNotaZettel(nota.id);
                                setVisaoAtiva('acervo');
                              }}
                              className={`px-2 py-1 rounded hover:bg-stone-200/70 dark:hover:bg-stone-800 cursor-pointer truncate flex items-center gap-1.5 ${
                                isSel
                                  ? 'bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-300 font-bold'
                                  : 'text-stone-600 dark:text-stone-400'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
                              <span className="truncate">{nota.titulo}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* 03 - PERMANENTES */}
                <div>
                  <div
                    onClick={() => togglePasta('03 - PERMANENTES')}
                    className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60 cursor-pointer text-stone-700 dark:text-stone-300 font-medium"
                  >
                    <div className="flex items-center gap-1.5">
                      {pastasAbertas['03 - PERMANENTES'] ? (
                        <ChevronDown className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>03 - PERMANENTES</span>
                    </div>
                    <span className="text-[10px] text-stone-400">{notasPorPasta.permanentes.length}</span>
                  </div>

                  {pastasAbertas['03 - PERMANENTES'] && (
                    <div className="pl-4 space-y-0.5 mt-0.5 max-h-60 overflow-y-auto">
                      {notasPorPasta.permanentes.length === 0 ? (
                        <div className="px-2 py-1 text-[11px] text-stone-400 italic">
                          Nenhuma nota permanente criada ainda.
                        </div>
                      ) : (
                        notasPorPasta.permanentes.map((nota) => {
                          const isSel = notaAtiva?.id === nota.id;
                          return (
                            <div
                              key={nota.id}
                              onClick={() => {
                                selecionarNotaZettel(nota.id);
                                setVisaoAtiva('acervo');
                              }}
                              className={`px-2 py-1 rounded hover:bg-stone-200/70 dark:hover:bg-stone-800 cursor-pointer truncate flex items-center gap-1.5 ${
                                isSel
                                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold'
                                  : 'text-stone-600 dark:text-stone-400'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate">{nota.titulo}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* 04 - CAIXA DE ENTRADA */}
                <div>
                  <div
                    onClick={() => {
                      togglePasta('04 - CAIXA DE ENTRADA');
                      setVisaoAtiva('inbox');
                    }}
                    className={`flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60 cursor-pointer font-medium ${
                      visaoAtiva === 'inbox'
                        ? 'text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Inbox className="w-3 h-3 text-amber-600" />
                      <span>04 - CAIXA DE ENTRADA</span>
                    </div>
                    {notasTemporarias.filter((t) => !t.processada).length > 0 && (
                      <span className="text-[10px] px-1.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                        {notasTemporarias.filter((t) => !t.processada).length}
                      </span>
                    )}
                  </div>
                </div>

                {/* 05 - DIÁRIO INTELECTUAL */}
                <div>
                  <div
                    onClick={() => {
                      togglePasta('05 - DIÁRIO INTELECTUAL');
                      setVisaoAtiva('diario');
                    }}
                    className={`flex items-center justify-between px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60 cursor-pointer font-medium ${
                      visaoAtiva === 'diario'
                        ? 'text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <BookMarked className="w-3 h-3 text-amber-600" />
                      <span>05 - DIÁRIO INTELECTUAL</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-cinzel font-semibold bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      Caderno Real
                    </span>
                  </div>
                </div>

                {/* MODELO */}
                <div>
                  <div
                    onClick={() => togglePasta('MODELO')}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60 cursor-pointer text-stone-500"
                  >
                    {pastasAbertas.MODELO ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>MODELO</span>
                  </div>
                  {pastasAbertas.MODELO && (
                    <div className="pl-4 space-y-0.5 mt-0.5 text-stone-500 text-[11px]">
                      <div
                        onClick={() => abrirCriadorPermanente({ tipo: 'indice' })}
                        className="hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer py-0.5"
                      >
                        Template — Nota Índice
                      </div>
                      <div
                        onClick={() => abrirCriadorPermanente({ tipo: 'referencia' })}
                        className="hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer py-0.5"
                      >
                        Template — Nota Referência
                      </div>
                      <div
                        onClick={() => abrirCriadorPermanente({ tipo: 'permanente' })}
                        className="hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer py-0.5"
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
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60 cursor-pointer text-stone-500 ${
                      visaoAtiva === 'canvas' ? 'text-purple-700 dark:text-purple-300 font-bold' : ''
                    }`}
                  >
                    {pastasAbertas.Rascunho ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>Rascunho / Canvas</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ÁREA DO DOCUMENTO / WORKSPACE CENTRAL */}
        <main className="flex-1 flex flex-col justify-between overflow-y-auto">
          {visaoAtiva === 'inbox' ? (
            /* VISÃO 04 - CAIXA DE ENTRADA (DESIGN REFORMULADO & FICHÁRIO 48H) */
            <CaixaEntradaInbox
              onConverterEmPermanente={handleConverterEmPermanente}
              onSelecionarLivroEstante={onSelecionarLivroEstante}
            />
          ) : visaoAtiva === 'diario' ? (
            /* VISÃO 05 - O DIÁRIO INTELECTUAL ("CADERNO REAL" - PRD) */
            <DiarioCadernoReal />
          ) : visaoAtiva === 'canvas' ? (
            /* VISÃO CANVAS DE ARTICULAÇÃO */
            <div className="max-w-5xl mx-auto w-full p-6 sm:p-10 space-y-6">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Mesa de Articulação / Canvas
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">
                    {canvasZettel[0]?.titulo || 'Mesa de Articulação Conceitual'}
                  </h2>
                </div>
                <button
                  onClick={() => setVisaoAtiva('acervo')}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-bold"
                >
                  Voltar ao Leitor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900 space-y-2.5">
                  <div className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase">1. Fontes Fichadas ({todasReferencias.length})</div>
                  {todasReferencias.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        selecionarNotaZettel(r.id);
                        setVisaoAtiva('acervo');
                      }}
                      className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-sky-200 dark:border-sky-800 shadow-2xs cursor-pointer hover:border-sky-400"
                    >
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{r.titulo}</div>
                      <div className="text-[11px] text-stone-500">Nota de Referência</div>
                    </div>
                  ))}
                  {todasReferencias.length === 0 && (
                    <div className="text-xs text-stone-400 italic">Nenhuma fonte fichada ainda.</div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2.5">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">2. Ideias Conectadas ({todasPermanentes.length})</div>
                  {todasPermanentes.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        selecionarNotaZettel(p.id);
                        setVisaoAtiva('acervo');
                      }}
                      className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 shadow-2xs cursor-pointer hover:border-emerald-400"
                    >
                      <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 truncate">{p.titulo}</div>
                      <div className="text-[11px] text-stone-500 truncate">{p.relacao || 'Sem relação direta'}</div>
                    </div>
                  ))}
                  {todasPermanentes.length === 0 && (
                    <div className="text-xs text-stone-400 italic">Nenhuma ideia permanente ainda.</div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2.5">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase">3. Tese Emergente</div>
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-serif leading-relaxed">
                    Conforme você cria notas permanentes e as conecta, use este espaço para organizar argumentos e teses para artigos, resumos e produções intelectuais.
                  </p>
                </div>
              </div>
            </div>
          ) : notaAtiva ? (
            /* VISÃO PRINCIPAL DA NOTA COM SUPORTE A SPLIT VIEW E EDITOR ENRIQUECIDO */
            splitViewAtivo ? (
              /* MODO SPLIT VIEW (PAINEL DUPLO LADO A LADO PARA MONITORES GRANDES) */
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-stone-200 dark:divide-stone-800 overflow-hidden min-h-[720px]">
                {/* PAINEL ESQUERDO: FONTE / REFERÊNCIA / LEITURA */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-stone-50/30 dark:bg-[#131417]/50">
                  {/* Cabeçalho do Painel Esquerdo */}
                  <div className="sticky top-0 z-20 px-4 py-2.5 bg-stone-100/95 dark:bg-[#16171b]/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1 shrink-0">
                        <BookOpen className="w-3 h-3" />
                        <span>Painel 1 · Fonte / Consulta</span>
                      </span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {notaAtiva.titulo}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {notaAtiva.tipo === 'referencia' && (
                        <button
                          type="button"
                          onClick={handleCriarPermanenteDeReferenciaAtiva}
                          className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold hover:bg-emerald-200 transition flex items-center gap-1 cursor-pointer"
                          title="Criar nova nota permanente a partir desta fonte"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="hidden sm:inline">+ Permanente</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setModoEdicao((prev) => !prev)}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                          modoEdicao
                            ? 'bg-amber-700 text-white border-amber-600'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                        title={modoEdicao ? 'Alternar para Modo Leitura' : 'Editar esta nota'}
                      >
                        {modoEdicao ? <Book className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo do Painel Esquerdo */}
                  <div className="p-6 sm:p-8 space-y-5 flex-1">
                    {/* Título Principal */}
                    {modoEdicao ? (
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                          Título
                        </label>
                        <input
                          type="text"
                          value={tituloEditando}
                          onChange={(e) => setTituloEditando(e.target.value)}
                          className="w-full text-lg sm:text-xl font-serif font-bold p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>
                    ) : (
                      <div>
                        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-snug">
                          {notaAtiva.titulo}
                        </h1>
                      </div>
                    )}

                    {/* Propriedades Frontmatter */}
                    <div className="border border-stone-200/90 dark:border-stone-800/90 bg-stone-50/80 dark:bg-[#1a1c22]/80 rounded-xl p-3 space-y-2 font-sans text-xs shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 font-bold">
                        <div
                          onClick={() => setPropriedadesAberta((prev) => !prev)}
                          className="flex items-center gap-1.5 cursor-pointer hover:text-stone-800 dark:hover:text-stone-200"
                        >
                          {propriedadesAberta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          <span>Propriedades (Frontmatter)</span>
                        </div>
                      </div>

                      {propriedadesAberta && (
                        <div className="pt-1.5 space-y-1.5 text-stone-700 dark:text-stone-300">
                          {notaAtiva.pagina && (
                            <div className="flex items-center gap-4 text-xs">
                              <span className="w-20 text-stone-400 font-medium">Página</span>
                              <span className="font-bold text-stone-800 dark:text-stone-200">p. {notaAtiva.pagina}</span>
                            </div>
                          )}
                          {notaAtiva.tipoRelacao && (
                            <div className="flex items-center gap-4 text-xs">
                              <span className="w-20 text-stone-400 font-medium">Dialética</span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                {notaAtiva.tipoRelacao === 'contraponto' ? '⚡ Contraponto / Objeção' :
                                 notaAtiva.tipoRelacao === 'desenvolve' ? '🌲 Desenvolve / Aprofunda' :
                                 notaAtiva.tipoRelacao === 'complementa' ? '🧩 Complementa / Afim' :
                                 notaAtiva.tipoRelacao === 'aplica' ? '💡 Aplica / Exemplo' : '📜 Origem Histórica'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Corpo: Editor ou Leitura */}
                    {modoEdicao ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-stone-200 dark:border-stone-800 text-xs">
                          <button
                            type="button"
                            onClick={() => aplicarFormatacaoNoEditor('marcatexto', false)}
                            className="px-2 py-1 rounded bg-amber-100 text-amber-900 dark:bg-yellow-500/20 dark:text-yellow-300 border border-amber-300 dark:border-yellow-500/40 font-medium flex items-center gap-1 cursor-pointer"
                            title="Destacar seleção com marca-texto amarelo (Ctrl+H)"
                          >
                            <Highlighter className="w-3 h-3" />
                            <span>==Marca-texto==</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarFormatacaoNoEditor('citacao', false)}
                            className="px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-medium cursor-pointer"
                            title="Formatar seleção como citação (Ctrl+Q)"
                          >
                            + #citação
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarFormatacaoNoEditor('sintese', false)}
                            className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] cursor-pointer"
                          >
                            + #síntese
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarFormatacaoNoEditor('comentario', false)}
                            className="px-2 py-1 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[11px] cursor-pointer"
                          >
                            + #comentário
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarFormatacaoNoEditor('wikilink', false)}
                            className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] cursor-pointer"
                          >
                            + [[Wikilink]]
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarFormatacaoNoEditor('negrito', false)}
                            className="p-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer"
                            title="Negrito (Ctrl+B)"
                          >
                            <Bold className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => aplicarFormatacaoNoEditor('italico', false)}
                            className="p-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer"
                            title="Itálico (Ctrl+I)"
                          >
                            <Italic className="w-3 h-3" />
                          </button>
                        </div>

                        <textarea
                          ref={textareaRef}
                          rows={16}
                          value={conteudoEditando}
                          onChange={(e) => setConteudoEditando(e.target.value)}
                          onKeyDown={(e) => handleKeyDownTextarea(e, false)}
                          className="w-full p-4 font-mono text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-relaxed"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 font-sans">
                            Atalhos: Ctrl+H (marca-texto) · Ctrl+Q (citação) · Ctrl+Enter (salvar)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setModoEdicao(false)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSalvarEdicao}
                              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-600 text-white shadow-xs cursor-pointer"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      renderizarTextoFormatado(notaAtiva.conteudo, notaAtiva)
                    )}
                  </div>
                </div>

                {/* PAINEL DIREITO: NOTA PERMANENTE / SÍNTESE PESSOAL */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-white/60 dark:bg-[#16171b]/90">
                  {/* Cabeçalho do Painel Direito */}
                  <div className="sticky top-0 z-20 px-4 py-2.5 bg-stone-100/95 dark:bg-[#18191e]/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 truncate flex-1 mr-2">
                      <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3" />
                        <span>Painel 2 · Permanente</span>
                      </span>

                      {/* Seletor rápido de permanente ativa no lado direito */}
                      {todasPermanentes.length > 0 && (
                        <select
                          value={notaSecundaria?.id || ''}
                          onChange={(e) => setNotaSecundariaId(e.target.value)}
                          className="p-1 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 truncate max-w-[200px] sm:max-w-[280px]"
                        >
                          {todasPermanentes.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.titulo}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => abrirCriadorPermanente({ ref: notaAtiva.titulo, pagina: notaAtiva.pagina ? String(notaAtiva.pagina) : '' })}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                        title="Criar nova nota permanente com base na leitura ao lado"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Nova</span>
                      </button>

                      {notaSecundaria && (
                        <button
                          type="button"
                          onClick={() => setModoEdicaoSecundaria((prev) => !prev)}
                          className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                            modoEdicaoSecundaria
                              ? 'bg-emerald-700 text-white border-emerald-600'
                              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                          }`}
                          title={modoEdicaoSecundaria ? 'Alternar para Modo Leitura' : 'Editar permanente'}
                        >
                          {modoEdicaoSecundaria ? <Book className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo do Painel Direito */}
                  <div className="p-6 sm:p-8 space-y-5 flex-1">
                    {notaSecundaria ? (
                      <>
                        {salvoFeedbackSecundaria && (
                          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                            <Check className="w-3 h-3" /> Permanente atualizada com sucesso!
                          </div>
                        )}

                        {modoEdicaoSecundaria ? (
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                              Título da Ideia (Conceito Atômico)
                            </label>
                            <input
                              type="text"
                              value={tituloSecundariaEditando}
                              onChange={(e) => setTituloSecundariaEditando(e.target.value)}
                              className="w-full text-lg sm:text-xl font-serif font-bold p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                            />
                          </div>
                        ) : (
                          <div>
                            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-snug">
                              {notaSecundaria.titulo}
                            </h2>
                          </div>
                        )}

                        {/* Frontmatter da Permanente */}
                        <div className="border border-stone-200/90 dark:border-stone-800/90 bg-stone-50/80 dark:bg-[#1a1c22]/80 rounded-xl p-3 space-y-2 font-sans text-xs shadow-2xs">
                          <div className="flex items-center gap-4 text-xs">
                            <span className="w-20 text-stone-400 font-medium">Referência</span>
                            <span className="font-semibold text-sky-700 dark:text-sky-400 truncate">
                              {notaSecundaria.referencia ? notaSecundaria.referencia.replace(/\[\[|\]\]/g, '') : 'Nenhuma'}
                            </span>
                          </div>

                          {notaSecundaria.tipoRelacao && (
                            <div className="flex items-center gap-4 text-xs pt-1 border-t border-stone-200 dark:border-stone-800">
                              <span className="w-20 text-stone-400 font-medium">Dialética</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                  {notaSecundaria.tipoRelacao === 'contraponto' ? '⚡ Contraponto / Objeção' :
                                   notaSecundaria.tipoRelacao === 'desenvolve' ? '🌲 Desenvolve / Aprofunda' :
                                   notaSecundaria.tipoRelacao === 'complementa' ? '🧩 Complementa / Afim' :
                                   notaSecundaria.tipoRelacao === 'aplica' ? '💡 Aplica / Exemplo' : '📜 Origem Histórica'}
                                </span>
                                {notaSecundaria.justificativaRelacao && (
                                  <span className="text-xs text-stone-500 italic">"{notaSecundaria.justificativaRelacao}"</span>
                                )}
                              </div>
                            </div>
                          )}

                          {notaSecundaria.citacaoOriginal && (
                            <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border-l-2 border-amber-600 text-xs font-serif italic text-stone-700 dark:text-amber-100/90">
                              "{notaSecundaria.citacaoOriginal}"
                            </div>
                          )}
                        </div>

                        {/* Editor ou Texto */}
                        {modoEdicaoSecundaria ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-stone-200 dark:border-stone-800 text-xs">
                              <button
                                type="button"
                                onClick={() => aplicarFormatacaoNoEditor('marcatexto', true)}
                                className="px-2 py-1 rounded bg-amber-100 text-amber-900 dark:bg-yellow-500/20 dark:text-yellow-300 border border-amber-300 dark:border-yellow-500/40 font-medium flex items-center gap-1 cursor-pointer"
                                title="Destacar seleção com marca-texto amarelo (Ctrl+H)"
                              >
                                <Highlighter className="w-3 h-3" />
                                <span>==Marca-texto==</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => aplicarFormatacaoNoEditor('citacao', true)}
                                className="px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-medium cursor-pointer"
                                title="Formatar seleção como citação (Ctrl+Q)"
                              >
                                + #citação
                              </button>
                              <button
                                type="button"
                                onClick={() => aplicarFormatacaoNoEditor('wikilink', true)}
                                className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] cursor-pointer"
                              >
                                + [[Wikilink]]
                              </button>
                              <button
                                type="button"
                                onClick={() => aplicarFormatacaoNoEditor('negrito', true)}
                                className="p-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer"
                              >
                                <Bold className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => aplicarFormatacaoNoEditor('italico', true)}
                                className="p-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer"
                              >
                                <Italic className="w-3 h-3" />
                              </button>
                            </div>

                            <textarea
                              ref={textareaSecundariaRef}
                              rows={16}
                              value={conteudoSecundariaEditando}
                              onChange={(e) => setConteudoSecundariaEditando(e.target.value)}
                              onKeyDown={(e) => handleKeyDownTextarea(e, true)}
                              className="w-full p-4 font-mono text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 leading-relaxed"
                            />

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-stone-400 font-sans">
                                Atalhos: Ctrl+H (marca-texto) · Ctrl+B (negrito) · Ctrl+Enter (salvar)
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setModoEdicaoSecundaria(false)}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSalvarEdicaoSecundaria}
                                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs cursor-pointer"
                                >
                                  Salvar Permanente
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          renderizarTextoFormatado(notaSecundaria.conteudo, notaSecundaria)
                        )}
                      </>
                    ) : (
                      /* Estado Vazio de Permanente no Painel Direito */
                      <div className="p-12 text-center text-stone-400 space-y-4 max-w-sm mx-auto my-auto">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mx-auto">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="font-serif text-base font-bold text-stone-800 dark:text-stone-200">
                          Redação Simultânea de Permanente
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed font-sans">
                          Leia a fonte à esquerda, selecione trechos marcantes com o cursor e transforme-os em conceitos atômicos próprios aqui no painel direito.
                        </p>
                        <button
                          type="button"
                          onClick={() => abrirCriadorPermanente({ ref: notaAtiva.titulo, pagina: notaAtiva.pagina ? String(notaAtiva.pagina) : '' })}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
                        >
                          + Rascunhar Permanente Desta Fonte
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* MODO VISÃO ÚNICA AMPLA (COM LARGURA ERGONÔMICA EXPANDIDA) */
              <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-6 sm:px-10 py-8 space-y-6">
                {/* Breadcrumb */}
                <div className="text-xs font-sans text-stone-400 dark:text-stone-500 flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <span>Biblioteca</span>
                    <span>/</span>
                    <span className="uppercase font-medium text-stone-600 dark:text-stone-400">{notaAtiva.pasta}</span>
                    <span>/</span>
                    <span className="text-stone-800 dark:text-stone-200 font-semibold truncate">{notaAtiva.titulo}</span>
                  </div>

                  {salvoFeedback && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" /> Salvo com sucesso!
                    </span>
                  )}
                </div>

                {/* Título Principal com Edição Direta */}
                <div className="space-y-2">
                  {modoEdicao ? (
                    <div>
                      <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                        Título do Arquivo / Conceito
                      </label>
                      <input
                        type="text"
                        value={tituloEditando}
                        onChange={(e) => setTituloEditando(e.target.value)}
                        className="w-full text-xl sm:text-2xl font-serif font-bold p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                        {notaAtiva.titulo}
                      </h1>
                      <button
                        onClick={() => setModoEdicao(true)}
                        className="shrink-0 text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                  )}

                  {/* Ações contextuais de fluxo rápido dependendo do tipo da nota */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {notaAtiva.tipo === 'referencia' && (
                      <button
                        onClick={handleCriarPermanenteDeReferenciaAtiva}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Nova Permanente desta Fonte</span>
                      </button>
                    )}

                    {notaAtiva.tipo === 'permanente' && (
                      <button
                        onClick={() => setModalConectarAberto(true)}
                        className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-bold hover:bg-purple-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>+ Conectar com Outra Permanente</span>
                      </button>
                    )}

                    {notaAtiva.tipo === 'indice' && (
                      <>
                        <button
                          onClick={() => abrirCriadorPermanente({ tipo: 'referencia' })}
                          className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-bold hover:bg-sky-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Nova Referência</span>
                        </button>
                        <button
                          onClick={() => abrirCriadorPermanente({ tipo: 'permanente' })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Nova Permanente</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Caixa "Propriedades" do Obsidian */}
                <div className="border border-stone-200/90 dark:border-stone-800/90 bg-stone-50/80 dark:bg-[#1a1c22]/80 rounded-xl p-3.5 space-y-2 font-sans text-xs shadow-2xs">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 font-bold">
                    <div
                      onClick={() => setPropriedadesAberta((prev) => !prev)}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-stone-800 dark:hover:text-stone-200"
                    >
                      {propriedadesAberta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span>Propriedades (Frontmatter)</span>
                    </div>

                    <button
                      onClick={() => setEditandoPropriedades((prev) => !prev)}
                      className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      {editandoPropriedades ? 'Cancelar' : 'Alterar Propriedades'}
                    </button>
                  </div>

                  {propriedadesAberta && (
                    <>
                      {editandoPropriedades ? (
                        /* Formulário de Edição Direta de Propriedades */
                        <div className="pt-2 space-y-2.5 text-stone-700 dark:text-stone-300 border-t border-stone-200 dark:border-stone-800">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Tema</label>
                              <select
                                value={propTema}
                                onChange={(e) => setPropTema(e.target.value)}
                                className="w-full p-1.5 text-xs rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700"
                              >
                                <option value="">Sem tema associado</option>
                                {todosIndices.map((idx) => (
                                  <option key={idx.id} value={idx.titulo}>
                                    {idx.titulo}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Página</label>
                              <input
                                type="text"
                                value={propPagina}
                                onChange={(e) => setPropPagina(e.target.value)}
                                placeholder="Ex: 84"
                                className="w-full p-1.5 text-xs rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Referência (Fonte)</label>
                            <select
                              value={propRef}
                              onChange={(e) => setPropRef(e.target.value)}
                              className="w-full p-1.5 text-xs rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700"
                            >
                              <option value="">Nenhuma / Outra</option>
                              {todasReferencias.map((ref) => (
                                <option key={ref.id} value={ref.titulo}>
                                  {ref.titulo}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Relação Afim</label>
                            <select
                              value={propRelacao}
                              onChange={(e) => setPropRelacao(e.target.value)}
                              className="w-full p-1.5 text-xs rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700"
                            >
                              <option value="">Nenhuma conexão direta</option>
                              {todasPermanentes
                                .filter((p) => p.id !== notaAtiva.id)
                                .map((p) => (
                                  <option key={p.id} value={p.titulo}>
                                    {p.titulo}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Tags (separadas por vírgula)</label>
                            <input
                              type="text"
                              value={propTagsStr}
                              onChange={(e) => setPropTagsStr(e.target.value)}
                              placeholder="nota permanente, síntese, revisar"
                              className="w-full p-1.5 text-xs rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditandoPropriedades(false)}
                              className="px-3 py-1 rounded text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSalvarPropriedades}
                              className="px-3 py-1 rounded bg-amber-700 hover:bg-amber-600 text-white font-bold"
                            >
                              Salvar Propriedades
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Exibição Normal de Propriedades */
                        <div className="pt-2 space-y-2 text-stone-700 dark:text-stone-300">
                          {/* Linha ID */}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="w-24 text-stone-400 flex items-center gap-1.5 shrink-0 font-medium">
                              <span className="font-mono text-stone-400">≡</span>
                              <span>ID</span>
                            </div>
                            <div className="font-mono text-stone-800 dark:text-stone-200">{notaAtiva.id}</div>
                          </div>

                          {/* Linha Tags */}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="w-24 text-stone-400 flex items-center gap-1.5 shrink-0 font-medium">
                              <Tag className="w-3 h-3 text-stone-400" />
                              <span>tags</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {notaAtiva.tags.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded-full text-[11px] bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Linha Tema */}
                          {notaAtiva.tema && (
                            <div className="flex items-center gap-4 text-xs">
                              <div className="w-24 text-stone-400 flex items-center gap-1.5 shrink-0 font-medium">
                                <Folder className="w-3 h-3 text-stone-400" />
                                <span>Tema</span>
                              </div>
                              <button
                                onClick={() => handleClicarWikilink(notaAtiva.tema || '')}
                                className="font-semibold text-purple-700 dark:text-purple-400 underline hover:text-purple-900 cursor-pointer"
                              >
                                {notaAtiva.tema.replace(/\[\[|\]\]/g, '')}
                              </button>
                            </div>
                          )}

                          {/* Linha Referência */}
                          {notaAtiva.referencia && (
                            <div className="flex items-center gap-4 text-xs">
                              <div className="w-24 text-stone-400 flex items-center gap-1.5 shrink-0 font-medium">
                                <BookOpen className="w-3 h-3 text-stone-400" />
                                <span>Referência</span>
                              </div>
                              <button
                                onClick={() => handleClicarWikilink(notaAtiva.referencia || '')}
                                className="font-semibold text-sky-700 dark:text-sky-400 underline hover:text-sky-900 cursor-pointer truncate max-w-md"
                              >
                                {notaAtiva.referencia.replace(/\[\[|\]\]/g, '')}
                              </button>
                            </div>
                          )}

                          {/* Linha Página */}
                          {notaAtiva.pagina && (
                            <div className="flex items-center gap-4 text-xs">
                              <div className="w-24 text-stone-400 flex items-center gap-1.5 shrink-0 font-medium">
                                <span className="font-mono text-stone-400">p.</span>
                                <span>Página</span>
                              </div>
                              <div className="font-bold text-stone-800 dark:text-stone-200">{notaAtiva.pagina}</div>
                            </div>
                          )}

                          {/* Linha Relação Afim */}
                          {notaAtiva.relacao && (
                            <div className="flex items-center gap-4 text-xs">
                              <div className="w-24 text-stone-400 flex items-center gap-1.5 shrink-0 font-medium">
                                <Lightbulb className="w-3 h-3 text-stone-400" />
                                <span>Relação</span>
                              </div>
                              <button
                                onClick={() => handleClicarWikilink(notaAtiva.relacao || '')}
                                className="font-semibold text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-900 cursor-pointer truncate max-w-md"
                              >
                                {notaAtiva.relacao.replace(/\[\[|\]\]/g, '')}
                              </button>
                            </div>
                          )}

                          {/* Linha Relação Dialética */}
                          {notaAtiva.tipoRelacao && (
                            <div className="flex items-center gap-4 text-xs pt-1 border-t border-stone-200 dark:border-stone-800">
                              <div className="w-24 text-stone-400 flex items-center gap-1.5 shrink-0 font-medium">
                                <LinkIcon className="w-3 h-3 text-purple-500" />
                                <span>Dialética</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                  {notaAtiva.tipoRelacao === 'contraponto' ? '⚡ Contraponto / Objeção' :
                                   notaAtiva.tipoRelacao === 'desenvolve' ? '🌲 Desenvolve / Aprofunda' :
                                   notaAtiva.tipoRelacao === 'complementa' ? '🧩 Complementa / Afim' :
                                   notaAtiva.tipoRelacao === 'aplica' ? '💡 Aplica / Exemplo' : '📜 Origem Histórica'}
                                </span>
                                {notaAtiva.justificativaRelacao && (
                                  <span className="text-xs text-stone-500 italic">"{notaAtiva.justificativaRelacao}"</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Citação Original de Apoio */}
                          {notaAtiva.citacaoOriginal && (
                            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border-l-2 border-amber-600 text-xs font-serif italic text-stone-700 dark:text-amber-100/90">
                              "{notaAtiva.citacaoOriginal}"
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Corpo da Nota */}
                <div className="py-2">
                  {modoEdicao ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800 text-xs">
                        <button
                          type="button"
                          onClick={() => aplicarFormatacaoNoEditor('marcatexto', false)}
                          className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 dark:bg-yellow-500/20 dark:text-yellow-300 border border-amber-300 dark:border-yellow-500/40 font-medium flex items-center gap-1 cursor-pointer"
                          title="Destacar com marca-texto amarelo (Ctrl+H)"
                        >
                          <Highlighter className="w-3 h-3" />
                          <span>==Marca-texto==</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarFormatacaoNoEditor('citacao', false)}
                          className="px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-medium cursor-pointer"
                          title="Formatar como citação clássica (Ctrl+Q)"
                        >
                          + #citação
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarFormatacaoNoEditor('sintese', false)}
                          className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] cursor-pointer"
                        >
                          + #síntese
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarFormatacaoNoEditor('comentario', false)}
                          className="px-2 py-1 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[11px] cursor-pointer"
                        >
                          + #comentário
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarFormatacaoNoEditor('wikilink', false)}
                          className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] cursor-pointer"
                        >
                          + [[Wikilink]]
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarFormatacaoNoEditor('negrito', false)}
                          className="p-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer"
                          title="Negrito (Ctrl+B)"
                        >
                          <Bold className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarFormatacaoNoEditor('italico', false)}
                          className="p-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer"
                          title="Itálico (Ctrl+I)"
                        >
                          <Italic className="w-3 h-3" />
                        </button>
                      </div>

                      <textarea
                        ref={textareaRef}
                        rows={18}
                        value={conteudoEditando}
                        onChange={(e) => setConteudoEditando(e.target.value)}
                        onKeyDown={(e) => handleKeyDownTextarea(e, false)}
                        className="w-full p-4 font-mono text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-relaxed"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-sans">
                          Atalhos: Ctrl+H (marca-texto) · Ctrl+Q (citação) · Ctrl+Enter (salvar)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModoEdicao(false)}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSalvarEdicao}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-600 text-white shadow-xs cursor-pointer"
                          >
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    renderizarTextoFormatado(notaAtiva.conteudo, notaAtiva)
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="p-16 text-center text-stone-400 text-sm space-y-4 max-w-md mx-auto">
              <Lightbulb className="w-10 h-10 mx-auto text-amber-600/60" />
              <div className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">
                Seu Cofre Zettelkasten Está Pronto
              </div>
              <p className="text-xs text-stone-500">
                Selecione uma nota na árvore de diretórios ou clique no botão abaixo para criar sua primeira nota permanente com suas próprias palavras.
              </p>
              <button
                type="button"
                onClick={() => abrirCriadorPermanente()}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                + Criar Primeira Nota Permanente
              </button>
            </div>
          )}

          {/* BARRA INFERIOR DE STATUS */}
          <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-[#121316]/90 px-4 py-2 flex items-center justify-between text-[11px] text-stone-500 font-sans z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBacklinksAberto((prev) => !prev)}
                className="hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                title="Exibir Conexões Reversas / Backlinks"
              >
                <LinkIcon className="w-3 h-3 text-amber-600" />
                <span>
                  {backlinks.length} {backlinks.length === 1 ? 'link inverso' : 'links inversos'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>{statsNota.palavras.toLocaleString('pt-BR')} palavras</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>{statsNota.caracteres.toLocaleString('pt-BR')} caracteres</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span className="flex items-center gap-1 text-stone-600 dark:text-stone-400 font-sans">
                <LayoutGrid className="w-3 h-3 text-purple-600" />
                <span>Canvas</span>
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* GAVETA DE BACKLINKS RETRÁTIL */}
      {backlinksAberto && notaAtiva && (
        <div className="fixed bottom-12 right-6 w-80 sm:w-96 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl p-4 z-40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
              <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Conexões Reversas ({backlinks.length})</span>
            </div>
            <button
              onClick={() => setBacklinksAberto(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {backlinks.length === 0 ? (
            <div className="text-xs text-stone-400 italic py-2">
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
                  className="p-2 rounded-lg bg-stone-50 dark:bg-stone-950 hover:bg-amber-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-xs cursor-pointer text-stone-800 dark:text-stone-200 hover:text-amber-900 transition"
                >
                  <div className="font-semibold">{b.titulo}</div>
                  <div className="text-[10px] text-stone-500 truncate">{b.pasta}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DRAWER LATERAL DE CRIAÇÃO RÁPIDA (NÃO-BLOQUEANTE) */}
      <DrawerNovaPermanente
        aberto={drawerNovoAberto}
        onFechar={() => setDrawerNovoAberto(false)}
        tipoInicial={drawerNovoTipo}
        referenciaInicial={drawerNovoRef}
        paginaInicial={drawerNovoPagina}
        citacaoInicial={drawerNovoCitacao}
        todasReferencias={todasReferencias}
        todasPermanentes={todasPermanentes}
        todosIndices={todosIndices}
        livros={livros}
        onCriarPermanente={handleSalvarNovaPermanente}
        onCriarReferencia={handleCriarReferenciaDrawer}
        onCriarIndice={handleCriarIndiceDrawer}
      />

      {/* MENU FLUTUANTE CONTEXTUAL DE SELEÇÃO DE TEXTO */}
      <MenuFlutuanteSelecao
        posicao={menuFlutuantePos}
        textoSelecionado={textoSelecionado}
        onDestacar={handleDestacarSelecao}
        onCitar={handleCitarSelecao}
        onExtrairPermanente={handleExtrairSelecaoParaPermanente}
        onCopiar={handleCopiarSelecao}
      />

      {/* MODAL RÁPIDO DE CONEXÃO COM OUTRA PERMANENTE */}
      {modalConectarAberto && notaAtiva && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191d] border border-stone-200 dark:border-stone-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-stone-800 dark:text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-purple-600" />
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  Conectar a outra Ideia Permanente
                </h3>
              </div>
              <button
                onClick={() => setModalConectarAberto(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 font-serif">
              Selecione uma nota permanente afim para estabelecer a ligação hipertextual direta entre ambas.
            </p>

            <div className="space-y-3">
              <select
                value={notaConectarId}
                onChange={(e) => setNotaConectarId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700"
              >
                <option value="">Selecione uma nota permanente...</option>
                {todasPermanentes
                  .filter((p) => p.id !== notaAtiva.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titulo}
                    </option>
                  ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalConectarAberto(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!notaConectarId}
                  onClick={handleSalvarConexaoPermanente}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white disabled:opacity-50 cursor-pointer"
                >
                  Criar Conexão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÃO E SINCRONIZAÇÃO DO SUPABASE */}
      {modalSupabaseAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191d] border border-stone-200 dark:border-stone-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-stone-800 dark:text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                  Backend de Dados na Nuvem (Supabase)
                </h3>
              </div>
              <button
                onClick={() => setModalSupabaseAberto(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas */}
            <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-xs">
              <button
                onClick={() => setAbaSupabase('conexao')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  abaSupabase === 'conexao'
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Conexão & Credenciais
              </button>
              <button
                onClick={() => setAbaSupabase('sql')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  abaSupabase === 'sql'
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Script SQL das Tabelas
              </button>
            </div>

            {abaSupabase === 'conexao' ? (
              <form onSubmit={handleConectarSupabaseSubmit} className="space-y-3.5">
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Insira o URL do seu projeto e a chave anônima (anon public key) do Supabase para salvar e sincronizar suas notas em tempo real.
                </p>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Project URL do Supabase
                  </label>
                  <input
                    type="url"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Anon Public Key (API Key)
                  </label>
                  <input
                    type="password"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full p-2.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                    required
                  />
                </div>

                {supabaseFeedback && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      supabaseFeedback.ok
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {supabaseFeedback.msg}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800">
                  <div>
                    {supabaseStatus === 'conectado' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Desconectar do Supabase e voltar para o armazenamento local?')) {
                            desconectarSupabase();
                            setSupabaseFeedback(null);
                          }
                        }}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Desconectar Supabase
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalSupabaseAberto(false)}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      disabled={supabaseTestando}
                      className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {supabaseTestando ? 'Conectando...' : 'Testar e Salvar'}
                    </button>
                  </div>
                </div>

                {/* Zona de Limpeza de Mockups */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Deseja resetar e limpar todos os dados de teste?</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            'Tem certeza que deseja limpar todos os dados de teste e começar com o cofre zerado (apenas os 5 macrotemas fundamentais)?'
                          )
                        ) {
                          limparMockupsZettelkasten();
                          alert('Cofre resetado com dados reais limpos!');
                        }
                      }}
                      className="text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      Limpar dados de exemplo
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Copie o script abaixo e execute no <strong>SQL Editor</strong> do seu painel do Supabase para criar as tabelas com RLS:
                </p>

                <div className="relative">
                  <pre className="p-3 rounded-xl bg-stone-900 text-stone-200 font-mono text-[11px] max-h-56 overflow-y-auto">
                    {`CREATE TABLE public.notas_zettel (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  pasta TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  tema TEXT,
  referencia TEXT,
  pagina TEXT,
  relacao TEXT,
  livro_id INTEGER,
  revisar BOOLEAN DEFAULT FALSE,
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notas_temporarias (
  id TEXT PRIMARY KEY,
  pensamento TEXT NOT NULL,
  fonte TEXT NOT NULL,
  livro_id INTEGER,
  pagina TEXT,
  processada BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notas_zettel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_temporarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Livre" ON public.notas_zettel FOR ALL USING (true);
CREATE POLICY "Livre Temp" ON public.notas_temporarias FOR ALL USING (true);`}
                  </pre>
                  <button
                    onClick={handleCopiarSQL}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-100 text-[10px] font-bold flex items-center gap-1 border border-stone-700 cursor-pointer"
                  >
                    {sqlCopiado ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{sqlCopiado ? 'Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE PERSONALIZAÇÃO DA IMAGEM DE FUNDO */}
      {modalFundoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18191d] border border-stone-200 dark:border-stone-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-stone-800 dark:text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                  Imagem de Fundo do Zettelkasten
                </h3>
              </div>
              <button
                onClick={() => setModalFundoAberto(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                Obras Clássicas Disponíveis:
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
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/40'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 hover:border-amber-400'
                      }`}
                    >
                      {preset.url ? (
                        <div
                          className="h-16 w-full rounded-lg bg-cover bg-center mb-1.5 border border-stone-200 dark:border-stone-800"
                          style={{ backgroundImage: `url('${preset.url}')` }}
                        />
                      ) : (
                        <div className="h-16 w-full rounded-lg bg-stone-200 dark:bg-stone-950 mb-1.5 flex items-center justify-center text-[10px] text-stone-500 border border-stone-200 dark:border-stone-800">
                          Sem Imagem
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{preset.nome}</div>
                        <div className="text-[10px] text-stone-500 truncate">{preset.autor}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <div className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                Ou use Imagem Própria:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFundoUrl}
                  onChange={(e) => setCustomFundoUrl(e.target.value)}
                  placeholder="https://...cole a URL da imagem aqui"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customFundoUrl.trim()) {
                      setFundoZettelkasten(customFundoUrl.trim());
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
                >
                  Aplicar URL
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
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

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-stone-200 dark:border-stone-800">
              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-1">
                  <span>Opacidade do Fundo</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{opacidadeFundoZettelkasten}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={opacidadeFundoZettelkasten}
                  onChange={(e) => setOpacidadeFundoZettelkasten(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-1">
                  <span>Desfoque (Blur)</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{desfoqueFundoZettelkasten}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={desfoqueFundoZettelkasten}
                  onChange={(e) => setDesfoqueFundoZettelkasten(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setModalFundoAberto(false)}
                className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
