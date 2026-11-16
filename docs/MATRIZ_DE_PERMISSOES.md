# Matriz de permissões

## Visibilidade confirmada

Todos os perfis da equipe poderão visualizar todos os registros.

## Ações propostas — confirmar antes de ativar equipe

| Ação | Atendimento | Execução | Revisão | Administração |
|---|---:|---:|---:|---:|
| Consultar clientes, processos e tarefas | Sim | Sim | Sim | Sim |
| Criar/editar lead e dados de atendimento | Sim | Consultar | Consultar | Sim |
| Criar/editar providência atribuída | Consultar | Sim | Consultar | Sim |
| Enviar tarefa para revisão | Não | Sim | Não | Sim |
| Aprovar ou devolver com motivo | Não | Não | Sim | Sim |
| Gerenciar usuários/configuração | Não | Não | Não | Sim |

Esta tabela é uma proposta, não configuração ativa. Ações devem ser protegidas no backend. Hoje há autenticação individual básica, mas não há interface de gestão de usuários nem papéis aplicados a registros.
