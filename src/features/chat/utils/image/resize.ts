export interface ResizeDimensions {
	width: number;
	height: number;
}

export interface ResizeOptions {
	maxWidth: number;
	maxHeight: number;
}

export function calculateResizeDimensions(
	originalWidth: number,
	originalHeight: number,
	options: ResizeOptions,
): ResizeDimensions {
	const { maxWidth, maxHeight } = options;

	if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
		return { width: originalWidth, height: originalHeight };
	}

	const isLandscape = originalWidth > originalHeight;
	const aspectRatio = originalWidth / originalHeight;

	if (isLandscape) {
		const newWidth = Math.min(originalWidth, maxWidth);
		const newHeight = newWidth / aspectRatio;
		return { width: newWidth, height: newHeight };
	}
	const newHeight = Math.min(originalHeight, maxHeight);
	const newWidth = newHeight * aspectRatio;
	return { width: newWidth, height: newHeight };
}
