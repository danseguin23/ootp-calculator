# Convenções de planos

Este arquivo define uma convenção de trabalho para humanos e agentes; não é executado automaticamente por uma ferramenta.

Crie um plano para mudanças que afetem várias funcionalidades, fórmulas, formatos de importação/exportação ou compatibilidade do armazenamento. Uma correção textual pequena normalmente dispensa plano. Planos concretos podem ficar em `docs/plans/`; crie essa pasta quando houver um plano real. Sugestões e defeitos documentados não são trabalho aprovado.

## Modelo

```markdown
# Nome da mudança

## Estado
Proposta / aprovada pelo responsável / em andamento / concluída.

## Objetivo e escopo
Resultado pretendido, itens incluídos e limites.

## Comportamento atual e esperado
Exemplo concreto de entrada, saída atual e saída esperada.

## Impacto
Arquivos, funcionalidades, documentação, fórmulas e dados afetados.

## Compatibilidade
Dados antigos, migração, formatos externos e recuperação quando aplicável.

## Etapas e progresso
- [ ] Inspecionar dependências e registrar comportamento atual.
- [ ] Implementar etapas específicas da mudança.
- [ ] Validar e atualizar documentação.

## Aceitação e validação
Resultados observáveis, exemplos numéricos e comandos a executar.
Registrar separadamente passou, falhou, não executado e não verificado.

## Riscos e dúvidas
Decisões pendentes, impactos e pressupostos.
```
