require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inserirCurso(nome) {
  const { data, error } = await supabase.from('cursos').insert({ nome: nome.trim() }).select().single();
  if (error) throw error;
  return data;
}
async function listarCursos() {
  const { data, error } = await supabase.from('cursos')
    .select('id, nome, criado_em, alunos(count)').order('nome', { ascending: true });
  if (error) throw error;
  return data.map(c => ({ id: c.id, nome: c.nome, criado_em: c.criado_em, total_alunos: c.alunos?.[0]?.count ?? 0 }));
}
async function excluirCurso(id) {
  const { data, error } = await supabase.from('cursos').delete().eq('id', id).select();
  if (error) throw error;
  return data?.[0] ?? null;
}
async function inserirAluno({ nome, ra, curso_id }) {
  const { data, error } = await supabase.from('alunos').insert({ nome: nome.trim(), ra: ra.trim(), curso_id })
    .select('id, nome, ra, curso_id, criado_em, curso:cursos(id, nome)').single();
  if (error) throw error;
  return data;
}
async function listarAlunos(cursoId = null) {
  let query = supabase.from('alunos').select('id, nome, ra, curso_id, criado_em, curso:cursos(id, nome)').order('nome');
  if (cursoId !== null && cursoId !== undefined) query = query.eq('curso_id', cursoId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
async function atualizarAluno(ra, { nome, curso_id }) {
  const { data, error } = await supabase.from('alunos').update({ nome: nome.trim(), curso_id })
    .eq('ra', ra).select('id, nome, ra, curso_id, criado_em, curso:cursos(id, nome)');
  if (error) throw error;
  return data?.[0] ?? null;
}
async function excluirAluno(ra) {
  const { data, error } = await supabase.from('alunos').delete().eq('ra', ra).select();
  if (error) throw error;
  return data?.[0] ?? null;
}

module.exports = { supabase, inserirCurso, listarCursos, excluirCurso, inserirAluno, listarAlunos, atualizarAluno, excluirAluno };
