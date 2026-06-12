import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware de segurança e autenticação
 * Implementa:
 * - Proteção de rotas com verificação de token
 * - Verificação de roles (admin/user)
 * - Headers de segurança globais
 * - Redirecionamento apropriado
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value || request.cookies.get("token")?.value;
  const role = request.cookies.get("user_role")?.value || request.cookies.get("role")?.value;
  const isRoot = request.nextUrl.pathname === "/";
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");

  // Redirecionar para login se acessar rotas protegidas sem token
  if (!token && (isDashboard || isAdmin)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirecionar se usuário comum tentar acessar admin
  if (token && isAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirecionar para dashboard se usuário autenticado está na root
  if (token && isRoot) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Criar resposta com headers de segurança
  const response = NextResponse.next();

  // SEGURANÇA: Headers de proteção recomendados
  response.headers.set("X-Frame-Options", "DENY"); // Previne clickjacking
  response.headers.set("X-Content-Type-Options", "nosniff"); // Previne MIME type sniffing
  response.headers.set("X-XSS-Protection", "1; mode=block"); // Proteção XSS (legado)
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin"); // Controla Referrer
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()" // Restringe APIs perigosas
  );

  // CSP (Content Security Policy) - restringe recursos que podem ser carregados
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vlibras.gov.br; style-src 'self' 'unsafe-inline' https://vlibras.gov.br; img-src 'self' data: https:; font-src 'self' data: https://vlibras.gov.br; connect-src 'self' https://backendtaskinsight.onrender.com https://taskinsight-data-analysis.onrender.com https://vlibras.gov.br; frame-src https://vlibras.gov.br; worker-src blob:;"
  );

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*"],
};
