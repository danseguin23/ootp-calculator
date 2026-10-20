# Instruções para agentes

## Escopo e organização

Aplicação Vue 3 com Options API, Vue Router e Vue CLI 4. Use o checkout existente; não crie worktrees sem solicitação explícita. Preserve alterações e arquivos preexistentes. Não registre segredos, valores de ambiente ou conteúdos de arquivos de credenciais.

- `src/data-classes.js`: modelos, validações e fórmulas de Batter, Pitcher e Fielder.
- `src/util.js`: conversão de escalas, colunas, apresentação e ordem inicial.
- `src/components/Projections.vue`: ciclo de projeção, listas e persistência.
- `src/components/Projections/`: entradas, escala e tabela.
- `src/views/PositionCalculator.vue`: formulário e saída defensiva.
- `public/teams.json`: fatores de estádio; `src/data-manager.js`: carregamento.
- `src/router/index.js`: rotas; `src/main.js`: inicialização e analytics.

## Comandos

Execute na raiz do repositório. Instalação reproduzível: `npm ci`.

Bash: `npm run serve`; build: `NODE_OPTIONS=--openssl-legacy-provider npm run build`.

PowerShell:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npx vue-cli-service serve --port 8081
# Para gerar dist:
npm run build
```

Há apenas scripts `serve` e `build`; não invente comandos de teste ou lint. Veja [desenvolvimento](docs/development.md) e [validação](docs/testing.md).

## Convenções e cuidados

O código usa componentes `.vue`, Options API, propriedades camelCase e tipos `batting`/`pitching`. Há estilos globais e manipulação direta de DOM; mudanças em seletores podem afetar eventos. Siga o estilo do trecho alterado, sem reformatar arquivos inteiros por conveniência.

Fórmulas trabalham com ratings normalizados, valores não arredondados e fatores de estádio. Antes de alterá-las, registre exemplos e compare resultados, limites, escala 20–80 e Stuff acima da faixa usual. Não substitua fórmulas ativas por constantes marcadas como deprecated. Mudanças em `teams.json` exigem conferir todas as chaves consumidas.

Dados persistidos não possuem versão de schema. Planeje compatibilidade para campos ausentes, ratings normalizados e listas antigas; não apague localStorage para esconder regressões. Teste recarregamento e edição em contexto de navegador isolado. Não use dados reais do usuário para testes destrutivos.

## Verificação e documentação

Mudança de UI: executar build e exercitar rota, formulário, erros e fluxo afetado no navegador. Mudança de cálculo: comparar exemplos reproduzíveis e extremos; mudança de importação: conferir cabeçalhos, prioridade de aliases, dados ausentes e valores opcionais; mudança de persistência/listas: recarregar e validar confirmação/cancelamento; mudança de CSV: inspecionar conteúdo e caracteres especiais.

Atualize `docs/features/`, `docs/calculations.md` e `docs/data-and-storage.md` conforme o domínio afetado. Atualize `docs/development.md` ao mudar scripts e `docs/testing.md` com novas evidências. Diferencie inspeção estática de execução. Defeitos conhecidos estão em `docs/troubleshooting.md`; não trate comportamento defeituoso como requisito desejado.

Use [PLANS.md](PLANS.md) para mudanças com múltiplos fluxos, fórmulas ou migração. Nenhum plano representa autorização automática para implementá-lo.
