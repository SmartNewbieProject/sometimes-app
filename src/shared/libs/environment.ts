const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

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
