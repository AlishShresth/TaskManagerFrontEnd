import { type User } from './auth';
import { type TaskStatus } from './task';

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: User;
  members: User[];
  statuses: TaskStatus[];
  sprints: Array<{
    id: number;
    name: string;
    start_date: string;
    end_date: string;
  }>;
  created_at: string;
  updated_at: string;
}
