import { NotaZettel, NotaTemporaria, CanvasZettel } from '../types';

// -------------------------------------------------------------
// DADOS REAIS DE INÍCIO DO ZETTELKASTEN (SEM MOCKUPS ARTIFICIAIS)
// Contém apenas os macrotemas de índice fundamentais (01 índice)
// prontos para receber as leituras e ideias reais do usuário.
// -------------------------------------------------------------

export const NOTAS_ZETTEL_INICIAIS: NotaZettel[] = [
  {
    id: '1-LITERATURA',
    titulo: '1 - LITERATURA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- 

# Notas Relacionadas
- `,
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString()
  },
  {
    id: '2-HISTORIA',
    titulo: '2 - HISTÓRIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- 

# Notas Relacionadas
- `,
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString()
  },
  {
    id: '3-PSICOLOGIA',
    titulo: '3 - PSICOLOGIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- 

# Notas Relacionadas
- `,
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString()
  },
  {
    id: '4-RELIGIAO',
    titulo: '4 - RELIGIÃO',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- 

# Notas Relacionadas
- `,
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString()
  },
  {
    id: '5-FILOSOFIA',
    titulo: '5 - FILOSOFIA',
    tipo: 'indice',
    pasta: '01 índice',
    tags: ['nota índice'],
    conteudo: `# Referências
- 

# Notas Relacionadas
- `,
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString()
  }
];

export const NOTAS_TEMPORARIAS_INICIAIS: NotaTemporaria[] = [];

export const CANVAS_ZETTEL_INICIAL: CanvasZettel = {
  id: 'canvas-1',
  titulo: 'Mesa de Articulação Conceitual',
  descricao: 'Espaço em branco para conectar suas notas de referência e permanentes.',
  nodes: [],
  edges: []
};
