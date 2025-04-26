import axios from 'axios';
import {
  LoginRequest,
  LoginResponse,
  Task,
  TaskCreateRequest,
  TaskExport,
  TaskUpdateRequest,
  User,
  UserCreateRequest,
  UserUpdateRequest,
} from '@/types';
import config from '@/config';

// Create axios instance
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append('username', data.username);
  formData.append('password', data.password);
  
  const response = await api.post<LoginResponse>('/login/access-token', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

// Tasks API
export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
};

export const getTasksByWeek = async (weekNumber: number, year: number): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/tasks/week/${weekNumber}/${year}`);
  return response.data;
};

export const getPublicTasksByWeek = async (weekNumber: number, year: number): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/tasks/public/week/${weekNumber}/${year}`);
  return response.data;
};

export const getTask = async (id: number): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data: TaskCreateRequest): Promise<Task> => {
  const response = await api.post<Task>('/tasks/', data);
  return response.data;
};

export const updateTask = async (id: number, data: TaskUpdateRequest): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id: number): Promise<Task> => {
  const response = await api.delete<Task>(`/tasks/${id}`);
  return response.data;
};

// Users API
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users/');
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/users/${id}/`);
  return response.data;
};

export const createUser = async (data: UserCreateRequest): Promise<User> => {
  const response = await api.post<User>('/users/', data);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdateRequest): Promise<User> => {
  const response = await api.put<User>(`/users/${id}/`, data);
  return response.data;
};

export const updateCurrentUser = async (data: UserUpdateRequest): Promise<User> => {
  const response = await api.put<User>('/users/me/', data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<User> => {
  const response = await api.delete<User>(`/users/${id}/`);
  return response.data;
};

// Exports API
export const exportWeekly = async (weekNumber: number, year: number): Promise<TaskExport> => {
  const response = await api.get<TaskExport>(`/exports/weekly/${weekNumber}/${year}`);
  return response.data;
};

export const exportMonthly = async (month: number, year: number): Promise<TaskExport> => {
  const response = await api.get<TaskExport>(`/exports/monthly/${month}/${year}`);
  return response.data;
};

export const exportQuarterly = async (quarter: number, year: number): Promise<TaskExport> => {
  const response = await api.get<TaskExport>(`/exports/quarterly/${quarter}/${year}`);
  return response.data;
};

export const exportYearly = async (year: number): Promise<TaskExport> => {
  const response = await api.get<TaskExport>(`/exports/yearly/${year}`);
  return response.data;
}; 