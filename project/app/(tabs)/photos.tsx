import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';
import PhotoPreview from '@/components/PhotoPreview';
import { getWorkoutData } from '@/utils/storage';
import { formatDate } from '@/utils/stats';
import type { WorkoutData } from '@/types/workout';

const { width } = Dimensions.get('window');
const photoSize = (width - 60) / 2;

export default function PhotosScreen() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const allWorkouts = await getWorkoutData();
      const workoutsWithPhotos = Object.values(allWorkouts)
        .filter(workout => workout.photo)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setWorkouts(workoutsWithPhotos);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const renderPhotoGrid = () => {
    if (workouts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#6b7280" />
          <Text style={styles.emptyTitle}>No workout photos yet</Text>
          <Text style={styles.emptySubtitle}>
            Add photos to your workouts to see them here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.photoGrid}>
        {workouts.map((workout) => (
          <TouchableOpacity
            key={workout.date}
            style={styles.photoItem}
            onPress={() => setSelectedPhoto(workout.photo!)}
          >
            <PhotoPreview
              uri={workout.photo!}
              style={[styles.photo, { height: photoSize }]}
            />
            <View style={styles.photoInfo}>
              <Text style={styles.photoDate}>{formatDate(workout.date)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFullScreenPhoto = () => {
    if (!selectedPhoto) return null;

    const workout = workouts.find(w => w.photo === selectedPhoto);

    return (
      <View style={styles.fullScreenOverlay}>
        <TouchableOpacity
          style={styles.fullScreenBackground}
          onPress={() => setSelectedPhoto(null)}
        >
          <View style={styles.fullScreenContainer}>
            <PhotoPreview
              uri={selectedPhoto}
              style={styles.fullScreenPhoto}
            />
            {workout && (
              <Text style={styles.fullScreenDate}>
                {formatDate(workout.date)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Photos</Text>
        <Text style={styles.subtitle}>{workouts.length} photos</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPhotoGrid()}
      </ScrollView>

      {renderFullScreenPhoto()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 40,
  },
  photoItem: {
    width: photoSize,
  },
  photo: {
    borderRadius: 12,
  },
  photoInfo: {
    paddingTop: 8,
  },
  photoDate: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 1000,
  },
  fullScreenBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    alignItems: 'center',
  },
  fullScreenPhoto: {
    width: width - 40,
    height: (width - 40) * 0.75,
    borderRadius: 16,
  },
  fullScreenDate: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 16,
  },
});