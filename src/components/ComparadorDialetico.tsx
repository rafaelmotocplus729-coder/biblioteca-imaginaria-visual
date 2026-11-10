import React, { useState, useMemo } from 'react';
import { Livro, Relacao, Progresso } from '../types';
import { CORES_AREAS } from '../constants/theme';
import {
  Scale,
  X,
  Swords,
  ArrowRight,
  Sparkles,
  Save,
  Check
} from 'lucide-react';

interface ComparadorDialeticoProps {
  isOpen: boolean;
  onClose: () => void;
  livros: Livro[];
  relacoes: Relacao[];
  progressos: Record<number, Progresso>;
  livroInicialAId?: number;
  livroInicialBId?: number;
  onAtualizarNotas: (livroId: number, notas: string) => void;
  onSelecionarLivro: (id: number) => void;
}

export const ComparadorDialetico: React.FC<ComparadorDialeticoProps> = ({
  isOpen,
  onClose,
  livros,
  relacoes,
  progressos,
  livroInicialAId,
  livroInicialBId,
  onAtualizarNotas,
  onSelecionarLivro
}) => {
  // Lista de contrapontos canônicos da biblioteca
  const contrapontosDisponiveis = useMemo(() => {
    return relacoes.filter((r) => r.tipo === 'contraponto');
  }, [relacoes]);

  // Livros selecionados para comparação
  const [livroAId, setLivroAId] = useState<number>(livroInicialAId || 42); // Hayek
  const [livroBId, setLivroBId] = useState<number>(livroInicialBId || 43); // Polanyi
  const [sintesePessoal, setSintesePessoal] = useState('');
  const [sinteseSalva, setSinteseSalva] = useState(false);

  // Sincronizar com props se fornecidas
  React.useEffect(() => {
    if (livroInicialAId) setLivroAId(livroInicialAId);
    if (livroInicialBId) setLivroBId(livroInicialBId);
  }, [livroInicialAId, livroInicialBId]);

  const livroA = useMemo(() => livros.find((l) => l.id === livroAId) || livros[0], [livros, livroAId]);
  const livroB = useMemo(() => livros.find((l) => l.id === livroBId) || livros[1], [livros, livroBId]);

  const coresA = CORES_AREAS[livroA.area] || CORES_AREAS['Filosofia'];
  const coresB = CORES_AREAS[livroB.area] || CORES_AREAS['Filosofia'];

  // Encontrar se existe relação direta catalogada entre A e B
  const relacaoDireta = useMemo(() => {
    return relacoes.find(
      (r) =>
        (r.de === livroA.id && r.para === livroB.id) ||
        (r.de === livroB.id && r.para === livroA.id)
    );
  }, [relacoes, livroA, livroB]);

  const handleSalvarSintese = () => {
    if (!sintesePessoal.trim()) return;
    const notaExistenteA = progressos[livroA.id]?.notas || '';
    const novaNotaA = notaExistenteA
      ? `${notaExistenteA}\n\n[Confronto com #${livroB.id} ${livroB.titulo}]: ${sintesePessoal}`
      : `[Confronto com #${livroB.id} ${livroB.titulo}]: ${sintesePessoal}`;
    onAtualizarNotas(livroA.id, novaNotaA);
    setSinteseSalva(true);
    setTimeout(() => setSinteseSalva(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-library-paper dark:bg-library-darkPaper w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Confronto Dialético */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-700 to-rose-950 flex items-center justify-center text-white shadow-md">
              <Scale className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Confronto Dialético & Contrapontos
              </h2>
              <p className="text-[11px] text-stone-500 font-sans uppercase tracking-widest">
                Exame comparativo de teses filosóficas e políticas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Seleção Rápida de Debates Canônicos */}
        <div className="px-6 py-3 bg-stone-100/70 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800/80 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs">
          <span className="font-cinzel font-semibold text-stone-500 shrink-0 flex items-center gap-1">
            <Swords className="w-3.5 h-3.5 text-rose-600" />
            Debates Clássicos:
          </span>
          {contrapontosDisponiveis.map((contra) => {
            const deLivro = livros.find((l) => l.id === contra.de);
            const paraLivro = livros.find((l) => l.id === contra.para);
            if (!deLivro || !paraLivro) return null;
            const isSelected =
              (livroA.id === deLivro.id && livroB.id === paraLivro.id) ||
              (livroA.id === paraLivro.id && livroB.id === deLivro.id);

            return (
              <button
                key={contra.id}
                onClick={() => {
                  setLivroAId(deLivro.id);
                  setLivroBId(paraLivro.id);
                  setSintesePessoal('');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-serif font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-rose-900 text-rose-100 border-rose-700 shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-rose-400'
                }`}
              >
                {deLivro.autor.split(' ').pop()} vs {paraLivro.autor.split(' ').pop()}
              </button>
            );
          })}
        </div>

        {/* Conteúdo Principal: Duas Colunas Lado a Lado */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Seletor Customizado dos Dois Livros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Seletor Livro A */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                Tese Inicial (Livro A)
              </label>
              <select
                value={livroAId}
                onChange={(e) => setLivroAId(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-serif font-medium text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500"
              >
                {livros.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} {l.titulo} — {l.autor} ({l.ano})
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor Livro B */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                Antítese / Contraponto (Livro B)
              </label>
              <select
                value={livroBId}
                onChange={(e) => setLivroBId(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-serif font-medium text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500"
              >
                {livros.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} {l.titulo} — {l.autor} ({l.ano})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destaque do Eixo de Tensão Dialética */}
          <div className="p-4 rounded-xl border border-rose-300/80 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/80 via-amber-50/40 to-rose-50/80 dark:from-rose-950/30 dark:via-stone-900 dark:to-rose-950/30 text-center">
            <span className="text-[10px] font-cinzel font-bold tracking-widest text-rose-700 dark:text-rose-400 uppercase">
              {relacaoDireta?.tipo === 'contraponto' ? '⚡ Contraponto Direto do Grafo' : '⚖️ Confronto Hermenêutico'}
            </span>
            <p className="mt-1 text-sm sm:text-base font-serif italic text-stone-900 dark:text-stone-100 font-medium">
              "{relacaoDireta?.nota || `Comparação direta entre ${livroA.titulo} e ${livroB.titulo}`}"
            </p>
          </div>

          {/* Confronto Lado a Lado dos Livros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Divisor Central com Ícone de Balança */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-library-paper dark:bg-library-darkPaper border border-rose-400 shadow-md items-center justify-center text-rose-600 z-10">
              <Swords className="w-4 h-4" />
            </div>

            {/* Painel Livro A */}
            <div
              className="rounded-xl p-5 border border-stone-300 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-4 relative"
              style={{ borderTop: `4px solid ${coresA.hex}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className="px-2 py-0.5 text-[9px] font-cinzel font-bold uppercase rounded text-white"
                    style={{ backgroundColor: coresA.hex }}
                  >
                    Nível {livroA.nivel} · #{livroA.id}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mt-1">
                    {livroA.titulo}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-serif italic">
                    {livroA.autor} ({livroA.ano})
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSelecionarLivro(livroA.id);
                    onClose();
                  }}
                  className="px-2 py-1 text-[11px] font-cinzel font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Ver Ficha <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Tese de A */}
              <div className="space-y-1 bg-white/80 dark:bg-stone-950/60 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                  Tese Central
                </span>
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-stone-800 dark:text-stone-200">
                  {livroA.tese}
                </p>
              </div>

              {/* O que acrescenta */}
              <div className="space-y-1 bg-white/80 dark:bg-stone-950/60 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                  O que Acrescenta à sua Formação
                </span>
                <p className="text-xs font-serif leading-relaxed text-stone-700 dark:text-stone-300">
                  {livroA.acrescenta}
                </p>
              </div>
            </div>

            {/* Painel Livro B */}
            <div
              className="rounded-xl p-5 border border-stone-300 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-4 relative"
              style={{ borderTop: `4px solid ${coresB.hex}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className="px-2 py-0.5 text-[9px] font-cinzel font-bold uppercase rounded text-white"
                    style={{ backgroundColor: coresB.hex }}
                  >
                    Nível {livroB.nivel} · #{livroB.id}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mt-1">
                    {livroB.titulo}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-serif italic">
                    {livroB.autor} ({livroB.ano})
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSelecionarLivro(livroB.id);
                    onClose();
                  }}
                  className="px-2 py-1 text-[11px] font-cinzel font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Ver Ficha <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Tese de B */}
              <div className="space-y-1 bg-white/80 dark:bg-stone-950/60 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                  Tese Central
                </span>
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-stone-800 dark:text-stone-200">
                  {livroB.tese}
                </p>
              </div>

              {/* O que acrescenta */}
              <div className="space-y-1 bg-white/80 dark:bg-stone-950/60 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-cinzel font-bold text-stone-500 uppercase tracking-wider">
                  O que Acrescenta à sua Formação
                </span>
                <p className="text-xs font-serif leading-relaxed text-stone-700 dark:text-stone-300">
                  {livroB.acrescenta}
                </p>
              </div>
            </div>
          </div>

          {/* Área de Síntese Pessoal do Leitor */}
          <div className="p-5 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Minha Síntese Pessoal deste Conflito
              </label>
              {sinteseSalva && (
                <span className="text-xs font-serif text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Salvo nas suas notas de leitura!
                </span>
              )}
            </div>
            <textarea
              value={sintesePessoal}
              onChange={(e) => setSintesePessoal(e.target.value)}
              placeholder="Como você articula a tensão entre esses dois autores? Quem possui o diagnóstico mais acurado e quais são os limites de cada tese? Registre aqui a sua síntese..."
              rows={3}
              className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-serif text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSalvarSintese}
                disabled={!sintesePessoal.trim()}
                className="px-4 py-2 rounded-lg text-xs font-cinzel font-bold tracking-wider uppercase bg-amber-700 hover:bg-amber-800 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Gravar Síntese nas Notas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
