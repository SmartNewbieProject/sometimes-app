import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '../../libs/cn';
import colors from '../../constants/colors';

const textStyles = cva('text-base', {
  variants: {
    variant: {
      primary: 'text-darkPurple',
      secondary: 'text-lightPurple',
    },
    size: {
      sm: 'text-sm',
      md: 'text-md',
      "18": 'text-[18px]',
      '20': 'text-[20px]',
      '13': 'text-[13px]',
      chip: 'text-[13px]',
      lg: 'text-lg',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      light: 'font-light',
      bold: 'font-bold',
    },
    textColor: {
      white: 'text-white',
      purple: 'text-primaryPurple',
      dark: 'text-darkPurple',
      black: 'text-black',
      light: 'text-lightPurple',
      'pale-purple': 'text-[#9B94AB]',
      deepPurple: 'text-strongPurple',
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
  style?: TextStyle;
};

export const Text: React.FC<TextProps> = ({
  variant,
  size,
  weight,
  textColor,
  className = '',
  style,
  children
}) => {
  return (
    <RNText className={cn(textStyles({ variant, size, weight, textColor }), className)} style={style}>
      {children}
    </RNText>
  );
}; 