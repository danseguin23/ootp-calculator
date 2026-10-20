# Arquitetura

Aplicação de página única, sem servidor de cálculo próprio. [main.js](../src/main.js) cria o app Vue, inicializa Firebase Analytics, disponibiliza `$analytics` e `$instance` e monta o router em `#app`. A configuração Firebase existente não é reproduzida aqui. Não há autenticação de usuários implementada.

[App.vue](../src/App.vue) fornece cabeçalho, navegação fora da home, área de rotas e rodapé; aplica tema escuro. Os estilos globais vivem principalmente nesse arquivo e nos componentes.

## Rotas

| Caminho | Responsável | Comportamento |
| --- | --- | --- |
| `/` | Home.vue | Cartões para as três calculadoras e About |
| `/home` | router | Redireciona para `/` |
| `/position-calculator` | PositionCalculator.vue | Cálculo defensivo |
| `/batter-projections` | BatterProjections.vue | Projections com tipo batting |
| `/pitcher-projections` | PitcherProjections.vue | Projections com tipo pitching |
| `/about` | About.vue | Apresentação, contato e ressalvas |
| qualquer outra | NotFound.vue | Mensagem 404 dentro da SPA |

Fonte: [router](../src/router/index.js). Usa `createWebHistory`; hospedagem precisa devolver `index.html` para rotas internas. [firebase.json](../firebase.json) publica `dist` com rewrite global. Deploy não foi executado.

## Fluxo de dados

`getTeams()` carrega `/teams.json` por Axios. `Projections` aguarda os fatores, reidrata jogadores em classes e recalcula estatísticas; depois monta listas e tabela. Falhas de fetch/JSON não têm tratamento explícito nessa cadeia.

`InputSingle` ou `InputBatch` entrega `{ players }` ou `{ error }`. Batter/Pitcher validam entradas, convertem escalas e calculam. O pai insere na lista alvo e grava localStorage. `ProjectionTable` apresenta e ordena campos definidos em `util.js`, encaminha edição/exclusão ao pai e gera CSV.

`PositionCalculator` cria um Fielder; este converte ratings e calcula oito posições, WAR e cores. O componente apresenta valores ou `-`, sem lista de jogadores ativa.

## Componentes auxiliares

- RatingsScale: seis escalas e preferência compartilhada.
- Checkbox: controle visual com estado próprio, usado para unidades e seleção.
- MoreOptions: menu contextual Rename/Delete das listas.
- HomeLink: cartões com router-link; Navbar: navegação principal.
- AppFooter: contato, rede social, código histórico e doação externa.
- Header e RouterView não participam das rotas/montagem atuais; RouterView está vazio.
- Welcome e modal Donate existem, mas os caminhos de exibição estão desativados. O link de doação do rodapé permanece ativo.

## Integrações

Firebase Analytics recebe eventos de cálculo, entrada, edição, exclusão, listas, escala, equipe, unidades, download e modal de doação quando chamado. A entrega dos eventos ao serviço não foi verificada. Bootstrap por CDN e Google Fonts vêm de `public/index.html`; recursos visuais locais vêm de `public/img/`. Dependências MUI estão declaradas, sem uso identificado nos componentes lidos. Não há sincronização remota dos jogadores implementada.
