"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { nodeApi } from "@/lib/api";
import { analyticsApi } from "@/lib/analyticsApi";
import { useAuth } from "@/store/auth";
import { ITask, TaskStatus, TaskPriority, ICreateTask } from "@/types/task.types";
import { MetricsByStatusResponse, MetricsByPriorityResponse, AverageTimeResponse, 
  TimelineResponse,ThroughputResponse, ResponseTimeResponse } from "@/types/metrics.types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
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
  logoutBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    color: "#fff",
    padding: "0.35rem 0.9rem",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.9rem",
  } as React.CSSProperties,
  main: { maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" } as React.CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  } as React.CSSProperties,
  cardTitle: { margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: 600, color: "#1e3a5f" } as React.CSSProperties,
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" } as React.CSSProperties,
  field: { display: "flex", flexDirection: "column", gap: 4 } as React.CSSProperties,
  fieldFull: { display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" } as React.CSSProperties,
  label: { fontSize: "0.82rem", color: "#555", fontWeight: 500 } as React.CSSProperties,
  input: {
    padding: "0.5rem 0.7rem",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: "0.95rem",
    outline: "none",
  } as React.CSSProperties,
  select: {
    padding: "0.5rem 0.7rem",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: "0.95rem",
    background: "#fff",
  } as React.CSSProperties,
  btn: (color = "#2d6a9f"): React.CSSProperties => ({
    padding: "0.5rem 1rem",
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: 500,
  }),
  taskItem: {
    border: "1px solid #e8e8e8",
    borderRadius: 8,
    padding: "1rem",
    marginBottom: "0.75rem",
    background: "#fafafa",
  } as React.CSSProperties,
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } as React.CSSProperties,
  taskTitle: { fontWeight: 600, fontSize: "1rem", color: "#222" } as React.CSSProperties,
  badge: (color: string): React.CSSProperties => ({
    background: color + "22",
    color: color,
    border: `1px solid ${color}44`,
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: "0.78rem",
    fontWeight: 600,
  }),
  taskDesc: { color: "#666", fontSize: "0.9rem", marginBottom: 8 } as React.CSSProperties,
  taskMeta: { display: "flex", gap: "0.75rem", flexWrap: "wrap" as const, marginBottom: 10, fontSize: "0.82rem", color: "#888" },
  actions: { display: "flex", gap: "0.5rem", flexWrap: "wrap" as const },
  error: { color: "#c0392b", fontSize: "0.85rem", marginTop: "0.5rem" } as React.CSSProperties,
  empty: { textAlign: "center" as const, color: "#aaa", padding: "2rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" } as React.CSSProperties,
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
};

