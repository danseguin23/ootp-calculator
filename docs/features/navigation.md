# Navegação, preferências e recursos auxiliares

Home oferece cartões para posições, rebatedores, arremessadores e About. Cabeçalho retorna à home; Navbar aparece nas demais rotas com links às três calculadoras. About explica objetivo, contato e ausência de vínculo oficial. Rotas desconhecidas exibem mensagem 404 da SPA. Rodapé mantém links externos de contato, rede social, código histórico e doação; ações externas e pagamentos não foram executados.

A aplicação força `theme-dark` na inicialização. O método de troca de tema e a chave `theme` existem em Navbar, mas o botão está comentado e o tema salvo não é restaurado. Welcome e o modal Donate não são fluxos ativos: a condição local `welcome` é false e o template de Welcome em Projections está comentado. Não há login, conta, nuvem de jogadores ou seletor de idioma implementados.

Escala é compartilhada entre calculadoras; time é compartilhado entre projeções; unidade de altura fica nas posições. Essas preferências são locais ao navegador/origem. O modo Single/Batch reinicia em Single, pois persistência de `option-input` está comentada. A preferência de unidade não converte automaticamente os campos existentes.

InputSingle observa largura de 960px para aplicar layout; tabelas têm rolagem responsiva. Acessibilidade e todos os tamanhos de tela não foram auditados. Home tenta pré-carregar imagens `*-hover.svg` ausentes de public/img; a existência ausente foi confirmada por inspeção. Links de projeções em About apontam incorretamente para a calculadora de posições.

Fontes: [App.vue](../../src/App.vue), [router](../../src/router/index.js), [Home](../../src/views/Home.vue), [About](../../src/views/About.vue), [Navbar](../../src/components/Navbar.vue), [AppFooter](../../src/components/AppFooter.vue), [RatingsScale](../../src/components/Projections/RatingsScale.vue). Analytics e recursos externos estão descritos em [arquitetura](../architecture.md).
