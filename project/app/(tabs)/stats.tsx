import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, BarChart3 } from 'lucide-react-native';
import StatsCard from '@/components/StatsCard';
import StatsChart from '@/components/StatsChart';
import { getWorkoutData, exportAllData } from '@/utils/storage';
import { 
  filterWorkoutsByPeriod, 
  calculateStats, 
  getChartData,
  type TimePeriod 
} from '@/utils/stats';
import { EXERCISE_NAMES } from '@/types/workout';
import type { WorkoutData, WorkoutStats } from '@/types/workout';

const TIME_PERIODS: { key: TimePeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'all-time', label: 'All-Time' },
];

export default function StatsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [workouts, setWorkouts] = useState<{ [date: string]: WorkoutData }>({});
  const [stats, setStats] = useState<WorkoutStats>({
    maxPerSet: {},
    totalReps: {},
    averages: {},
    workoutCount: 0,
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    calculateCurrentStats();
  }, [workouts, selectedPeriod]);

  const loadWorkouts = async () => {
    try {
      const data = await getWorkoutData();
      setWorkouts(data);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    }
  };

  const calculateCurrentStats = () => {
    const filteredWorkouts = filterWorkoutsByPeriod(workouts, selectedPeriod);
    const currentStats = calculateStats(filteredWorkouts);
    setStats(currentStats);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportResult = await exportAllData();
      
      if (exportResult) {
        if (Platform.OS === 'web') {
          // For web, trigger download
          const blob = new Blob([exportResult], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `fitness_tracker_export_${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          
          Alert.alert('Success', 'Data exported successfully!');
        } else {
          Alert.alert('Success', `Data exported to: ${exportResult}`);
        }
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TIME_PERIODS.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.cardsContainer}>
      <View style={styles.cardRow}>
        <StatsCard
          title="Total Workouts"
          value={stats.workoutCount}
          icon={<BarChart3 size={20} color="#3b82f6" />}
        />
        <StatsCard
          title="Best Push-ups"
          value={stats.maxPerSet.pushups || 0}
          unit="reps"
        />
      </View>
      
      <View style={styles.cardRow}>
        <StatsCard
          title="Total Squats"
          value={stats.totalReps.squats || 0}
          unit="reps"
        />
        <StatsCard
          title="Avg Pull-ups"
          value={stats.averages.pullups || 0}
          unit="reps"
        />
      </View>

      <View style={styles.cardRow}>
        <StatsCard
          title="Total Sit-ups"
          value={stats.totalReps.sitUps || 0}
          unit="reps"
        />
        <StatsCard
          title="Best Plank"
          value={stats.maxPerSet.planks || 0}
          unit="sec"
        />
      </View>
    </View>
  );

  const renderCharts = () => {
    const filteredWorkouts = filterWorkoutsByPeriod(workouts, selectedPeriod);
    
    if (filteredWorkouts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No workout data for this period</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartsContainer}>
        <StatsChart
          data={getChartData(filteredWorkouts, 'pushups', 'total')}
          title="Push-ups Progress"
          type="line"
        />
        <StatsChart
          data={getChartData(filteredWorkouts, 'pullups', 'max')}
          title="Pull-ups Max Per Set"
          type="bar"
        />
        <StatsChart
          data={getChartData(filteredWorkouts, 'squats', 'total')}
          title="Squats Total"
          type="line"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Stats</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          disabled={isExporting}
        >
          <Download size={20} color="#3b82f6" />
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderPeriodSelector()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStatsCards()}
        {renderCharts()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 6,
  },
  exportButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  periodSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  periodButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  chartsContainer: {
    marginBottom: 40,
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    fontStyle: 'italic',
  },
});