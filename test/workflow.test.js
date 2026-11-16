const test = require('node:test');
const assert = require('node:assert/strict');
const { validateTransition } = require('../workflow');

test('permite encaminhar execução para revisão', () => {
  assert.equal(validateTransition('Em execução', 'Em revisão').valid, true);
});

test('exige motivo para devolver para correção', () => {
  assert.equal(validateTransition('Em revisão', 'Correção solicitada').valid, false);
  assert.equal(validateTransition('Em revisão', 'Correção solicitada', 'Revisar documento').valid, true);
});

test('bloqueia saltos que ignoram execução e revisão', () => {
  assert.equal(validateTransition('Pendente', 'Aprovada').valid, false);
  assert.equal(validateTransition('Correção solicitada', 'Concluída').valid, false);
});

test('permite concluir somente depois da aprovação/protocolo', () => {
  assert.equal(validateTransition('Aprovada', 'Concluída').valid, true);
  assert.equal(validateTransition('Protocolada', 'Concluída').valid, true);
});
