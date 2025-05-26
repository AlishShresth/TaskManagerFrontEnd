import { type User } from './auth';

export interface TaskStatus {
  id: number;
  name: string;
  project: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus | null;
  priority: 'low' | 'medium' | 'high';
  project: {
    id: number;
    name: string;
  };
  parent_task: number | null;
  assigned_to: User | null;
  created_by: User;
  deadline: string | null;
  estimated_hours: number;
  actual_hours: number;
  sprint: {
    id: number;
    name: string;
  } | null;
  story_points: number | null;
  comments: Array<{ id: number; content: string; author: User }>;
  attachments: Array<{ id: number; file: string; uploaded_by: User }>;
  history: Array<{
    id: number;
    field: string;
    old_value: string | null;
    new_value: string | null;
    user: User | null;
  }>;
  created_at: string;
  updated_at: string;
}
