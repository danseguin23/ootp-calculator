# Dados e armazenamento

## Modelos

[Batter/Pitcher/Fielder](../src/data-classes.js) armazenam ratings normalizados, identificação e resultados numéricos. Batter/Pitcher possuem `list`, `team`, `position`, `name`; importação acrescenta metadados como jersey/info/age/bats/throws/overall. Nem todo campo declarado na classe é preenchido ou utilizado. Campos opcionais de override são `babipInput`, `stealTendency` no Batter e `hraInput`, `babipInput` no Pitcher. Ausência é representada por null; entradas antigas também podem não conter a propriedade.

Estatísticas são floats internos; a interface formata sem substituir valores originais. Na carga, `Object.assign(new model(), objeto)` restaura métodos e `calculateStats(teams)` recalcula. Não há versão de schema, migração geral ou proteção contra JSON corrompido. JSON parse/fetch sem tratamento pode interromper a montagem. Não edite dados de usuário sem backup.

## localStorage

| Chave | Conteúdo/estado |
| --- | --- |
| `batting`, `pitching` | Arrays JSON de jogadores e resultados; ativos |
| `lists-batting`, `lists-pitching` | Arrays JSON de nomes de listas; ativos |
| `list-batting`, `list-pitching` | Nome da lista selecionada; ativos |
| `team` | Abreviação do time, padrão `-`; ativo e compartilhado |
| `scale` | Texto da escala, padrão `20 to 80`; ativo e compartilhado |
| `use-centimetres` | Texto `true`/`false`; ativo |
| `fielding` | Leitura legada nas posições; sem fluxo ativo de gravação |
| `save-entry` | Método existente; controle/restauração comentados |
| `theme` | Método de troca sem botão ativo; App força tema escuro |
| `fresh-25` | Modal de doação desativado; leitura/método de fechamento existentes |
| `welcome-lists` | Lógica de aviso existente, template de Welcome comentado |
| `option-input` | Gravação comentada; não é preferência ativa |

`lastAdded` e `stale` são marcadores visuais removidos antes de salvar jogadores. Armazenamento pertence à origem do navegador, não ao repositório, Firebase ou conta. Limpar dados do site perde os jogadores. CSV não preserva o schema completo. Não há backup/restauração geral ou sincronização implementados.

## Times e estádios

[public/teams.json](../public/teams.json) é array estático carregado por [data-manager.js](../src/data-manager.js). `abbr` identifica time, `name` nomeia; `-` é No Team com fatores 1. Campos: avg_overall/avg_lhb/avg_rhb, hr_overall/hr_lhb/hr_rhb, doubles, triples, obp, slg, era e fip. Fatores ajustam estatísticas conforme modelo; não são ratings de jogadores. Fonte externa/atualidade empírica desses fatores não verificada.

## Intercâmbio

Entrada em lote usa TSV com cabeçalhos, descrito em [importação](features/batch.md). Saída CSV tem apenas colunas de resultados em [listas e tabela](features/lists-and-table.md). Nenhum desses formatos equivale ao JSON completo do localStorage.
