import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import type { WorkoutData } from '@/types/workout';

const WORKOUT_DATA_KEY = 'workoutData';
const LOGS_DIR = `${FileSystem.documentDirectory}Logs/`;
const PHOTOS_DIR = `${FileSystem.documentDirectory}Pictures/`;

// Initialize directories
export const initializeDirectories = async () => {
  if (Platform.OS !== 'web') {
    try {
      const logsInfo = await FileSystem.getInfoAsync(LOGS_DIR);
      if (!logsInfo.exists) {
        await FileSystem.makeDirectoryAsync(LOGS_DIR, { intermediates: true });
      }
      
      const photosInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
      if (!photosInfo.exists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.warn('Failed to initialize directories:', error);
    }
  }
};

// Save workout data to AsyncStorage and file system
export const saveWorkoutData = async (workoutData: WorkoutData) => {
  try {
    // Save to AsyncStorage
    const existingData = await getWorkoutData();
    const updatedData = {
      ...existingData,
      [workoutData.date]: workoutData,
    };
    
    await AsyncStorage.setItem(WORKOUT_DATA_KEY, JSON.stringify(updatedData));
    
    // Save daily JSON file (mobile only)
    if (Platform.OS !== 'web') {
      const fileName = `workout_${workoutData.date}.json`;
      const filePath = `${LOGS_DIR}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(workoutData, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save workout data:', error);
    return false;
  }
};

// Get all workout data
export const getWorkoutData = async (): Promise<{ [date: string]: WorkoutData }> => {
  try {
    const data = await AsyncStorage.getItem(WORKOUT_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to get workout data:', error);
    return {};
  }
};

// Save photo and return file path
export const saveWorkoutPhoto = async (photoUri: string, date: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    // For web, just return the URI as-is
    return photoUri;
  }
  
  try {
    const fileName = `workout_${date}_${Date.now()}.jpg`;
    const filePath = `${PHOTOS_DIR}${fileName}`;
    
    await FileSystem.copyAsync({
      from: photoUri,
      to: filePath,
    });
    
    return filePath;
  } catch (error) {
    console.error('Failed to save photo:', error);
    return null;
  }
};

// Export all data as single JSON file
export const exportAllData = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    // For web, return JSON string to be downloaded via browser
    const data = await getWorkoutData();
    return JSON.stringify(data, null, 2);
  }
  
  try {
    const data = await getWorkoutData();
    const fileName = `fitness_tracker_export_${Date.now()}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
    return filePath;
  } catch (error) {
    console.error('Failed to export data:', error);
    return null;
  }
};

// Clear all data (for testing/reset)
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(WORKOUT_DATA_KEY);
    
    if (Platform.OS !== 'web') {
      // Clear log files
      const logsInfo = await FileSystem.getInfoAsync(LOGS_DIR);
      if (logsInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(LOGS_DIR);
        for (const file of files) {
          await FileSystem.deleteAsync(`${LOGS_DIR}${file}`);
        }
      }
      
      // Clear photo files  
      const photosInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
      if (photosInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
        for (const file of files) {
          await FileSystem.deleteAsync(`${PHOTOS_DIR}${file}`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
};