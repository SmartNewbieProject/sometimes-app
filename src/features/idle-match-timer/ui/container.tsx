import { PurpleGradient } from '@/src/shared/ui';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { useMatchLoading, useMatchingBackground } from '../hooks';
import { useLatestMatchingV31 } from '../queries/use-latest-matching-v31';
import type { MatchCategory } from '../types-v31';
import { CATEGORY_COLORS } from '../types-v31';

type ContainerProps = {
	children: ReactNode;
	gradientMode: boolean;
	category?: MatchCategory;
};

export const Container = ({ children, gradientMode, category }: ContainerProps) => {
	const { primary: match } = useLatestMatchingV31();
	const { rematchingLoading } = useMatchLoading();
	const [width, setWidth] = useState(0);
	const { uri: backgroundUri } = useMatchingBackground();
	const onLayout = (event: LayoutChangeEvent) => {
		const { width: layoutWidth } = event.nativeEvent.layout;

		setWidth(layoutWidth);
	};

	if (gradientMode) {
		const useCategoryGradient = category && category !== 'scheduled';
		const gradientColors = useCategoryGradient
			? (CATEGORY_COLORS[category].gradient as readonly [string, string])
			: null;

		return (
			<View
				onLayout={onLayout}
				style={[
					styles.imageBackground,
					{
						height: match?.type === 'not-found' ? undefined : rematchingLoading ? 400 : width,
					},
				]}
			>
				{gradientColors ? (
					<LinearGradient
						colors={gradientColors}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={StyleSheet.absoluteFill}
					/>
				) : (
					<PurpleGradient />
				)}
				{children}
			</View>
		);
	}

	return (
		<ImageBackground
			source={{ uri: backgroundUri }}
			onLayout={onLayout}
			style={[
				styles.imageBackground,
				{
					height: match?.type === 'not-found' ? undefined : rematchingLoading ? 400 : width,
				},
			]}
		>
			{children}
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		aspectRatio: 1,
		alignSelf: 'center',
		position: 'relative',
		overflow: 'hidden',
		borderRadius: 20,
	},
	imageBackground: {
		overflow: 'hidden',
		width: '100%',
		height: '100%',
		borderRadius: 20,
	},
});
