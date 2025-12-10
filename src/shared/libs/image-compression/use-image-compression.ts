import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as compressorNative from './compressor.native';
import * as compressorWeb from './compressor.web';
import type {
  ImageCompressionOptions,
  ImageCompressionResult,
  ImageCompressionError,
} from './types';

const compressor = Platform.OS === 'web' ? compressorWeb : compressorNative;

export interface UseImageCompressionOptions {
  onSuccess?: (result: ImageCompressionResult) => void;
  onError?: (error: ImageCompressionError) => void;
}

export interface UseImageCompressionReturn {
  compress: (uri: string, options?: ImageCompressionOptions) => Promise<ImageCompressionResult>;
  compressToBase64: (uri: string, options?: ImageCompressionOptions) => Promise<string>;
  compressMultiple: (
    uris: string[],
    options?: ImageCompressionOptions
  ) => Promise<ImageCompressionResult[]>;
  isCompressing: boolean;
  progress: number;
  error: ImageCompressionError | null;
}

export function useImageCompression(
  options: UseImageCompressionOptions = {}
): UseImageCompressionReturn {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ImageCompressionError | null>(null);

  const compress = useCallback(
    async (uri: string, compressionOptions?: ImageCompressionOptions) => {
      setIsCompressing(true);
      setProgress(0);
      setError(null);

      try {
        const result = await compressor.compressImage(uri, {
          ...compressionOptions,
          onProgress: (p) => {
            setProgress(p);
            compressionOptions?.onProgress?.(p);
          },
        });

        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const compressionError = err as ImageCompressionError;
        setError(compressionError);
        options.onError?.(compressionError);
        throw compressionError;
      } finally {
        setIsCompressing(false);
      }
    },
    [options]
  );

  const compressToBase64 = useCallback(
    async (uri: string, compressionOptions?: ImageCompressionOptions) => {
      setIsCompressing(true);
      setProgress(0);
      setError(null);

      try {
        const result = await compressor.compressImageToBase64(uri, {
          ...compressionOptions,
          onProgress: (p) => {
            setProgress(p);
            compressionOptions?.onProgress?.(p);
          },
        });

        return result;
      } catch (err) {
        const compressionError = err as ImageCompressionError;
        setError(compressionError);
        options.onError?.(compressionError);
        throw compressionError;
      } finally {
        setIsCompressing(false);
      }
    },
    [options]
  );

  const compressMultiple = useCallback(
    async (uris: string[], compressionOptions?: ImageCompressionOptions) => {
      setIsCompressing(true);
      setProgress(0);
      setError(null);

      try {
        const results: ImageCompressionResult[] = [];

        for (let i = 0; i < uris.length; i++) {
          const uri = uris[i];
          const overallProgress = (i / uris.length) * 100;

          const result = await compressor.compressImage(uri, {
            ...compressionOptions,
            onProgress: (p) => {
              const totalProgress = overallProgress + (p / uris.length);
              setProgress(totalProgress);
              compressionOptions?.onProgress?.(totalProgress);
            },
          });

          results.push(result);
        }

        setProgress(100);
        return results;
      } catch (err) {
        const compressionError = err as ImageCompressionError;
        setError(compressionError);
        options.onError?.(compressionError);
        throw compressionError;
      } finally {
        setIsCompressing(false);
      }
    },
    [options]
  );

  return {
    compress,
    compressToBase64,
    compressMultiple,
    isCompressing,
    progress,
    error,
  };
}
