import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Platform } from 'react-native';

export const PalePurpleGradient = () => {
  if (Platform.OS === 'web') {
    return (
      <LinearGradient
      colors={['#FFFFFF', '#F8F5FF']}
      style={StyleSheet.create({
        gradient: {
          direction: 'inherit',
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
    style={StyleSheet.create({
      gradient: {
        direction: 'inherit',
        position: 'absolute',
        width: '100%',
        height: '100%',
      }
    }).gradient}
  />
  )
}