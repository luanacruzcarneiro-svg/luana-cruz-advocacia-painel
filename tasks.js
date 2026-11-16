/* Fluxo operacional: processo → providência → revisão → agenda. */
window.workflowTaskStatuses = ['Pendente', 'Em execução', 'Em revisão', 'Correção solicitada', 'Aprovada', 'Protocolada', 'Concluída'];

window.createWorkflowTask = function createWorkflowTask(input = {}) {
  const record = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: String(input.title || '').trim(),
    description: String(input.description || '').trim(),
    processId: input.processId || null,
    movementId: input.movementId || null,
    eventId: input.eventId || null,
    responsible: String(input.responsible || currentActor || 'Luana Cruz').trim(),
    reviewer: String(input.reviewer || currentActor || 'Luana Cruz').trim(),
    dueDate: input.dueDate || '',
    priority: input.priority || 'Normal',
    status: 'Pendente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  };
  record.history.push({ at: record.createdAt, by: currentActor || 'Luana Cruz', action: 'Providência criada' });
  tasks.unshift(record);
  return record;
};

function taskProcess(task) { return cases.find(c => String(c.id) === String(task.processId)); }
function taskDate(value) { return value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : 'Sem prazo interno'; }
function taskHistoryHtml(task) {
  return (task.history || []).slice().reverse().map(item => `<div class="task-history-item"><b>${esc(item.action)}</b><small>${esc(item.by || 'Equipe')} · ${new Date(item.at).toLocaleString('pt-BR')}</small>${item.note ? `<p>${esc(item.note)}</p>` : ''}</div>`).join('') || '<p class="muted">Ainda sem histórico.</p>';
}
function taskCard(task) {
  const process = taskProcess(task);
  return `<article class="task-card" draggable="true" data-task-id="${task.id}">
    <div class="task-card-top"><span class="badge ${task.priority === 'Urgente' ? 'red' : task.priority === 'Alta' ? 'gold' : 'gray'}">${esc(task.priority)}</span><button class="text-link" data-action="edit-workflow-task" data-id="${task.id}">Abrir</button></div>
    <strong>${esc(task.title)}</strong>
    <p>${process ? `<a href="#process-${process.id}" data-action="open-process" data-id="${process.id}">${esc(process.number)} · ${esc(process.court || 'Tribunal não informado')} · ${esc(process.system || 'Sistema não informado')}</a>` : 'Sem processo vinculado'}</p>
    <div class="task-card-meta"><span>Execução: ${esc(task.responsible || 'A definir')}</span><span>Revisão: ${esc(task.reviewer || 'A definir')}</span><span>Prazo interno: ${taskDate(task.dueDate)}</span></div>
    <label class="task-status-label">Etapa<select class="task-status-select" data-id="${task.id}">${workflowTaskStatuses.map(status => `<option ${status === task.status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>
  </article>`;
}

window.tasksPage = function tasksPage() {
  const active = tasks.filter(task => !['Concluída', 'Protocolada'].includes(task.status)).length;
  const review = tasks.filter(task => task.status === 'Em revisão').length;
  const correction = tasks.filter(task => task.status === 'Correção solicitada').length;
  return `${head('CONTROLADORIA', 'Tarefas e providências', 'Acompanhe execução, revisão, correções e prazos vinculados aos processos.', btn('Nova tarefa', 'new-workflow-task'))}
    <div class="notice">Uma movimentação pode gerar uma providência para execução. A data processual deve ser conferida por uma pessoa antes de ser tratada como prazo definitivo.</div>
    <div class="task-stats"><button data-task-filter="active"><b>${active}</b><span>Em andamento</span></button><button data-task-filter="review"><b>${review}</b><span>Aguardando revisão</span></button><button data-task-filter="correction"><b>${correction}</b><span>Correções solicitadas</span></button><button data-task-filter="all"><b>${tasks.length}</b><span>Todas as tarefas</span></button></div>
    <div class="toolbar"><label class="search-box"><span>⌕</span><input id="taskSearch" placeholder="Buscar tarefa, processo ou responsável"></label><select class="filter-select" id="taskStatusFilter"><option value="">Todas as etapas</option>${workflowTaskStatuses.map(status => `<option>${status}</option>`).join('')}</select><select class="filter-select" id="taskPriorityFilter"><option value="">Todas as prioridades</option>${['Urgente', 'Alta', 'Normal', 'Baixa'].map(priority => `<option>${priority}</option>`).join('')}</select><button class="btn btn-outline" data-action="toggle-task-board">Alternar quadro/lista</button></div>
    <div class="task-board">${workflowTaskStatuses.map(status => { const items = tasks.filter(task => task.status === status); return `<section class="task-column" data-task-stage="${status}"><header>${esc(status)} <span>${items.length}</span></header>${items.map(taskCard).join('') || '<p class="task-empty">Sem tarefas nesta etapa.</p>'}</section>`; }).join('')}</div>
    <div class="task-list hidden" id="taskList">${taskTable(tasks)}</div>`;
};

function taskTable(items) {
  if (!items.length) return '<div class="empty-state"><b>Nenhuma tarefa cadastrada</b>Use “Nova tarefa” ou registre uma providência em um processo.</div>';
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Providência</th><th>Processo</th><th>Executor</th><th>Revisor</th><th>Prazo interno</th><th>Etapa</th><th></th></tr></thead><tbody>${items.map(task => { const process = taskProcess(task); return `<tr><td>${esc(task.title)}</td><td>${process ? esc(process.number) : '—'}</td><td>${esc(task.responsible)}</td><td>${esc(task.reviewer)}</td><td>${taskDate(task.dueDate)}</td><td><select class="task-status-select filter-select" data-id="${task.id}">${workflowTaskStatuses.map(status => `<option ${status === task.status ? 'selected' : ''}>${status}</option>`).join('')}</select></td><td><button class="text-link" data-action="edit-workflow-task" data-id="${task.id}">Abrir</button></td></tr>`; }).join('')}</tbody></table></div>`;
}

window.openWorkflowTask = function openWorkflowTask(id) {
  const task = tasks.find(item => item.id === Number(id));
  if (!task) return;
  const processOptions = cases.map(item => `<option value="${item.id}" ${String(task.processId) === String(item.id) ? 'selected' : ''}>${esc(item.number)} · ${esc(item.court || '')} · ${esc(item.system || '')}</option>`).join('');
  openModal('Providência e revisão', 'Atualize os dados da tarefa e consulte seu histórico.', `<div class="form-grid"><div class="field full"><label>Providência</label><input name="title" required value="${esc(task.title)}"></div><div class="field full"><label>Processo</label><select name="processId"><option value="">Sem processo vinculado</option>${processOptions}</select></div><div class="field"><label>Responsável pela execução</label><input name="responsible" value="${esc(task.responsible)}"></div><div class="field"><label>Responsável pela revisão</label><input name="reviewer" value="${esc(task.reviewer)}"></div><div class="field"><label>Prazo interno</label><input type="date" name="dueDate" value="${esc(task.dueDate)}"></div><div class="field"><label>Prioridade</label><select name="priority">${['Urgente', 'Alta', 'Normal', 'Baixa'].map(item => `<option ${item === task.priority ? 'selected' : ''}>${item}</option>`).join('')}</select></div><div class="field full"><label>Descrição e instruções</label><textarea name="description">${esc(task.description)}</textarea></div><div class="field full"><label>Histórico</label><div class="task-history">${taskHistoryHtml(task)}</div></div></div>`, form => {
    const previous = { title: task.title, responsible: task.responsible, reviewer: task.reviewer, dueDate: task.dueDate, priority: task.priority };
    Object.assign(task, { title: form.get('title').trim(), processId: form.get('processId') || null, responsible: form.get('responsible').trim(), reviewer: form.get('reviewer').trim(), dueDate: form.get('dueDate'), priority: form.get('priority'), description: form.get('description').trim(), updatedAt: new Date().toISOString() });
    if (task.eventId) { const event = events.find(item => item.id === task.eventId); if (event && task.dueDate) { event.date = task.dueDate; event.caseId = task.processId || null; const linked = taskProcess(task); event.processNumber = linked?.number || ''; event.court = linked?.court || ''; event.system = linked?.system || ''; } else if (event && !task.dueDate) { events = events.filter(item => item.id !== event.id); task.eventId = null; } }
    if (Object.keys(previous).some(key => previous[key] !== task[key])) task.history.push({ at: task.updatedAt, by: currentActor, action: 'Dados da providência atualizados' });
    save(); toast('Providência atualizada');
  });
};

window.newWorkflowTask = function newWorkflowTask(processId = '') {
  const processOptions = cases.map(item => `<option value="${item.id}" ${String(processId) === String(item.id) ? 'selected' : ''}>${esc(item.number)} · ${esc(item.court || '')} · ${esc(item.system || '')}</option>`).join('');
  openModal('Nova tarefa', 'Registre uma providência e os responsáveis pela execução e revisão.', `<div class="form-grid"><div class="field full"><label>Providência</label><input name="title" required placeholder="Ex.: Preparar manifestação"></div><div class="field full"><label>Processo vinculado</label><select name="processId"><option value="">Sem processo vinculado</option>${processOptions}</select></div><div class="field"><label>Responsável pela execução</label><input name="responsible" value="${esc(currentActor)}"></div><div class="field"><label>Responsável pela revisão</label><input name="reviewer" value="${esc(currentActor)}"></div><div class="field"><label>Prazo interno</label><input type="date" name="dueDate"></div><div class="field"><label>Prioridade</label><select name="priority">${['Urgente', 'Alta', 'Normal', 'Baixa'].map(item => `<option ${item === 'Normal' ? 'selected' : ''}>${item}</option>`).join('')}</select></div><div class="field full"><label>Descrição e instruções</label><textarea name="description"></textarea></div><label class="field full task-calendar-check"><input type="checkbox" name="addToAgenda"> Adicionar o prazo interno também à Agenda (não substitui a conferência do prazo processual)</label></div>`, form => {
    const process = cases.find(item => String(item.id) === String(form.get('processId')));
    const task = createWorkflowTask({ title: form.get('title'), description: form.get('description'), processId: process?.id, responsible: form.get('responsible'), reviewer: form.get('reviewer'), dueDate: form.get('dueDate'), priority: form.get('priority') });
    if (form.get('addToAgenda') && task.dueDate) { const event = { id: Date.now() + 1, date: task.dueDate, title: `Prazo interno: ${task.title}`, time: 'Conferir prazo processual', type: 'prazo', note: task.description, caseId: process?.id || null, processNumber: process?.number || '', court: process?.court || '', system: process?.system || '', taskId: task.id }; events.push(event); task.eventId = event.id; }
    save(); toast('Tarefa criada');
  });
};

function applyWorkflowStatus(task, status, note = '') {
  const validation = Workflow.validateTransition(task.status, status, note);
  if (!validation.valid) { toast(validation.error); render(); return; }
  task.status = status; task.updatedAt = new Date().toISOString();
  task.history = task.history || [];
  task.history.push({ at: task.updatedAt, by: currentActor, action: status, note });
  save(); render(); toast(`Tarefa movida para ${status}`);
}

function requestTaskStatus(task, status) {
  if (status === task.status) return;
  if (status === 'Correção solicitada') {
    openModal('Devolver para correção', 'Informe o que precisa ser corrigido. O motivo ficará no histórico.', '<div class="field"><label>Motivo da correção</label><textarea name="reason" required minlength="3"></textarea></div>', form => applyWorkflowStatus(task, status, form.get('reason').trim()));
    return;
  }
  applyWorkflowStatus(task, status);
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action], [data-task-filter]');
  if (!button) return;
  if (button.dataset.action === 'new-workflow-task') { window.newWorkflowTask(button.dataset.processId || ''); return; }
  if (button.dataset.action === 'edit-workflow-task' || button.dataset.action === 'open-task') { window.openWorkflowTask(button.dataset.id); return; }
  if (button.dataset.action === 'toggle-task-board') { document.querySelector('.task-board')?.classList.toggle('hidden'); document.querySelector('#taskList')?.classList.toggle('hidden'); return; }
  if (button.dataset.taskFilter) {
    const filter = button.dataset.taskFilter;
    document.querySelector('#taskStatusFilter').value = filter === 'review' ? 'Em revisão' : filter === 'correction' ? 'Correção solicitada' : '';
    filterWorkflowTasks(filter === 'active' ? 'active' : 'all');
  }
});

