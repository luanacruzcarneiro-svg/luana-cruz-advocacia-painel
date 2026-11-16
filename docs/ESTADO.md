# Estado do projeto

- Kit Cândia V2 lido e guardado integralmente em `kit/KIT-CANDIA-V2.md`; skills relacionadas preservadas em `kit/skills/` e `.agents/skills/`.
- Diagnóstico confirmado pela titular em 16/11/2026: equipe futura, todos os perfis visualizam todos os registros e fluxo prioritário processo → providência → revisão → agenda.
- Aplicação atual: Node.js/Express, telas anteriores preservadas, sem a calculadora removida por solicitação anterior.
- Módulos: visão geral, leads, processos, tarefas, agenda, documentos, teses e peças, campanhas e conexões.
- Tarefa: vinculável ao processo, responsável e revisor; suporta transições do fluxo, motivo para devolução e histórico. Prazos manuais podem ser vinculados à agenda e ao processo.
- Banco: PostgreSQL com migração versionada para produção; SQLite mantido só para desenvolvimento local.
- Servidor: autenticação, sessão PostgreSQL em produção, endpoint `/health`, validação de origem e proteção CSRF.
- GitHub: sem commits ou remoto; publicação ainda não realizada.
- Railway: definição IaC preparada, ainda não aplicada; nenhum serviço foi provisionado. Conferir plano e custo antes de criar recursos.
- Integrações externas: notícias oficiais consultadas pela Visão geral; acompanhamento de tribunais, Google Agenda, mensagens sociais/WhatsApp e publicação de campanhas não estão conectados.
- Verificação local: Node.js 26, npm 11 e Git disponíveis no computador da titular; `package-lock.json` gerado; instalação informou zero vulnerabilidades após remoção do conector SQLite de sessão local; `node --check` passou para o servidor e quatro testes do fluxo já haviam passado. Servidor ainda não homologado por execução local.
- Próximos marcos: criar repo privado e fazer primeiro push; depois provisionar Railway apenas após conferir plano/custos; homologar serviço, domínio, backups e login antes de dados reais.
- Nenhum segredo, conta externa ou recurso pago foi criado por este projeto nesta etapa.
