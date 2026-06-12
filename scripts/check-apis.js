#!/usr/bin/env node

/**
 * Script de verificação de conectividade das APIs
 * Executa: node scripts/check-apis.js
 */

const https = require("https");
const http = require("http");

const APIs = [
  {
    name: "Node.js API",
    url: "https://backendtaskinsight.onrender.com/",
    env: "NEXT_PUBLIC_NODE_API_URL",
  },
  {
    name: "Python API (FastAPI)",
    url: "https://taskinsight-data-analysis.onrender.com/",
    env: "NEXT_PUBLIC_PYTHON_API_URL",
  },
  {
    name: "Analytics API",
    url: "https://taskinsight-data-analysis.onrender.com/",
    env: "NEXT_PUBLIC_ANALYTICS_API_URL",
  },
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith("https") ? https : http;

    const timeout = setTimeout(() => {
      resolve({
        status: "⚠️ TIMEOUT",
        responseTime: Date.now() - startTime,
        error: "Timeout após 5s",
      });
    }, 5000);

    protocol
      .get(url, { timeout: 5000 }, (res) => {
        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;
        
        // Qualquer resposta é considerada como conectado
        resolve({
          status: "✅ OK",
          statusCode: res.statusCode,
          responseTime,
        });
      })
      .on("error", (err) => {
        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;
        resolve({
          status: "❌ ERRO",
          responseTime,
          error: err.message,
        });
      });
  });
}

async function main() {
  console.log("\n🔍 Verificando conectividade das APIs\n");
  console.log("═".repeat(70));

  const results = [];

  for (const api of APIs) {
    process.stdout.write(`${api.name.padEnd(30)} ... `);
    const result = await checkUrl(api.url);
    results.push({ ...api, ...result });

    const color = result.status.includes("✅") ? "\x1b[32m" : result.status.includes("⚠️") ? "\x1b[33m" : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(`${color}${result.status}${reset} (${result.responseTime}ms)`);
    if (result.statusCode) console.log(`${" ".repeat(32)}HTTP: ${result.statusCode}`);
    if (result.error) console.log(`${" ".repeat(32)}Erro: ${result.error}`);
  }

  console.log("═".repeat(70));

  // Resumo
  const allOk = results.every((r) => r.status.includes("✅"));
  console.log(
    `\n${allOk ? "✅" : "⚠️"} ${allOk ? "TODAS AS APIs RESPONDENDO" : "ALGUMAS APIs COM PROBLEMAS"}\n`
  );

  // Configuração
  console.log("📋 Configuração em env.local:\n");
  results.forEach((api) => {
    console.log(`${api.env}=${api.url.replace(/\/$/, "")}`);
  });

  console.log("\n✅ Verificação concluída!\n");
}

main().catch(console.error);
