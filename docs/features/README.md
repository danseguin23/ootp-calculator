# Inventário e matriz de funcionalidades

A matriz cobre os fluxos ativos encontrados nas rotas, componentes e modelos, além dos controles legados. **Navegador** indica execução em Chromium nesta tarefa; **código** indica inspeção estática, sem afirmar execução completa. Itens não verificados são explicitados. As referências de fontes abaixo são caminhos relativos à raiz do repositório; links detalhados constam nos documentos.

| Funcionalidade | Arquivos responsáveis | Documentação | Verificação |
| --- | --- | --- | --- |
| Home, navegação, redirect e 404 | src/router/index.js, src/views/Home.vue, src/components/Navbar.vue | [Navegação](navigation.md) | Código; calculadoras abertas no navegador |
| About, contato e doação externa | src/views/About.vue, src/components/AppFooter.vue | [Navegação](navigation.md) | Código e links About no navegador; ações externas não executadas |
| Grupos defensivos e altura | src/views/PositionCalculator.vue, src/data-classes.js | [Posições](positions.md) | Navegador: dez ratings 60, altura 6/0 |
| Notas, cores e WAR defensivo | src/data-classes.js, src/util.js | [Cálculos](../calculations.md) | Saída numérica reproduzida; cores por código |
| Escalas, múltiplos e faixas | src/util.js, src/components/Projections/RatingsScale.vue | [Cálculos](../calculations.md) | Código; 20–80 exercitada |
| Unidade de altura | src/views/PositionCalculator.vue | [Posições](positions.md) | Código; persistência da unidade não executada |
| Entrada individual batting | src/components/Projections/InputSingle.vue, src/data-classes.js | [Projeções](projections.md) | Navegador: SS com ratings 50 |
| Entrada individual pitching | mesmos módulos | [Projeções](projections.md) | Navegador: SP com ratings 50 |
| BABIP/HRA/defesa opcionais | src/data-classes.js, src/components/Projections/InputSingle.vue | [Projeções](projections.md) | Campos preenchidos no smoke; ausência/estimadores por código |
| Parque, lateralidade, Ground/Fly, titular/relevo | src/data-classes.js, public/teams.json | [Cálculos](../calculations.md) | Código; parque neutro e SP executados |
| Lote TSV, aliases, potenciais e Help | src/components/Projections/InputBatch.vue | [Importação](batch.md) | Navegador: lote batting mínimo reordenado; aliases/Help por código |
| Criar, selecionar e renomear listas | src/components/Projections.vue, src/components/MoreOptions.vue | [Listas](lists-and-table.md) | Navegador: criar duas listas; renomear por código |
| Excluir lista e cancelar confirmação | mesmos módulos | [Listas](lists-and-table.md) | Defeito reproduzido: cancelar apagou jogadores |
| Edição e Save | src/components/Projections.vue, src/components/Projections/InputSingle.vue | [Projeções](projections.md) | Navegador: ambos os tipos |
| Duplicate Player e Delete do formulário | mesmos módulos | [Projeções](projections.md) | Código; fluxo completo não executado |
| Clear e alternância Single/Batch | mesmos módulos, InputBatch.vue | [Projeções](projections.md) | Código |
| Seleção, exclusão coletiva e confirmação | src/components/Projections/ProjectionTable.vue | [Listas](lists-and-table.md) | Código; exclusão coletiva não executada |
| Ordenação, formatação e realce | ProjectionTable.vue, src/util.js | [Listas](lists-and-table.md) | WAR/formatos observados; alternância e realce por código |
| Download CSV | ProjectionTable.vue | [Listas](lists-and-table.md) | Navegador: ambos os nomes de arquivo; escape por código |
| Salvar, recarregar e recalcular jogadores | src/components/Projections.vue, src/data-classes.js | [Dados](../data-and-storage.md) | Navegador: ambos os tipos |
| Equipe, escala, listas e preferências | Projections.vue, RatingsScale.vue, PositionCalculator.vue | [Dados](../data-and-storage.md) | Código; recarga de jogadores executada |
| Temas, Welcome, Donate e Save Entry legados | App.vue, Navbar.vue, Welcome.vue, Donate.vue, PositionCalculator.vue | [Navegação](navigation.md) | Código: controles desativados |
| Analytics e recursos CDN | src/main.js, public/index.html | [Arquitetura](../architecture.md) | Chamadas por código; entrega externa não verificada |
| Layout responsivo e rolagem | App.vue, InputSingle.vue, ProjectionTable.vue | [Navegação](navigation.md) | Código; auditoria visual ampla não realizada |
| Build, dev server e hosting SPA | package.json, firebase.json | [Desenvolvimento](../development.md) | Build/servidor Linux; deploy não executado |

O código é a fonte do comportamento implementado. A documentação não aprova mudanças para corrigir os defeitos encontrados. Confira [evidências e roteiro](../testing.md) e [problemas conhecidos](../troubleshooting.md).
