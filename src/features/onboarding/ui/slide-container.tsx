import { FontAwesome } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/src/shared/constants/colors';
import type { SlideContainerProps } from '../types';

export const SlideContainer = ({
  headline,
  subtext,
  icon,
  iconSize = 80,
  iconColor = colors.primaryPurple,
  children,
}: SlideContainerProps) => {
  const formattedHeadline = headline.replace(/&#10;/g, '\n');
  const formattedSubtext = subtext.replace(/&#10;/g, '\n');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>{formattedHeadline}</Text>
        <Text style={styles.subtext}>{formattedSubtext}</Text>

        <View style={styles.illustrationArea}>
          {icon && (
            <FontAwesome
              name={icon as any}
              size={iconSize}
              color={iconColor}
            />
          )}
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headline: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subtext: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  illustrationArea: {
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
