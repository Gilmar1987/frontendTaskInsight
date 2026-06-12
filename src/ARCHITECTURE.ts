// ============================================================================
// 🏗️ ARQUITETURA - TaskInsight Frontend
// ============================================================================

/**
 * Fluxo de Autenticação Seguro
 * 
 *     ┌─────────────────────────────────────────────────────────────────┐
 *     │                         CLIENTE (Browser)                        │
 *     └─────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 *     ┌─────────────────────────────────────────────────────────────────┐
 *     │  1. User submits LoginForm (com validação Zod)                 │
 *     │     ├─ Email validado                                           │
 *     │     ├─ Senha validada (min 6 chars)                             │
 *     │     └─ Error boundary para capturar erros                       │
 *     └─────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 *     ┌─────────────────────────────────────────────────────────────────┐
 *     │  2. API Call via nodeApi.post()                                │
 *     │     ├─ Adiciona Authorization header automaticamente           │
 *     │     ├─ Content-Type: application/json                          │
 *     │     ├─ X-Frame-Options: DENY                                   │
 *     │     └─ CSP headers                                             │
 *     └─────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 *     ┌─────────────────────────────────────────────────────────────────┐
 *     │              API NODE.JS (Backend)                              │
 *     │                 /users/login                                     │
 *     └─────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 *     ┌─────────────────────────────────────────────────────────────────┐
 *     │  3. Response { user, token, refreshToken }                     │
 *     │     └─ Se 401: clearCredentials() e redireciona para /         │
 *     └─────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 *     ┌─────────────────────────────────────────────────────────────────┐
 *     │  4. SecurityManager.setToken(token)                            │
 *     │     ├─ localStorage.setItem('auth_token', token)               │
 *     │     ├─ document.cookie (SameSite=Strict)                       │
 *     │     └─ setUser() + role cookie                                 │
 *     └─────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 *     ┌─────────────────────────────────────────────────────────────────┐
 *     │  5. AuthContext.setAuth(user, token)                           │
 *     │     ├─ Atualiza estado React                                    │
 *     │     └─ isAuthenticated() = true                                 │
 *     └─────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 *     ┌─────────────────────────────────────────────────────────────────┐
 *     │  6. Middleware.ts redirecion para /dashboard                   │
 *     │     └─ Verifica token em cookies                                │
 *     └─────────────────────────────────────────────────────────────────┘
 */

/**
 * Camadas da Arquitetura
 * 
 * ┌──────────────────────────────────────────────────────────────────┐
 * │                         PRESENTATION                              │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  Pages                                                     │ │
 * │  │  ├─ page.tsx (login/signup)                               │ │
 * │  │  ├─ dashboard/page.tsx                                    │ │
 * │  │  └─ admin/page.tsx                                        │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * │                                                                  │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  Components                                                │ │
 * │  │  ├─ LoginForm.tsx (com validação)                         │ │
 * │  │  ├─ ErrorBoundary.tsx (tratamento de erros)              │ │
 * │  │  └─ ...outros componentes                                │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * └──────────────────────────────────────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌──────────────────────────────────────────────────────────────────┐
 * │                        STATE MANAGEMENT                           │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  AuthContext (src/store/auth.tsx)                         │ │
 * │  │  ├─ user: IUser | null                                    │ │
 * │  │  ├─ token: string | null                                  │ │
 * │  │  ├─ isLoading: boolean                                    │ │
 * │  │  ├─ setAuth(user, token)                                 │ │
 * │  │  ├─ clearAuth()                                           │ │
 * │  │  └─ isAuthenticated()                                     │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * └──────────────────────────────────────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌──────────────────────────────────────────────────────────────────┐
 * │                       BUSINESS LOGIC                              │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  Validation (src/lib/validation.ts)                       │ │
 * │  │  ├─ LoginSchema                                           │ │
 * │  │  ├─ SignupSchema                                          │ │
 * │  │  ├─ CreateTaskSchema                                      │ │
 * │  │  └─ UpdateTaskSchema                                      │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * │                                                                  │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  Security Manager (src/lib/security.ts)                   │ │
 * │  │  ├─ setToken(), getToken(), clearToken()                 │ │
 * │  │  ├─ setUser(), getUser(), clearUser()                    │ │
 * │  │  ├─ clearCredentials()                                    │ │
 * │  │  └─ isTokenValid()                                        │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * └──────────────────────────────────────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌──────────────────────────────────────────────────────────────────┐
 * │                         API LAYER                                 │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  API Clients (src/lib/api.ts)                             │ │
 * │  │  ├─ nodeApi.get/post/put/delete()                         │ │
 * │  │  ├─ pythonApi.get/post()                                  │ │
 * │  │  ├─ fetchApi() com retry logic                            │ │
 * │  │  └─ ApiError class com contexto                           │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * │                                                                  │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  Analytics API (src/lib/analyticsApi.ts)                 │ │
 * │  │  └─ getByStatus, getByPriority, etc                      │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * └──────────────────────────────────────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌──────────────────────────────────────────────────────────────────┐
 * │                    INFRASTRUCTURE                                 │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  Middleware (src/middleware.ts)                           │ │
 * │  │  ├─ Validação de autenticação                             │ │
 * │  │  ├─ Verificação de roles                                  │ │
 * │  │  ├─ Headers de segurança (CSP, X-Frame-Options, etc)      │ │
 * │  │  └─ Redirecionamento apropriado                           │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * │                                                                  │
 * │  ┌────────────────────────────────────────────────────────────┐ │
 * │  │  Next.js Config (next.config.js)                          │ │
 * │  │  └─ Rewrite para /api/node/* e /api/python/*            │ │
 * │  └────────────────────────────────────────────────────────────┘ │
 * └──────────────────────────────────────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌──────────────────────────────────────────────────────────────────┐
 * │                      BACKEND APIS                                 │
 * │  ├─ Node.js API (localhost:3000)                                 │
 * │  │  ├─ /users/login                                              │
 * │  │  ├─ /users/signup                                             │
 * │  │  ├─ /tasks/* (CRUD)                                           │
 * │  │  └─ ...                                                       │
 * │  │                                                               │
 * │  └─ FastAPI (localhost:8000)                                    │
 * │     ├─ /task/metrics/by-status                                  │
 * │     ├─ /task/metrics/by-priority                                │
 * │     └─ ...                                                      │
 * └──────────────────────────────────────────────────────────────────┘
 */

