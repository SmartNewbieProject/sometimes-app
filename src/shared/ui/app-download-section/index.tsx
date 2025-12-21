import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { FloatingTooltip } from '../floating-tooltip';

type AppDownloadSectionSize = 'sm' | 'md' | 'lg';

interface AppDownloadSectionProps {
  onAppStorePress?: () => void;
  onGooglePlayPress?: () => void;
  tooltipText?: string;
  showTooltip?: boolean;
  size?: AppDownloadSectionSize;
}

const SIZE_CONFIG = {
  sm: {
    imageWidth: 140,
    imageHeight: 45,
    gap: 4,
    tooltipBottom: 48,
  },
  md: {
    imageWidth: 160,
    imageHeight: 52,
    gap: 4,
    tooltipBottom: 55,
  },
  lg: {
    imageWidth: 180,
    imageHeight: 59,
    gap: 6,
    tooltipBottom: 62,
  },
} as const;

export const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({
  onAppStorePress,
  onGooglePlayPress,
  tooltipText = '앱을 설치하여 더 간편하게 시작하세요!',
  showTooltip = true,
  size = 'md',
}) => {
  const config = SIZE_CONFIG[size];

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={[styles.storeLinksContainer, { gap: config.gap }]}>
          <Pressable onPress={onAppStorePress} accessibilityLabel="App Store에서 다운로드" accessibilityRole="link">
            <Image
              source={require('@assets/images/download/appstore-hq.png')}
              style={{
                width: config.imageWidth,
                height: config.imageHeight,
                cursor: 'pointer',
              }}
              resizeMode="contain"
              accessibilityLabel="App Store에서 다운로드"
              alt="App Store에서 다운로드"
            />
          </Pressable>
          <Pressable onPress={onGooglePlayPress} accessibilityLabel="Google Play에서 다운로드" accessibilityRole="link">
            <Image
              source={require('@assets/images/download/googleplay-hq.png')}
              style={{
                width: config.imageWidth,
                height: config.imageHeight,
                cursor: 'pointer',
              }}
              resizeMode="contain"
              accessibilityLabel="Google Play에서 다운로드"
              alt="Google Play에서 다운로드"
            />
          </Pressable>
        </View>
        {showTooltip && (
          <FloatingTooltip
            text={tooltipText}
            rotation="top"
            style={{ bottom: config.tooltipBottom, zIndex: 1001 }}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
