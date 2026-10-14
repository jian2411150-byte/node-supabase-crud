// Demonstração simples de acesso ao banco pelo terminal.
const db = require('./supabase');

async function main() {
  console.log('Cursos cadastrados:');
  console.table(await db.listarCursos());
  console.log('Alunos cadastrados:');
  console.table((await db.listarAlunos()).map(a => ({ nome: a.nome, ra: a.ra, curso: a.curso?.nome })));
}
main().catch(err => { console.error('Falha ao consultar o Supabase:', err.message); process.exitCode = 1; });
