"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { IUser } from "@/types/user.types";

interface AuthCtx {
  user: IUser | null;
  token: string | null;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      const parsed = JSON.parse(u);
      setToken(t);
      setUser(parsed);
      document.cookie = `token=${t}; path=/; max-age=${60 * 60 * 24 * 7}`;
      document.cookie = `role=${parsed.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  }, []);

  const setAuth = (u: IUser, t: string) => {
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    document.cookie = `token=${t}; path=/; max-age=${60 * 60 * 24 * 7}`;
    document.cookie = `role=${u.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
    setUser(u);
    setToken(t);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
