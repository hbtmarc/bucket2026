export type GoalStatus = 'backlog' | 'planned' | 'doing' | 'done';
export type TargetType = 'none' | 'count' | 'boolean';
export type QuarterHint = 'T1' | 'T2' | 'T3' | 'T4' | null;

export interface Theme {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Goal {
  id: string;
  themeId: string;
  title: string;
  description?: string;
  status: GoalStatus;
  targetType: TargetType;
  targetValue?: number | null;
  currentValue?: number | null;
  priority: 1 | 2 | 3 | 4;
  budgetPlanned?: number | null;
  quarterHint?: QuarterHint;
  dueDate?: string | null;
  notesMarkdown?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  doneAt?: number | null;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Entry {
  id: string;
  title: string;
  date: string;
  location?: string;
  cost?: number | null;
  url?: string;
  hasCinematicRecord?: boolean;
  notesMarkdown?: string;
  createdAt: number;
  updatedAt: number;
}
