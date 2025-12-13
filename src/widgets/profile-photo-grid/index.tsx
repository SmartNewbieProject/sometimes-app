import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfilePhotoCard, ProfilePhoto } from '../profile-photo-card';

interface ProfilePhotoGridProps {
  photos: ProfilePhoto[];
  onMorePress?: (photo: ProfilePhoto) => void;
  onReuploadPress?: (photo: ProfilePhoto) => void;
}

export function ProfilePhotoGrid({
  photos,
  onMorePress,
  onReuploadPress,
}: ProfilePhotoGridProps) {
  // Sort: Main photo first, then by order
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.isMain) return -1;
    if (b.isMain) return 1;
    return a.order - b.order;
  });

  const mainPhoto = sortedPhotos[0];
  const subPhotos = sortedPhotos.slice(1, 3);

  return (
    <View style={styles.container}>
      {/* Left: Main Photo (Big Square) */}
      <View style={styles.mainPhotoContainer}>
        {mainPhoto && (
          <ProfilePhotoCard
            photo={mainPhoto}
            onMorePress={onMorePress}
            onReuploadPress={onReuploadPress}
          />
        )}
      </View>

      {/* Right: Sub Photos (2 Small Squares) */}
      <View style={styles.subPhotosContainer}>
        {subPhotos.map((photo, index) => (
          <View key={photo.id} style={styles.subPhotoWrapper}>
            <ProfilePhotoCard
              photo={photo}
              onMorePress={onMorePress}
              onReuploadPress={onReuploadPress}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    aspectRatio: 3 / 2, // Maintains proportional height
  },
  mainPhotoContainer: {
    flex: 2,
  },
  subPhotosContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
  },
  subPhotoWrapper: {
    flex: 1,
  },
});
