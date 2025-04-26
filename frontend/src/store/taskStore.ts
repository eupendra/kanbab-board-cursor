import { create } from 'zustand';
import { Task, TaskCreateRequest, TaskStatus, TaskUpdateRequest } from '@/types';
import * as api from '@/services/api';
import { getWeekNumber } from '@/utils/dateUtils';

interface TaskState {
  tasks: Task[];
  currentWeekTasks: Task[];
  isLoading: boolean;
  error: string | null;
  currentWeek: number;
  currentYear: number;
  
  fetchTasks: () => Promise<void>;
  fetchTasksByWeek: (weekNumber: number, year: number) => Promise<void>;
  createTask: (task: TaskCreateRequest) => Promise<void>;
  updateTask: (id: number, task: TaskUpdateRequest) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  setCurrentWeek: (week: number, year: number) => void;
  moveTask: (taskId: number, newStatus: TaskStatus) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => {
  // Get current week and year
  const today = new Date();
  const { week, year } = getWeekNumber(today);
  
  return {
    tasks: [],
    currentWeekTasks: [],
    isLoading: false,
    error: null,
    currentWeek: week,
    currentYear: year,
    
    fetchTasks: async () => {
      set({ isLoading: true, error: null });
      try {
        const tasks = await api.getTasks();
        set({ tasks, isLoading: false });
      } catch (error) {
        console.error('Error fetching tasks:', error);
        set({ 
          error: 'Failed to fetch tasks. Please try again.', 
          isLoading: false 
        });
      }
    },
    
    fetchTasksByWeek: async (weekNumber: number, year: number) => {
      set({ isLoading: true, error: null });
      try {
        const tasks = await api.getTasksByWeek(weekNumber, year);
        set({ currentWeekTasks: tasks, isLoading: false });
      } catch (error) {
        console.error('Error fetching tasks by week:', error);
        set({ 
          error: 'Failed to fetch tasks for this week. Please try again.', 
          isLoading: false 
        });
      }
    },
    
    createTask: async (task: TaskCreateRequest) => {
      set({ isLoading: true, error: null });
      try {
        const newTask = await api.createTask(task);
        
        // Add the new task to the state
        set((state) => ({ 
          tasks: [...state.tasks, newTask],
          currentWeekTasks: task.week_number === state.currentWeek && task.year === state.currentYear 
            ? [...state.currentWeekTasks, newTask] 
            : state.currentWeekTasks,
          isLoading: false 
        }));
        
        // Refresh the tasks for the current week to ensure everything is up to date
        const { currentWeek, currentYear } = get();
        await get().fetchTasksByWeek(currentWeek, currentYear);
      } catch (error) {
        console.error('Error creating task:', error);
        set({ 
          error: 'Failed to create task. Please try again.', 
          isLoading: false 
        });
      }
    },
    
    updateTask: async (id: number, task: TaskUpdateRequest) => {
      set({ isLoading: true, error: null });
      try {
        const updatedTask = await api.updateTask(id, task);
        set((state) => ({ 
          tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
          currentWeekTasks: state.currentWeekTasks.map(t => t.id === id ? updatedTask : t),
          isLoading: false 
        }));
      } catch (error) {
        console.error('Error updating task:', error);
        set({ 
          error: 'Failed to update task. Please try again.', 
          isLoading: false 
        });
      }
    },
    
    deleteTask: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        await api.deleteTask(id);
        set((state) => ({ 
          tasks: state.tasks.filter(t => t.id !== id),
          currentWeekTasks: state.currentWeekTasks.filter(t => t.id !== id),
          isLoading: false 
        }));
      } catch (error) {
        console.error('Error deleting task:', error);
        set({ 
          error: 'Failed to delete task. Please try again.', 
          isLoading: false 
        });
      }
    },
    
    setCurrentWeek: (week: number, year: number) => {
      set({ currentWeek: week, currentYear: year });
      get().fetchTasksByWeek(week, year);
    },
    
    moveTask: async (taskId: number, newStatus: TaskStatus) => {
      try {
        // Find the task in the current state
        const task = get().currentWeekTasks.find(t => t.id === taskId);
        if (!task) {
          console.error(`Task with ID ${taskId} not found`);
          return;
        }
        
        // Optimistically update the UI
        set((state) => ({
          currentWeekTasks: state.currentWeekTasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
          ),
          tasks: state.tasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        }));
        
        // Send the update to the server
        await api.updateTask(taskId, { status: newStatus });
        
        // No need to refresh the entire list as we've already updated the state
      } catch (error) {
        console.error('Error moving task:', error);
        
        // Revert the optimistic update on error
        const originalTask = get().tasks.find(t => t.id === taskId);
        if (originalTask) {
          set((state) => ({
            currentWeekTasks: state.currentWeekTasks.map(t => 
              t.id === taskId ? originalTask : t
            ),
            tasks: state.tasks.map(t => 
              t.id === taskId ? originalTask : t
            ),
            error: 'Failed to move task. Please try again.'
          }));
        }
      }
    },
  };
}); 