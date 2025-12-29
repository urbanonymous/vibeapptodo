export type StepStatus = "not_started" | "in_progress" | "completed" | "skipped";

export type ResourceType = "doc" | "video" | "article" | "tool" | "provider" | "other";

export type Resource = {
  id: string;
  type: ResourceType;
  title: string;
  url: string;
  description?: string;
};

export type StepTemplate = {
  number: number;
  title: string;
  description: string;
  phase: string;
  resources: Resource[];
  external_links: Resource[];
};

export type StepProgress = {
  step_number: number;
  status: StepStatus;
  progress_percent: number;
  notes: string;
  completed_at?: string;
  reminders: Array<{ id: string; remind_at: string; message: string; sent: boolean }>;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  overall_progress: number;
  created_at: string;
  updated_at: string;
};

