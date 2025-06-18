import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';

interface PhotoPreviewProps {
  uri: string;
  onRemove?: () => void;
  style?: ViewStyle;
}

export default function PhotoPreview({ uri, onRemove, style }: PhotoPreviewProps) {
  const handleRemove = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onRemove },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <X size={16} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});