# Arquitetura e implantação

## Estado implementado

- Frontend: `index.html`, `app.js`, `styles.css`, com telas privadas servidas pelo backend; autenticação em `login.html` e `login.js`.
- Backend: Node.js 24 + Express; sessão HTTP-only em PostgreSQL em produção e memória temporária no modo local; CSRF, limite de tentativas e senha hash.
- Persistência: `db.js` seleciona PostgreSQL quando `DATABASE_URL` existe e SQLite somente fora de produção. Produção sem PostgreSQL falha explicitamente.
- PostgreSQL: `migrations/001-initial.sql` cria usuários e estado JSONB versionado; `scripts/migrate.js` executa a migração.
- Saúde: `/health` verifica o banco e responde 200 apenas quando está disponível.
- Infraestrutura alvo: `.railway/railway.ts` descreve PostgreSQL, aplicação, migração pré-deploy, health check, variáveis e domínio configurado.
- Git: repositório local sem commits ou remoto. GitHub privado ainda não criado/conectado.

## Implantação pendente

Não há projeto Railway, banco remoto, domínio verificado ou URL de produção. O Railway IaC está preparado, mas não aplicado. Antes de provisionar, revisar preço/plano e obter autorização específica para custos. Depois da criação, validar conexão privada banco-app, variáveis, health check, login, persistência, backup/restauração, DNS e certificado HTTPS.

O deploy deve usar o repositório privado autorizado. Não use GitHub Pages: o backend precisa executar Node.js e as telas/dados devem exigir autenticação.

## Dados e migração

O schema Postgres permite usuários e um estado compartilhado do escritório com controle de versão otimista. Todas as categorias de estado aceitas são validadas pela API. SQLite permanece como opção local de desenvolvimento; ainda não existe processo para importar automaticamente um banco SQLite existente, nem foi encontrado banco local confirmado nesta auditoria. Uma migração de dados reais deve começar com cópia de segurança verificada e reconciliação de contagens.

Uploads de documentos não foram implementados como armazenamento remoto persistente. O módulo atual não deve ser tratado como repositório de anexos sensíveis até existir armazenamento privado com controle de acesso, limites e política de retenção.

## Segurança e trabalho futuro

- Os papéis `admin`, `atendimento`, `execucao` e `revisao` são registrados; todos veem todos os registros conforme decisão confirmada. Restrições de ações por papel ainda não estão aplicadas.
- Gestão de usuários pela interface e recuperação segura de senha pendentes.
- Backup automatizado, política de retenção e teste de recuperação pendentes.
- Trilhas locais registram transições de tarefas; auditoria central de acesso/alterações ainda pendente.
- Google Agenda, fontes processuais, redes sociais, WhatsApp e publicação de campanhas não estão conectados.
