import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Camera, Calendar, Save, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import type { WorkoutData, ExerciseType } from '@/types/workout';
import { EXERCISE_NAMES } from '@/types/workout';
import { saveWorkoutData, saveWorkoutPhoto, getWorkoutData } from '@/utils/storage';
import { getTodayString } from '@/utils/stats';
import PhotoPreview from './PhotoPreview';

interface WorkoutFormProps {
  onSave?: (workout: WorkoutData) => void;
}

export default function WorkoutForm({ onSave }: WorkoutFormProps) {
  const [date, setDate] = useState(getTodayString());
  const [exercises, setExercises] = useState({
    pushups: { max: 0, total: 0 },
    pullups: { max: 0, total: 0 },
    squats: { max: 0, total: 0 },
    sitUps: { max: 0, total: 0 },
    planks: { max: 0, total: 0 },
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Load existing workout data for selected date
  useEffect(() => {
    loadWorkoutForDate(date);
  }, [date]);

  const loadWorkoutForDate = async (selectedDate: string) => {
    try {
      const allWorkouts = await getWorkoutData();
      const workout = allWorkouts[selectedDate];
      
      if (workout) {
        setExercises(workout.exercises);
        setPhoto(workout.photo || null);
      } else {
        // Reset form for new date
        setExercises({
          pushups: { max: 0, total: 0 },
          pullups: { max: 0, total: 0 },
          squats: { max: 0, total: 0 },
          sitUps: { max: 0, total: 0 },
          planks: { max: 0, total: 0 },
        });
        setPhoto(null);
      }
    } catch (error) {
      console.error('Failed to load workout data:', error);
    }
  };

  const updateExercise = (exercise: ExerciseType, field: 'max' | 'total', value: string) => {
    const numValue = parseInt(value) || 0;
    setExercises(prev => ({
      ...prev,
      [exercise]: {
        ...prev[exercise],
        [field]: numValue,
      },
    }));
  };

  const handleImagePicker = async () => {
    try {
      // Request permission for image picker
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const savedPath = await saveWorkoutPhoto(result.assets[0].uri, date);
        if (savedPath) {
          setPhoto(savedPath);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleCamera = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera not available', 'Camera is not supported on web platform');
      return;
    }

    try {
      if (!cameraPermission?.granted) {
        const permission = await requestCameraPermission();
        if (!permission.granted) {
          Alert.alert('Permission required', 'Please allow camera access');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const savedPath = await saveWorkoutPhoto(result.assets[0].uri, date);
        if (savedPath) {
          setPhoto(savedPath);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const workoutData: WorkoutData = {
        date,
        exercises,
        photo: photo || undefined,
        timestamp: Date.now(),
      };

      const success = await saveWorkoutData(workoutData);
      
      if (success) {
        Alert.alert('Success', 'Workout saved successfully!');
        onSave?.(workoutData);
      } else {
        Alert.alert('Error', 'Failed to save workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    } finally {
      setIsSaving(false);
    }
  };

  const renderExerciseInput = (exercise: ExerciseType) => (
    <View key={exercise} style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{EXERCISE_NAMES[exercise]}</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Max per set</Text>
          <TextInput
            style={styles.input}
            value={exercises[exercise].max.toString()}
            onChangeText={(value) => updateExercise(exercise, 'max', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#6b7280"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Total</Text>
          <TextInput
            style={styles.input}
            value={exercises[exercise].total.toString()}
            onChangeText={(value) => updateExercise(exercise, 'total', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#6b7280"
          />
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Workout</Text>
        <View style={styles.dateContainer}>
          <Calendar size={20} color="#6b7280" />
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#6b7280"
          />
        </View>
      </View>

      <View style={styles.exercisesContainer}>
        {(Object.keys(EXERCISE_NAMES) as ExerciseType[]).map(renderExerciseInput)}
      </View>

      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Workout Photo (Optional)</Text>
        
        {photo && (
          <PhotoPreview
            uri={photo}
            onRemove={() => setPhoto(null)}
            style={styles.photoPreview}
          />
        )}
        
        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoButton} onPress={handleImagePicker}>
            <Upload size={20} color="#3b82f6" />
            <Text style={styles.photoButtonText}>Upload Photo</Text>
          </TouchableOpacity>
          
          {Platform.OS !== 'web' && (
            <TouchableOpacity style={styles.photoButton} onPress={handleCamera}>
              <Camera size={20} color="#3b82f6" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Save size={20} color="#ffffff" />
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Saving...' : 'Save Workout'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  dateInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  exercisesContainer: {
    marginBottom: 30,
  },
  exerciseContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  photoSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  photoPreview: {
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 8,
  },
  photoButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    gap: 8,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});