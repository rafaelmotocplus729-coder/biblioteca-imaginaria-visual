# Registro de Decisões de Produto (DECISOES.md)

Este documento registra as decisões de arquitetura e produto adotadas na implementação da **Biblioteca Imaginária Visual**, em conformidade com a Seção 11 e Seção 1 do PRD.

## 1. Padrões Adotados (Seção 11 do PRD)

| Tema | Opção Adotada | Justificativa |
| :--- | :--- | :--- |
| **Plataforma** | Web responsivo (Mobile-first) & Progressive Web App (PWA) | Permite acesso tanto no celular quanto no notebook com suporte offline e sem necessidade de instalação em lojas. |
| **Persistência de Dados** | `localStorage` local + exportação/importação manual em JSON, Markdown e CSV | Garante privacidade total (nenhum dado pessoal sai do aparelho), custo zero de infraestrutura e controle absoluto pelo usuário. |
| **Apresentação Visual das Obras** | Capas reais com alternador para visão em lombada | Proporciona tanto o prazer estético da estante visual quanto a densidade de informação da lombada de biblioteca. |
| **Edições de Clássicos** | Até 3 edições em português com seletor de edição preferida | Permite que o leitor defina qual tradução ou editora possui ou pretende ler (ex.: 34, Martins Fontes, Companhia das Letras, etc.). |
| **Trilhas Temáticas à Parte** | Não incluído na v1 | Foco no cumprimento rigoroso do grafo dos 60 livros e 5 níveis sem dispersão. |
| **Obras em Inglês** | Rótulo de idioma `[EN]` nos livros #2 e #36 | Busca nas APIs pela edição em inglês original mantendo fidelidade ao objetivo pedagógico. |

## 2. Decisões Arquiteturais e Técnicas

- **Stack Tecnológica:** Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons + Zustand para gerenciamento de estado.
- **Grafo:** Implementação interativa com D3 (Force Simulation), com nós coloridos por área, espessura e destaque de contrapontos e sequência de preparação.
- **Integridade dos Dados:** Dados estruturais em `data/livros.json` e `data/relacoes.json`. Enriquecimento cacheado em `data/enriquecido.json` e pendências catalogadas em `data/pendencias.json`.
- **Regra do Resumo:** Obras com `resumo_permitido = "nao"` contam com o selo rígido *"Resumo trairia o argumento"* e disponibilizam campo editável para *"Guia de Leitura"* pessoal do usuário, nunca gerando paráfrases artificiais.
