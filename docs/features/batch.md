# Importação em lote

Em qualquer projeção, escolha Batch Input, equipe, lista alvo e escala. No OOTP, abra a visão de ratings, use Report → Write report to disk, copie a tabela **com cabeçalhos**, cole no textarea e envie. Help expande/recolhe essas instruções. Trata-se de colagem TSV (tabulações), sem upload de arquivo ou importação CSV implementados. Fonte: [InputBatch.vue](../../src/components/Projections/InputBatch.vue).

Remove linhas externas sem tabulações, normaliza espaços dos cabeçalhos e remove o sufixo ` ▾`. Mapeia por nome, permitindo reordenar colunas e ignorar extras. `POS` precisa estar presente. Os candidatos são escolhidos pela presença do cabeçalho, não por conteúdo preenchido.

## Colunas

| Tipo | Obrigatórias | Opcionais especiais |
| --- | --- | --- |
| Batting | POS, B, CON, GAP, POW, EYE, K's, SPE, STE, DEF | BABIP, SR |
| Pitching | POS, STU, MOV, CON, STM, G/F, HLD | HRA, BABIP |

Metadados reconhecidos incluem `#`, Name, Inf, Age, T e OVR; batting também reconhece CON vL/POW vL/CON vR/POW vR/BUN/BFH/SctAcc; pitching STU vL/STU vR/VELO/SctAcc. Alguns campos são carregados ou normalizados sem participar dos cálculos. `Name` não é exigido pelo parser de lote como na entrada individual.

Para CON/GAP/POW/EYE/STU/MOV, prioridade: nome base → nome + ` P` → nome + ` vL` → nome + ` vR`. Para K's: K's → K P → K vL → K vR. São aliases alternativos, não uma projeção separada contra cada mão. Constantes de cabeçalhos potenciais existem, mas o caminho ativo normaliza tudo para o layout atual e passa `potential=false` ao modelo. POT não é automaticamente equivalente a OVR.

DEF é obrigatório e precisa ter conteúdo no lote, embora seja opcional na entrada individual; `-` é aceito como ausência pelo parser opcional do modelo. SR é rating de tendência de roubo. Todas as linhas recebem o time e a lista selecionados. Sucesso retorna à entrada individual e persiste jogadores. Clear apaga texto de entrada. Não há deduplicação por nome.

## Erros e limites

- Vazio: `Input cannot be blank!`
- Sem cabeçalho POS: `Missing header row! ...`
- Coluna requerida ausente: `Missing required column for stat: ...`
- Célula requerida vazia: `Missing value for required column: ...`
- Rating inválido: mensagens da conversão.

Uma falha impede o envio da coleção ao pai; não há importação parcial persistida deliberada. O catch usa `error.indexOf`, que pode falhar para objetos Error nativos; esse risco foi identificado por inspeção e não reproduzido nesta tarefa. Não há parser de aspas/escape TSV. Compatibilidade com todas as versões/exportações do OOTP não verificada.
