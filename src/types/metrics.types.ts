

// Métricas para o Dashboard


// Métricas por Status
export interface StatusItem {
  count: number;
  percent: number;
}

export interface MetricsByStatusResponse {
  success: boolean;
  data: {
    total_tasks: number;
    PENDING: StatusItem;
    IN_PROGRESS: StatusItem;
    DONE: StatusItem;
    CANCELLED: StatusItem;
  };
}


// Métricas por Prioridade
export interface MetricsByPriorityResponse {
  success: boolean;
  data: {
    total_tasks: number;
    HIGH: StatusItem;
    MEDIUM: StatusItem;
    LOW: StatusItem;
  };
}

export interface AverageTimeResponse {
  success: boolean;
  data: {
    average_time_seconds: number;
    average_time_hours: number;
    average_time_days: number;
  };
}

// Throughput - Quantidade de tarefas concluídas por dia
export interface ThroughputItem {
  day: string;
  count: number;
}
export interface ThroughputResponse {
  success: boolean;
  data: ThroughputItem[];
}

// Timeline de Tarefas backlog, criadas e finalizadas
export interface TimelineItem {
  date: string;
  criadas: number;
  finalizadas: number;
  backlog: number;
}

export interface TimelineResponse {
  success: boolean;
  data: TimelineItem[];
}

// Tempo de Resposta por Dia (SLA)
export interface ResponseTimeItem {
  date: string;
  slaPercentage: number;
  target: 90; // Meta de SLA (exemplo: 90%)
}

export interface ResponseTimeResponse {
  success: boolean;
  data: ResponseTimeItem[];
}

// Resolução de Tempo por Dia
export interface ResolutionTimeItem {
  date: string;
  onTimeSolution: number;
  target: number;
}

export interface ResolutionTimeResponse {
  success: boolean;
  data: ResolutionTimeItem[];
}


// Tempo de Resposta por Mês
export interface ResponseTimeMesItem {
  month: string;
  slaPercentage: number;
  target: 90; // Meta de SLA (exemplo: 90%)
}

export interface ResponseTimeMesResponse {
  success: boolean;
  data: ResponseTimeMesItem[];
}

// Resolução de Tempo por Mês
export interface ResolutionTimeMesItem {
  month: string;
  onTimeSolution: number;
  target: number;
}

export interface ResolutionTimeMesResponse {
  success: boolean;
  data: ResolutionTimeMesItem[];
}