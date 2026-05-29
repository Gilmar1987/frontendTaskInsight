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
  const apiLabel = isNode ? `[Node API]` : `[Python API]`;
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
    const isLoginRoute = url.includes("/users/login");
    if (!isLoginRoute) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  }

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text || undefined };
  }

  if (!res.ok) {
    const errorMessage = res.status === 401
      ? "Credenciais inválidas"
      : json?.errors?.[0]?.message
      || json?.message
      || (typeof json === "string" ? json : undefined)
      || `Erro ${res.status}`;

    console.error(`%c${apiLabel}`, "color: #e74c3c", method, url, "→", res.status, errorMessage);
    throw new Error(errorMessage);
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
