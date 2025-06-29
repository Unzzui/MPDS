// User types
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Exercise types
export interface Exercise {
  id: number;
  workout_id: number;
  name: string;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
  completed: boolean;
  set_number: number;
  created_at: string;
  sets: ExerciseSet[];
}

export interface ExerciseSet {
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface ExerciseCreate {
  name: string;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
  completed: boolean;
  set_number: number;
}

export interface ExerciseUpdate {
  name?: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  notes?: string;
  completed?: boolean;
  set_number?: number;
}

// Workout types
export interface Workout {
  id: number;
  user_id: number;
  date: string;
  day_type: string;
  success: boolean;
  in_progress: boolean;
  completed: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
  exercises: Exercise[];
}

export interface WorkoutCreate {
  date: string;
  day_type: string;
  notes?: string;
  exercises: ExerciseCreate[];
}

export interface WorkoutUpdate {
  date?: string;
  day_type?: string;
  success?: boolean;
  in_progress?: boolean;
  completed?: boolean;
  notes?: string;
}

export interface WorkoutSummary {
  id: number;
  date: string;
  day_type: string;
  success: boolean;
  completed: boolean;
  inprogress?: boolean;
  exercise_count: number;
  total_sets: number;
  exercises: Exercise[];
}

export interface WorkoutProgress {
  workout_id?: number;
  date: string;
  day_type: string;
  in_progress: boolean;
  completed: boolean;
  exercises: ExerciseCreate[];
}

// Training Block types
export interface BlockStage {
  id: number;
  block_id: number;
  name: string;
  week_number: number;
  load_percentage: number;
  description?: string;
  created_at: string;
}

export interface TrainingBlock {
  id: string;
  user_id: number;
  name: string;
  duration: number;
  total_weeks: number;
  current_stage: string;
  start_date: string;
  end_date: string;
  current_week: number;
  rm_pullups: number;
  rm_dips: number;
  rm_muscleups: number;
  rm_squats: number;
  strategy: string;
  weekly_increment: number;
  deload_week?: number;
  is_active: boolean;
  status: 'in_progress' | 'completed' | 'planned';
  routines_by_day: { [key: string]: string };
  increment_type: 'percentage' | 'absolute';
  created_at: string;
  updated_at?: string;
  stages: BlockStage[];
}

export interface TrainingBlockCreate {
  name: string;
  duration: number;
  total_weeks: number;
  current_stage: string;
  start_date: string;
  end_date: string;
  current_week: number;
  rm_pullups: number;
  rm_dips: number;
  rm_muscleups: number;
  rm_squats: number;
  strategy: string;
  weekly_increment: number;
  deload_week?: number;
  routines_by_day: { [key: string]: string };
  increment_type: 'percentage' | 'absolute';
  stages: BlockStageCreate[];
}

export interface BlockStageCreate {
  name: string;
  week_number: number;
  load_percentage: number;
  description?: string;
}

export interface WeeklyProjection {
  [week: string]: {
    [reps: string]: number;
  };
}

export interface RpeTable {
  [rpe: string]: number[];
}

export interface BlockProgress {
  current_week: number;
  total_weeks: number;
  progress_percentage: number;
  next_workout?: string;
  weekly_projections: WeeklyProjection;
  rpe_tables: {
    [exercise: string]: RpeTable;
  };
}

// One Rep Max types
export interface OneRepMax {
  id: number;
  user_id: number;
  exercise: string;
  one_rm: number;
  date_achieved: string;
  created_at: string;
  updated_at?: string;
}

export interface OneRepMaxCreate {
  exercise: string;
  one_rm: number;
  date_achieved: string;
}

// Statistics types
export interface WorkoutStats {
  total_workouts: number;
  completed_workouts: number;
  completion_rate: number;
  exercise_stats: ExerciseStat[];
}

export interface ExerciseStat {
  name: string;
  avg_weight: number;
  max_weight: number;
  avg_reps: number;
  total_sets: number;
}

export interface SuggestedWeights {
  exercise: string;
  weights_3x3: number;
  weights_3x5: number;
  weights_3x8: number;
}

export interface TrainingProgress {
  current_block?: TrainingBlock;
  suggested_weights: SuggestedWeights[];
  current_week: number;
  total_weeks: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Chart types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressData {
  date: string;
  one_rm: number;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Routine Types
export interface RoutineExercise {
  id: number;
  routine_id: number;
  exercise_name: string;
  order: number;
  sets: number;
  reps: string;
  weight_percentage?: number;
  rest_time?: number;
  is_main_lift: boolean;
  notes?: string;
  created_at: string;
}

export interface Routine {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  exercises: string[];
  days: number[];
  main_lifts: string[];
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at?: string;
  routine_exercises: RoutineExercise[];
}

export interface RoutineCreate {
  name: string;
  description?: string;
  exercises: string[];
  days: number[];
  main_lifts: string[];
  is_active?: boolean;
  is_template?: boolean;
  routine_exercises?: RoutineExerciseCreate[];
}

export interface RoutineUpdate {
  name?: string;
  description?: string;
  exercises?: string[];
  days?: number[];
  main_lifts?: string[];
  is_active?: boolean;
  is_template?: boolean;
}

export interface RoutineSummary {
  id: number;
  name: string;
  description?: string;
  exercise_count: number;
  day_count: number;
  is_active: boolean;
  created_at: string;
}

export interface RoutineTemplate {
  id: number;
  name: string;
  description?: string;
  exercises: string[];
  days: number[];
  main_lifts: string[];
  is_template: boolean;
}

export interface RoutineExerciseCreate {
  exercise_name: string;
  order: number;
  sets: number;
  reps: string;
  weight_percentage?: number;
  rest_time?: number;
  is_main_lift?: boolean;
  notes?: string;
}

export interface RoutineExerciseUpdate {
  exercise_name?: string;
  order?: number;
  sets?: number;
  reps?: string;
  weight_percentage?: number;
  rest_time?: number;
  is_main_lift?: boolean;
  notes?: string;
} 