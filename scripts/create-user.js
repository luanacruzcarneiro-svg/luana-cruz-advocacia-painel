const readline = require('node:readline');
const bcrypt = require('bcryptjs');
const db = require('../db');

function hiddenPrompt(label) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) return reject(new Error('Execute este comando em um terminal interativo.'));
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    process.stdout.write(label);
    let value = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onData = chunk => {
      const char = chunk.toString('utf8');
      if (char === '\u0003') { cleanup(); reject(new Error('Cancelado.')); return; }
      if (char === '\r' || char === '\n') { cleanup(); process.stdout.write('\n'); resolve(value); return; }
      if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
      else if (char >= ' ') value += char;
    };
    function cleanup(){process.stdin.off('data',onData);process.stdin.setRawMode(false);rl.close()}
    process.stdin.on('data', onData);
  });
}

function textPrompt(label) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(label, answer => { rl.close(); resolve(answer.trim()); });
  });
}

(async()=>{
  try {
    const username=(await hiddenPrompt('Usuário novo: ')).trim();
    if(username.length<3||username.length>80)throw new Error('O usuário deve ter entre 3 e 80 caracteres.');
    const role=(await textPrompt('Perfil (admin, atendimento, execucao, revisao): ')).toLowerCase();
    if(!['admin','atendimento','execucao','revisao'].includes(role))throw new Error('Escolha um dos perfis indicados.');
    const password=await hiddenPrompt('Senha (mínimo 14 caracteres): ');
    if(password.length<14||password.length>200)throw new Error('Use uma senha entre 14 e 200 caracteres.');
    const confirmation=await hiddenPrompt('Confirme a senha: ');
    if(password!==confirmation)throw new Error('As senhas não coincidem.');
    const hash=await bcrypt.hash(password,12);
    await db.createUser(username,hash,role);
    console.log(`Acesso criado para ${username} com perfil ${role}. A senha não foi exibida nem salva em texto puro.`);
  } catch(err) { console.error(err.message);process.exitCode=1; }
  finally { await db.close(); }
})();
