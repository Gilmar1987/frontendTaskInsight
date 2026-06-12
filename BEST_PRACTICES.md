# 📋 Guia de Boas Práticas - TaskInsight Frontend

## 🔒 Segurança

### Gerenciamento de Tokens
```typescript
import * as SecurityManager from '@/lib/security';

// Salvar token
SecurityManager.setToken(token);

// Recuperar token
const token = SecurityManager.getToken();

// Limpar token
SecurityManager.clearToken();

// Limpar tudo
SecurityManager.clearCredentials();
```

### Validação de Dados
```typescript
import { LoginSchema, validateData } from '@/lib/validation';

// Com react-hook-form (recomendado)
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(LoginSchema),
});

// Manual
const result = await validateData(LoginSchema, formData);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.errors);
}
```

### Tratamento de Erros de API
```typescript
import { nodeApi, ApiError } from '@/lib/api';

try {
  const data = await nodeApi.post('/users/login', credentials);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Status: ${error.status}, Message: ${error.message}`);
  }
}
```

### Error Boundary
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## 🧪 Testes

### Executar Testes
```bash
npm test                    # Todos os testes
npm run test:watch        # Modo watch
npm run test:coverage     # Relatório de cobertura
```

### Estrutura de Testes
```typescript
describe('Feature', () => {
  beforeEach(() => {
    // Setup
  });

  it('deve fazer algo', () => {
    // Test
    expect(result).toBe(expected);
  });
});
```

---

## 🏗️ Estrutura de Pastas

```
src/
├── app/               # Rotas Next.js App Router
├── components/        # Componentes reutilizáveis
│   ├── ErrorBoundary.tsx
│   ├── LoginForm.tsx
│   └── ...
├── lib/              # Lógica compartilhada
│   ├── api.ts        # Clientes de API
│   ├── security.ts   # Gerenciamento de tokens
│   ├── validation.ts # Schemas de validação
│   ├── security.test.ts
│   └── validation.test.ts
├── store/            # Context API
│   └── auth.tsx
├── types/            # Tipos TypeScript
│   ├── user.types.ts
│   ├── task.types.ts
│   └── metrics.types.ts
└── middleware.ts     # Middleware de segurança
```

---

## 📦 Dependências

### Produção
- **next** — Framework React
- **react**, **react-dom** — Biblioteca UI
- **typescript** — Type safety
- **zod** — Validação de schemas
- **react-hook-form** — Gerenciamento de forms
- **@hookform/resolvers** — Integração com Zod
- **recharts** — Gráficos

### Desenvolvimento
- **jest** — Test runner
- **@testing-library/react** — Testes de componentes
- **@testing-library/jest-dom** — Matchers customizados

---

## 🚀 Deployment

### Variáveis de Ambiente
```env
# .env.local
NEXT_PUBLIC_NODE_API_URL=http://localhost:3000
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_ANALYTICS_API_URL=http://127.0.0.1:8000
```

### Build e Start
```bash
npm run build      # Build para produção
npm start          # Iniciar servidor (porta 3001)
npm run dev        # Desenvolvimento (porta 3001 com hot reload)
```

---

## 🔐 Checklist de Segurança

### Antes de Fazer Commit
- [ ] Validar dados de entrada com Zod
- [ ] Não armazenar senhas em localStorage
- [ ] Usar `SecurityManager` para tokens
- [ ] Adicionar `Error Boundary` em componentes críticos
- [ ] Testar tratamento de erros

### Antes de Deploy
- [ ] Executar `npm audit` e resolver vulnerabilidades
- [ ] Executar `npm test` com cobertura >80%
- [ ] Executar `npm run type-check` sem erros
- [ ] Revisar `SECURITY_IMPROVEMENTS.md`

---

## 🐛 Debugging

### Logs de API
Os clientes de API (nodeApi, pythonApi) logam automaticamente:
```
[Node API] POST /users/login → 200
[Python API] GET /task/metrics/by-status → 200
```

### React DevTools
```bash
# Instale a extensão do navegador
# Chrome: React Developer Tools
# Firefox: React DevTools
```

### Browser DevTools
```javascript
// Console
localStorage.getItem('auth_token')
document.cookie

// Network Tab
// Verifique os headers de segurança
```

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Jest Documentation](https://jestjs.io/)
- [OWASP Security Guidelines](https://owasp.org/)

---

## ❓ Troubleshooting

### "Erro de CORS"
```typescript
// O frontend faz requisição para /api/node/:path*
// Que é reescrita para NODE_API_URL/api/:path*
// Certifique-se que NODE_API_URL está correto em .env.local
```

### "Token expirado"
```typescript
// Automaticamente o middleware detecta 401
// E limpa as credenciais, redirecionando para login
SecurityManager.clearCredentials();
```

### "Erro ao fazer parse de resposta"
```typescript
// Verifique se a API retorna JSON válido
// Caso contrário, a resposta será { message: "texto recebido" }
```

---

**Última atualização:** 11 de junho de 2026
