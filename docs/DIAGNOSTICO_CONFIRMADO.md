# Diagnóstico confirmado — Luana Cruz Advocacia

**Status:** confirmado pela responsável em 16/11/2026.  
**Evidência da confirmação:** resposta explícita “Confirmo” nesta conversa.

## Escritório e identidade

- Nome: Luana Cruz Advocacia.
- OAB informada: OAB/SP 415.473.
- Marca existente: logo transparente e paleta creme, cobre/dourado e preto no diretório `assets/`.
- Domínio e e-mail do escritório: Locaweb; domínio informado `www.luanacruzadvocacia.com.br`.
- Destino do código: repositório GitHub privado próprio.
- Hospedagem escolhida após o kit: Railway. Recursos pagos só poderão ser criados depois de apresentar estimativa atual e obter autorização específica.

## Pessoas e acesso

- Hoje a responsável acumula atendimento, execução, revisão e administração.
- No próximo ano, prevê contratar pessoas para atendimento, execução, revisão e administração.
- Preferência confirmada: todos os perfis poderão ver todos os registros. Responsabilidades e ações por função deverão ser distintas; permissões de alteração ainda precisam ser detalhadas antes de habilitar contas de equipe.
- Não criar usuários ou pessoas fictícias.

## Fluxo prioritário confirmado

**Processo → providência → revisão → agenda.**

1. Cadastrar manualmente um processo ou, em fase posterior, receber movimentação por integração autorizada.
2. Conferir a movimentação e decidir se há providência, tarefa ou apenas registro informativo.
3. Encaminhar a tarefa para execução e registrar responsável, prazo interno, prioridade e contexto.
4. Enviar para revisão; se houver correção, registrar motivo, devolver à execução e preservar o histórico.
5. Após aprovação, registrar protocolo/conclusão e manter o processo, o prazo e o histórico pesquisáveis.
6. Vincular agenda ao processo e à tarefa. Uma data de prazo processual só se torna definitiva depois de conferência humana e cálculo determinístico da regra aplicável.

## Módulos e integrações

- Preservar: leads, processos, agenda, documentos, teses e peças, campanhas, conexões e identidade visual existentes.
- Primeira entrega: tarefas e fluxo de execução/revisão integrado aos processos e agenda.
- Fases posteriores: login e usuários com papéis de equipe; push de fontes oficiais/integrações judiciais; sincronização Google Agenda; caixa de entrada de redes sociais; campanhas integradas.
- APIs de tribunais, redes sociais, Google e assinatura eletrônica não estão conectadas nem foram validadas. Usar somente meios oficiais autorizados e ativar uma integração de cada vez.

## Dados, operação e segurança

- Projeto atual: aplicação Node.js/Express com armazenamento local no navegador para demonstração e servidor autenticado com banco SQLite em volume configurado.
- Não há implantação em produção confirmada, remoto GitHub ou commit inicial.
- Antes de dados reais: adotar PostgreSQL gerenciado em produção, autenticação individual, papéis, auditoria, backups e recuperação testada; não publicar segredos ou registros reais no Git.
- Não criar gastos recorrentes sem estimativa e autorização concreta.

## Critérios objetivos de sucesso da primeira entrega

- Um processo pode gerar ou receber uma providência e abrir uma tarefa vinculada.
- A tarefa tem executor, revisor, status, prioridade, datas e histórico.
- A transição para revisão, devolução com motivo e aprovação ficam registradas.
- Data de prazo revisada é vinculada à agenda com número do processo, tribunal e sistema.
- Usuários conseguem buscar tarefas concluídas e consultar o histórico.
- Dados persistem após reinício; permissões, fluxos de erro/vazio e desktop/celular são verificados.

## Premissas e pendências

- Todos veem todos os registros, conforme escolha explícita da responsável.
- A Locaweb permanece como provedora de domínio/e-mail; a hospedagem do aplicativo será preparada para Railway conforme instrução confirmada.
- Prazos calculados precisam de validação humana; integração ou movimentação não substitui conferência jurídica.
- Pendentes: matriz de ações de cada papel; política de backup/retenção; estimativa e autorização de plano Railway; credenciais via fluxo seguro; vinculação GitHub e publicação.
