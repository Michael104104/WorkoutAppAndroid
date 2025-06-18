import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WorkoutForm from '@/components/WorkoutForm';
import { initializeDirectories } from '@/utils/storage';

export default function HomeScreen() {
  useEffect(() => {
    // Initialize storage directories on app start
    initializeDirectories().catch(console.error);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <WorkoutForm />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
  },
});