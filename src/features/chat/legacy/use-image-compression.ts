import { SaveFormat, useImageManipulator } from 'expo-image-manipulator';
import { Platform } from 'react-native';
import type { CompressionConfig } from '../utils/image/compression';
import { compressImageWeb } from '../utils/image/web-compression';

export function useImageCompression(uri?: string) {
	const context = uri ? useImageManipulator(uri) : null;

	const compressImage = async (
		imageUri: string,
		options: Partial<CompressionConfig> = {},
	): Promise<string> => {
		const config: CompressionConfig = {
			maxWidth: options.maxWidth || 800,
			maxHeight: options.maxHeight || 800,
			quality: options.quality || 0.7,
			format: options.format || 'jpeg',
		};

		if (Platform.OS === 'web') {
			const result = await compressImageWeb(imageUri, config);
			return result.base64;
		}

		if (!context) {
			throw new Error('useImageCompression hook에 올바른 URI가 설정되지 않음');
		}

		context.resize({
			width: config.maxWidth,
			height: config.maxHeight,
		});

		const image = await context.renderAsync();
		const result = await image.saveAsync({
			format: config.format === 'jpeg' ? SaveFormat.JPEG : SaveFormat.PNG,
			compress: config.quality,
			base64: true,
		});

		if (!result.base64) {
			throw new Error('압축된 이미지 base64 생성 실패');
		}

		const compressedBase64 = `data:image/${config.format};base64,${result.base64}`;
		const originalSize = imageUri.length;
		const compressedSize = compressedBase64.length;
		const compressionRate = `${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`;

		console.debug('압축 테스트:', {
			원본크기: originalSize,
			압축크기: compressedSize,
			압축률: compressionRate,
		});
		return compressedBase64;
	};

	return { compressImage };
}
