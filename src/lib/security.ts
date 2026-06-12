/**
 * Módulo seguro de gerenciamento de tokens
 * Implementa boas práticas de segurança para armazenamento de tokens
 */

// NOTA: Para máxima segurança em produção, tokens devem ser armazenados em httpOnly cookies
// via API middleware. Esta é uma implementação melhorada para desenvolvimento.

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

/**
 * Salva o token de forma segura
 * Em produção, o servidor deve enviar tokens em httpOnly cookies
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;

  try {
    // Armazenar em localStorage com prefixo para evitar conflitos
    localStorage.setItem(TOKEN_KEY, token);

    // SEGURANÇA: Adicionar headers de segurança (isso será feito no middleware do servidor)
    // Para cookies de desenvolvimento, adicionar SameSite=Strict
    const sevenDaysInSeconds = 60 * 60 * 24 * 7;
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${sevenDaysInSeconds}; SameSite=Strict; Secure`;
  } catch (error) {
    console.error("[SecurityManager] Erro ao salvar token:", error);
  }
};

/**
 * Recupera o token armazenado
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("[SecurityManager] Erro ao recuperar token:", error);
    return null;
  }
};

/**
 * Remove o token de forma segura
 */
export const clearToken = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict; Secure`;
  } catch (error) {
    console.error("[SecurityManager] Erro ao limpar token:", error);
  }
};

/**
 * Salva dados de usuário de forma segura
 */
export const setUser = (user: any): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Salvar role em cookie para middleware
    if (user?.role) {
      document.cookie = `user_role=${user.role}; path=/; SameSite=Strict; Secure`;
    }
  } catch (error) {
    console.error("[SecurityManager] Erro ao salvar usuário:", error);
  }
};

/**
 * Recupera dados de usuário
 */
export const getUser = (): any | null => {
  if (typeof window === "undefined") return null;

  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("[SecurityManager] Erro ao recuperar usuário:", error);
    return null;
  }
};

/**
 * Remove dados de usuário
 */
export const clearUser = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(USER_KEY);
    document.cookie = "user_role=; path=/; max-age=0; SameSite=Strict; Secure";
  } catch (error) {
    console.error("[SecurityManager] Erro ao limpar usuário:", error);
  }
};

/**
 * Limpa todas as credenciais
 */
export const clearCredentials = (): void => {
  clearToken();
  clearUser();
};

/**
 * Verifica se o token é válido (verificação básica)
 */
export const isTokenValid = (): boolean => {
  const token = getToken();
  return !!token && token.length > 0;
};

/**
 * Classe customizada para erros de segurança
 */
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}
