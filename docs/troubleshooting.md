# Solução de problemas e limitações

## Ambiente

| Sintoma | Diagnóstico e ação | Evidência |
| --- | --- | --- |
| `export não é reconhecido` no Windows | Script serve usa sintaxe Bash; use alternativa PowerShell em desenvolvimento | Relatado pelo usuário; alternativa revisada, Windows não executado |
| Erro OpenSSL em webpack/Node moderno | Defina NODE_OPTIONS=--openssl-legacy-provider conforme plataforma | Build Linux passou com essa opção |
| Aviso caniuse-lite desatualizado | Base Browserslist antiga; atualização deve ser tarefa de dependências separada | Aviso no build; não bloqueou |
| Avisos de asset/entrypoint size | Bundles/imagens excedem recomendação do webpack | Build concluiu com três avisos |
| Tabela não carrega | Inspecione GET /teams.json, JSON salvo e console; não apague armazenamento como primeira tentativa | Fluxo sem catch abrangente identificado no código |
| Dados sumiram em outro navegador/origem | localStorage não sincroniza; CSV não restaura o conjunto completo | Arquitetura confirmada |
| Porta 8081 ocupada | Reutilize servidor saudável ou encerre apenas processo iniciado por você; não finalize processos desconhecidos | Procedimento recomendado; conflito não reproduzido |

## Defeitos e diferenças confirmados

- `Projections.deleteList`: cancelar confirmação ainda executa filtro de jogadores e persistência, fora de `if (conf)`. Reproduzido em contexto descartável: cancelar apagou jogadores e manteve as listas.
- `ProjectionTable.download`: não escapa vírgulas, aspas ou quebras de linha; CSV com esses caracteres pode ficar inválido.
- `About.vue`: links de projeções apontam para `/position-calculator`.
- `Home.vue`: pré-carga aponta para quatro banners hover ausentes; não impede a navegação principal.
- O aviso de restrição de canhotos não é aplicado em Fielder; não há entrada de lateralidade nas posições.
- `getLookupValue`: rating fora de todos os intervalos retorna o último valor da tabela, inclusive se abaixo do mínimo; não existe extrapolação documentada como regra do jogo.

- `displayIP` em util.js: o smoke de SP produziu `156.3`, embora a notação usual de outs só permita .0/.1/.2. A fórmula de apresentação multiplica a fração por 10/3 e pode gerar dígito 3. A saída está registrada sem corrigi-la.

Esses comportamentos não foram corrigidos nesta tarefa. Exclusão cancelada, links de About e IP foram observados no navegador; os demais pontos foram confirmados por inspeção. Veja a matriz.

## Riscos não reproduzidos

Cancelar/trocar edição pode perder referência ao jogador no array geral, pois editPlayer o remove antes do Save e changeOption só o recoloca na lista visível. O catch do lote chama indexOf em erro que pode ser objeto nativo. JSON corrompido, equipe inexistente e falhas de rede não têm recuperação robusta. Não foram exercitados todos esses caminhos; precisam de reprodução isolada antes de definir correção.

## Fora do escopo verificado

Precisão estatística contra temporadas reais/OOTP, envio de Analytics, pagamentos, deploy Firebase, funcionamento de todos os recursos externos, acessibilidade e compatibilidade ampla de navegadores/Windows não verificados. Melhorias nessas áreas são propostas possíveis, sem implementação aprovada.
