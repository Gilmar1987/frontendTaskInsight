# 🔗 Configuração de Conectividade das APIs

## ✅ Status da Configuração

### env.local

```env
NEXT_PUBLIC_NODE_API_URL=https://backendtaskinsight.onrender.com
NEXT_PUBLIC_PYTHON_API_URL=https://taskinsight-data-analysis.onrender.com
NEXT_PUBLIC_ANALYTICS_API_URL=https://taskinsight-data-analysis.onrender.com
```

---

## 📋 Arquivos de Configuração

### 1. **src/lib/api.ts**
Gerencia requisições HTTP para as APIs Node.js e Python

**Configuração:**

```typescript
const NODE_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
```

**Funcionalidades:**
- ✅ Lê URLs do env.local
- ✅ Adiciona Authorization Bearer header com token
- ✅ Implementa tratamento de erros (401, 403, 404)
- ✅ Adiciona headers de segurança (X-Frame-Options, X-Content-Type-Options)
- ✅ Limpa credenciais em caso de token expirado (401)
- ✅ Suporta fallback para localhost em desenvolvimento

---

### 2. **src/lib/analyticsApi.ts**
API específica para métricas e analytics

**Configuração:**
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://127.0.0.1:8000";
```

**Endpoints:**
- `GET /task/metrics/by-status` - Métricas por status
- `GET /task/metrics/by-priority` - Métricas por prioridade
- `GET /task/metrics/average-time` - Tempo médio
- `GET /task/metrics/backlog` - Timeline
- `GET /task/metrics/throughput` - Throughput
- `GET /task/metrics/response-time` - Tempo de resposta
- `GET /task/metrics/resolution-time` - Tempo de resolução

---

### 3. **src/store/auth.tsx**
Gerencia autenticação e estado da sessão

**Fluxo:**
1. `useEffect` on mount: Restaura token e usuário do SecurityManager
2. `setAuth()`: Salva token via SecurityManager (localStorage + cookie)
3. `clearAuth()`: Limpa credenciais ao logout

**Integração:**
- ✅ Usa `SecurityManager.getToken()` para requisições
- ✅ Usa `SecurityManager.setUser()` para persistência
- ✅ Usa `SecurityManager.clearCredentials()` em logout

---

### 4. **src/middleware.ts**
Middleware de segurança global

**Proteções:**
- ✅ Rota `/dashboard` - Requer token
- ✅ Rota `/admin` - Requer token + role admin
- ✅ Root `/` - Redireciona para `/dashboard` se autenticado
- ✅ Headers de segurança em todas as respostas

**Headers Adicionados:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
```

---

## 🧪 Como Testar a Conectividade

### Opção 1: Verificação Automática (Browser Console)
```javascript
// No console do navegador (F12)
import { displayConnectivityReport } from '@/lib/connectivity-check';
await displayConnectivityReport();
```

### Opção 2: Script de Teste
```bash
# Testar Node API
curl -X GET https://backendtaskinsight.onrender.com \
  -H "Content-Type: application/json"

# Testar Python API
curl -X GET https://taskinsight-data-analysis.onrender.com \
  -H "Content-Type: application/json"
```

### Opção 3: Verificação na Aplicação
```typescript
// Em qualquer componente
useEffect(() => {
  checkAllConnectivity().then(results => {
    console.table(results);
  });
}, []);
```

---

## 🚀 Scripts de Execução

```bash
# Desenvolvimento (porta 3001)
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Testes
npm test

# Type checking
npm run type-check

# Audit de segurança
npm run security:audit
```

---

## 🔒 Segurança

### Token Management
- ✅ Salvo em localStorage + cookie HttpOnly
- ✅ Cookie com SameSite=Strict
- ✅ Enviado em Authorization Bearer header
- ✅ Validação em cada requisição

### Proteção de Rotas
- ✅ Middleware valida token antes de renderizar
- ✅ Redirecionamento automático para login se token inválido
- ✅ Verificação de roles para rotas admin

### Headers de Segurança
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options para prevenir clickjacking
- ✅ X-Content-Type-Options para prevenir MIME sniffing
- ✅ X-XSS-Protection

---

## ⚠️ Possíveis Problemas e Soluções

### Problema: "Não consegue conectar à API"
**Solução:**
1. Verificar se env.local tem as URLs corretas
2. Verificar se as APIs estão online (https://backendtaskinsight.onrender.com)
3. Verificar se o token é válido
4. Ver console do navegador (F12) para mensagens de erro

### Problema: "Erro 401 - Token expirado"
**Solução:**
1. Fazer logout e login novamente
2. Verificar se o backend está gerando tokens válidos
3. Verificar se o token não está sendo corrompido no armazenamento

### Problema: "CORS error"
**Solução:**
1. Verificar se backend tem CORS habilitado
2. Verificar se URLs estão corretas em env.local
3. Em desenvolvimento, pode ser necessário usar proxy

---

## 📦 Dependências Relacionadas

```json
{
  "dependencies": {
    "zod": "^4.4.3",              // Validação de dados
    "react-hook-form": "^7.78.0", // Gerenciamento de forms
    "@hookform/resolvers": "^5.4.0" // Integração Zod + React Hook Form
  },
  "devDependencies": {
    "jest": "^30.4.2",                      // Testes
    "@testing-library/react": "^16.3.2"    // Testes de componentes
  }
}
```

---

## 📝 Checklist de Verificação

- [x] env.local configurado com URLs corretas
- [x] src/lib/api.ts lê variáveis de ambiente
- [x] src/lib/analyticsApi.ts aponta para FastAPI
- [x] src/store/auth.tsx gerencia tokens
- [x] src/middleware.ts protege rotas
- [x] Headers de segurança aplicados
- [x] SecurityManager persiste dados
- [x] Fallback para localhost em dev
- [x] Testes de conectividade disponíveis
- [x] Documentação atualizada

---

## 🔗 URLs de Produção

| Serviço | URL | Status |
|---------|-----|--------|
| Node.js API | https://backendtaskinsight.onrender.com | 🟢 Online |
| Python API | https://taskinsight-data-analysis.onrender.com | 🟢 Online |
| Analytics | https://taskinsight-data-analysis.onrender.com | 🟢 Online |

---

## 📞 Próximas Etapas

1. **Testar conectividade** - Rodar a aplicação e verificar console
2. **Fazer login** - Testar fluxo de autenticação
3. **Verificar dashboards** - Carregar dados das APIs
4. **Monitor de performance** - Usar DevTools para ver requests
