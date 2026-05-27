# TaskInsight — Guia de Implementação Frontend (Next.js)

Guia completo e validado em ambiente real para implementar o frontend do TaskInsight com Next.js, consumindo a API Node.js e FastAPI Python.

---

## Tecnologias Utilizadas

- **Next.js 14+** com App Router
- **TypeScript**
- **fetch nativo** — requisições HTTP (sem Axios)
- **Context API** — gerenciamento de estado global (auth)
- **TailwindCSS** — estilização (opcional, inline styles também funcionam)

---

## Instalação

```bash
npx create-next-app@latest frontend-taskinsight --typescript --tailwind --app
cd frontend-taskinsight
```

> Não é necessário instalar Axios, Zod ou React Hook Form para o funcionamento básico.

---

## Porta da Aplicação

O frontend roda na porta **3001** para não conflitar com a API Node.js (porta 3000):

```bash
# package.json
"scripts": {
  "dev": "next dev -p 3001",
  "start": "next start -p 3001"
}
```

---

## Variáveis de Ambiente

Crie `.env.local` na raiz do projeto Next.js:

```env
# URL da API Node.js
NEXT_PUBLIC_NODE_API_URL=http://localhost:3000

# URL da FastAPI (Python)
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

> ⚠️ As variáveis JWT (`JWT_SECRET`, `JWT_REFRESH_SECRET`, etc.) ficam **apenas no backend**. O frontend nunca precisa delas.

> ⚠️ Confirme que o `.env` do backend tem `FRONTEND_URL=http://localhost:3001` para o CORS funcionar.

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard protegido
│   ├── layout.tsx           # AuthProvider global
│   └── page.tsx             # Login + Cadastro (tabs)
├── lib/
│   └── api.ts               # Cliente HTTP centralizado
├── middleware.ts             # Proteção de rotas via cookie
├── store/
│   └── auth.tsx             # Context de autenticação
└── types/
    ├── user.types.ts
    └── task.types.ts
```

---

## Configuração do Proxy (next.config.js)

### ⚠️ Ponto crítico — prefixo `/api` do backend

A API Node.js monta as rotas com prefixo `/api`:
```
app.use('/api/users', userRouter);
app.use('/api/tasks', taskRouter);
```

Por isso o rewrite deve incluir `/api/` no destino:

```javascript
/** @type {import('next').NextConfig} */

const NODE_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

console.log("\x1b[36m\n  ▲ TaskInsight — APIs configuradas");
console.log(`\x1b[32m    Node.js API  \x1b[0m→  ${NODE_URL}`);
console.log(`\x1b[35m    FastAPI      \x1b[0m→  ${PYTHON_URL}\n`);

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/node/:path*",
        destination: `${NODE_URL}/api/:path*`,  // ← /api/ obrigatório
      },
      {
        source: "/api/python/:path*",
        destination: `${PYTHON_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

**Mapeamento final:**
| Chamada no frontend | Destino real |
|---|---|
| `/api/node/users/login` | `http://localhost:3000/api/users/login` ✅ |
| `/api/node/tasks` | `http://localhost:3000/api/tasks` ✅ |
| `/api/python/insights` | `http://localhost:8000/insights` ✅ |

> ⚠️ Após qualquer alteração no `next.config.js`, reinicie o servidor com `npm run dev`.

---

## Cliente HTTP (`src/lib/api.ts`)

```typescript
const NODE_BASE = "/api/node";
const PYTHON_BASE = "/api/python";

const NODE_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

if (typeof window !== "undefined") {
  console.log("%c[TaskInsight] Configuração de APIs", "color: #2d6a9f; font-weight: bold; font-size: 13px");
  console.log("%c  Node.js API →", "color: #27ae60", NODE_URL);
  console.log("%c  FastAPI (Python) →", "color: #8e44ad", PYTHON_URL);
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function fetchApi(url: string, options: RequestInit = {}) {
  const token = getToken();
  const method = options.method || "GET";
  const isNode = url.startsWith(NODE_BASE);
  const apiLabel = isNode ? "[Node API]" : "[Python API]";
  const apiColor = isNode ? "color: #27ae60" : "color: #8e44ad";
  console.log(`%c${apiLabel}`, apiColor, method, url);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    console.error(`%c${apiLabel}`, "color: #e74c3c", method, url, "→", res.status, json?.message || "");
    throw new Error(json?.message || `Erro ${res.status}`);
  }
  console.log(`%c${apiLabel}`, apiColor, method, url, "→", res.status);
  return json;
}

export const nodeApi = {
  get: (path: string) => fetchApi(`${NODE_BASE}${path}`),
  post: (path: string, body: unknown) =>
    fetchApi(`${NODE_BASE}${path}`, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) =>
    fetchApi(`${NODE_BASE}${path}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => fetchApi(`${NODE_BASE}${path}`, { method: "DELETE" }),
};

