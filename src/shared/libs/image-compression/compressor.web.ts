import {
  DEFAULT_IMAGE_COMPRESSION_CONFIG,
  RETRY_DELAYS_MS,
} from './config';
import {
  ImageCompressionError,
  ImageCompressionErrorCode,
  type ImageCompressionOptions,
  type ImageCompressionResult,
  type ImageCompressionMetrics,
} from './types';
import logger from '../logger';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);

    img.src = src;
  });
}

function calculateResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number; needsResize: boolean } {
  const maxOriginal = Math.max(originalWidth, originalHeight);

  if (maxOriginal <= maxDimension) {
    return {
      width: originalWidth,
      height: originalHeight,
      needsResize: false,
    };
  }

  const scale = maxDimension / maxOriginal;
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
    needsResize: true,
  };
}

function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mimeType });
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function compressImageInternal(
  uri: string,
  options: ImageCompressionOptions
): Promise<ImageCompressionResult> {
  const config = { ...DEFAULT_IMAGE_COMPRESSION_CONFIG, ...options };

  try {
    const startTime = Date.now();

    options.onProgress?.(10);

    const img = await loadImage(uri);

    options.onProgress?.(30);

    const { width, height, needsResize } = calculateResizeDimensions(
      img.naturalWidth,
      img.naturalHeight,
      config.maxDimension
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    options.onProgress?.(50);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    options.onProgress?.(70);

    const mimeType = `image/${config.outputFormat}`;
    const compressedBase64 = canvas.toDataURL(mimeType, config.quality);

    options.onProgress?.(90);

    const blob = base64ToBlob(compressedBase64);
    const compressedSize = blob.size;

    const processingTime = Date.now() - startTime;

    options.onProgress?.(100);

    const metrics: ImageCompressionMetrics = {
      originalSize: uri.length,
      compressedSize,
      compressionRatio: uri.length > 0 ? (1 - compressedSize / uri.length) * 100 : 0,
      compressionTimeMs: processingTime,
      resized: needsResize,
      originalDimensions: { width: img.naturalWidth, height: img.naturalHeight },
      compressedDimensions: { width, height },
    };

    logger.info('Image compression completed (web)', metrics);

    return {
      uri: compressedBase64,
      base64: compressedBase64,
      width,
      height,
      sizeInBytes: compressedSize,
      mimeType,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Image compression failed (web): ${errorMsg}`);
    throw new ImageCompressionError(
      ImageCompressionErrorCode.COMPRESSION_FAILED,
      'Failed to compress image on web',
      error
    );
  }
}

async function compressImageWithRetry(
  uri: string,
  options: ImageCompressionOptions,
  attempt: number = 0
): Promise<ImageCompressionResult> {
  const config = { ...DEFAULT_IMAGE_COMPRESSION_CONFIG, ...options };

  try {
    return await compressImageInternal(uri, options);
  } catch (error) {
    const errorMsg = error instanceof ImageCompressionError
      ? `${error.code}: ${error.message}`
      : error instanceof Error ? error.message : String(error);
    logger.error(`Image compression attempt failed (${attempt + 1}): ${errorMsg}`);

    if (attempt < config.maxRetries) {
      const delay = RETRY_DELAYS_MS[attempt] || 4000;
      logger.info(`Retrying compression after ${delay}ms`, { attempt: attempt + 1 });

      await new Promise((resolve) => setTimeout(resolve, delay));
      return compressImageWithRetry(uri, options, attempt + 1);
    }

    throw new ImageCompressionError(
      ImageCompressionErrorCode.MAX_RETRIES_EXCEEDED,
      `Failed to compress image after ${config.maxRetries} attempts`,
      error
    );
  }
}

export async function compressImage(
  uri: string,
  options: ImageCompressionOptions = {}
): Promise<ImageCompressionResult> {
  if (!uri) {
    throw new ImageCompressionError(
      ImageCompressionErrorCode.INVALID_URI,
      'Image URI is required'
    );
  }

  return compressImageWithRetry(uri, options);
}

export async function compressImageToBase64(
  uri: string,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const result = await compressImage(uri, options);
  return result.base64 || result.uri;
}

export async function estimateCompressedSize(
  uri: string,
  options: ImageCompressionOptions = {}
): Promise<number> {
  try {
    const blob = base64ToBlob(uri);
    const estimatedRatio = options.quality || DEFAULT_IMAGE_COMPRESSION_CONFIG.quality;
    return Math.round(blob.size * estimatedRatio);
  } catch {
    return 0;
  }
}