export default function DashboardPage() {
  const { user, token, clearAuth } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");

  const [metrics, setMetrics] = useState<{
    status: MetricsByStatusResponse | null;
    priority: MetricsByPriorityResponse | null;
    avgTime: AverageTimeResponse | null;
    
  }>({ status: null, priority: null, avgTime: null, });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [throughput, setThroughput] = useState<ThroughputResponse | null>(null);
  const [loadingThroughput, setLoadingThroughput] = useState(true);
  const [responseTime, setResponseTime] = useState<ResponseTimeResponse | null>(null);
  const [loadingResponseTime, setLoadingResponseTime] = useState(true);

  useEffect(() => {
    if (!token) { router.replace("/"); return; }
    loadTasks();
    loadMetrics();
    loadTimeline();
    loadThroughput();
    loadResponseTime();

  }, [token]);

  async function loadTimeline() {
    if (!token) return;
    setLoadingTimeline(true);
    try {
      const data = await analyticsApi.getTimeline(token);
      setTimeline(data);
    } catch {
      setTimeline(null);
    } finally {
      setLoadingTimeline(false);
    }
  }

  async function loadThroughput() {
    if (!token) return;
    setLoadingThroughput(true);
    try {
      const data = await analyticsApi.getThroughput(token);
      setThroughput(data);
    } catch {
      setThroughput(null);
    } finally {
      setLoadingThroughput(false);
    }
  }

  async function loadResponseTime() {
    if (!token) return;
    setLoadingResponseTime(true);
    try {
      const data = await analyticsApi.getResponseTime(token);
      setResponseTime(data);
    } catch {
      setResponseTime(null);
    } finally {
      setLoadingResponseTime(false);
    }
  }

  async function loadMetrics() {
    if (!token) return;
    setLoadingMetrics(true);
    try {
      const [status, priority, avgTime] = await Promise.all([
        analyticsApi.getByStatus(token),
        analyticsApi.getByPriority(token),
        analyticsApi.getAverageTime(token),
      ]);
      setMetrics({ status, priority, avgTime });
    } catch {
      setMetrics({ status: null, priority: null, avgTime: null });
    } finally {
      setLoadingMetrics(false);
    }
  }

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await nodeApi.get("/tasks");
      setTasks(res.data ?? res);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload: ICreateTask = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      priority: fd.get("priority") as TaskPriority,
      dueDate: fd.get("dueDate") ? new Date(fd.get("dueDate") as string).toISOString() : undefined,
    };
    try {
      await nodeApi.post("/tasks", payload);
      (e.target as HTMLFormElement).reset();
      await loadTasks();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar tarefa");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    try {
      await nodeApi.put(`/tasks/${id}`, { status });
      await loadTasks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta tarefa?")) return;
    try {
      await nodeApi.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  const filtered = filterStatus === "ALL" ? tasks : tasks.filter((t) => t.status === filterStatus);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}>📋 TaskInsight</span>
        <div style={s.navRight}>
          <span>Olá, {user?.name ?? "..."}</span>
          {user?.role === "admin" && (
            <button style={s.logoutBtn} onClick={() => router.push("/admin")}>⚙ Admin</button>
          )}
          <button style={s.logoutBtn} onClick={handleLogout}>Sair</button>
        </div>
      </nav>

      <main style={s.main}>
        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard("#2d6a9f")}>
            <div style={s.statNum}>{stats.total}</div>
            <div style={s.statLabel}>Total</div>
          </div>
          <div style={s.statCard("#f39c12")}>
            <div style={s.statNum}>{stats.pending}</div>
            <div style={s.statLabel}>Pendentes</div>
          </div>
          <div style={s.statCard("#2980b9")}>
            <div style={s.statNum}>{stats.inProgress}</div>
            <div style={s.statLabel}>Em Andamento</div>
          </div>
          <div style={s.statCard("#27ae60")}>
            <div style={s.statNum}>{stats.done}</div>
            <div style={s.statLabel}>Concluídas</div>
          </div>
        </div>

        {/* Métricas Analytics */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>📊 Métricas</h2>
          {loadingMetrics ? (
            <div style={s.empty}>Carregando métricas...</div>
          ) : !metrics.status ? (
            <div style={s.empty}>API de analytics indisponível.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              {/* Por Status */}
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "#555", fontSize: "0.85rem", textTransform: "uppercase" as const }}>Por Status</div>
                {(["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"] as const).map((s_) => (
                  <div key={s_} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.85rem", color: "#555" }}>{STATUS_LABEL[s_]}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${metrics.status!.data[s_].percent}%`, height: "100%", background: STATUS_COLOR[s_], borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: "0.82rem", color: "#888", minWidth: 32 }}>{metrics.status!.data[s_].count}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Por Prioridade */}
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "#555", fontSize: "0.85rem", textTransform: "uppercase" as const }}>Por Prioridade</div>
                {(["HIGH", "MEDIUM", "LOW"] as const).map((p_) => (
                  <div key={p_} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.85rem", color: "#555" }}>{p_ === "HIGH" ? "Alta" : p_ === "MEDIUM" ? "Média" : "Baixa"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${metrics.priority!.data[p_].percent}%`, height: "100%", background: PRIORITY_COLOR[p_], borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: "0.82rem", color: "#888", minWidth: 32 }}>{metrics.priority!.data[p_].count}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tempo Médio */}
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "#555", fontSize: "0.85rem", textTransform: "uppercase" as const }}>Tempo Médio de Conclusão</div>
                {metrics.avgTime!.data.average_time_hours === 0 ? (
                  <div style={{ color: "#aaa", fontSize: "0.85rem" }}>Nenhuma tarefa concluída com tempo registrado.</div>
                ) : (
                  <>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#1e3a5f" }}>
                      {metrics.avgTime!.data.average_time_hours.toFixed(1)}h
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#888" }}>
                      {metrics.avgTime!.data.average_time_days.toFixed(2)} dias
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#aaa", marginTop: 4 }}>
                      {Math.round(metrics.avgTime!.data.average_time_seconds / 60)} minutos
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de Linha — Produtividade Diária */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>📈 Produtividade Diária</h2>
          {loadingThroughput ? (
            <div style={s.empty}>Carregando gráfico...</div>
          ) : !throughput || throughput.data.length === 0 ? (
            <div style={s.empty}>Sem dados suficientes para exibir o gráfico.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={throughput.data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e0e0e0" }}
                  formatter={(value, name) => [
                    value,
                     "Tarefas" ,
                  ]}
                />
                <Legend
                  formatter={(value) =>
                     "Tarefas Finalizadas" 
                  }
                />
                
                <Line type="monotone" dataKey="count" stroke="#27ae60" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico de Linha —   backlog*/}
        <div style={s.card}>
          <h2 style={s.cardTitle}>📈 Evolução de Tarefas - Backlog</h2>
          {loadingTimeline ? (
            <div style={s.empty}>Carregando gráfico...</div>
          ) : !timeline || timeline.data.length === 0 ? (
            <div style={s.empty}>Sem dados suficientes para exibir o gráfico.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeline.data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e0e0e0" }}
                  formatter={(value, name) => [
                    value,
                    name === "criadas" ? "Criadas" : name === "finalizadas" ? "Finalizadas" : "Backlog",
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "criadas" ? "Criadas" : value === "finalizadas" ? "Finalizadas" : "Backlog"
                  }
                />
                <Line type="monotone" dataKey="criadas"    stroke="#2980b9" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="finalizadas" stroke="#27ae60" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="backlog"    stroke="#e74c3c" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

         {/* Gráfico de Linha — SLA Diária */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>📈 SLA Diária Meta 90% com 03 horas para iniciar atendimento</h2>
          {loadingResponseTime ? (
            <div style={s.empty}>Carregando gráfico...</div>
          ) : !responseTime || responseTime.data.length === 0 ? (
            <div style={s.empty}>Sem dados suficientes para exibir o gráfico.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={responseTime.data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e0e0e0" }}
                  formatter={(value, name) => [
                    value,
                    name === "slaPercentage" ? "SLA (%)" : name === "target" ? "Meta SLA 90%" : "",
                     
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "slaPercentage" ? "SLA das Tarefas %" : value === "target" ? "Meta SLA 90%" : ""
                      

                  }
                />
                
                <Line type="monotone" dataKey="slaPercentage" stroke="#27ae60" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" stroke="#f39c12" strokeWidth={2} dot={false} activeDot={false} strokeDasharray="5 5" />
                
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

         

        {/* Formulário de criação */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Nova Tarefa</h2>
          <form onSubmit={handleCreate}>
            <div style={s.grid}>
              <div style={s.fieldFull}>
                <label style={s.label}>Título *</label>
                <input style={s.input} name="title" placeholder="Título da tarefa" required minLength={3} maxLength={120} />
              </div>
              <div style={s.fieldFull}>
                <label style={s.label}>Descrição *</label>
                <textarea
                  style={{ ...s.input, resize: "vertical", minHeight: 70 }}
                  name="description"
                  placeholder="Descreva a tarefa..."
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Prioridade</label>
                <select style={s.select} name="priority" defaultValue="MEDIUM">
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Prazo</label>
                <input style={s.input} name="dueDate" type="date" />
              </div>
            </div>
            {formError && <div style={s.error}>{formError}</div>}
            <div style={{ marginTop: "0.75rem" }}>
              <button style={s.btn()} type="submit" disabled={submitting}>
                {submitting ? "Criando..." : "+ Criar Tarefa"}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de tarefas */}
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ ...s.cardTitle, margin: 0 }}>Tarefas</h2>
            <select style={{ ...s.select, fontSize: "0.85rem" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "ALL")}>
              <option value="ALL">Todos os status</option>
              <option value="PENDING">Pendentes</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="DONE">Concluídas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>

          {loading ? (
            <div style={s.empty}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>Nenhuma tarefa encontrada.</div>
          ) : (
            filtered.map((task) => (
              <div key={task._id} style={s.taskItem}>
                <div style={s.taskHeader}>
                  <span style={s.taskTitle}>{task.title}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={s.badge(STATUS_COLOR[task.status])}>{STATUS_LABEL[task.status]}</span>
                    <span style={s.badge(PRIORITY_COLOR[task.priority])}>{task.priority}</span>
                  </div>
                </div>
                <p style={s.taskDesc}>{task.description}</p>
                <div style={s.taskMeta}>
                  {task.dueDate && <span>📅 Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}</span>}
                  {task.completedAt && task.startedAt && (
                    <span>⏱ {Math.round((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 60000)} min</span>
                  )}
                  <span>🕐 {new Date(task.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <div style={s.actions}>
                  {NEXT_STATUS[task.status] && (
                    <button style={s.btn("#2980b9")} onClick={() => handleStatusChange(task._id, NEXT_STATUS[task.status]!)}>
                      {task.status === "PENDING" ? "▶ Iniciar" : "✓ Concluir"}
                    </button>
                  )}
                  {(task.status === "PENDING" || task.status === "IN_PROGRESS") && (
                    <button style={s.btn("#95a5a6")} onClick={() => handleStatusChange(task._id, "CANCELLED")}>
                      ✕ Cancelar
                    </button>
                  )}
                  {task.status !== "DONE" && task.status !== "CANCELLED" && (
                    <button style={s.btn("#e74c3c")} onClick={() => handleDelete(task._id)}>
                      🗑 Excluir
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
