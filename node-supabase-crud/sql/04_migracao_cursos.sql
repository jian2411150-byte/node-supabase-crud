-- Use SOMENTE se a tabela alunos antiga já existe e tem uma coluna texto chamada curso.
-- Faça backup antes de executar. Não rode 02_tabela_alunos.sql nesse caso.

create table if not exists public.cursos (
  id bigint generated always as identity primary key,
  nome text not null unique check (length(trim(nome)) > 0),
  criado_em timestamptz not null default now()
);

-- Cria um curso para cada nome antigo distinto, ignorando valores vazios.
insert into public.cursos (nome)
select distinct trim(curso)
from public.alunos
where curso is not null and length(trim(curso)) > 0
on conflict (nome) do nothing;

-- Adiciona a chave estrangeira inicialmente opcional para migrar dados antigos.
alter table public.alunos add column if not exists curso_id bigint;

update public.alunos a
set curso_id = c.id
from public.cursos c
where a.curso_id is null and trim(coalesce(a.curso, '')) = c.nome;

-- Registros antigos sem curso válido recebem um curso de recuperação.
insert into public.cursos (nome) values ('Sem curso') on conflict (nome) do nothing;
update public.alunos a
set curso_id = c.id
from public.cursos c
where a.curso_id is null and c.nome = 'Sem curso';

alter table public.alunos alter column curso_id set not null;
alter table public.alunos add constraint alunos_curso_id_fkey
  foreign key (curso_id) references public.cursos(id) on delete restrict;
create index if not exists alunos_curso_id_idx on public.alunos(curso_id);

-- A coluna antiga curso é mantida para permitir conferir a migração.
