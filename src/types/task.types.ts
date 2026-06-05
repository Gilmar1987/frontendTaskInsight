export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface IDeadlineHistoryEntry {
  oldDate: string | null;
  newDate: string;
  reason: string;
  changedAt: string;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  deadlineHistory: IDeadlineHistoryEntry[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTask {
  title: string;
  description: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
