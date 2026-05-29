# Relatório Técnico: Lock de Arquivo no Windows

Este relatório documenta a investigação do erro de Windows em que a pasta do projeto não pode ser compactada ou renomeada porque um arquivo de log aparece como aberto pelo "Processador de comandos do Windows".

## Arquivos Relacionados

Os arquivos citados no problema foram:

```text
node_modules/vite/arraia-control-dev.err.log
arraia-control-dev.err
```

Durante a investigação local, os arquivos encontrados estavam em:

```text
node_modules/.vite/arraia-control-dev.err.log
node_modules/.vite/arraia-control-dev.out.log
```

## Causa Provável

A causa provável é a permanência de processos de desenvolvimento do Vite abertos no Windows, iniciados por `npm run dev` e mantidos por uma cadeia de processos `cmd.exe -> npm -> vite`.

O projeto não possui script npm, configuração Vite ou automação versionada que crie esses logs. Os arquivos `arraia-control-dev.err.log` e `arraia-control-dev.out.log` parecem ter sido gerados por uma ferramenta externa ou ambiente de execução que iniciou o Vite redirecionando stdout/stderr para arquivos dentro de `node_modules/.vite`.

No Windows, enquanto o processo que abriu o arquivo continua ativo, o handle do arquivo permanece bloqueado. Por isso o Explorer não consegue compactar, mover ou renomear a pasta.

## Evidências Encontradas

### Scripts npm

O `package.json` define apenas:

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

Não há redirecionamento de stdout ou stderr, como `> arquivo.log`, `2> arquivo.err` ou equivalente.

### Configuração do Vite

O `vite.config.js` contém somente o plugin React:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

Não existe logger customizado, plugin de log, hook de build ou configuração que gere arquivos `.log` ou `.err`.

### Arquivos BAT/CMD

Não foram encontrados scripts `.bat`, `.cmd`, `.ps1` ou `.sh` versionados no repositório. Os únicos arquivos desse tipo estavam em `node_modules/.bin`, gerados pela instalação de dependências.

### Busca por Logs e Redirecionamento

A busca no código versionado não encontrou referências a:

- `2>`
- `1>`
- `.log`
- `.err`
- `arraia-control-dev`
- scripts Windows customizados
- automações com `Start-Process`

### Processos Ativos

Foram encontrados servidores Vite ativos na pasta do projeto:

```text
node.exe ... vite.js --host 127.0.0.1 --port 5173 --strictPort
node.exe ... vite.js --host 127.0.0.1 --port 5174 --strictPort
node.exe ... vite.js --host 127.0.0.1 --port 5175 --strictPort
```

Também foram encontrados processos pais `cmd.exe` executando `npm run dev`.

Essa cadeia explica a mensagem do Windows indicando que o arquivo está aberto em "Processador de comandos do Windows".

### Conteúdo dos Logs

O arquivo `node_modules/.vite/arraia-control-dev.out.log` contém saída normal do Vite, incluindo mensagens de HMR e reinicialização por alteração de `.env`.

O arquivo `node_modules/.vite/arraia-control-dev.err.log` estava vazio no momento da investigação.

## Correção Recomendada

Antes de compactar, renomear ou mover a pasta:

1. Encerrar todos os terminais que estejam rodando `npm run dev`.
2. Parar o Vite com `Ctrl+C` no terminal em que ele foi iniciado.
3. Confirmar que não há `node.exe` ou `cmd.exe` executando Vite para esta pasta.
4. Remover os logs locais após os processos serem encerrados.

No PowerShell, para identificar processos relacionados ao projeto:

```powershell
Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -in @('node.exe', 'cmd.exe') -and
    $_.CommandLine -like '*vestidos_quadrilha*'
  } |
  Select-Object ProcessId, Name, ParentProcessId, CommandLine
```

Para encerrar apenas os processos Vite identificados, use os PIDs retornados pelo comando anterior:

```powershell
Stop-Process -Id 22060,9420,4948
```

Substitua os IDs pelos processos ativos no momento. Não use esse comando às cegas.

## Correção Definitiva

A correção definitiva não está no código da aplicação, porque o repositório não cria esses logs. Ela está no fluxo de desenvolvimento:

- Não executar compactação, renomeação ou movimentação da pasta com o dev server ativo.
- Não redirecionar logs para dentro de `node_modules`.
- Configurar ferramentas externas para gravar logs em uma pasta temporária fora do projeto, como `%TEMP%\arraia-control`.
- Encerrar processos Vite antes de arquivar o projeto.
- Compactar o código-fonte sem `node_modules` e reinstalar dependências com `npm install` quando necessário.

## Boas Práticas para Evitar o Problema

- Rode `npm run dev` em um terminal visível e encerre com `Ctrl+C`.
- Evite iniciar múltiplos Vite servers para a mesma pasta.
- Não feche o terminal abruptamente enquanto o Vite está ativo.
- Não compacte `node_modules`; gere o pacote com arquivos versionados e reinstale dependências no destino.
- Se uma ferramenta externa gerar logs, prefira uma pasta fora do projeto.
- Antes de renomear a pasta, confirme que não existem processos `node.exe` usando o caminho do repositório.

## Conclusão

O lock é um problema de estado local do Windows causado por processo de desenvolvimento ativo ou encerrado incorretamente. Não há evidência de que o código versionado do Arraiá Control gere automaticamente o arquivo `arraia-control-dev.err.log`.

O ajuste preventivo aplicado no repositório foi manter logs locais fora do Git via `.gitignore`. A liberação efetiva do arquivo depende de encerrar os processos Vite/cmd que mantêm o handle aberto.
