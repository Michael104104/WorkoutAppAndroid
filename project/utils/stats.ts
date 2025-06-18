import type { WorkoutData, WorkoutStats, TimePeriod } from '@/types/workout';

// Get date range for time period
const getDateRange = (period: TimePeriod): { start: Date; end: Date } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return { start: weekStart, end: weekEnd };
    
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { start: monthStart, end: monthEnd };
    
    case 'year':
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
      return { start: yearStart, end: yearEnd };
    
    case 'all-time':
      return { start: new Date(0), end: new Date(Date.now() + 24 * 60 * 60 * 1000) };
    
    default:
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
  }
};

// Filter workouts by time period
export const filterWorkoutsByPeriod = (
  workouts: { [date: string]: WorkoutData }, 
  period: TimePeriod
): WorkoutData[] => {
  const { start, end } = getDateRange(period);
  
  return Object.values(workouts).filter(workout => {
    const workoutDate = new Date(workout.date + 'T00:00:00');
    return workoutDate >= start && workoutDate < end;
  });
};

// Calculate stats from filtered workouts
export const calculateStats = (workouts: WorkoutData[]): WorkoutStats => {
  if (workouts.length === 0) {
    return {
      maxPerSet: {},
      totalReps: {},
      averages: {},
      workoutCount: 0,
    };
  }

  const exercises = ['pushups', 'pullups', 'squats', 'sitUps', 'planks'] as const;
  const stats: WorkoutStats = {
    maxPerSet: {},
    totalReps: {},
    averages: {},
    workoutCount: workouts.length,
  };

  exercises.forEach(exercise => {
    const maxValues = workouts.map(w => w.exercises[exercise].max).filter(v => v > 0);
    const totalValues = workouts.map(w => w.exercises[exercise].total).filter(v => v > 0);
    
    stats.maxPerSet[exercise] = maxValues.length > 0 ? Math.max(...maxValues) : 0;
    stats.totalReps[exercise] = totalValues.reduce((sum, val) => sum + val, 0);
    stats.averages[exercise] = totalValues.length > 0 
      ? Math.round(totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length * 10) / 10
      : 0;
  });

  return stats;
};

// Get chart data for visualization
export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
  }[];
}

export const getChartData = (
  workouts: WorkoutData[], 
  exercise: string, 
  metric: 'max' | 'total'
): ChartData => {
  const sortedWorkouts = workouts
    .filter(w => w.exercises[exercise as keyof typeof w.exercises])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const labels = sortedWorkouts.map(w => {
    const date = new Date(w.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const data = sortedWorkouts.map(w => {
    const exerciseData = w.exercises[exercise as keyof typeof w.exercises];
    return metric === 'max' ? exerciseData.max : exerciseData.total;
  });

  return {
    labels,
    datasets: [{
      data,
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue color
    }],
  };
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Get today's date in YYYY-MM-DD format
export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};