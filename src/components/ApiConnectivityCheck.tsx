"use client";

import { useEffect, useState } from "react";
import { checkAllConnectivity } from "@/lib/connectivity-check";

interface ConnectivityResult {
  service: string;
  url: string;
  status: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

export function ApiConnectivityCheck() {
  const [results, setResults] = useState<ConnectivityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await checkAllConnectivity();
        setResults(data);
      } catch (error) {
        console.error("Erro ao verificar conectividade:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 15px",
          backgroundColor: "#2d6a9f",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "12px",
          zIndex: 999,
        }}
        title="Clique para ver status das APIs"
      >
        🔗 API Status
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        maxWidth: "400px",
        zIndex: 1000,
        fontFamily: "monospace",
        fontSize: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, color: "#2d6a9f", fontSize: "14px" }}>🔗 API Connectivity</h3>
        <button
          onClick={() => setExpanded(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            color: "#999",
          }}
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div style={{ color: "#999" }}>Verificando...</div>
      ) : (
        <div>
          {results.map((result, idx) => (
            <div key={idx} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span>{result.status}</span>
                <strong>{result.service}</strong>
              </div>
              <div style={{ color: "#666", fontSize: "11px" }}>
                {result.url}
              </div>
              {result.statusCode && (
                <div style={{ color: "#999", fontSize: "11px" }}>
                  HTTP {result.statusCode} • {result.responseTime}ms
                </div>
              )}
              {result.error && (
                <div style={{ color: "#e74c3c", fontSize: "11px" }}>
                  ⚠️ {result.error}
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee" }}>
            <small style={{ color: "#999" }}>
              ✅ Último verificado: {new Date().toLocaleTimeString()}
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
