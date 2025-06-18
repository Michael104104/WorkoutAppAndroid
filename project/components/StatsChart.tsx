import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import type { ChartData } from '@/utils/stats';

interface StatsChartProps {
  data: ChartData;
  title: string;
  type?: 'line' | 'bar';
  height?: number;
}

const screenWidth = Dimensions.get('window').width;

export default function StatsChart({ 
  data, 
  title, 
  type = 'line', 
  height = 220 
}: StatsChartProps) {
  if (data.labels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#2a2a2a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3b82f6',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#2a2a2a',
    },
  };

  const chartData = {
    labels: data.labels.slice(-7), // Show last 7 data points to prevent overcrowding
    datasets: data.datasets.map(dataset => ({
      data: dataset.data.slice(-7),
      color: dataset.color,
      strokeWidth: 2,
    })),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {type === 'line' ? (
          <LineChart
            data={chartData}
            width={screenWidth - 60}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <BarChart
            data={chartData}
            width={screenWidth - 60}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            withInnerLines={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    fontStyle: 'italic',
  },
});