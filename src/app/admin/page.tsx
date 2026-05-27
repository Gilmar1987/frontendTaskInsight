"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nodeApi } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { IUser } from "@/types/user.types";
import { ITask, TaskStatus, TaskPriority } from "@/types/task.types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  DONE: "Concluída",
  CANCELLED: "Cancelada",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING: "#f39c12",
  IN_PROGRESS: "#2980b9",
  DONE: "#27ae60",
  CANCELLED: "#95a5a6",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: "#27ae60",
  MEDIUM: "#f39c12",
  HIGH: "#e74c3c",
};

const s = {
  page: { minHeight: "100vh", background: "#f0f2f5" } as React.CSSProperties,
  nav: {
    background: "#1e3a5f",
    color: "#fff",
    padding: "0 2rem",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,
  navTitle: { fontWeight: 700, fontSize: "1.2rem" } as React.CSSProperties,
  navRight: { display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem" } as React.CSSProperties,
  navBtn: (color = "rgba(255,255,255,0.15)"): React.CSSProperties => ({
    background: color,
    border: "none",
    color: "#fff",
    padding: "0.35rem 0.9rem",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.9rem",
    textDecoration: "none",
  }),
  main: { maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" } as React.CSSProperties,
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    borderBottom: "2px solid #e0e0e0",
    paddingBottom: "0.5rem",
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: "0.5rem 1.2rem",
    border: "none",
    background: active ? "#1e3a5f" : "#fff",
    color: active ? "#fff" : "#555",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
    fontSize: "0.95rem",
  }),
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  statCard: (color: string): React.CSSProperties => ({
    background: "#fff",
    borderRadius: 10,
    padding: "1rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderTop: `3px solid ${color}`,
  }),
  statNum: { fontSize: "1.8rem", fontWeight: 700, color: "#1e3a5f" } as React.CSSProperties,
  statLabel: { fontSize: "0.8rem", color: "#888", marginTop: 2 } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  } as React.CSSProperties,
  cardTitle: { margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: 600, color: "#1e3a5f" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.9rem" },
  th: {
    textAlign: "left" as const,
    padding: "0.6rem 0.8rem",
    background: "#f5f7fa",
    color: "#555",
    fontWeight: 600,
    borderBottom: "2px solid #e8e8e8",
    fontSize: "0.82rem",
  },
  td: {
    padding: "0.65rem 0.8rem",
    borderBottom: "1px solid #f0f0f0",
    color: "#333",
    verticalAlign: "middle" as const,
  },
  badge: (color: string): React.CSSProperties => ({
    background: color + "22",
    color: color,
    border: `1px solid ${color}44`,
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: "0.75rem",
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
  }),
  roleBadge: (role: string): React.CSSProperties => ({
    background: role === "admin" ? "#1e3a5f22" : "#27ae6022",
    color: role === "admin" ? "#1e3a5f" : "#27ae60",
    border: `1px solid ${role === "admin" ? "#1e3a5f44" : "#27ae6044"}`,
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: "0.75rem",
    fontWeight: 600,
  }),
  deleteBtn: {
    background: "#fdecea",
    color: "#c0392b",
    border: "1px solid #f5c6cb",
    borderRadius: 6,
    padding: "3px 10px",
    cursor: "pointer",
    fontSize: "0.8rem",
  } as React.CSSProperties,
  empty: { textAlign: "center" as const, color: "#aaa", padding: "2rem" },
  searchInput: {
    padding: "0.5rem 0.8rem",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: "0.9rem",
    width: 240,
    outline: "none",
  } as React.CSSProperties,
  filterRow: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1rem",
    flexWrap: "wrap" as const,
    alignItems: "center",
  } as React.CSSProperties,
  select: {
    padding: "0.5rem 0.7rem",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: "0.9rem",
    background: "#fff",
  } as React.CSSProperties,
};

