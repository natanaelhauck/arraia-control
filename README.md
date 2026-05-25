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
- Dashboard financeiro com receita prevista, valores recebidos, pendências e devoluções
- Listagem de vestidos em cards responsivos
- Busca por código, cor, tamanho ou observações
- Filtro por status
- Filtros por cor genérica e tamanho
- Login com Supabase Auth por e-mail e senha
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
7. Em Authentication > Users, crie os usuários internos com e-mail e senha.

O `schema.sql` também cria triggers para atualizar `updated_at` automaticamente e políticas RLS para usuários autenticados.

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

## Dashboard Financeiro

O dashboard financeiro usa os registros da tabela `rentals` e aplica os filtros por período e status. O filtro de período considera a `party_date` do aluguel.

Regras atuais de cálculo:

- Receita total prevista: soma de `total_amount` dos aluguéis ativos e devolvidos.
- Valor já recebido: soma de `deposit_amount`; quando o aluguel está devolvido e possui `total_amount`, o sistema considera que o valor total foi recebido.
- Valor pendente: `total_amount - deposit_amount` somente para aluguéis ativos, sem permitir valor negativo.
- Devoluções próximas: aluguéis ativos com `expected_return_date` nos próximos 7 dias.
- Devoluções atrasadas: aluguéis ativos com `expected_return_date` anterior à data atual.

Como ainda não existe um campo específico para pagamento final, a regra temporária considera aluguel devolvido como quitado. No futuro, o sistema pode receber controle de pagamento completo, checkout e baixa manual de parcelas.

## Segurança

- RLS está ativado nas tabelas.
- A tela de login usa Supabase Auth com e-mail e senha.
- O dashboard só é exibido quando existe sessão ativa.
- Crie os usuários internos em Supabase Authentication > Users.
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

- Perfis de usuário e níveis de permissão
- Deploy
- Domínio próprio
- Rotina de backup
