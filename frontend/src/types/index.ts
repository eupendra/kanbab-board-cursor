export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  owner_id: number;
  week_number: number;
  year: number;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  is_manager: boolean;
}

export interface TaskExport {
  tasks: Task[];
  start_date: string;
  end_date: string;
  user_name: string;
  user_email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  is_public?: boolean;
  week_number: number;
  year: number;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  is_public?: boolean;
  week_number?: number;
  year?: number;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  full_name?: string;
  is_admin?: boolean;
  is_manager?: boolean;
}

export interface UserUpdateRequest {
  email?: string;
  password?: string;
  full_name?: string;
  is_admin?: boolean;
  is_manager?: boolean;
  is_active?: boolean;
} 