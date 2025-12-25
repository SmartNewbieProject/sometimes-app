import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
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

async function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  try {
    if (!uri || typeof uri !== 'string' || uri.trim() === '') {
      throw new ImageCompressionError(
        ImageCompressionErrorCode.INVALID_URI,
        'Invalid image URI: URI is empty or not a string'
      );
    }

    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      throw new ImageCompressionError(
        ImageCompressionErrorCode.INVALID_URI,
        'Image file does not exist'
      );
    }

    if (info.size && info.size > 50 * 1024 * 1024) {
      throw new ImageCompressionError(
        ImageCompressionErrorCode.LOAD_FAILED,
        `Image file too large: ${Math.round(info.size / 1024 / 1024)}MB (max 50MB)`
      );
    }

    if (info.size === 0) {
      throw new ImageCompressionError(
        ImageCompressionErrorCode.INVALID_URI,
        'Image file is empty (0 bytes)'
      );
    }

    const image = await ImageManipulator.manipulateAsync(uri, [], { compress: 1 });

    if (!image || !image.width || !image.height) {
      throw new ImageCompressionError(
        ImageCompressionErrorCode.LOAD_FAILED,
        'Failed to extract image dimensions'
      );
    }

    return { width: image.width, height: image.height };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to get image dimensions: ${errorMsg}`);

    if (error instanceof ImageCompressionError) {
      throw error;
    }

    throw new ImageCompressionError(
      ImageCompressionErrorCode.LOAD_FAILED,
      'Failed to load image dimensions',
      error
    );
  }
}

async function getFileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      throw new ImageCompressionError(
        ImageCompressionErrorCode.INVALID_URI,
        'Image file does not exist'
      );
    }
    return info.size || 0;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to get file size: ${errorMsg}`);
    return 0;
  }
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

async function compressImageWithRetry(
  uri: string,
  options: ImageCompressionOptions,
  attempt: number = 0
): Promise<ImageCompressionResult> {
  const config = { ...DEFAULT_IMAGE_COMPRESSION_CONFIG, ...options };

  try {
    const startTime = Date.now();

    logger.info('Starting image compression', { uri, attempt, config });

    const originalDimensions = await getImageDimensions(uri);
    const originalSize = await getFileSize(uri);

    options.onProgress?.(10);

    const { width, height, needsResize } = calculateResizeDimensions(
      originalDimensions.width,
      originalDimensions.height,
      config.maxDimension
    );

    logger.info('Image dimensions calculated', {
      original: originalDimensions,
      target: { width, height },
      needsResize,
    });

    options.onProgress?.(30);

    const actions: ImageManipulator.Action[] = needsResize
      ? [{ resize: { width, height } }]
      : [];

    const saveFormat =
      config.outputFormat === 'jpeg'
        ? ImageManipulator.SaveFormat.JPEG
        : ImageManipulator.SaveFormat.PNG;

    options.onProgress?.(50);

    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: config.quality,
      format: saveFormat,
      base64: false,
    });

    if (!result || !result.uri) {
      throw new ImageCompressionError(
        ImageCompressionErrorCode.COMPRESSION_FAILED,
        'Image manipulation returned invalid result'
      );
    }

    options.onProgress?.(80);

    const compressedSize = await getFileSize(result.uri);
    const processingTime = Date.now() - startTime;

    options.onProgress?.(100);

    const metrics: ImageCompressionMetrics = {
      originalSize,
      compressedSize,
      compressionRatio: originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0,
      compressionTimeMs: processingTime,
      resized: needsResize,
      originalDimensions,
      compressedDimensions: { width: result.width, height: result.height },
    };

    logger.info('Image compression completed', metrics);

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      sizeInBytes: compressedSize,
      mimeType: `image/${config.outputFormat}`,
    };
  } catch (error) {
    const errorMsg = error instanceof ImageCompressionError
      ? `${error.code}: ${error.message}`
      : error instanceof Error ? error.message : String(error);
    logger.error(`Image compression failed (attempt ${attempt + 1}): ${errorMsg}`);

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
  if (!uri || typeof uri !== 'string') {
    throw new ImageCompressionError(
      ImageCompressionErrorCode.INVALID_URI,
      'Image URI is required and must be a string'
    );
  }

  if (uri.trim() === '') {
    throw new ImageCompressionError(
      ImageCompressionErrorCode.INVALID_URI,
      'Image URI cannot be empty'
    );
  }

  logger.info('Compress image requested', { uri, options });

  try {
    return await compressImageWithRetry(uri, options);
  } catch (error) {
    const errorMsg = error instanceof ImageCompressionError
      ? `${error.code}: ${error.message}`
      : error instanceof Error ? error.message : String(error);
    logger.error(`Image compression failed completely: ${errorMsg}`);
    throw error;
  }
}

export async function compressImageToBase64(
  uri: string,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const result = await compressImage(uri, options);

  try {
    const base64 = await FileSystem.readAsStringAsync(result.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const mimeType = result.mimeType || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    logger.error('Failed to convert to base64', { error });
    throw new ImageCompressionError(
      ImageCompressionErrorCode.COMPRESSION_FAILED,
      'Failed to convert compressed image to base64',
      error
    );
  }
}

export async function estimateCompressedSize(
  uri: string,
  options: ImageCompressionOptions = {}
): Promise<number> {
  try {
    const originalSize = await getFileSize(uri);
    const estimatedRatio = options.quality || DEFAULT_IMAGE_COMPRESSION_CONFIG.quality;
    return Math.round(originalSize * estimatedRatio);
  } catch {
    return 0;
  }
}
