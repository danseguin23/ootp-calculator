# OOTP Calculator

Utilitário comunitário para auxiliar decisões no [OOTP Baseball](https://www.ootpdevelopments.com/out-of-the-park-baseball-home/), sem vínculo oficial com OOTP Developments. O README anterior identifica a aplicação como versão “2.1.something”; o pacote declara `0.1.0`. O endereço histórico divulgado é [ootpcalculator.com](https://ootpcalculator.com/); disponibilidade e equivalência com este checkout não verificadas. Versões anteriores foram indicadas em outras branches.

## Funcionalidades

- **Position Calculator**: estima notas máximas e WAR defensivo para oito posições.
- **Batter Projections**: projeta estatísticas de temporada a partir de avaliações de rebatedores.
- **Pitcher Projections**: projeta estatísticas de arremessadores.
- Entrada individual e em lote, listas locais, edição, duplicação, ordenação, exclusão e CSV nas projeções.

As projeções se apresentam como adequadas a saves MLB de 2026. São estimativas da implementação, sem garantia de reprodução dos resultados do jogo.

## Instalação e execução

Com Node.js e npm disponíveis, na raiz do checkout:

```bash
npm ci
npm run serve
```

O segundo comando acima é para Bash/Linux. No PowerShell:

```powershell
npm ci
$env:NODE_OPTIONS="--openssl-legacy-provider"
npx vue-cli-service serve --port 8081
```

A aplicação usa a porta 8081. Veja versões verificadas, build e limitações em [Desenvolvimento](docs/development.md).

## Documentação

- [Inventário e matriz de funcionalidades](docs/features/README.md)
- [Arquitetura](docs/architecture.md)
- [Cálculos](docs/calculations.md)
- [Dados e armazenamento](docs/data-and-storage.md)
- [Desenvolvimento](docs/development.md)
- [Testes e evidências](docs/testing.md)
- [Solução de problemas e defeitos conhecidos](docs/troubleshooting.md)
- [Instruções para agentes](AGENTS.md)
- [Convenções de planos](PLANS.md)

## Contribuições e licença

Contribuições são bem-vindas. O projeto nasceu como ferramenta pessoal; consulte as responsabilidades dos módulos antes de modificar fórmulas. A licença está em [LICENSE.md](LICENSE.md).
