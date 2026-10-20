# Projeções de rebatedores e arremessadores

Rotas `/batter-projections` e `/pitcher-projections`. [Projections.vue](../../src/components/Projections.vue) compartilha o fluxo; [InputSingle.vue](../../src/components/Projections/InputSingle.vue) define campos e [data-classes.js](../../src/data-classes.js) implementa validações e fórmulas.

## Entrada individual

Single Input é o modo inicial. Selecione Target List, Ratings Scale e Team, preencha o jogador e envie Submit. A lista inicial de jogadores é vazia; o nome lógico padrão é `DEFAULT LIST`, mas uma instalação sem dados pode não exibir uma aba até criar uma lista. Team inicia em `-` (fatores neutros) ou preferência salva; escala inicia em 20–80 ou preferência salva.

| Domínio | Entradas |
| --- | --- |
| Ambos | Nome obrigatório, time, posição obrigatória, lista alvo e escala |
| Rebatedor | Posição C/1B/2B/3B/SS/LF/CF/RF/DH; Bats `-`, L, R ou S (padrão `-`); Contact, Avoid K’s, Gap, Power, Eye, Speed e Stealing obrigatórios |
| Rebatedor opcional | BABIP e Defense; ausentes, BABIP é estimado e contribuição ZR de Defense é zero. `stealTendency` existe no modelo/importação, sem campo individual visível |
| Arremessador | Posição SP/RP/CL; Ground/Fly EX GB/GB/NEU/FB/EX FB (padrão NEU); Stuff, Movement, Control, Stamina e Hold obrigatórios |
| Arremessador opcional | HRA e BABIP substituem estimativas intermediárias quando preenchidos |

BABIP, HRA e tendência de roubo opcionais são **ratings na escala selecionada**, não taxas estatísticas como .300. Campos opcionais começam nulos. Não há seletor de temporada, quantidade de jogos ou liga; as constantes estão no código.

Nome vazio: `Invalid input! Name cannot be left blank.` Posição `-`: `Invalid input! Position cannot be left blank.` Rating obrigatório vazio: `Invalid input! Ratings cannot be left blank.` Faixas e múltiplos de cinco são validados pela conversão. Erros aparecem abaixo dos botões, após pequeno atraso. Time inexistente em dados adulterados não tem fallback seguro.

## Resultados

Rebatedores projetam 150 jogos e 600 PA; apresentam Name, Team, Pos, Bats, G, PA, AB, H, 2B, 3B, HR, BB, SO, AVG, OBP, SLG, ISO, OPS, OPS+, BABIP, WAR, SB e CS. Fatores de estádio variam por lateralidade; switch hitter usa média ponderada 2/3 L e 1/3 R para AVG/HR.

Arremessadores apresentam Name, Team, Pos, G, GS, IP, HA, HR, R, ER, BB, K, ERA, AVG, BABIP, WHIP, HR/9, BB/9, K/9, K/BB, ERA+, FIP e WAR. SP usa fórmulas de titular; RP e CL compartilham fórmulas de relevo. Stamina afeta volume, Movement/Ground-Fly afetam estimativas quando não substituídas e Hold afeta corridas por roubo.

Contagens são arredondadas na interface; taxas usam três casas sem zero inicial abaixo de 1, WAR e razões por nove usam uma casa, ERA/FIP/WHIP duas. IP usa parte inteira e outs segundo `displayIP`, não uma simples casa decimal de innings. CSV contém valores brutos. Consulte [fórmulas](../calculations.md).

## Edição, duplicação e limpeza

Clique na linha para editar; os ratings internos são reconvertidos para a escala atual. A linha é removida dos arrays em memória durante edição e Save insere o resultado novamente; não é uma transação com rollback garantido. Target List pode mover o resultado. Duplicate Player envia sem limpar o formulário, permitindo outra submissão; não confunda com cópia imediata mantendo obrigatoriamente o original na tabela. Delete no formulário remove o jogador em edição e persiste. Clear limpa formulário e erro, sem apagar toda a tabela; durante edição a interface oferece Delete em seu lugar.

Cada tipo tem armazenamento separado. Ao recarregar, jogadores são reidratados e recalculados com fórmulas e fatores atuais, portanto projeções antigas podem mudar. A escala altera interpretação de novas entradas; não converte automaticamente números já digitados. Mais detalhes em [listas e tabela](lists-and-table.md), [importação](batch.md) e [persistência](../data-and-storage.md).
