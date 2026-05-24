# Arraiá Control

Sistema interno para gestão inicial de aluguel de vestidos de quadrilha.

## Stack

- React + Vite
- JavaScript
- CSS puro
- Persistência local com `localStorage`
- Sem backend nesta primeira versão

## Funcionalidades

- Dashboard com total de vestidos, disponíveis, alugados e reservados
- Lista de vestidos em cards
- Busca por codigo, cor ou tamanho
- Filtro por status
- Cadastro de novos vestidos
- Modal de detalhes com foto, dados do vestido, aluguel atual e historico
- Registro de aluguel com dados da cliente, datas, valor, sinal e observacoes
- Marcação de devolução, movendo o aluguel atual para o histórico
- Dados iniciais de exemplo

## Como rodar

Instale as dependências:

```bash
npm install
```

Rode o ambiente local:

```bash
npm run dev
```

Gere a build de produção:

```bash
npm run build
```

## Estrutura

```text
src/
  components/   Componentes reutilizáveis da interface
  data/         Dados iniciais de exemplo
  styles/       CSS separado por base, layout, componentes e formulários
  utils/        Persistência e formatadores
```

Os dados ficam no navegador, na chave `arraia-control:dresses` do `localStorage`.
