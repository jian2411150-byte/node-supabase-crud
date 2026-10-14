# Node.js + Supabase — CRUD de Cursos e Alunos

Projeto didático baseado no material de apresentação enviado. Implementa uma API REST em Node.js/Express, banco PostgreSQL no Supabase e uma interface web sem framework para cadastrar, listar, editar e excluir cursos e alunos.

## Funcionalidades

- CRUD de cursos e alunos.
- Relacionamento 1:N: um curso pode ter vários alunos; cada aluno pertence a um curso.
- Chave estrangeira `alunos.curso_id` → `cursos.id`.
- Filtro de alunos por curso.
- Contagem de alunos por curso.
- Edição de aluno e exclusão por RA.
- Impede apagar cursos que ainda tenham alunos vinculados (HTTP 409).
- Validação básica e mensagens de erro para entradas inválidas.
- Frontend responsivo com modal para cadastro/edição.

## Tecnologias

- Node.js 20 ou superior
- Express
- `@supabase/supabase-js`
- Supabase / PostgreSQL
- HTML, CSS e JavaScript puro

## 1. Criar o projeto Supabase

1. Acesse <https://supabase.com/> e crie um projeto.
2. Abra o **SQL Editor** no painel do projeto.
3. Abra `sql/01_tabela_cursos.sql`, copie o conteúdo e execute.
4. Abra `sql/02_tabela_alunos.sql`, copie o conteúdo e execute.
5. Abra `sql/03_policies.sql`, copie o conteúdo e execute.
6. Em **Connect** ou **Project Settings → API**, copie a Project URL e a chave pública `anon`/publishable.

> **Atenção à segurança:** as policies do arquivo `03_policies.sql` liberam leitura, inclusão, edição e exclusão para visitantes anônimos. Isso serve apenas para exercício local com dados fictícios. Não publique uma aplicação com essas permissões e dados reais. Em produção, configure autenticação e policies por usuário. Nunca use a chave `service_role`/secret no frontend nem a publique no GitHub.

### Se já existe uma tabela `alunos` antiga

Se ela já possui a coluna texto `curso`, faça backup e siga `sql/04_migracao_cursos.sql` **em vez de** executar `02_tabela_alunos.sql`. O script de migração é para o esquema antigo descrito na apresentação e deve ser revisado antes de executado em dados importantes. Não rode os dois caminhos ao mesmo tempo.

## 2. Configurar o Node.js

Instale o Node.js LTS (versão 20 ou superior): <https://nodejs.org/>. Abra esta pasta no VS Code e, no terminal integrado, execute:

```bash
npm install
```

Copie `.env.example` para um arquivo chamado `.env` na raiz do projeto e preencha:

```env
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=COLE_A_CHAVE_PUBLICA_ANON_OU_PUBLISHABLE
PORT=3000
```

Use os valores reais do seu projeto. Não coloque aspas e não compartilhe o `.env`. O `.gitignore` já impede que ele seja enviado ao Git.

## 3. Executar

```bash
npm start
```

Abra <http://localhost:3000>. A interface carrega cursos e alunos do Supabase. Para encerrar o servidor, pressione `Ctrl + C` no terminal.

Opcional: teste a conexão direta pelo terminal com `npm run demo` (o servidor HTTP não precisa estar rodando para esse comando).

## 4. Rotas da API

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| GET | `/api/health` | Verifica se a API está ativa | 200 |
| GET | `/cursos` | Lista cursos e total de alunos | 200 |
| POST | `/cursos` | Cria curso (`{"nome":"ADS"}`) | 201 |
| DELETE | `/cursos/:id` | Exclui curso sem alunos | 200 |
| GET | `/alunos` | Lista todos os alunos | 200 |
| GET | `/cursos/:id/alunos` | Lista alunos de um curso | 200 |
| POST | `/alunos` | Cria aluno (`{"nome":"Maria Silva","ra":"2026001","curso_id":1}`) | 201 |
| PUT | `/alunos/:ra` | Atualiza nome e curso (`{"nome":"Maria Silva","curso_id":1}`) | 200 |
| DELETE | `/alunos/:ra` | Exclui aluno pelo RA | 200 |

Códigos comuns: `400` entrada inválida, `404` registro inexistente, `409` duplicidade ou conflito, `502` falha de conexão com Supabase.

## 5. Teste manual rápido

1. Cadastre um curso, por exemplo `ADS`.
2. Cadastre outro curso, por exemplo `Gestão Comercial`.
3. Cadastre um aluno com RA `2026001`, escolhendo `ADS`.
4. Confira o aluno na tabela e a contagem de alunos do curso.
5. Use o filtro para mostrar apenas os alunos de `ADS`.
6. Edite o aluno e altere o curso.
7. Tente excluir o curso que ainda tem alunos: a API deve impedir e a interface mostrará uma mensagem.
8. Exclua o aluno e, depois, tente excluir o curso novamente.
9. Tente cadastrar um RA repetido: a API deve responder `409`.

Para testar diretamente com `curl` (PowerShell também pode usar `curl.exe`):

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/cursos
curl http://localhost:3000/alunos
```

## 6. Publicar no GitHub

1. Crie um repositório novo no GitHub, por exemplo `node-supabase-crud`.
2. Não adicione uma segunda cópia de README se o GitHub perguntar; este projeto já tem um.
3. No terminal, dentro desta pasta, execute:

```bash
git init
git add .
git status
git commit -m "Adiciona CRUD de cursos e alunos com Node.js e Supabase"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/node-supabase-crud.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub. Antes do `git commit`, confira `git status`: o arquivo `.env` **não pode aparecer** entre os arquivos preparados. Se aparecer, remova-o do índice com `git rm --cached .env` e confira o `.gitignore`.

## Estrutura

```text
node-supabase-crud/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── sql/
│   ├── 01_tabela_cursos.sql
│   ├── 02_tabela_alunos.sql
│   ├── 03_policies.sql
│   └── 04_migracao_cursos.sql
├── .env.example
├── .gitignore
├── index.js
├── package.json
├── README.md
├── server.js
└── supabase.js
```

## Limitações conhecidas

Este é um exemplo acadêmico para rodar localmente. Não implementa login, autorização por usuário, testes automatizados, logs estruturados nem proteção contra abuso. Antes de colocar na internet, implemente autenticação, policies RLS restritivas, validação e monitoramento adequados.
