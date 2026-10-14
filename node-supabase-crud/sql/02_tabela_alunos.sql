create table if not exists public.alunos (
  id bigint generated always as identity primary key,
  nome text not null check (length(trim(nome)) > 0),
  ra text not null unique check (length(trim(ra)) > 0),
  curso_id bigint not null references public.cursos(id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index if not exists alunos_curso_id_idx on public.alunos(curso_id);
