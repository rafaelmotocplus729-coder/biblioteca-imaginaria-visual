export const CORES_AREAS: Record<string, { bg: string; text: string; border: string; badge: string; hex: string }> = {
  'Método': {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-500',
    badge: 'bg-slate-600 text-white',
    hex: '#4A5568'
  },
  'Inglês': {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-600',
    badge: 'bg-blue-600 text-white',
    hex: '#2B6CB0'
  },
  'Literatura': {
    bg: 'bg-purple-50 dark:bg-purple-950',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-600',
    badge: 'bg-purple-600 text-white',
    hex: '#805AD5'
  },
  'Política': {
    bg: 'bg-rose-50 dark:bg-rose-950',
    text: 'text-rose-800 dark:text-rose-200',
    border: 'border-rose-600',
    badge: 'bg-rose-600 text-white',
    hex: '#C53030'
  },
  'Psicologia': {
    bg: 'bg-amber-50 dark:bg-amber-950',
    text: 'text-amber-800 dark:text-amber-200',
    border: 'border-amber-600',
    badge: 'bg-amber-600 text-white',
    hex: '#DD6B20'
  },
  'Antropologia': {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-600',
    badge: 'bg-yellow-600 text-white',
    hex: '#D69E2E'
  },
  'Filosofia': {
    bg: 'bg-teal-50 dark:bg-teal-950',
    text: 'text-teal-800 dark:text-teal-200',
    border: 'border-teal-600',
    badge: 'bg-teal-600 text-white',
    hex: '#319795'
  },
  'História': {
    bg: 'bg-orange-50 dark:bg-orange-950',
    text: 'text-orange-900 dark:text-orange-200',
    border: 'border-orange-700',
    badge: 'bg-orange-800 text-white',
    hex: '#744210'
  },
  'História da Igreja': {
    bg: 'bg-amber-100 dark:bg-amber-900',
    text: 'text-amber-900 dark:text-amber-100',
    border: 'border-amber-700',
    badge: 'bg-amber-800 text-white',
    hex: '#975A16'
  },
  'Economia': {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    text: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-600',
    badge: 'bg-emerald-600 text-white',
    hex: '#2F855A'
  },
  'Sociologia': {
    bg: 'bg-sky-50 dark:bg-sky-950',
    text: 'text-sky-800 dark:text-sky-200',
    border: 'border-sky-600',
    badge: 'bg-sky-600 text-white',
    hex: '#3182CE'
  },
  'Catolicismo': {
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    text: 'text-indigo-800 dark:text-indigo-200',
    border: 'border-indigo-600',
    badge: 'bg-indigo-600 text-white',
    hex: '#6B46C1'
  }
};

export const LEGENDA_RESUMO: Record<string, { rotulo: string; descricao: string; simbolo: string }> = {
  nao: {
    rotulo: 'Resumo trairia o argumento (ler integralmente)',
    descricao: 'Esta é uma obra de leitura integral. O estilo e a tessitura formal pertencem ao próprio argumento.',
    simbolo: '✗'
  },
  sim: {
    rotulo: 'Bom resumo é aceitável',
    descricao: 'Livro instrumental ou panorâmico. Anotações sintéticas e consultas tópicas cumprem o objetivo.',
    simbolo: '✓'
  },
  estrutura: {
    rotulo: 'Resumo serve para a estrutura, não para o argumento',
    descricao: 'Um mapa conceitual ou índice comentado apoia a navegação, mas os pontos axiais exigem exame atento.',
    simbolo: '~'
  }
};

export const ESTIMATIVAS_HORAS = {
  OBRA: { min: 15, max: 30, media: 22.5 },
  MAPA: { min: 8, max: 15, media: 11.5 },
  PORTA: { min: 4, max: 8, media: 6.0 }
};

export const PAGINAS_LIVROS: Record<number, number> = {
  1: 432, 2: 380, 3: 336, 4: 176, 5: 184,
  6: 112, 7: 520, 8: 160, 9: 96, 10: 224,
  11: 240, 12: 68, 13: 160, 14: 80, 15: 96,
  16: 224, 17: 256, 18: 440, 19: 160, 20: 608,
  21: 440, 22: 144, 23: 368, 24: 832, 25: 480,
  26: 288, 27: 464, 28: 560, 29: 512, 30: 112,
  31: 480, 32: 600, 33: 160, 34: 720, 35: 512,
  36: 96, 37: 400, 38: 960, 39: 280, 40: 64,
  41: 860, 42: 320, 43: 400, 44: 360, 45: 336,
  46: 288, 47: 280, 48: 352, 49: 624, 50: 128,
  51: 192, 52: 208, 53: 720, 54: 760, 55: 890,
  56: 336, 57: 256, 58: 912, 59: 600, 60: 688
};

export function obterPaginasLivro(id: number, fallbackClasse: string = 'OBRA'): number {
  if (PAGINAS_LIVROS[id]) return PAGINAS_LIVROS[id];
  if (fallbackClasse === 'PORTA') return 160;
  if (fallbackClasse === 'MAPA') return 480;
  return 320;
}

export function calcularLarguraLombada(paginas: number): number {
  const minWidth = 44; // px para livros breves (~60 a 100 págs)
  const maxWidth = 84; // px para tomos volumosos (~900+ págs)
  const t = Math.min(1, Math.max(0, (paginas - 60) / 880));
  return Math.round(minWidth + t * (maxWidth - minWidth));
}

export function calcularAlturaLombada(id: number): number {
  // Variação sutil e elegante de altura (250px a 274px) típica de bibliotecas históricas
  const alturas = [252, 260, 256, 268, 264, 258, 272, 254];
  return alturas[id % alturas.length];
}

export const EX_LIBRIS_NIVEIS: Record<number, { titulo: string; lema: string; icon: string }> = {
  1: {
    titulo: 'Ex-Libris Propaedeutica',
    lema: 'Ad Discendum et Discernendum',
    icon: '🏛️'
  },
  2: {
    titulo: 'Ex-Libris Conscientia',
    lema: 'In Absurdo Lux et Veritas',
    icon: '⚖️'
  },
  3: {
    titulo: 'Ex-Libris Fundamenta',
    lema: 'Radices Sapientiae Antiquae',
    icon: '📜'
  },
  4: {
    titulo: 'Ex-Libris Dialectica',
    lema: 'Per Confligentes Ad Libertatem',
    icon: '⚔️'
  },
  5: {
    titulo: 'Ex-Libris Culmen Magnum',
    lema: 'In Altissimis Animae Transeunt',
    icon: '👑'
  }
};

