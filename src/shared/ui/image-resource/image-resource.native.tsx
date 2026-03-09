import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '../../constants/semantic-colors';
import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { ImageResourceProps } from './index';
import { Text } from '../text';

export const ImageResource: React.FC<ImageResourceProps> = ({
	resource,
	width = 100,
	height = 100,
	style,
	contentFit = 'cover',
	borderRadius = 0,
}) => {
	const { t } = useTranslation();
	const isMounted = useRef(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

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
		if (isMounted.current) {
			setHasError(false);
		}
	};

	const handleError = (error: unknown) => {
		if (isMounted.current) {
			console.error('[ImageResource] ExpoImage error:', error);
			setHasError(true);
		}
	};

	if (hasError) {
		return (
			<View style={[styles.container, style]}>
				<View style={[styles.image, { backgroundColor: semanticColors.surface.background }]}>
					<Text>{t('common.image_load_failed')}</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, style]}>
			<ExpoImage
				source={resource}
				style={styles.image}
				contentFit={contentFit}
				onLoadStart={handleLoadStart}
				onError={handleError}
				transition={300}
			/>
		</View>
	);
};
