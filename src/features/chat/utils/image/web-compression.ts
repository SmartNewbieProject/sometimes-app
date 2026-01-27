import type { CompressionConfig, CompressionResult } from './compression';
import { calculateResizeDimensions } from './resize';

export async function compressImageWeb(
	uri: string,
	config: CompressionConfig,
): Promise<CompressionResult> {
	const { maxWidth, maxHeight, quality, format } = config;

	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new Image();

		img.onload = () => {
			try {
				const { width, height } = calculateResizeDimensions(img.width, img.height, {
					maxWidth,
					maxHeight,
				});

				canvas.width = width;
				canvas.height = height;

				if (!ctx) {
					reject(new Error('Canvas context 생성 실패'));
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);

				const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
				const compressedDataUrl = canvas.toDataURL(mimeType, quality);

				const originalSize = uri.length;
				const compressedSize = compressedDataUrl.length;
				const compressionRate = `${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`;

				resolve({
					uri: compressedDataUrl,
					base64: compressedDataUrl,
					size: {
						original: originalSize,
						compressed: compressedSize,
						compressionRate,
					},
				});
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => reject(new Error('이미지 로드 실패'));
		img.src = uri;
	});
}