export default function AdminPage() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "tasks">("users");

  const [users, setUsers] = useState<IUser[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [userSearch, setUserSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriority | "ALL">("ALL");

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    loadUsers();
    loadTasks();
  }, [user]);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const res = await nodeApi.get("/users");
      setUsers(res.data ?? res);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadTasks() {
    setLoadingTasks(true);
    try {
      const res = await nodeApi.get("/tasks/all");
      setTasks(res.data ?? res);
    } catch {
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Desativar este usuário?")) return;
    try {
      await nodeApi.delete(`/users/${id}`);
      await loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao desativar usuário");
    }
  }

  async function handleDeleteTask(id: string) {
    if (!confirm("Excluir esta tarefa?")) return;
    try {
      await nodeApi.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir tarefa");
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase());
    const matchStatus = taskStatusFilter === "ALL" || t.status === taskStatusFilter;
    const matchPriority = taskPriorityFilter === "ALL" || t.priority === taskPriorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => !u.isDeleted).length,
    totalTasks: tasks.length,
    doneTasks: tasks.filter((t) => t.status === "DONE").length,
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}>📋 TaskInsight — <span style={{ color: "#f39c12" }}>Admin</span></span>
        <div style={s.navRight}>
          <span>Olá, {user?.name ?? "..."}</span>
          <button style={s.navBtn()} onClick={() => router.push("/dashboard")}>Dashboard</button>
          <button style={s.navBtn("#e74c3c44")} onClick={handleLogout}>Sair</button>
        </div>
      </nav>

      <main style={s.main}>
        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard("#2d6a9f")}>
            <div style={s.statNum}>{stats.totalUsers}</div>
            <div style={s.statLabel}>Total Usuários</div>
          </div>
          <div style={s.statCard("#27ae60")}>
            <div style={s.statNum}>{stats.activeUsers}</div>
            <div style={s.statLabel}>Usuários Ativos</div>
          </div>
          <div style={s.statCard("#f39c12")}>
            <div style={s.statNum}>{stats.totalTasks}</div>
            <div style={s.statLabel}>Total Tarefas</div>
          </div>
          <div style={s.statCard("#8e44ad")}>
            <div style={s.statNum}>{stats.doneTasks}</div>
            <div style={s.statLabel}>Tarefas Concluídas</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={s.tab(tab === "users")} onClick={() => setTab("users")}>
            👥 Usuários ({users.length})
          </button>
          <button style={s.tab(tab === "tasks")} onClick={() => setTab("tasks")}>
            📋 Todas as Tarefas ({tasks.length})
          </button>
        </div>

        {/* Usuários */}
        {tab === "users" && (
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ ...s.cardTitle, margin: 0 }}>Usuários</h2>
              <input
                style={s.searchInput}
                placeholder="Buscar por nome ou email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            {loadingUsers ? (
              <div style={s.empty}>Carregando...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={s.empty}>Nenhum usuário encontrado.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Nome</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Criado em</th>
                    <th style={s.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={s.td}>{u.name}</td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}><span style={s.roleBadge(u.role)}>{u.role}</span></td>
                      <td style={s.td}>
                        <span style={s.badge(u.isDeleted ? "#95a5a6" : "#27ae60")}>
                          {u.isDeleted ? "Inativo" : "Ativo"}
                        </span>
                      </td>
                      <td style={s.td}>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td style={s.td}>
                        {!u.isDeleted && u._id !== user?._id && (
                          <button style={s.deleteBtn} onClick={() => handleDeleteUser(u._id)}>
                            Desativar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tarefas */}
        {tab === "tasks" && (
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ ...s.cardTitle, margin: 0 }}>Todas as Tarefas</h2>
            </div>
            <div style={s.filterRow}>
              <input
                style={s.searchInput}
                placeholder="Buscar por título..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
              />
              <select style={s.select} value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value as TaskStatus | "ALL")}>
                <option value="ALL">Todos os status</option>
                <option value="PENDING">Pendente</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="DONE">Concluída</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
              <select style={s.select} value={taskPriorityFilter} onChange={(e) => setTaskPriorityFilter(e.target.value as TaskPriority | "ALL")}>
                <option value="ALL">Todas as prioridades</option>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>
            {loadingTasks ? (
              <div style={s.empty}>Carregando...</div>
            ) : filteredTasks.length === 0 ? (
              <div style={s.empty}>Nenhuma tarefa encontrada.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Título</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Prioridade</th>
                    <th style={s.th}>Prazo</th>
                    <th style={s.th}>Criado em</th>
                    <th style={s.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t) => (
                    <tr key={t._id}>
                      <td style={s.td}>
                        <div style={{ fontWeight: 500 }}>{t.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 2 }}>{t.description.slice(0, 60)}{t.description.length > 60 ? "..." : ""}</div>
                      </td>
                      <td style={s.td}><span style={s.badge(STATUS_COLOR[t.status])}>{STATUS_LABEL[t.status]}</span></td>
                      <td style={s.td}><span style={s.badge(PRIORITY_COLOR[t.priority])}>{t.priority}</span></td>
                      <td style={s.td}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString("pt-BR") : "—"}</td>
                      <td style={s.td}>{new Date(t.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td style={s.td}>
                        <button style={s.deleteBtn} onClick={() => handleDeleteTask(t._id)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
