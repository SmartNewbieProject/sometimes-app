import colors from '@/src/shared/constants/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AnimatedProgressBarProps {
	progress: number;
	width?: number;
	height?: number;
}

export const AnimatedProgressBar = ({ progress, width, height = 12 }: AnimatedProgressBarProps) => {
	const clampedProgress = Math.min(Math.max(progress, 0), 1);

	return (
		<View style={[styles.track, { height, borderRadius: height / 2 }, width != null && { width }]}>
			<View
				style={[
					styles.fill,
					{
						height,
						borderRadius: height / 2,
						width: `${clampedProgress * 100}%`,
					},
					// @ts-ignore - web-only transition
					{ transition: 'width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)' },
				]}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	track: {
		backgroundColor: '#F3EDFF',
		overflow: 'hidden',
	},
	fill: {
		backgroundColor: colors.primaryPurple,
	},
});
