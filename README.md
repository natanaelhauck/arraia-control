# Arraiá Control

Sistema interno para gestão de aluguel de vestidos de quadrilha. A versão atual é uma base funcional para operar o acervo localmente e preparar a evolução para Supabase.

## Objetivo

Centralizar o controle de vestidos, reservas, aluguéis e devoluções em uma interface simples para pessoas não técnicas, com dados organizados em um formato compatível com banco.

## Funcionalidades atuais

- Dashboard com total de vestidos, disponíveis, alugados e reservados
- Listagem de vestidos em cards responsivos
- Busca por código, cor, tamanho ou observações
- Filtro por status
- Cadastro de vestido em modal
- Upload de foto JPG, JPEG, PNG ou WEBP com preview e limite inicial de 3MB
- Edição e exclusão de vestidos com confirmação
- Modal de detalhes com foto, informações do vestido, aluguel atual e histórico
- Registro de aluguel com dados da cliente, datas, valor, sinal e observações
- Edição do aluguel atual
- Marcação de devolução com confirmação
- Mensagens amigáveis de erro e sucesso

## Persistência

Esta versão usa `localStorage` para desenvolvimento. O acesso fica concentrado em:

```text
src/services/storageService.js
```

As fotos são salvas temporariamente como base64 em `fotoBase64Dev`. Essa abordagem é apenas para desenvolvimento local.

## Próxima etapa

A próxima etapa planejada é substituir o armazenamento local por:

- Supabase Database para vestidos e aluguéis
- Supabase Storage para fotos dos vestidos

O modelo atual já separa os dados principais:

```text
vestido:
  id, codigo, tamanho, cor, status, observacoes, fotoUrl, fotoBase64Dev, createdAt, updatedAt

aluguel:
  id, vestidoId, clienteNome, clienteTelefone, clienteEndereco, dataFesta,
  dataRetirada, dataDevolucaoPrevista, dataDevolucaoReal, valor, sinalPago,
  observacoes, status, createdAt, updatedAt
```

## Como rodar localmente

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
  components/   Componentes da interface
  data/         Dados iniciais de exemplo
  services/     Persistência local e preparação para Supabase
  styles/       CSS separado por base, layout, componentes e formulários
  utils/        Formatadores
```
