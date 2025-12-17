import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { FloatingTooltip } from '../floating-tooltip';

interface AppDownloadSectionProps {
  onAppStorePress?: () => void;
  onGooglePlayPress?: () => void;
  tooltipText?: string;
  showTooltip?: boolean;
}

export const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({
  onAppStorePress,
  onGooglePlayPress,
  tooltipText = '앱을 설치하여 더 간편하게 시작하세요!',
  showTooltip = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.storeLinksContainer}>
          <Pressable onPress={onAppStorePress}>
            <Image
              source={require('@assets/images/download/appstore-hq.png')}
              style={styles.storeImage}
              resizeMode="contain"
            />
          </Pressable>
          <Pressable onPress={onGooglePlayPress}>
            <Image
              source={require('@assets/images/download/googleplay-hq.png')}
              style={styles.storeImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        {showTooltip && (
          <FloatingTooltip
            text={tooltipText}
            rotation="top"
            style={styles.tooltip}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 15,
    width: 330,
    alignItems: 'center',
  },
  contentWrapper: {
    position: 'relative',
    width: '100%',
    zIndex: 1000,
  },
  storeLinksContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeImage: {
    width: 160,
    height: 52,
    cursor: 'pointer',
  },
  tooltip: {
    bottom: 55,
    zIndex: 1001,
  },
});
