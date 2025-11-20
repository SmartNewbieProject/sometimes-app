import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import colors , { semanticColors } from '@/src/shared/constants/colors';

interface ContactImageProps {
  imageUrl?: string;
  size?: number;
}

export const ContactImage: React.FC<ContactImageProps> = ({
  imageUrl,
  size = 58,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUrl ? (
        <>
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              { width: size - 4, height: size - 4 },
            ]}
            resizeMode="cover"
          />
          <BlurView
            style={[
              styles.blurOverlay,
              { width: size - 4, height: size - 4 },
            ]}
            intensity={5}
            tint={colors.primaryPurple}
          />
        </>
      ) : (
        <View
          style={[
            styles.image,
            { width: size - 4, height: size - 4 },
            styles.placeholder,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 99,
  },
  blurOverlay: {
    position: 'absolute',
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: semanticColors.surface.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
