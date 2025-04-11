import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export const PalePurpleGradient = () => {
  return (
    <LinearGradient
    colors={['#FFFFFF', '#F5F1FF']}
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