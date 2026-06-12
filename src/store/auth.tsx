"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { IUser } from "@/types/user.types";
import * as SecurityManager from "@/lib/security";

interface AuthCtx {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const t = SecurityManager.getToken();
      const u = SecurityManager.getUser();
      if (t && u) {
        setToken(t);
        setUser(u);
      }
    } catch (error) {
      console.error("[AuthProvider] Erro ao restaurar sessão:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAuth = (u: IUser, t: string) => {
    try {
      SecurityManager.setToken(t);
      SecurityManager.setUser(u);
      setUser(u);
      setToken(t);
    } catch (error) {
      console.error("[AuthProvider] Erro ao salvar autenticação:", error);
    }
  };

  const clearAuth = () => {
    try {
      SecurityManager.clearCredentials();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("[AuthProvider] Erro ao limpar autenticação:", error);
    }
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setAuth, clearAuth, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  }
  return context;
};
