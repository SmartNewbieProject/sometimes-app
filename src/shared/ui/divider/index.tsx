import { View } from 'react-native';
import { cn } from '@/src/shared/libs/cn';

type DividerProps = {
  color?: string;
  size?: number;
  className?: string;
};

const Horizontal = ({ 
  color = '#E7E9EC',
  size = 1,
  className = '',
}: DividerProps) => {
  return (
    <View 
      className={cn("w-full", className)}
      style={{
        height: size,
        backgroundColor: color,
      }}
    />
  );
};

const Vertical = ({ 
  color = '#E7E9EC',
  size = 1,
  className = '',
}: DividerProps) => {
  return (
    <View 
      className={cn("h-full", className)}
      style={{
        width: size,
        backgroundColor: color,
      }}
    />
  );
};

export const Divider = {
  Horizontal,
  Vertical,
};
