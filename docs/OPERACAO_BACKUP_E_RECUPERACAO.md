# Operação, backup e recuperação

## Estado

Não há produção nem rotina de backup configurada. O volume SQLite atual só persiste se o host montar armazenamento persistente; não é o alvo de produção definido no kit.

## Plano antes de dados reais

1. Configurar PostgreSQL e aplicar migrations versionadas.
2. Definir rotina/retensão de backup com o recurso efetivamente disponível no plano Railway escolhido.
3. Registrar responsável por recuperação, frequência e retenção.
4. Fazer backup consistente e restaurá-lo em banco separado, com registros fictícios de verificação.
5. Registrar evidência, duração, contagens e falhas em `HOMOLOGACAO.md`.
6. Não enviar anexos ao Git nem depender do disco temporário do contêiner; usar armazenamento privado persistente.

Custos, disponibilidade do plano e modo de backup precisam ser consultados na documentação/painel Railway atual antes da contratação. Nenhuma rotina será descrita como ativa antes de sua configuração e teste.
