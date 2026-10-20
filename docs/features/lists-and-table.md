# Listas, tabela e CSV

Fontes: [Projections.vue](../../src/components/Projections.vue), [ProjectionTable.vue](../../src/components/Projections/ProjectionTable.vue), [MoreOptions.vue](../../src/components/MoreOptions.vue) e [util.js](../../src/util.js).

## Listas

Cada tipo tem listas próprias. Abas selecionam a lista exibida e atualizam Target List; este seletor define o destino da próxima submissão. O botão `+` cria lista; Enter ou perda de foco salva, Escape cancela. Nomes são convertidos para maiúsculas, sem trim explícito. Vazio, duplicado e `__` são rejeitados; este último mostra `AAAAHHHHH!!!!`. Espaços consecutivos não são normalizados. Renomear atualiza a associação dos jogadores e persiste.

O menu `...` oferece Rename/Delete. A última lista tem Delete desabilitado visualmente. Lista vazia é excluída sem confirmação; com jogadores pede confirmação. **Defeito confirmado por inspeção:** o filtro que remove jogadores e salva fica fora do `if (conf)`; cancelar ainda remove os jogadores, embora preserve o nome da lista. Não use esse cancelamento como mecanismo de segurança. Veja [problemas conhecidos](../troubleshooting.md).

Ao carregar, jogadores sem lista recebem `DEFAULT LIST`; listas são reconstruídas dos jogadores quando não há lista salva. A seleção anterior vem de localStorage, sem validação robusta contra lista inexistente. Listas não são compartilhadas entre batting/pitching.

## Ordenação e seleção

A tabela começa em WAR decrescente. Clicar cabeçalho ordena pelo valor bruto; repetir inverte sentido. Textos como Name/Team/Pos começam crescentes; SO de batting e métricas de corridas/hits cedidos começam crescentes; demais métricas seguem `fields` em util.js. A ordenação também altera o array geral em memória; só gravar jogadores torna essa ordem persistida. Não existe campo persistido específico para preferência de ordenação.

Checkbox de linha seleciona sem abrir edição; checkbox do cabeçalho alterna todas as linhas visíveis. Delete Selected exclui seleção; sem selecionados o botão é Delete All e considera a lista exibida. Pede confirmação; nessa ação, cancelar não chama a exclusão no pai. Nenhuma exclusão possui desfazer. Realce temporário identifica jogador novo em certas inserções; não é informação persistida.

## CSV

Download CSV exporta **todos os jogadores da lista visível**, na ordem atual, independentemente dos checkboxes. Nome: `batting-projections.csv` ou `pitching-projections.csv`. Cabeçalhos seguem util.js e dados são propriedades brutas, sem a formatação da tabela; criação local via data URL, sem upload. Botão desabilitado com lista vazia.

**Limitação confirmada no código:** o gerador concatena vírgulas sem escape de aspas, vírgulas ou quebras de linha em nomes/campos. IP exportado é o valor numérico interno, não o texto de outs da tela. CSV não é backup completo: não inclui todos os ratings ou listas e não há reimportação CSV implementada.
