import React from 'react';
import { View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { cn } from '../../libs/cn';

interface IconProps extends SvgProps {
  className?: string;
  size?: number;
}

export const IconWrapper: React.FC<IconProps> = ({ 
  className,
  width,
  height,
  size = 24,
  children,
  ...props 
}) => {
  return (
    <View className={cn('text-darkPurple', className)}>
      {React.cloneElement(children as React.ReactElement, {
        width: width || size,
        height: height || size,
        ...props
      })}
    </View>
  );
}; 