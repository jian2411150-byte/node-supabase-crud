-- Projeto didático: permite CRUD público para o papel anon.
-- NÃO use estas permissões abertas em um sistema real com dados pessoais.
alter table public.cursos enable row level security;
alter table public.alunos enable row level security;

drop policy if exists "cursos_select_anon" on public.cursos;
drop policy if exists "cursos_insert_anon" on public.cursos;
drop policy if exists "cursos_update_anon" on public.cursos;
drop policy if exists "cursos_delete_anon" on public.cursos;
drop policy if exists "alunos_select_anon" on public.alunos;
drop policy if exists "alunos_insert_anon" on public.alunos;
drop policy if exists "alunos_update_anon" on public.alunos;
drop policy if exists "alunos_delete_anon" on public.alunos;

create policy "cursos_select_anon" on public.cursos for select to anon using (true);
create policy "cursos_insert_anon" on public.cursos for insert to anon with check (true);
create policy "cursos_update_anon" on public.cursos for update to anon using (true) with check (true);
create policy "cursos_delete_anon" on public.cursos for delete to anon using (true);
create policy "alunos_select_anon" on public.alunos for select to anon using (true);
create policy "alunos_insert_anon" on public.alunos for insert to anon with check (true);
create policy "alunos_update_anon" on public.alunos for update to anon using (true) with check (true);
create policy "alunos_delete_anon" on public.alunos for delete to anon using (true);
