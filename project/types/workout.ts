export interface ExerciseData {
  max: number;
  total: number;
}

export interface WorkoutData {
  date: string; // YYYY-MM-DD format
  exercises: {
    pushups: ExerciseData;
    pullups: ExerciseData;
    squats: ExerciseData;
    sitUps: ExerciseData;
    planks: ExerciseData; // in seconds for planks
  };
  photo?: string; // file path or URI
  timestamp: number;
}

export interface WorkoutStats {
  maxPerSet: { [key: string]: number };
  totalReps: { [key: string]: number };
  averages: { [key: string]: number };
  workoutCount: number;
}

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all-time';

export const EXERCISE_NAMES = {
  pushups: 'Push-ups',
  pullups: 'Pull-ups', 
  squats: 'Squats',
  sitUps: 'Sit-ups',
  planks: 'Planks (sec)',
} as const;

export type ExerciseType = keyof typeof EXERCISE_NAMES;