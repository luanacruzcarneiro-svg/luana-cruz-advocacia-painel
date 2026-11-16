# Homologação

Status inicial dos cenários: **não testado**. A confirmação do diagnóstico não equivale a aceite do sistema.

| Cenário | Ambiente | Resultado esperado | Observado | Evidência | Pendência |
|---|---|---|---|---|---|
| Diagnóstico | Conversa, 16/11/2026 | Fluxo e equipe compreendidos e confirmados | Confirmado pela titular | Resposta explícita “Confirmo” | Nenhuma |
| Criar andamento e tarefa vinculada | Local | Dados completos e vinculados ao processo | Não testado nesta fase | Pendente | Implementação |
| Execução → revisão | Local | Mudanças de estado e histórico preservados | Não testado | Pendente | Implementação |
| Devolução com motivo e reenvio | Local | Motivo preservado e tarefa retorna à execução | Não testado | Pendente | Implementação |
| Prazo vinculado à agenda | Local | Vínculo ao processo, tribunal e sistema | Não testado | Pendente | Implementação |
| Acesso sem autenticação | Local/produção | API e telas privadas bloqueadas | Não testado nesta fase | Pendente | Teste de segurança |
| Persistência após reinício/deploy | Local/produção | Registros permanecem | Não testado nesta fase | Pendente | PostgreSQL/backup |
| Desktop e celular | Navegador real | Sem cortes; ações acessíveis | Não testado nesta fase | Pendente | Inspeção visual |
| Deploy Railway | Produção | Health check e URL externa | Não testado; sem projeto | Pendente | Aguardar configuração e autorização de custo |
