---
name: candia-validar
description: Verifica fluxo, permissões, publicação Railway e restauração antes de entrega; use em homologação e release. Não marca aceite humano por conta própria.
license: MIT
metadata:
  author: Kit Cândia
  version: "2.0.0"
---
Leia critérios do diagnóstico e itens 14, 15 e 17 do original em kit/KIT-CANDIA-V2.md. Execute testes, navegador desktop/móvel, API com perfis distintos, persistência após reinício/deploy e backup restaurado em destino separado. Inspecione as telas reais conforme complemento F e compare com docs/DESIGN.md. Confira healthcheck, commit publicado, logs sem segredos e rollback documentado. Verifique links Obsidian/README e acesso ao repositório correto. Registre cada evidência em docs/HOMOLOGACAO.md; não use existência de arquivos como prova funcional. Se não há navegador, registre pendência e tente capacidade autorizada disponível; não declare inspeção visual feita.
Verificação antes da entrega: URL externa acessível; login/recuperação/desativação e anexos protegidos; fluxo principal completo; histórico/persistência; backup recuperável; limites/custos conhecidos; usuário recebeu roteiro simples. Aceite humano requer resposta real. Se algo obrigatório falhar, corrija ou registre bloqueio, sem rótulo de concluído. Para corrigir código use candia-construir; para contexto perdido use candia-retomar.
Feedback: registrar melhoria do método no projeto para revisão pelo autor do kit.
Kit Cândia — MIT.