export const pythonApi = {
  get: (path: string) => fetchApi(`${PYTHON_BASE}${path}`),
  post: (path: string, body: unknown) =>
    fetchApi(`${PYTHON_BASE}${path}`, { method: "POST", body: JSON.stringify(body) }),
};
```

---

## Gerenciamento de Auth (`src/store/auth.tsx`)

### ⚠️ Ponto crítico — token deve ser salvo no cookie E no localStorage

O middleware do Next.js só consegue ler **cookies** (não localStorage). Por isso o token precisa ser salvo nos dois lugares:

```typescript
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { IUser } from "@/types/user.types";

interface AuthCtx {
  user: IUser | null;
  token: string | null;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
      // Sincroniza cookie ao restaurar sessão
      document.cookie = `token=${t}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  }, []);

  const setAuth = (u: IUser, t: string) => {
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    // Salva no cookie para o middleware conseguir ler
    document.cookie = `token=${t}; path=/; max-age=${60 * 60 * 24 * 7}`;
    setUser(u);
    setToken(t);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Remove o cookie também
    document.cookie = "token=; path=/; max-age=0";
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## Proteção de Rotas (`src/middleware.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isRoot = request.nextUrl.pathname === "/";
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (!token && isDashboard)
    return NextResponse.redirect(new URL("/", request.url));

  if (token && isRoot)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
```

---

## Página Principal — Login + Cadastro (`src/app/page.tsx`)

### ⚠️ Ponto crítico — usar useState controlado, não FormData

`FormData` pode retornar `null` em re-renders do React. Use sempre `useState` para capturar valores de formulário:

```typescript
// ❌ Problemático — FormData pode retornar null
const fd = new FormData(e.currentTarget);
const email = fd.get("email"); // pode ser null

// ✅ Correto — useState controlado
const [form, setForm] = useState({ email: "", password: "" });
// ...
<input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
```

### ⚠️ Ponto crítico — usar window.location.href após login

`router.push()` pode não redirecionar corretamente quando o estado de auth ainda está sendo sincronizado. Use `window.location.href` para garantir o redirect após salvar o token:

```typescript
// ❌ Pode não redirecionar se o cookie ainda não foi salvo
router.push("/dashboard");

// ✅ Garante reload completo com cookie já salvo
window.location.href = "/dashboard";
```

---

## Tipos TypeScript

### `src/types/user.types.ts`
```typescript
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface ILoginResponse {
  success: boolean;
  data: {
    user: IUser;
    token: string;
    refreshToken: string;
  };
}
```

### `src/types/task.types.ts`
```typescript
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface ITask {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTask {
  title: string;
  description: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
```

---

## Fluxo de Status das Tarefas

```
PENDING → [Iniciar]   → IN_PROGRESS
          [Cancelar]  → CANCELLED

IN_PROGRESS → [Concluir]  → DONE
              [Cancelar]  → CANCELLED

DONE      → sem ações
CANCELLED → sem ações
```

A API retorna `400 Bad Request` para transições inválidas.

---

## Métricas Disponíveis

```typescript
// Tempo médio de conclusão (em minutos)
const avgTime = tasks
  .filter(t => t.startedAt && t.completedAt)
  .map(t => new Date(t.completedAt!).getTime() - new Date(t.startedAt!).getTime())
  .reduce((acc, t, _, arr) => acc + t / arr.length, 0) / 60000;

// Tarefas atrasadas
const overdue = tasks.filter(t =>
  t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
);

// Distribuição por status
const byStatus = tasks.reduce((acc, t) => {
  acc[t.status] = (acc[t.status] || 0) + 1;
  return acc;
}, {} as Record<TaskStatus, number>);

// Distribuição por prioridade
const byPriority = tasks.reduce((acc, t) => {
  acc[t.priority] = (acc[t.priority] || 0) + 1;
  return acc;
}, {} as Record<TaskPriority, number>);
```

---

## Checklist de Problemas Comuns

| Problema | Causa | Solução |
|---|---|---|
| `404` nas rotas da API | Rewrite sem `/api/` no destino | `destination: \`${nodeUrl}/api/:path*\`` |
| `ECONNREFUSED` na porta 3000 | Backend não está rodando | Iniciar o backend antes do frontend |
| Login retorna erro de credenciais | Backend rodando mas campos vazios | Usar `useState` controlado nos inputs |
| Redirect após login volta para `/` | Token salvo só no localStorage | Salvar token também no `document.cookie` |
| `router.push` não redireciona | Cookie não sincronizado ainda | Usar `window.location.href` após login |
| CORS bloqueado pelo browser | `FRONTEND_URL` errado no backend | Setar `FRONTEND_URL=http://localhost:3001` no `.env` do backend |
