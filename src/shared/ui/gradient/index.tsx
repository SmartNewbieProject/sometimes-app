import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, type ViewStyle } from 'react-native';

const STANDARD_GRADIENT_COLORS = ['#FFFFFF', '#F5F1FF'] as const;

export const PalePurpleGradient = () => {
	return (
		<LinearGradient
			colors={[...STANDARD_GRADIENT_COLORS]}
			start={{ x: 0, y: 0 }}
			end={{ x: 0, y: 1 }}
			style={
				StyleSheet.create({
					gradient: gradientStyle,
				}).gradient
			}
		/>
	);
};

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
					gradient: gradientStyle,
				}).gradient,
				style,
			]}
		/>
	);
};

const gradientStyle = {
	position: 'absolute',
	width: '100%',
	height: '100%',
} as ViewStyle;
