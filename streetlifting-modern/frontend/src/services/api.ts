import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  User, UserCreate, UserLogin, AuthResponse,
  Workout, WorkoutCreate, WorkoutUpdate, WorkoutSummary, WorkoutProgress,
  TrainingBlock, TrainingBlockCreate,
  OneRepMax, OneRepMaxCreate,
  WorkoutStats, TrainingProgress,
  ApiResponse, PaginatedResponse,
  Routine, RoutineCreate, RoutineUpdate, RoutineSummary, RoutineTemplate, RoutineExercise, RoutineExerciseCreate
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    console.log('Initializing ApiService with baseURL:', `${API_BASE_URL}/api/v1`);
    
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Axios instance created:', this.api);

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  login = async (credentials: UserLogin): Promise<AuthResponse> => {
    console.log('Login method called, this.api:', this.api);
    console.log('API_BASE_URL:', API_BASE_URL);
    
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  register = async (userData: UserCreate): Promise<User> => {
    const response: AxiosResponse<User> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  getCurrentUser = async (): Promise<User> => {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  // Workout endpoints
  async createWorkout(workout: WorkoutCreate): Promise<Workout> {
    const response: AxiosResponse<Workout> = await this.api.post('/workouts/', workout);
    return response.data;
  }

  async getWorkouts(params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    day_type?: string;
  }): Promise<WorkoutSummary[]> {
    const response: AxiosResponse<WorkoutSummary[]> = await this.api.get('/workouts/', { params });
    return response.data;
  }

  async getWorkout(id: number): Promise<Workout> {
    const response: AxiosResponse<Workout> = await this.api.get(`/workouts/${id}`);
    return response.data;
  }

  async updateWorkout(id: number, workout: WorkoutUpdate): Promise<Workout> {
    const response: AxiosResponse<Workout> = await this.api.put(`/workouts/${id}`, workout);
    return response.data;
  }

  async deleteWorkout(id: number): Promise<void> {
    await this.api.delete(`/workouts/${id}`);
  }

  async getPendingWorkouts(): Promise<Workout[]> {
    const response: AxiosResponse<Workout[]> = await this.api.get('/workouts/pending/list');
    return response.data;
  }

  async saveWorkoutProgress(progress: WorkoutProgress): Promise<Workout> {
    const response: AxiosResponse<Workout> = await this.api.post('/workouts/progress/save', progress);
    return response.data;
  }

  async completeWorkout(id: number): Promise<Workout> {
    const response: AxiosResponse<Workout> = await this.api.post(`/workouts/${id}/complete`);
    return response.data;
  }

  async getWorkoutStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<WorkoutStats> {
    const response: AxiosResponse<WorkoutStats> = await this.api.get('/workouts/stats/summary', { params });
    return response.data;
  }

  // Training Block endpoints
  async createTrainingBlock(block: TrainingBlockCreate): Promise<TrainingBlock> {
    const response: AxiosResponse<TrainingBlock> = await this.api.post('/training-blocks/', block);
    return response.data;
  }

  async getTrainingBlocks(): Promise<TrainingBlock[]> {
    const response: AxiosResponse<TrainingBlock[]> = await this.api.get('/training-blocks/');
    return response.data;
  }

  async getTrainingBlock(id: number): Promise<TrainingBlock> {
    const response: AxiosResponse<TrainingBlock> = await this.api.get(`/training-blocks/${id}`);
    return response.data;
  }

  async updateTrainingBlock(id: number, block: Partial<TrainingBlock>): Promise<TrainingBlock> {
    const response: AxiosResponse<TrainingBlock> = await this.api.put(`/training-blocks/${id}`, block);
    return response.data;
  }

  async deleteTrainingBlock(id: number): Promise<void> {
    await this.api.delete(`/training-blocks/${id}`);
  }

  // Training Blocks API methods
  getAllBlocks = async (): Promise<TrainingBlock[]> => {
    const response: AxiosResponse<TrainingBlock[]> = await this.api.get('/blocks/');
    return response.data;
  }

  getCurrentBlock = async (): Promise<TrainingBlock | null> => {
    try {
      const response: AxiosResponse<TrainingBlock | null> = await this.api.get('/blocks/current/');
      return response.data;
    } catch (error: any) {
      // If it's a 404 error (no current block), return null instead of throwing
      if (error.response?.status === 404) {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }

  createBlock = async (blockData: TrainingBlockCreate): Promise<TrainingBlock> => {
    const response: AxiosResponse<TrainingBlock> = await this.api.post('/blocks/', blockData);
    return response.data;
  }

  updateBlock = async (id: string, blockData: Partial<TrainingBlockCreate>): Promise<TrainingBlock> => {
    const response: AxiosResponse<TrainingBlock> = await this.api.put(`/blocks/${id}/`, blockData);
    return response.data;
  }

  deleteBlock = async (id: string): Promise<void> => {
    await this.api.delete(`/blocks/${id}/`);
  }

  getBlockProgress = async (id: string): Promise<any> => {
    const response: AxiosResponse<any> = await this.api.get(`/blocks/${id}/progress/`);
    return response.data;
  }

  getWeeklyProjections = async (id: string): Promise<any> => {
    const response: AxiosResponse<any> = await this.api.get(`/blocks/${id}/projections/`);
    return response.data;
  }

  getRpeTables = async (id: string): Promise<any> => {
    const response: AxiosResponse<any> = await this.api.get(`/blocks/${id}/rpe-tables/`);
    return response.data;
  }

  // One Rep Max endpoints
  async createOneRepMax(oneRm: OneRepMaxCreate): Promise<OneRepMax> {
    const response: AxiosResponse<OneRepMax> = await this.api.post('/one-rep-maxes/', oneRm);
    return response.data;
  }

  async getOneRepMaxes(): Promise<OneRepMax[]> {
    const response: AxiosResponse<OneRepMax[]> = await this.api.get('/one-rep-maxes/');
    return response.data;
  }

  async getOneRepMax(id: number): Promise<OneRepMax> {
    const response: AxiosResponse<OneRepMax> = await this.api.get(`/one-rep-maxes/${id}`);
    return response.data;
  }

  async updateOneRepMax(id: number, oneRm: Partial<OneRepMax>): Promise<OneRepMax> {
    const response: AxiosResponse<OneRepMax> = await this.api.put(`/one-rep-maxes/${id}`, oneRm);
    return response.data;
  }

  async deleteOneRepMax(id: number): Promise<void> {
    await this.api.delete(`/one-rep-maxes/${id}`);
  }

  // Training Progress endpoints
  async getTrainingProgress(): Promise<TrainingProgress> {
    const response: AxiosResponse<TrainingProgress> = await this.api.get('/training/progress');
    return response.data;
  }

  async getSuggestedWeights(): Promise<any> {
    const response: AxiosResponse = await this.api.get('/training/suggested-weights');
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  removeAuthToken(): void {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Routine endpoints
  async getRoutines(): Promise<RoutineSummary[]> {
    try {
      console.log('API: Getting routines...');
      const response: AxiosResponse<RoutineSummary[]> = await this.api.get('/routines/');
      console.log('API: Routines response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Error getting routines:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRoutine(id: number): Promise<Routine> {
    try {
      console.log(`API: Getting routine ${id}...`);
      const response: AxiosResponse<Routine> = await this.api.get(`/routines/${id}`);
      console.log(`API: Routine ${id} response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`API: Error getting routine ${id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async createRoutine(routine: RoutineCreate): Promise<Routine> {
    try {
      console.log('API: Creating routine...', routine);
      const response: AxiosResponse<Routine> = await this.api.post('/routines/', routine);
      console.log('API: Routine created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Error creating routine:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateRoutine(id: number, routine: RoutineUpdate): Promise<Routine> {
    const response: AxiosResponse<Routine> = await this.api.put(`/routines/${id}`, routine);
    return response.data;
  }

  async deleteRoutine(id: number): Promise<void> {
    await this.api.delete(`/routines/${id}`);
  }

  async activateRoutine(id: number): Promise<Routine> {
    const response: AxiosResponse<Routine> = await this.api.post(`/routines/${id}/activate`);
    return response.data;
  }

  async getRoutineTemplates(): Promise<RoutineTemplate[]> {
    const response: AxiosResponse<RoutineTemplate[]> = await this.api.get('/routines/templates');
    return response.data;
  }

  async getActiveRoutines(): Promise<Routine[]> {
    const response: AxiosResponse<Routine[]> = await this.api.get('/routines/active');
    return response.data;
  }

  async getRoutinesByDay(day: number): Promise<Routine[]> {
    const response: AxiosResponse<Routine[]> = await this.api.get(`/routines/day/${day}`);
    return response.data;
  }

  async createFromTemplate(templateId: number, name: string): Promise<Routine> {
    const response: AxiosResponse<Routine> = await this.api.post(`/routines/templates/${templateId}/create?name=${encodeURIComponent(name)}`);
    return response.data;
  }

  async getRoutineExercises(routineId: number): Promise<RoutineExercise[]> {
    const response: AxiosResponse<RoutineExercise[]> = await this.api.get(`/routines/${routineId}/exercises`);
    return response.data;
  }

  async addRoutineExercise(routineId: number, exercise: RoutineExerciseCreate): Promise<RoutineExercise> {
    const response: AxiosResponse<RoutineExercise> = await this.api.post(`/routines/${routineId}/exercises`, exercise);
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export { apiService };
export default apiService; 