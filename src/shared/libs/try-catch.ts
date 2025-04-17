import { ServerError } from '@/src/types/system';

export const tryCatch = async <T, K = void>(
  fn: () => Promise<T>,
  onError?: (error: ServerError) => K
) => {
  try {
    return await fn();
  } catch (error) {
    if (onError) {
      return onError(error as ServerError);
    }
    throw error;
  }
};

