import React from 'react';
import { Text as RNText } from 'react-native';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '../../libs/cn';

const textStyles = cva('text-base', {
  variants: {
    variant: {
      primary: 'text-darkPurple',
      secondary: 'text-lightPurple',
    },
    size: {
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
    },
    textColor: {
      white: 'text-white',
      purple: 'text-primaryPurple',
      dark: 'text-darkPurple',
      light: 'text-lightPurple',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    weight: 'normal',
    textColor: 'dark',
  },
});

export type TextProps = VariantProps<typeof textStyles> & {
  children: React.ReactNode;
  className?: string;
};

export const Text: React.FC<TextProps> = ({ 
  variant, 
  size, 
  weight, 
  textColor, 
  className = '', 
  children 
}) => {
  return (
    <RNText className={cn(textStyles({ variant, size, weight, textColor }), className)}>
      {children}
    </RNText>
  );
}; 