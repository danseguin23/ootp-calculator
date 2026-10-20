# Desenvolvimento

Execute comandos na raiz do checkout. Ambiente Linux verificado: Node 24.19.0, npm 11.9.0. O projeto não fixa versão de Node nem declara engines; essa versão é evidência do ambiente utilizado, não garantia para qualquer versão. Dependências usam Vue 3 e Vue CLI 4/webpack 4.

## Instalação

```bash
npm ci
```

Usa package-lock.json sem atualizar declarações. Nesta máquina foi usado `npm ci --cache /workspace/.npm --no-audit --no-fund` durante onboarding, com 1377 pacotes instalados. Flags de audit/fund reduzem operações auxiliares e não representam auditoria de segurança. Não houve nova instalação nesta tarefa de documentação, pois node_modules já estava disponível.

## Bash/Linux

```bash
npm run serve
# Para aceitar conexões em interfaces externas no ambiente cloud:
npm run serve -- --host 0.0.0.0
# Build:
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

Serve define NODE_OPTIONS e porta 8081 no script. O build precisa receber a opção externamente no Node moderno. A opção mantém compatibilidade com webpack antigo; não desative TLS ou verificações de integridade. O servidor de desenvolvimento não é serviço de produção.

## PowerShell/Windows

O script serve contém `export`, que não funciona no shell usado por npm no Windows. Na raiz:

```powershell
npm ci
$env:NODE_OPTIONS="--openssl-legacy-provider"
npx vue-cli-service serve --port 8081
```

Build, em outra sessão se necessário:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm run build
```

A variável vale para a sessão atual. Esses comandos foram revisados; Windows/PowerShell não foi executado neste ambiente Linux. O erro de export foi relatado pelo usuário. package.json foi preservado.

## Serviços e publicação

Nenhum banco ou backend local é necessário para calcular. `/teams.json` precisa ser servido na mesma origem. Analytics, fontes e Bootstrap têm dependências de rede externas; entrega de telemetria não é critério usado para validar cálculos locais. Não é necessário inventar credenciais.

Build gera `dist/`, ignorado pelo Git. `firebase.json` configura Firebase Hosting e fallback da SPA; publicar exige fluxo e autorização próprios. Nenhum deploy ou pagamento foi executado. Processos locais não sobrevivem necessariamente a uma nova tarefa cloud; iniciar o servidor novamente quando necessário.

## Verificações disponíveis

package.json define somente serve e build: não há script test, lint, typecheck ou geração de código dedicado. Siga [testes e evidências](testing.md); não descreva build como suíte de testes.
