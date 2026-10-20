# Validação e roteiro de testes

## Evidências desta tarefa

Verificação em Linux com Node 24.19.0, npm 11.9.0 e Chromium headless, em contexto de navegador isolado, sem dados pessoais. Não há suíte automatizada configurada no package.json. Scripts temporários de inspeção/navegador ficaram fora do checkout; não foram adicionados testes ou dependências ao projeto.

| Verificação | Resultado |
| --- | --- |
| `NODE_OPTIONS=--openssl-legacy-provider npm run build` | Passou; dist gerado, três avisos de performance e aviso Browserslist antigo |
| Servidor de desenvolvimento | Servidor iniciado no onboarding reutilizado; HTTP e páginas responderam nesta tarefa |
| Position Calculator | Passou; oito resultados em [posições](features/positions.md#exemplo-verificado) |
| Batting individual | Passou; nome Doc batter, SS, time neutro, Bats `-`, todos os campos numéricos visíveis 50 |
| Pitching individual | Passou; nome Doc pitcher, SP, time neutro, NEU, todos os campos numéricos visíveis 50 |
| Download CSV | Eventos de download e nomes batting-projections.csv/pitching-projections.csv confirmados |
| Persistência | Ambos os jogadores reapareceram após recarregar |
| Edição | Nome alterado e Save refletido na tabela em ambos os tipos |
| Console de aplicação no smoke principal | Nenhum pageerror capturado; falhas de recursos externos não equivalem a pageerror |
| Criar listas | Passou: DOC LIST e SECOND criadas com Enter |
| Importação TSV | Passou: batting com cabeçalhos mínimos reordenados, DEF `-` e nome Batch Doc |
| Cancelar exclusão de lista preenchida | Defeito reproduzido: arrays de jogadores vazios após dismiss, nomes DOC LIST/SECOND preservados |
| Links de About | Navegador confirmou ambos os links here das projeções em /position-calculator |
| PowerShell/Windows | Não executado; sintaxe revisada e falha de export relatada pelo usuário |
| Deploy, analytics e pagamentos | Não executados |

O roteiro temporário inicialmente usou índice incorreto do seletor de posição e depois não aguardou a entrada no estado de edição. Esses erros de automação foram corrigidos e os fluxos passaram; não foram registrados como defeitos da aplicação.

## Exemplos reproduzidos de projeção

Na escala 20–80, preencha **todos** os campos numéricos visíveis com 50, inclusive overrides opcionais, mantendo time `-`. Não confunda este caso com campos opcionais vazios.

- Batter, SS, Bats `-`: G 150, PA 600, AB 543, H 130, 2B 25, 3B 2, HR 18, BB 51, SO 137, AVG .240, OBP .313, SLG .393, ISO .153, OPS .706, OPS+ 97, BABIP .290, WAR 2.1, SB 4, CS 2.
- Pitcher, SP, Ground/Fly NEU: G 30, GS 30, IP exibido 156.3, HA 144, HR 18, R 74, ER 69, BB 55, K 157, ERA 3.94, AVG .239, BABIP .294, WHIP 1.27, HR/9 1.1, BB/9 3.1, K/9 9.0, K/BB 2.9, ERA+ 105, FIP 3.83, WAR 3.3.

IP 156.3 é a saída observada da implementação de displayIP; não deve ser reinterpretado como notação válida de outs sem revisão da fórmula de apresentação. A validação compara comportamento atual, não sua correção estatística.

## Roteiro manual complementar

1. Abrir home, About, `/home` e rota inexistente. Conferir destino real dos links.
2. Posições: enviar vazio, um grupo completo, grupos parciais; variar altura, alternar cm e escala, recarregar; conferir Clear.
3. Projeções: campos obrigatórios vazios, 20–80 não múltiplo de cinco, limites superiores/Stuff, ausência e presença de overrides, SP/RP/CL e parques/L/R/S.
4. Lote: colar TSV reordenado com cabeçalho; testar aliases P/vL/vR, coluna faltante, célula vazia, linha inválida, cabeçalho ausente, opcionais e metadados. Conferir erro e ausência de gravação parcial.
5. Listas: criar/renomear, Enter/Escape/blur, nome vazio/duplicado/`__`, selecionar destino diferente, excluir vazia e preenchida. Reproduzir cancelamento apenas em contexto descartável devido ao defeito conhecido.
6. Edição: Save, Duplicate, Delete, mudança de modo e mudança de lista; conferir original, memória e conteúdo persistido após recarregar.
7. Tabela: ordenação nos dois sentidos, checkboxes, seleção total, Delete Selected/All e cancelamento. CSV: abrir conteúdo, comparar floats/ordem e testar nome com vírgula, aspas e quebra de linha.
8. Recuperação: em contexto descartável, simular JSON corrompido, time inexistente e indisponibilidade de teams.json; registrar resultado sem apagar dados reais.

Esses passos complementares são um roteiro, não afirmação de execução. Veja [matriz](features/README.md) para cobertura por funcionalidade. Não foi verificada precisão contra OOTP, acessibilidade, responsividade em toda largura ou compatibilidade ampla entre navegadores.
