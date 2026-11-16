# Luana Cruz Advocacia — painel interno

Aplicativo interno com a identidade visual Luana Cruz Advocacia. O painel reúne leads, processos, tarefas, agenda, documentos, teses e peças, campanhas e conexões. O fluxo de trabalho prioritário é **processo → providência → revisão → agenda**. As telas existentes foram preservadas; a calculadora bancária foi retirada da navegação conforme solicitado anteriormente.

## Estado atual

- Interface em português, responsiva e com a paleta creme, preto e cobre da marca.
- Login sem cadastro público, senhas armazenadas com bcrypt e sessão protegida.
- Tarefas associadas ao processo, com responsáveis, revisão, transições de etapa e registro de alterações.
- Andamentos manuais podem gerar um item ligado à agenda quando a data final for informada. A data do prazo deve ser conferida pela equipe.
- PostgreSQL é obrigatório em produção; SQLite está disponível somente para desenvolvimento local.
- Fontes de notícias judiciais oficiais aparecem na Visão geral.

Tribunais, redes sociais, WhatsApp e Google Agenda ainda não estão conectados. Nenhum push judicial, mensagem ou alteração de agenda externa é recebido ou enviado automaticamente nesta versão. Essas conexões dependem de APIs oficiais, contas e credenciais próprias e deverão ser homologadas antes de uso.

## Requisitos e desenvolvimento local

Requer Node.js 24 LTS e npm. Na pasta do projeto:

```powershell
npm install
$env:SESSION_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:DATA_DIR = (Join-Path (Get-Location) 'data')
npm run user:add
npm start
```

Abra `http://localhost:3000`. `user:add` cria um acesso individual e solicita perfil `admin`, `atendimento`, `execucao` ou `revisao`. No momento, os perfis estão registrados para organização; todos os usuários autenticados veem os registros, como definido no diagnóstico. Não existe cadastro público.

Para rodar os testes automatizados do fluxo de tarefas: `npm test`. Para validar a sintaxe dos scripts: `node --check server.js` e os demais arquivos JavaScript.

## GitHub privado e Railway

O percurso decidido é **repositório privado no GitHub + aplicação e PostgreSQL no Railway**. O repositório ainda não foi criado nem recebeu commits. Não use GitHub Pages: não executa o backend e não é adequado para este painel interno.

Depois de confirmar a conta GitHub e criar o repositório privado, conecte a origem Git ao serviço Railway. O arquivo `.railway/railway.ts` registra a aplicação, o PostgreSQL, a migração pré-deploy, a checagem `/health` e o domínio pretendido. Ele ainda não foi aplicado. No Railway, configure o serviço a partir do repositório privado e confira a vinculação do domínio e das variáveis antes de liberar o acesso.

Variáveis esperadas no serviço:

- `NODE_ENV=production`
- `PUBLIC_ORIGIN=https://www.luanacruzadvocacia.com.br`
- `DATABASE_URL` fornecida pela conexão privada do PostgreSQL Railway
- `SESSION_SECRET` forte, aleatório e guardado somente no gerenciador de segredos do Railway
- `PORT` é fornecida pelo Railway

O comando de migração de banco é executado antes do deploy (`npm run db:migrate`). A aplicação escuta a porta injetada pelo Railway. O domínio está registrado no arquivo de infraestrutura como intenção, mas a validação DNS e o certificado HTTPS precisam ser confirmados no painel do serviço.

### Publicação segura

1. Revise o conteúdo e confirme que não há dados reais, arquivos `.env`, banco local, credenciais ou tokens no repositório.
2. Crie o repositório como privado e faça o primeiro push pela conta autorizada.
3. Conecte o repositório no Railway e revise os serviços declarados.
4. Antes de provisionar recursos, confira o plano, o custo mensal mínimo, cobrança por uso, limites e procedimento de desligamento. Nenhum recurso pago foi criado por este projeto até agora.
5. Configure segredos e PostgreSQL no Railway; não grave esses valores no GitHub.
6. Faça deploy e confira `/health`, login, persistência após reinício, agenda e tarefas em homologação com dados fictícios.
7. Configure DNS do domínio na Locaweb conforme os registros apresentados pelo Railway e valide HTTPS.
8. Configure backups e teste restauração antes de cadastrar informações reais de clientes.

## Usuários, dados e limitações operacionais

Todos os perfis atuais podem ver todos os registros. Regras de edição por equipe, administração visual de contas e recuperação automática de senha ainda não foram ativadas. Não compartilhe um usuário entre pessoas: crie um login individual para cada integrante. Antes de cadastrar a equipe, defina os limites de ação e revisão de cada perfil.

O painel ainda não oferece conexão universal com tribunais. O acompanhamento nacional exige fontes oficiais ou fornecedores autorizados e homologação por tribunal e sistema. O Google Agenda exige OAuth e sincronização segura no servidor. Caixa de entrada social e campanhas publicadas exigem acesso aprovado às APIs de cada plataforma. Campanhas registradas no painel não são publicadas automaticamente.

O app é uma base de trabalho e não uma garantia absoluta de sigilo ou uma auditoria formal de segurança. Proteja contas, dispositivos, segredos, backups e acesso ao serviço; configure política de retenção, controle de acesso e procedimentos LGPD apropriados ao escritório.

## Kit e documentação

O kit anexado e as decisões de implantação estão em [`kit/KIT-CANDIA-V2.md`](kit/KIT-CANDIA-V2.md) e [`docs/`](docs/). Comece por [`docs/00-LEIA-PRIMEIRO.md`](docs/00-LEIA-PRIMEIRO.md), consulte o diagnóstico confirmado, backlog, arquitetura, matriz de permissões e procedimento de backup.

## Marca

Os ativos da marca estão em `assets/`. A interface utiliza a marca recortada sem o fundo e os tons creme, preto e cobre.
