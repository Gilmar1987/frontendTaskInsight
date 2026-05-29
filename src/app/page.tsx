"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { nodeApi } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { ILoginResponse } from "@/types/user.types";

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
  } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "2.5rem",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  } as React.CSSProperties,
  logo: {
    textAlign: "center",
    marginBottom: "1.5rem",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#1e3a5f",
  } as React.CSSProperties,
  tabs: {
    display: "flex",
    borderBottom: "2px solid #e0e0e0",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "0.6rem",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontWeight: active ? 700 : 400,
    color: active ? "#2d6a9f" : "#888",
    borderBottom: active ? "2px solid #2d6a9f" : "2px solid transparent",
    marginBottom: -2,
    fontSize: "1rem",
    transition: "all 0.2s",
  }),
  field: { marginBottom: "1rem" } as React.CSSProperties,
  label: {
    display: "block",
    marginBottom: 4,
    fontSize: "0.85rem",
    color: "#555",
    fontWeight: 500,
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "0.6rem 0.8rem",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
  } as React.CSSProperties,
  btn: {
    width: "100%",
    padding: "0.75rem",
    background: "#2d6a9f",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "0.5rem",
  } as React.CSSProperties,
  error: {
    color: "#c0392b",
    fontSize: "0.85rem",
    marginBottom: "0.75rem",
    background: "#fdecea",
    padding: "0.5rem 0.75rem",
    borderRadius: 6,
  } as React.CSSProperties,
  success: {
    color: "#1a7a4a",
    fontSize: "0.85rem",
    marginBottom: "0.75rem",
    background: "#e8f5e9",
    padding: "0.5rem 0.75rem",
    borderRadius: 6,
  } as React.CSSProperties,
};

export default function HomePage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth, token } = useAuth();
  const router = useRouter();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", confirm: "" });

  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  function getErrorMessage(err: unknown, fallback: string) {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (typeof err === "object" && err !== null && "message" in err) {
      return String((err as any).message);
    }
    return fallback;
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("[Login] Enviando:", { email: loginForm.email, password: "***" });
    try {
      const res: ILoginResponse = await nodeApi.post("/users/login", {
        email: loginForm.email,
        password: loginForm.password,
      });
      console.log("[Login] Resposta:", res);
      setAuth(res.data.user, res.data.token);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao fazer login"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (registerForm.password !== registerForm.confirm) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }
    try {
      await nodeApi.post("/users/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      setSuccess("Conta criada! Faça login.");
      setTab("login");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao cadastrar"));
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t: "login" | "register") {
    setTab(t);
    setError("");
    setSuccess("");
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>📋 TaskInsight</div>

        <div style={s.tabs}>
          <button style={s.tab(tab === "login")} onClick={() => switchTab("login")}>
            Entrar
          </button>
          <button style={s.tab(tab === "register")} onClick={() => switchTab("register")}>
            Cadastrar
          </button>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            <div style={s.field}>
              <label style={s.label}>E-mail</label>
              <input style={s.input} name="email" type="email" placeholder="seu@email.com" required
                value={loginForm.email} onChange={(e) => setLoginForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Senha</label>
              <input style={s.input} name="password" type="password" placeholder="••••••" required
                value={loginForm.password} onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={s.field}>
              <label style={s.label}>Nome</label>
              <input style={s.input} name="name" type="text" placeholder="Seu nome" required
                value={registerForm.name} onChange={(e) => setRegisterForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={s.field}>
              <label style={s.label}>E-mail</label>
              <input style={s.input} name="email" type="email" placeholder="seu@email.com" required
                value={registerForm.email} onChange={(e) => setRegisterForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Senha</label>
              <input style={s.input} name="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6}
                value={registerForm.password} onChange={(e) => setRegisterForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Confirmar Senha</label>
              <input style={s.input} name="confirm" type="password" placeholder="Repita a senha" required minLength={6}
                value={registerForm.confirm} onChange={(e) => setRegisterForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Criar Conta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
