# Biblioteca Imaginária Visual

Aplicativo web pessoal para visualização, navegação e acompanhamento de uma biblioteca imaginária de 60 livros, distribuídos em 5 níveis de maturidade intelectual (no espírito do exercício de formação proposto por Olavo de Carvalho).

A lista é tratada como um **grafo em movimento**: relações de sequência (`prepara`), contrapontos de teses em conflito (`contraponto`) e obras afins (`mesmo_tema`).

## 📚 Funcionalidades

- **Estante Visual & Lombadas**: Exibição dos 60 livros organizados em 5 níveis, com capas autênticas em português e opção de visualização por lombadas.
- **Grafo Interativo (D3.js)**: Navegação visual pelas conexões entre as obras, modo focado em contrapontos/conflitos e adição/edição de novas relações.
- **Painel "O que ler agora"**: Sugestão de leitura atual (ex: *O Mito de Sísifo*), previsão de horas semanais (baseado no ritmo de 6h/semana) e alerta para leituras simultâneas.
- **Modal da Obra (11 seções)**:
  - Metadados completos (Área, Classe OBRA/MAPA/PORTA, Ano, Edição).
  - Tese do autor, o que acrescenta e por que precede a próxima.
  - Guia de leitura para obras com resumo vetado (resumo trairia o argumento).
  - Edições em português e sinopse editorial.
  - Registro de progresso (estado, data de início/fim, tentativas de abandono, "mudou meu juízo?", pergunta aberta e notas).
- **Revisão Semestral Guiada**: Fluxo para avaliar livros lidos ou abandonados com histórico e persistência.
- **Backup & Exportação**: Exportação e importação de estado completo em JSON, além de exportações em Markdown e CSV.
- **Modo Escuro & Responsividade**: Suporte a temas claro/escuro com paleta sóbria editorial e layout adaptado para dispositivos móveis e desktop.

## 🛠️ Tecnologias

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS**
- **Lucide React** (ícones)
- **D3.js** (visualização de grafos)
- **Canvas-Confetti**

## 🚀 Como Rodar o Projeto

1. Clone o repositório:
```bash
git clone git@github.com:rafaelmotocplus729-coder/biblioteca-imaginaria-visual.git
cd biblioteca-imaginaria-visual
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:5173
```

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento Vite.
- `npm run build`: Compila a aplicação para produção em `dist/`.
- `npm run preview`: Executa a versão pré-compilada localmente.
- `node scripts/validar-dados.js`: Executa testes de integridade dos dados dos 60 livros e relações.
- `node scripts/aplicar-capas-pt.js`: Atualiza e verifica capas autênticas em português.
