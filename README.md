# Arraiá Control

Sistema interno para gestão de aluguel de vestidos de quadrilha. A versão atual usa Supabase Database e Supabase Storage para operar com dados reais, mantendo uma interface simples para cadastro, aluguel, devolução e histórico.

## Stack

- React + Vite
- JavaScript
- CSS puro
- Supabase Database
- Supabase Storage
- `@supabase/supabase-js`

## Funcionalidades

- Dashboard com total de vestidos, disponíveis, alugados e reservados
- Listagem de vestidos em cards responsivos
- Busca por código, cor, tamanho ou observações
- Filtro por status
- Cadastro e edição de vestidos em modal
- Upload de foto para o bucket `dress-photos`
- Validação de imagem JPG, JPEG, PNG ou WEBP até 3MB
- Exclusão de vestido com confirmação
- Modal de detalhes com foto, informações do vestido, aluguel atual e histórico
- Registro e edição de aluguel
- Marcação de devolução com confirmação
- Histórico de aluguéis vindo da tabela `rentals`
- Mensagens amigáveis de loading, erro e sucesso

## Como Rodar Localmente

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` baseado em `.env.example`:

```bash
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

Rode o projeto:

```bash
npm run dev
```

Gere a build:

```bash
npm run build
```

Nunca use a service role key no frontend. Use somente a anon key.

## Configurar Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo [supabase/schema.sql](supabase/schema.sql).
4. Confirme que as tabelas `dresses` e `rentals` foram criadas.
5. Confirme que o bucket `dress-photos` existe em Storage.
6. Copie a Project URL e a anon public key para o `.env`.

O `schema.sql` também cria triggers para atualizar `updated_at` automaticamente e políticas RLS temporárias para desenvolvimento interno.

## Storage

O bucket usado pelo sistema é:

```text
dress-photos
```

Para esta fase, ele fica público para facilitar a exibição das fotos. As imagens são enviadas pelo navegador usando a anon key e a URL pública é salva em `dresses.photo_url`.

Antes de produção, revise as policies de Storage e considere usar URLs assinadas se as fotos não puderem ser públicas.

## Padrão recomendado para fotos dos vestidos

- Tire a foto na vertical.
- Use fundo simples.
- Deixe o vestido centralizado.
- Fotografe de frente.
- Mantenha boa iluminação.
- Evite cortar barra, manga ou cintura.
- Evite zoom excessivo.
- Use proporção parecida com 3:4 ou 4:5.
- Mantenha o tamanho máximo de 3MB.

## Segurança

- RLS está ativado nas tabelas.
- As policies atuais são temporárias para uso interno em desenvolvimento sem login.
- Antes de produção, o ideal é adicionar autenticação por usuário e senha.
- Não exponha a service role key.
- Mantenha somente `VITE_SUPABASE_ANON_KEY` no frontend.
- As entradas passam por sanitização básica e validações no frontend.
- O banco também protege status por constraints e código único por `unique`.

## Estrutura

```text
src/
  components/   Componentes da interface
  lib/          Cliente Supabase
  services/     Serviços de vestidos, aluguéis, imagens e sanitização
  styles/       CSS separado por base, layout, componentes e formulários
  utils/        Formatadores
supabase/
  schema.sql    Tabelas, constraints, triggers, RLS e bucket
```

## Próximos Passos

- Autenticação por usuário e senha
- Policies RLS baseadas em usuários autenticados
- Deploy
- Domínio próprio
- Rotina de backup
