"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/lib/validation";
import { nodeApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

/**
 * Componente de Login com Validação Segura
 * 
 * Benefícios:
 * - Validação de entrada com Zod
 * - React Hook Form para performance
 * - Tratamento robusto de erros
 * - Feedback visual para usuário
 */
export function LoginForm() {
  const { setAuth } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Chamar API com dados validados
      const response = await nodeApi.post("/users/login", data);

      if (response.success) {
        const { user, token } = response.data;
        setAuth(user, token);
        
        // Redirecionar após sucesso
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        }
      } else {
        setApiError(response.message || "Erro ao fazer login");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro de conexão";
      setApiError(message);
      console.error("[LoginForm]", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
      <h2 style={styles.title}>Login Seguro</h2>

      {/* Erro da API */}
      {apiError && (
        <div style={styles.errorBox}>
          <strong>❌ Erro:</strong> {apiError}
        </div>
      )}

      {/* Campo Email */}
      <div style={styles.field}>
        <label htmlFor="email" style={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          style={{
            ...styles.input,
            borderColor: errors.email ? "#ff6b6b" : "#ddd",
          }}
          disabled={isSubmitting}
        />
        {errors.email && (
          <span style={styles.errorText}>{errors.email.message}</span>
        )}
      </div>

      {/* Campo Senha */}
      <div style={styles.field}>
        <label htmlFor="password" style={styles.label}>
          Senha
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          style={{
            ...styles.input,
            borderColor: errors.password ? "#ff6b6b" : "#ddd",
          }}
          disabled={isSubmitting}
        />
        {errors.password && (
          <span style={styles.errorText}>{errors.password.message}</span>
        )}
      </div>

      {/* Botão Submit */}
      <button
        type="submit"
        style={{
          ...styles.button,
          opacity: isSubmitting || isLoading ? 0.6 : 1,
          cursor: isSubmitting || isLoading ? "not-allowed" : "pointer",
        }}
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? "Entrando..." : "Fazer Login"}
      </button>

      {/* Link para signup */}
      <p style={styles.linkText}>
        Não tem conta?{" "}
        <a href="/auth/signup" style={styles.link}>
          Cadastre-se aqui
        </a>
      </p>
    </form>
  );
}

const styles = {
  form: {
    width: "100%",
    maxWidth: "400px",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  } as React.CSSProperties,
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#1e3a5f",
    fontSize: "1.5rem",
  } as React.CSSProperties,
  field: {
    marginBottom: "1rem",
  } as React.CSSProperties,
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#333",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  } as React.CSSProperties,
  errorBox: {
    padding: "1rem",
    marginBottom: "1rem",
    backgroundColor: "#ffe0e0",
    color: "#c92a2a",
    borderRadius: "4px",
    fontSize: "0.9rem",
  } as React.CSSProperties,
  errorText: {
    color: "#ff6b6b",
    fontSize: "0.85rem",
    marginTop: "0.25rem",
    display: "block",
  } as React.CSSProperties,
  button: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#2d6a9f",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  linkText: {
    textAlign: "center",
    marginTop: "1rem",
    fontSize: "0.9rem",
    color: "#666",
  } as React.CSSProperties,
  link: {
    color: "#2d6a9f",
    textDecoration: "none",
    fontWeight: "600",
  } as React.CSSProperties,
};
