import logger from "@shared/libs/logger";

const isProduction = !__DEV__;
const isDevelopment = __DEV__;

interface Callbacks {
  production?: () => void;
  development?: () => void;
  defaultCallback?: () => void;
}

export const environmentStrategy = ({ production, development, defaultCallback }: Callbacks) => {
  defaultCallback?.();
  if (isProduction && production) {
    production();
  } else if (isDevelopment && development) {
    development();
  }
};

export const checkAppEnvironment = (target: 'development' | 'production') => {
  logger.debug(`현재 환경: ${__DEV__ ? 'development' : 'production'}`);
  if (target === 'production' && !isProduction) {
    return false;
  }

  if (target === 'development' && !isDevelopment) {
    return false;
  }

  return true;
}
