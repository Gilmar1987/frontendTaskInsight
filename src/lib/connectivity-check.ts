/**
 * Verificação de conectividade das APIs
 * Valida se as URLs configuradas no env.local estão acessíveis
 */

interface ConnectivityResult {
  service: string;
  url: string;
  status: "✅ OK" | "❌ ERRO" | "⚠️ TIMEOUT";
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

/**
 * Testa a conectividade com uma URL
 */
async function testUrl(url: string, timeout = 5000): Promise<ConnectivityResult> {
  const service = url.includes("backendtaskinsight") 
    ? "Node.js API" 
    : url.includes("taskinsight-data-analysis")
      ? "Python API (FastAPI)"
      : "Analytics API";

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    // Considera 2xx, 3xx e até 4xx como "conectado"
    // (pode retornar 404 ou 401 mas a API está respondendo)
    if (response.ok || response.status === 404 || response.status === 401) {
      return {
        service,
        url,
        status: "✅ OK",
        statusCode: response.status,
        responseTime,
      };
    }

    return {
      service,
      url,
      status: "❌ ERRO",
      statusCode: response.status,
      responseTime,
      error: `HTTP ${response.status}`,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    if (error.name === "AbortError") {
      return {
        service,
        url,
        status: "⚠️ TIMEOUT",
        responseTime,
        error: `Timeout após ${timeout}ms`,
      };
    }

    return {
      service,
      url,
      status: "❌ ERRO",
      responseTime,
      error: error.message || "Falha ao conectar",
    };
  }
}

/**
 * Executa verificação de conectividade de todas as APIs
 */
export async function checkAllConnectivity(): Promise<ConnectivityResult[]> {
  const nodeUrl = process.env.NEXT_PUBLIC_NODE_API_URL;
  const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL;
  const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_API_URL;

  console.log("🔍 Iniciando verificação de conectividade...\n");

  const results = await Promise.all([
    nodeUrl ? testUrl(nodeUrl) : Promise.resolve(null),
    pythonUrl ? testUrl(pythonUrl) : Promise.resolve(null),
    analyticsUrl ? testUrl(analyticsUrl) : Promise.resolve(null),
  ]);

  return results.filter((r) => r !== null) as ConnectivityResult[];
}

/**
 * Exibe relatório formatado de conectividade
 */
export async function displayConnectivityReport(): Promise<void> {
  if (typeof window === "undefined") return; // Apenas no cliente

  const results = await checkAllConnectivity();

  console.group("%c📊 RELATÓRIO DE CONECTIVIDADE DAS APIs", "font-size: 14px; font-weight: bold; color: #2d6a9f");

  results.forEach((result) => {
    const icon = result.status.includes("✅") ? "✅" : result.status.includes("⚠️") ? "⚠️" : "❌";
    const color = result.status.includes("✅") ? "#27ae60" : result.status.includes("⚠️") ? "#f39c12" : "#e74c3c";

    console.log(
      `%c${icon} ${result.service}`,
      `color: ${color}; font-weight: bold`
    );
    console.log(`   URL: ${result.url}`);
    console.log(`   Status: ${result.status}`);
    if (result.statusCode) console.log(`   HTTP: ${result.statusCode}`);
    if (result.responseTime) console.log(`   Tempo: ${result.responseTime}ms`);
    if (result.error) console.log(`   Erro: ${result.error}`);
    console.log("");
  });

  const allOk = results.every((r) => r.status.includes("✅"));
  const summary = allOk ? "✅ TODAS AS APIs RESPONDENDO" : "⚠️ ALGUMAS APIs FORA DO AR";
  console.log(`%c${summary}`, `color: ${allOk ? "#27ae60" : "#e74c3c"}; font-weight: bold; font-size: 13px`);
  console.groupEnd();
}

/**
 * Hook para uso em componentes React
 */
export async function useConnectivityCheck() {
  if (typeof window === "undefined") return null;

  return await checkAllConnectivity();
}
