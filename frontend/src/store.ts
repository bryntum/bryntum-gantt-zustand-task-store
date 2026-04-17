import { create } from 'zustand';

const API_URL = 'http://localhost:1337/api';

interface Task {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  percentDone?: number;
  parentId?: number | null;
  expanded?: boolean;
  rollup?: boolean;
  manuallyScheduled?: boolean;
  assignee?: string;
  [key: string]: unknown;
}

interface AppStore {
  // UI state
  selectedMembers: string[];
  toggleMember: (name: string) => void;

  // Task data
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<Task | undefined>;
  updateTask: (id: number, changes: Partial<Task>) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
    // UI state
    selectedMembers : [],
    toggleMember    : (name) =>
        set((state) => ({
            selectedMembers : state.selectedMembers.includes(name)
                ? state.selectedMembers.filter((m) => m !== name)
                : [...state.selectedMembers, name]
        })),

    // Task data
    tasks     : [],
    isLoading : true,

    fetchTasks : async() => {
        try {
            const res = await fetch(`${API_URL}/load`);
            const data = await res.json();
            if (data.success) {
                set({ tasks : data.tasks.rows, isLoading : false });
            }
        }
        catch (error) {
            console.error('Failed to fetch tasks:', error);
            set({ isLoading : false });
        }
    },

    addTask : async(task) => {
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method  : 'POST',
                headers : { 'Content-Type' : 'application/json' },
                body    : JSON.stringify(task)
            });
            const data = await res.json();
            if (data.success) {
                set((state) => ({ tasks : [...state.tasks, data.task] }));
                return data.task as Task;
            }
        }
        catch (error) {
            console.error('Failed to add task:', error);
        }
        return undefined;
    },

    updateTask : async(id, changes) => {
        try {
            await fetch(`${API_URL}/tasks/${id}`, {
                method  : 'PUT',
                headers : { 'Content-Type' : 'application/json' },
                body    : JSON.stringify(changes)
            });
            set((state) => ({
                tasks : state.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t))
            }));
        }
        catch (error) {
            console.error('Failed to update task:', error);
        }
    },

    removeTask : async(id) => {
        try {
            await fetch(`${API_URL}/tasks/${id}`, { method : 'DELETE' });
            set((state) => ({
                tasks : state.tasks.filter((t) => t.id !== id)
            }));
        }
        catch (error) {
            console.error('Failed to remove task:', error);
        }
    }
}));
