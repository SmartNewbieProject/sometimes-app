import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Platform, ViewStyle } from 'react-native';

export const PalePurpleGradient = () => {

  if (Platform.OS === 'web') {
    return (
      <LinearGradient
        colors={['#FFFFFF', '#F8F5FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.create({
          gradient: {
            position: 'absolute',
            width: '100%',
            height: '100%',
          }
        }).gradient}
      />
    );
  }

  return (
    <LinearGradient
      colors={['#FFFFFF', '#EAE0FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.create({
        gradient: {
          position: 'absolute',
          width: '100%',
          height: '100%',
        }
      }).gradient}
    />
  );
}

interface PurpleGradientProps {
  style?: ViewStyle;
}

export const PurpleGradient = ({ style }: PurpleGradientProps = {}) => {
  return (
    <LinearGradient
      colors={['#F3EDFF', '#E1D9FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 1]}
      style={[
        StyleSheet.create({
          gradient: {
            width: '100%',
            height: '100%',
            position: 'absolute',
          },
        }).gradient,
        style
      ]}
    />
  );
}
