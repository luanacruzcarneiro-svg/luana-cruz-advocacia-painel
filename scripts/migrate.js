const { ready, close } = require('../db');

(async () => {
  try {
    await ready;
    console.log('Migrações do banco concluídas.');
  } catch (error) {
    console.error('Falha na migração do banco:', error.message);
    process.exitCode = 1;
  } finally {
    await close();
  }
})();
