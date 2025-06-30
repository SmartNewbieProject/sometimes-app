import Loading from '@/src/features/loading';
import { Text } from '@/src/shared/ui';
import { Image as ExpoImage, useImage } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CustomInfiniteScrollView } from '../../infinite-scroll/custom-infinite-scroll-view';
import type { ImageResourceProps } from './index';

export const ImageResource: React.FC<ImageResourceProps> = ({
	resource,
	width = 100,
	height = 100,
	className = '',
	style,
	loadingTitle = '이미지를 불러오고 있어요',
	contentFit = 'cover',
	borderRadius = 0,
}) => {
	const [hasError, setHasError] = useState(false);
	const image = useImage(resource, {
		onError: (error) => {
			console.error(error);
			setHasError(true);
		},
	});

	const styles = StyleSheet.create({
		container: {
			width,
			height,
			borderRadius,
			overflow: 'hidden',
		},
		image: {
			width: '100%',
			height: '100%',
		},
	});

	const handleLoadStart = () => {
		setHasError(false);
	};

	const handleError = (error: unknown) => {
		setHasError(true);
	};

	if (hasError) {
		return (
			<View style={[styles.container, style]} className={className}>
				<View style={[styles.image, { backgroundColor: '#F3EDFF' }]}>
					<Text>이미지 로드 실패</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, style]} className={className}>
			<Loading.Lottie title={loadingTitle} loading={!image}>
				<ExpoImage
					source={image}
					style={styles.image}
					contentFit={contentFit}
					onLoadStart={handleLoadStart}
					onError={handleError}
					transition={300}
				/>
			</Loading.Lottie>
		</View>
	);
};
