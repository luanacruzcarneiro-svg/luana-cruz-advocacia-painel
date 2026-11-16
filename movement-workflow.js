/* Registra o andamento e, quando houver providência, cria tarefa vinculada. */
window.newMovement = function newMovement(caseId) {
  const process = cases.find(item => item.id === Number(caseId));
  if (!process) return;
  const formHtml = `<div class="notice">Processo ${esc(process.number)} · ${esc(process.court || 'Tribunal não informado')} · ${esc(process.system || 'Sistema não informado')}</div>
    <div class="form-grid">
      <div class="field full"><label>Andamento recebido</label><input name="title" required placeholder="Ex.: Intimação para manifestação"></div>
      <div class="field"><label>Data do andamento</label><input name="date" type="date" value="${localISODate()}" required></div>
      <div class="field"><label>Prazo final conferido (se aplicável)</label><input name="deadline" type="date"><small>Informe a data somente após conferir a publicação, o termo inicial e a regra aplicável.</small></div>
      <div class="field full"><label>Detalhes e providência</label><textarea name="description" placeholder="Resumo do andamento e providência a tomar"></textarea></div>
      <label class="field full task-calendar-check"><input type="checkbox" name="createTask" checked> Criar tarefa de providência para execução e revisão</label>
      <div class="field"><label>Responsável pela execução</label><input name="responsible" value="${esc(currentActor)}"></div>
      <div class="field"><label>Responsável pela revisão</label><input name="reviewer" value="${esc(currentActor)}"></div>
    </div>`;
  openModal('Registrar andamento', 'O prazo informado será associado à Agenda. A data não é calculada automaticamente pelo sistema.', formHtml, form => {
    const movement = { id: Date.now(), title: form.get('title').trim(), date: form.get('date'), description: form.get('description').trim(), deadline: form.get('deadline') || '' };
    const task = form.get('createTask') ? createWorkflowTask({ title: movement.title, description: movement.description, processId: process.id, movementId: movement.id, responsible: form.get('responsible'), reviewer: form.get('reviewer'), dueDate: movement.deadline }) : null;
    if (task) { movement.taskId = task.id; task.history.push({ at: new Date().toISOString(), by: currentActor, action: 'Andamento do processo vinculado', note: movement.title }); }
    if (movement.deadline) {
      const event = { id: Date.now() + 1, date: movement.deadline, title: `Prazo: ${movement.title}`, time: 'Conferido manualmente', type: 'prazo', note: movement.description, caseId: process.id, processNumber: process.number, court: process.court, system: process.system, movementId: movement.id, taskId: task?.id || null };
      movement.eventId = event.id;
      if (task) task.eventId = event.id;
      events.push(event);
    }
    process.movements = process.movements || [];
    process.movements.push(movement);
    save();
    toast(task ? (movement.deadline ? 'Andamento, tarefa e prazo adicionados' : 'Andamento e tarefa adicionados') : (movement.deadline ? 'Andamento e prazo adicionados' : 'Andamento registrado'));
  });
};
