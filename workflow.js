(function attachWorkflow(root) {
  const transitions = Object.freeze({
    'Pendente': ['Em execução'],
    'Em execução': ['Em revisão'],
    'Em revisão': ['Correção solicitada', 'Aprovada'],
    'Correção solicitada': ['Em execução'],
    'Aprovada': ['Protocolada', 'Concluída'],
    'Protocolada': ['Concluída'],
    'Concluída': []
  });
  function validateTransition(from, to, note = '') {
    if (!transitions[from]?.includes(to)) return { valid: false, error: `Fluxo inválido: ${from} → ${to}` };
    if (to === 'Correção solicitada' && String(note).trim().length < 3) return { valid: false, error: 'Informe o motivo da correção.' };
    return { valid: true, error: '' };
  }
  root.Workflow = Object.freeze({ transitions, validateTransition });
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Workflow;
})(globalThis);
