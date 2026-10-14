require('dotenv').config();
const express = require('express');
const db = require('./supabase');
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100kb' }));
app.use(express.static('public'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

function validarTexto(valor) { return typeof valor === 'string' && valor.trim().length > 0; }
function validarId(valor) { const n = Number(valor); return Number.isSafeInteger(n) && n > 0 ? n : null; }
function erroBanco(err) {
  if (err.code === '23505') return { status: 409, mensagem: 'Já existe um registro com esse nome ou RA.' };
  if (err.code === '23503') return { status: 400, mensagem: 'Curso inválido ou ainda existem alunos vinculados a ele.' };
  if (err.code === '42501' || /row-level security/i.test(err.message || '')) return { status: 403, mensagem: 'Operação bloqueada pelas políticas RLS do Supabase. Confira sql/03_policies.sql.' };
  if (/fetch failed|ENOTFOUND/i.test(err.message || '')) return { status: 502, mensagem: 'Não foi possível acessar o Supabase. Confira a URL e o status do projeto.' };
  return { status: 500, mensagem: err.message || 'Erro interno.' };
}
function tratarErro(res, err) { const e = erroBanco(err); return res.status(e.status).json({ erro: e.mensagem }); }

app.get('/cursos', async (_req, res) => {
  try { res.json(await db.listarCursos()); } catch (e) { tratarErro(res, e); }
});
app.post('/cursos', async (req, res) => {
  if (!validarTexto(req.body?.nome)) return res.status(400).json({ erro: 'Informe o nome do curso.' });
  try { res.status(201).json(await db.inserirCurso(req.body.nome)); } catch (e) { tratarErro(res, e); }
});
app.delete('/cursos/:id', async (req, res) => {
  const id = validarId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'ID de curso inválido.' });
  try {
    const curso = await db.excluirCurso(id);
    if (!curso) return res.status(404).json({ erro: 'Curso não encontrado.' });
    res.json({ mensagem: 'Curso excluído.', curso });
  } catch (e) { tratarErro(res, e); }
});

app.get('/alunos', async (_req, res) => {
  try { res.json(await db.listarAlunos()); } catch (e) { tratarErro(res, e); }
});
app.get('/cursos/:id/alunos', async (req, res) => {
  const id = validarId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'ID de curso inválido.' });
  try { res.json(await db.listarAlunos(id)); } catch (e) { tratarErro(res, e); }
});
app.post('/alunos', async (req, res) => {
  const { nome, ra, curso_id } = req.body || {};
  const cursoId = validarId(curso_id);
  if (!validarTexto(nome) || !validarTexto(ra) || !cursoId) return res.status(400).json({ erro: 'Informe nome, RA e curso_id válido.' });
  try { res.status(201).json(await db.inserirAluno({ nome, ra, curso_id: cursoId })); } catch (e) { tratarErro(res, e); }
});
app.put('/alunos/:ra', async (req, res) => {
  const ra = String(req.params.ra || '').trim();
  const { nome, curso_id } = req.body || {};
  const cursoId = validarId(curso_id);
  if (!ra || !validarTexto(nome) || !cursoId) return res.status(400).json({ erro: 'Informe nome e curso_id válido.' });
  try {
    const aluno = await db.atualizarAluno(ra, { nome, curso_id: cursoId });
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json(aluno);
  } catch (e) { tratarErro(res, e); }
});
app.delete('/alunos/:ra', async (req, res) => {
  const ra = String(req.params.ra || '').trim();
  if (!ra) return res.status(400).json({ erro: 'Informe o RA.' });
  try {
    const aluno = await db.excluirAluno(ra);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json({ mensagem: 'Aluno excluído.', aluno });
  } catch (e) { tratarErro(res, e); }
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});
app.listen(PORT, () => console.log(`API disponível em http://localhost:${PORT}`));
