const $ = (id) => document.getElementById(id);
const statusEl = $('status');
const mensagem = $('mensagem');
const modal = $('modal-aluno');
let cursos = [];
let raEmEdicao = null;

async function requisicao(url, options = {}) {
  const resposta = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const tipo = resposta.headers.get('content-type') || '';
  const dados = tipo.includes('application/json') ? await resposta.json() : null;
  if (!resposta.ok) throw new Error(dados?.erro || `Erro HTTP ${resposta.status}`);
  return dados;
}
function mostrarMensagem(texto, tipo = '') { mensagem.textContent = texto; mensagem.className = `mensagem ${tipo}`.trim(); }
function celula(texto) { const td = document.createElement('td'); td.textContent = texto ?? ''; return td; }
function botao(texto, classe, acao) { const b = document.createElement('button'); b.type = 'button'; b.textContent = texto; if (classe) b.className = classe; b.addEventListener('click', acao); return b; }
function preencherSelects() {
  for (const select of [$('filtro-curso'), $('aluno-curso')]) {
    const atual = select.value;
    select.replaceChildren();
    const padrao = document.createElement('option'); padrao.value = ''; padrao.textContent = select.id === 'filtro-curso' ? 'Todos os cursos' : 'Selecione um curso'; select.append(padrao);
    cursos.forEach(curso => { const opt = document.createElement('option'); opt.value = curso.id; opt.textContent = curso.nome; select.append(opt); });
    if ([...select.options].some(o => o.value === atual)) select.value = atual;
  }
}
async function listarCursos() {
  cursos = await requisicao('/cursos');
  const tbody = $('tabela-cursos'); tbody.replaceChildren();
  if (!cursos.length) { const tr = document.createElement('tr'); const td = celula('Nenhum curso cadastrado ainda.'); td.colSpan = 4; td.className = 'empty'; tr.append(td); tbody.append(tr); }
  cursos.forEach(curso => {
    const tr = document.createElement('tr'); tr.append(celula(curso.id), celula(curso.nome), celula(curso.total_alunos));
    const td = document.createElement('td'); const actions = document.createElement('div'); actions.className = 'acoes-linha';
    actions.append(botao('Excluir', 'apagar', () => excluirCurso(curso))); td.append(actions); tr.append(td); tbody.append(tr);
  });
  preencherSelects();
}
async function listarAlunos() {
  const id = $('filtro-curso').value;
  const alunos = await requisicao(id ? `/cursos/${encodeURIComponent(id)}/alunos` : '/alunos');
  const tbody = $('tabela-alunos'); tbody.replaceChildren();
  if (!alunos.length) { const tr = document.createElement('tr'); const td = celula('Nenhum aluno encontrado.'); td.colSpan = 4; td.className = 'empty'; tr.append(td); tbody.append(tr); return; }
  alunos.forEach(aluno => {
    const tr = document.createElement('tr'); tr.append(celula(aluno.nome), celula(aluno.ra), celula(aluno.curso?.nome || 'Curso não encontrado'));
    const td = document.createElement('td'); const actions = document.createElement('div'); actions.className = 'acoes-linha';
    actions.append(botao('Editar', '', () => abrirEdicao(aluno)), botao('Excluir', 'apagar', () => excluirAluno(aluno))); td.append(actions); tr.append(td); tbody.append(tr);
  });
}
async function atualizarTudo() { await listarCursos(); await listarAlunos(); }
async function adicionarCurso(event) {
  event.preventDefault(); const input = $('nome-curso');
  try { await requisicao('/cursos', { method: 'POST', body: JSON.stringify({ nome: input.value.trim() }) }); input.value = ''; await atualizarTudo(); mostrarMensagem('Curso cadastrado com sucesso.', 'ok'); }
  catch (e) { mostrarMensagem(e.message, 'erro'); }
}
async function excluirCurso(curso) {
  if (!confirm(`Excluir o curso “${curso.nome}”? Cursos com alunos vinculados não podem ser excluídos.`)) return;
  try { await requisicao(`/cursos/${curso.id}`, { method: 'DELETE' }); await atualizarTudo(); mostrarMensagem('Curso excluído.', 'ok'); }
  catch (e) { mostrarMensagem(e.message, 'erro'); }
}
function abrirNovoAluno() {
  raEmEdicao = null; $('form-aluno').reset(); $('titulo-modal').textContent = 'Novo aluno'; $('aluno-ra').disabled = false;
  if (!cursos.length) { mostrarMensagem('Cadastre um curso antes de cadastrar alunos.', 'erro'); return; }
  modal.showModal(); $('aluno-nome').focus();
}
function abrirEdicao(aluno) {
  raEmEdicao = aluno.ra; $('titulo-modal').textContent = 'Editar aluno'; $('aluno-nome').value = aluno.nome; $('aluno-ra').value = aluno.ra;
  $('aluno-ra').disabled = true; $('aluno-curso').value = String(aluno.curso_id); modal.showModal(); $('aluno-nome').focus();
}
async function salvarAluno(event) {
  event.preventDefault();
  const nome = $('aluno-nome').value.trim(), ra = $('aluno-ra').value.trim(), curso_id = Number($('aluno-curso').value);
  try {
    if (raEmEdicao) await requisicao(`/alunos/${encodeURIComponent(raEmEdicao)}`, { method: 'PUT', body: JSON.stringify({ nome, curso_id }) });
    else await requisicao('/alunos', { method: 'POST', body: JSON.stringify({ nome, ra, curso_id }) });
    modal.close(); await atualizarTudo(); mostrarMensagem(raEmEdicao ? 'Aluno atualizado.' : 'Aluno cadastrado.', 'ok');
  } catch (e) { mostrarMensagem(e.message, 'erro'); }
}
async function excluirAluno(aluno) {
  if (!confirm(`Excluir o aluno ${aluno.nome} (RA ${aluno.ra})?`)) return;
  try { await requisicao(`/alunos/${encodeURIComponent(aluno.ra)}`, { method: 'DELETE' }); await atualizarTudo(); mostrarMensagem('Aluno excluído.', 'ok'); }
  catch (e) { mostrarMensagem(e.message, 'erro'); }
}
$('form-curso').addEventListener('submit', adicionarCurso);
$('filtro-curso').addEventListener('change', () => listarAlunos().catch(e => mostrarMensagem(e.message, 'erro')));
$('novo-aluno').addEventListener('click', abrirNovoAluno);
$('form-aluno').addEventListener('submit', salvarAluno);
$('fechar-modal').addEventListener('click', () => modal.close());
$('cancelar-modal').addEventListener('click', () => modal.close());
(async function iniciar() {
  try { await requisicao('/api/health'); statusEl.textContent = 'API conectada'; statusEl.classList.add('ok'); await atualizarTudo(); }
  catch (e) { statusEl.textContent = 'Erro de conexão'; statusEl.classList.add('err'); mostrarMensagem(`${e.message}. Confira .env, SQL e se o servidor está ativo.`, 'erro'); }
})();
