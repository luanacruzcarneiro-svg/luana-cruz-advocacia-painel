import { defineRailway, postgres, preserve, project, service } from 'railway/iac';

export default defineRailway((ctx) => {
  const database = postgres('Luana Cruz PostgreSQL');
  const production = ctx.isEnvironment('production');

  // Vincule a origem ao repositório privado do escritório depois da criação do repo.
  // A omissão de source aqui evita inventar titular ou nome de repositório.
  const app = service('Luana Cruz Advocacia', {
    start: 'npm start',
    preDeploy: 'npm run db:migrate',
    healthcheck: '/health',
    healthcheckTimeout: 60,
    domains: production ? ['www.luanacruzadvocacia.com.br'] : [],
    env: {
      NODE_ENV: 'production',
      PUBLIC_ORIGIN: 'https://www.luanacruzadvocacia.com.br',
      DATABASE_URL: database.env.DATABASE_URL,
      SESSION_SECRET: preserve(),
    },
  });

  return project('Luana Cruz Advocacia', { resources: [database, app] });
});
