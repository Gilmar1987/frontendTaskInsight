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

export interface ThroughputItem {
  day: string;
  count: number;
}
export interface ThroughputResponse {
  success: boolean;
  data: ThroughputItem[];
}
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

export interface ResponseTimeItem {
  date: string;
  slaPercentage: number;
  target: 90; // Meta de SLA (exemplo: 90%)
}

export interface ResponseTimeResponse {
  success: boolean;
  data: ResponseTimeItem[];
}
