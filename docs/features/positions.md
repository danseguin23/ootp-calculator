# Calculadora de posições

Rota `/position-calculator`; fontes: [view](../../src/views/PositionCalculator.vue) e [Fielder](../../src/data-classes.js).

## Fluxo e entradas

Selecione a escala, preencha ao menos um grupo completo e clique Submit. Grupos independentes: catcher (Blocking, Framing, Arm), infield (Rng, Err, Arm, Turn DP) e outfield (Rng, Err, Arm). Campos começam vazios. Nome fica oculto, pois Save Entry está desativado. Não há seletor ativo de braço de arremesso.

Altura começa em pés/polegadas; Use Centimetres alterna campos e persiste a preferência. Conversão: `2.54 × (12 × pés + polegadas)`. Altura só afeta 1B; sem ela, 1B mostra `-`. O modelo limita altura acima de 215 cm. Não há mínimo explícito nem conversão automática dos campos ao alternar unidades.

As seis escalas e limites são descritos em [cálculos](../calculations.md). A validação do grupo usa valores truthy, portanto zero não completa um grupo. Sem grupo completo: `Invalid input! At least one rating group must be filled out.` Ratings inválidos seguem mensagens da conversão; o parâmetro nullable permite campos vazios nos grupos não preenchidos. Não há garantia de validação uniforme de grupos parciais.

## Saída e ações

Oito linhas fixas: Catcher, First Base, Second Base, Third Base, Shortstop, Left Field, Center Field, Right Field. Exibe nota máxima estimada, cor por rating interno e WAR defensivo de temporada com uma casa decimal. Grupo não calculado produz rating interno zero e aparece como `-`. A nota exibida tem piso no mínimo da escala, sem teto visual explícito. Clear apaga formulário, saída e erro; mantém a escala e preferência de unidades.

Submit emite `calculate-position`. A preferência `use-centimetres` é persistida. O código lê `fielding` antigo, mas não existe interface ativa para salvar/editar/excluir jogadores defensivos. Métodos e botões condicionais de edição não constituem fluxo acessível completo.

O texto da tela informa que canhotos não jogam C/2B/3B/SS; o modelo atual não recebe lateralidade e não aplica essa restrição. Não assuma que os resultados já foram filtrados para canhotos.

## Exemplo verificado

Escala 20–80, todos os dez ratings 60, altura 6 pés e 0 polegadas:

| Posição | Nota | WAR |
| --- | --- | --- |
| C | 60 | 1.8 |
| 1B | 70 | -0.2 |
| 2B | 65 | 1.3 |
| 3B | 60 | 0.5 |
| SS | 55 | 1.1 |
| LF | 70 | -0.1 |
| CF | 50 | -0.2 |
| RF | 65 | 0.1 |

Confirmado em Chromium nesta tarefa. Fórmulas em [cálculos](../calculations.md); WAR é estimativa do projeto, não validação contra OOTP.
