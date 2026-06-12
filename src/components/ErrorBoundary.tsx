"use client";

import React, { ReactNode, useState, useEffect } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Erro capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              border: "1px solid #ff6b6b",
              borderRadius: "8px",
              backgroundColor: "#ffe0e0",
              color: "#c92a2a",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <h2>❌ Algo deu errado</h2>
            <p>{this.state.error?.message || "Erro desconhecido"}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#c92a2a",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Recarregar página
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