function filterWorkflowTasks(mode = 'all') {
  const query = (document.querySelector('#taskSearch')?.value || '').toLowerCase();
  const status = document.querySelector('#taskStatusFilter')?.value || '';
  const priority = document.querySelector('#taskPriorityFilter')?.value || '';
  const filtered = tasks.filter(task => {
    const process = taskProcess(task);
    const active = !['Concluída', 'Protocolada'].includes(task.status);
    const text = `${task.title} ${task.description} ${task.responsible} ${task.reviewer} ${process?.number || ''}`.toLowerCase();
    return (mode !== 'active' || active) && (!query || text.includes(query)) && (!status || task.status === status) && (!priority || task.priority === priority);
  });
  const board = document.querySelector('.task-board');
  if (board) board.innerHTML = workflowTaskStatuses.map(stage => { const items = filtered.filter(task => task.status === stage); return `<section class="task-column" data-task-stage="${stage}"><header>${esc(stage)} <span>${items.length}</span></header>${items.map(taskCard).join('') || '<p class="task-empty">Sem tarefas nesta etapa.</p>'}</section>`; }).join('');
  const list = document.querySelector('#taskList'); if (list) list.innerHTML = taskTable(filtered);
}
document.addEventListener('input', event => { if (event.target.id === 'taskSearch') filterWorkflowTasks(); });
document.addEventListener('change', event => {
  if (event.target.id === 'taskStatusFilter' || event.target.id === 'taskPriorityFilter') filterWorkflowTasks();
  if (event.target.matches('.task-status-select')) { const task = tasks.find(item => item.id === Number(event.target.dataset.id)); if (task) requestTaskStatus(task, event.target.value); }
});
document.addEventListener('dragstart', event => { const card = event.target.closest('.task-card[draggable="true"]'); if (card) event.dataTransfer.setData('text/plain', card.dataset.taskId); });
document.addEventListener('dragover', event => { if (event.target.closest('[data-task-stage]')) event.preventDefault(); });
document.addEventListener('drop', event => { const column = event.target.closest('[data-task-stage]'); if (!column) return; event.preventDefault(); const task = tasks.find(item => item.id === Number(event.dataTransfer.getData('text/plain'))); if (task) requestTaskStatus(task, column.dataset.taskStage); });