/**
 * Fluxo de Proteção de Segurança
 * 
 * Input User
 *   │
 *   ├─→ [Validação Zod] Valida email, senha
 *   │      └─→ Se inválido: mostra erro no formulário
 *   │      └─→ Se válido: continua
 *   │
 *   ├─→ [Validação API] Envia para backend
 *   │      └─→ API faz validação adicional
 *   │      └─→ Se 401: clearCredentials() + redireciona
 *   │      └─→ Se 403: acesso negado (role inválida)
 *   │      └─→ Se 404: recurso não encontrado
 *   │
 *   ├─→ [SecurityManager] Armazena token com segurança
 *   │      └─→ localStorage com chave cifrada
 *   │      └─→ Cookie com SameSite=Strict, Secure
 *   │      └─→ Role em cookie separada
 *   │
 *   ├─→ [Headers de Segurança] Middleware adiciona:
 *   │      ├─ X-Frame-Options: DENY (previne clickjacking)
 *   │      ├─ X-Content-Type-Options: nosniff (previne MIME sniffing)
 *   │      ├─ CSP (Content-Security-Policy)
 *   │      ├─ X-XSS-Protection
 *   │      └─ Referrer-Policy
 *   │
 *   ├─→ [Middleware] Verifica rota protegida
 *   │      ├─ Sem token? → redireciona para /
 *   │      ├─ Role inválida? → redireciona para /dashboard
 *   │      └─ Autenticado? → permite acesso
 *   │
 *   └─→ [Error Boundary] Captura erros inesperados
 *      └─→ Mostra UI de erro amigável
 *      └─→ Log de erro em console
 *      └─→ Opção para recarregar página
 */

/**
 * Dependências Críticas
 * 
 * Segurança
 * - zod: Validação de schemas com type safety
 * - @hookform/resolvers: Integração Zod + React Hook Form
 * - next middleware: Headers de segurança
 * 
 * Estado & Formas
 * - react-hook-form: Gerenciamento de forms com performance
 * 
 * API
 * - fetch (nativo): Requisições HTTP com interceptação
 * 
 * Visualização
 * - recharts: Gráficos de analytics
 * 
 * Desenvolvimento
 * - jest: Test runner
 * - @testing-library/react: Testes de componentes
 */

/**
 * Proteção contra Ataques Comuns
 * 
 * XSS (Cross-Site Scripting)
 * ├─ CSP (Content-Security-Policy) header
 * ├─ Validação de entrada com Zod
 * ├─ Sanitização de dados na API
 * └─ Error Boundary para erros inesperados
 * 
 * CSRF (Cross-Site Request Forgery)
 * ├─ SameSite=Strict em cookies
 * ├─ Token armazenado com segurança
 * └─ Validação de origem no middleware
 * 
 * Clickjacking
 * ├─ X-Frame-Options: DENY header
 * └─ Previne iframe com página em domain diferente
 * 
 * MIME Type Sniffing
 * ├─ X-Content-Type-Options: nosniff
 * └─ Força navegador respeitar Content-Type
 * 
 * Man-in-the-Middle (MITM)
 * ├─ HTTPS em produção (força via Secure flag no cookie)
 * └─ Token Bearer no header Authorization
 * 
 * Session Hijacking
 * ├─ Token armazenado em httpOnly cookie (requer backend)
 * ├─ Token com expiração (refresh token via backend)
 * └─ Validação de token no middleware
 */

export default "Documentação de Arquitetura"
