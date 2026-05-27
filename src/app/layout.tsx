import type { Metadata } from "next";
import { AuthProvider } from "@/store/auth";

export const metadata: Metadata = {
  title: "TaskInsight",
  description: "Gerenciador de tarefas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f5f5" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
