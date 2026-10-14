create table if not exists public.cursos (
  id bigint generated always as identity primary key,
  nome text not null unique check (length(trim(nome)) > 0),
  criado_em timestamptz not null default now()
);
