import * as SecurityManager from "@/lib/security";

const NODE_BASE = "/api/node";
const PYTHON_BASE = "/api/python";

const NODE_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

if (typeof window !== "undefined") {
  console.log("%c[TaskInsight] Configuração de APIs", "color: #2d6a9f; font-weight: bold; font-size: 13px");
  console.log("%c  Node.js API →", "color: #27ae60", NODE_URL);
  console.log("%c  FastAPI (Python) →", "color: #8e44ad", PYTHON_URL);
}

/**
 * Classe para erros de API com contexto detalhado
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public endpoint: string,
    public method: string = "GET"
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Realiza requisições HTTP com tratamento de erros e autenticação
 */
/** Remove caracteres que poderiam ser usados para injetar entradas falsas nos logs */
function sanitizeLog(value: string): string {
  return value.replace(/[\r\n\t]/g, "");
}

async function fetchApi(url: string, options: RequestInit = {}): Promise<any> {
  const token = SecurityManager.getToken();
  const method = options.method || "GET";
  const isNode = url.startsWith(NODE_BASE);
  const apiLabel = isNode ? `[Node API]` : `[Python API]`;
  const apiColor = isNode ? "color: #27ae60" : "color: #8e44ad";

  console.log(`%c${apiLabel}`, apiColor, method, sanitizeLog(url));

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        // SEGURANÇA: Adicionar headers de prevenção de clickjacking
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        // Adicionar token se disponível
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    // Tratamento de autenticação expirada
    if (res.status === 401) {
      const isLoginRoute = url.includes("/users/login");
      if (!isLoginRoute) {
        console.warn("[API] Token expirado, limpando credenciais"); // mensagem estática, sem dados externos
        SecurityManager.clearCredentials();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
    }

    const text = await res.text();
    let json: any = null;

    // Tentar fazer parse do JSON
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      json = { message: text || undefined };
    }

    // Tratamento de erros
    if (!res.ok) {
      const errorMessage =
        res.status === 401
          ? "Credenciais inválidas ou token expirado"
          : res.status === 403
            ? "Você não tem permissão para acessar este recurso"
            : res.status === 404
              ? "Recurso não encontrado"
              : json?.errors?.[0]?.message ||
                json?.message ||
                (typeof json === "string" ? json : undefined) ||
                `Erro ${res.status}`;

      // 4xx de negócio (ex: 409 Título já existe) não são erros de sistema
      if (res.status >= 500) {
        console.error(`%c${apiLabel}`, "color: #e74c3c", method, sanitizeLog(url), "→", res.status);
      }
      throw new ApiError(res.status, errorMessage, url, method);
    }

    console.log(`%c${apiLabel}`, apiColor, method, sanitizeLog(url), "→", res.status);
    return json;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`%c${apiLabel}`, "color: #e74c3c", "Erro de rede"); // não loga o objeto de erro externo
    throw new Error(`Erro de conexão com ${isNode ? "Node API" : "Python API"}`);
  }
}

/**
 * Cliente da API Node.js
 */
export const nodeApi = {
  get: (path: string) => fetchApi(`${NODE_BASE}${path}`),
  post: (path: string, body: unknown) =>
    fetchApi(`${NODE_BASE}${path}`, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) =>
    fetchApi(`${NODE_BASE}${path}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => fetchApi(`${NODE_BASE}${path}`, { method: "DELETE" }),
};

/**
 * Cliente da API Python (FastAPI)
 */
export const pythonApi = {
  get: (path: string) => fetchApi(`${PYTHON_BASE}${path}`),
  post: (path: string, body: unknown) =>
    fetchApi(`${PYTHON_BASE}${path}`, { method: "POST", body: JSON.stringify(body) }),
};
