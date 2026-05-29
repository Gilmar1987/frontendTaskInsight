# TaskInsight — Frontend

Frontend do sistema TaskInsight desenvolvido com **Next.js 14+**, consumindo a API Node.js (CRUD) e a API FastAPI (Analytics).

---

## Tecnologias

- **Next.js 14+** com App Router
- **TypeScript**
- **fetch nativo** — requisições HTTP
- **Context API** — gerenciamento de estado de autenticação
- **Recharts** — gráficos
- **Inline styles** — estilização

---

## Pré-requisitos

- Node.js 18+
- API Node.js rodando na porta `3000`
- FastAPI (Python) rodando na porta `8000`

---

## Instalação

```bash
npm install
npm run dev
```

Acesse: `http://localhost:3001`

---

## Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_NODE_API_URL=http://localhost:3000
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_ANALYTICS_API_URL=http://127.0.0.1:8000
```

> Após qualquer alteração no `.env.local` ou `next.config.js`, reinicie o servidor.

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx        # Painel administrativo (role=admin)
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard do usuário autenticado
│   ├── layout.tsx           # Layout raiz com AuthProvider
│   └── page.tsx             # Login + Cadastro (tabs)
├── lib/
│   ├── api.ts               # Cliente HTTP para API Node.js
│   └── analyticsApi.ts      # Cliente HTTP para FastAPI Analytics
├── middleware.ts             # Proteção de rotas via cookie
├── store/
│   └── auth.tsx             # Context de autenticação global
└── types/
    ├── user.types.ts
    ├── task.types.ts
    └── metrics.types.ts
```

---

## Proxy de APIs (next.config.js)

O Next.js redireciona as chamadas internas para as APIs externas:

| Chamada no frontend | Destino real |
|---|---|
| `/api/node/users/login` | `http://localhost:3000/api/users/login` |
| `/api/node/tasks` | `http://localhost:3000/api/tasks` |
| `/api/python/*` | `http://localhost:8000/*` |

> A API de Analytics (`analyticsApi.ts`) chama a FastAPI **diretamente** sem passar pelo proxy.

---

## Páginas

### `/` — Login e Cadastro

- Tabs de **Entrar** e **Cadastrar**
- Inputs controlados com `useState`
- Após login bem-sucedido redireciona para `/dashboard` via `window.location.href`
- Exibe mensagem de erro na tela em caso de credenciais inválidas

### `/dashboard` — Dashboard do Usuário

Acessível para `role=user` e `role=admin`. Contém:

- **Cards de resumo** — Total, Pendentes, Em Andamento, Concluídas (dados da API Node.js)
- **Métricas Analytics** — Distribuição por status, por prioridade e tempo médio de conclusão (dados da FastAPI)
- **Gráfico de linha** — Evolução de tarefas criadas, finalizadas e backlog ao longo do tempo (FastAPI `/task/metrics/backlog`)
- **Formulário de criação** de tarefas
- **Lista de tarefas** com filtro por status e ações: Iniciar, Concluir, Cancelar, Excluir
- Botão **⚙ Admin** visível apenas para `role=admin`

### `/admin` — Painel Administrativo

Acessível apenas para `role=admin`. Contém:

- **Cards de resumo global** — Total de usuários, ativos, total de tarefas, concluídas
- **Tab Usuários** — Tabela com todos os usuários, busca por nome/email, botão Desativar (soft delete)
- **Tab Tarefas** — Todas as tarefas do sistema com filtros por status e prioridade, busca por título, botão Excluir
- **Tab Métricas Globais** — Distribuição por status e prioridade com barras de progresso e tempo médio global (dados da FastAPI filtrados por `role=admin`)

---

## Autenticação

O token JWT é salvo em dois lugares após o login:

```
localStorage  →  usado pelo cliente HTTP (api.ts e analyticsApi.ts)
cookie        →  usado pelo middleware do Next.js para proteger rotas
```

O `role` do usuário também é salvo em cookie para que o middleware possa bloquear o acesso à rota `/admin`.

### Proteção de Rotas (middleware.ts)

| Situação | Comportamento |
|---|---|
| Sem token → acessa `/dashboard` | Redireciona para `/` |
| Sem token → acessa `/admin` | Redireciona para `/` |
| Com token `role=user` → acessa `/admin` | Redireciona para `/dashboard` |
| Com token → acessa `/` | Redireciona para `/dashboard` |

---

## Integração com a FastAPI Analytics

O cliente `analyticsApi.ts` envia o token JWT diretamente para a FastAPI. A API extrai `userId` e `role` do token e filtra os dados automaticamente:

| Role | Comportamento |
|---|---|
| `user` | Retorna métricas apenas das tarefas do usuário autenticado |
| `admin` | Retorna métricas de todos os usuários |

### Endpoints consumidos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/task/metrics/by-status` | Distribuição por status |
| `GET` | `/task/metrics/by-priority` | Distribuição por prioridade |
| `GET` | `/task/metrics/average-time` | Tempo médio de conclusão |
| `GET` | `/task/metrics/backlog` | Evolução de criadas, finalizadas e backlog por dia |

---

## Integração com a API Node.js

### Endpoints consumidos

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/users/register` | Cadastro de usuário |
| `POST` | `/api/users/login` | Login |
| `GET` | `/api/users` | Listar todos os usuários (admin) |
| `DELETE` | `/api/users/:id` | Desativar usuário (admin) |
| `GET` | `/api/tasks` | Listar tarefas do usuário autenticado |
| `GET` | `/api/tasks/all` | Listar todas as tarefas (admin) |
| `POST` | `/api/tasks` | Criar tarefa |
| `PUT` | `/api/tasks/:id` | Atualizar status/dados da tarefa |
| `DELETE` | `/api/tasks/:id` | Excluir tarefa |

---

## Fluxo de Status das Tarefas

```
PENDING → [Iniciar]  → IN_PROGRESS
          [Cancelar] → CANCELLED

IN_PROGRESS → [Concluir] → DONE
              [Cancelar] → CANCELLED

DONE      → sem ações
CANCELLED → sem ações
```

---

## Problemas Comuns

| Problema | Causa | Solução |
|---|---|---|
| `404` nas rotas da API | Rewrite sem `/api/` no destino | Verificar `next.config.js` |
| `ECONNREFUSED` porta 3000 | Backend Node.js não está rodando | Iniciar o backend |
| Login retorna erro de credenciais | Campos vazios no submit | Usar `useState` controlado nos inputs |
| Redirect após login volta para `/` | Token salvo só no localStorage | Salvar token também no `document.cookie` |
| `router.push` não redireciona | Cookie não sincronizado | Usar `window.location.href` após login |
| CORS bloqueado | `FRONTEND_URL` errado no backend | Setar `FRONTEND_URL=http://localhost:3001` no `.env` do backend |
| Métricas não carregam | FastAPI offline | Verificar se FastAPI está rodando na porta `8000` |
