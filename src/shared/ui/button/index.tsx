import React from 'react';
import { TouchableOpacity } from 'react-native';
import { cva, VariantProps } from 'class-variance-authority';

const buttonStyles = cva(
  'rounded-[20] w-fit text-white py-2 px-6 transition-all duration-200', 
  {
    variants: {
      variant: {
        primary: 'bg-darkPurple hover:bg-darkPurple/80 active:bg-darkPurple/40',
        secondary: 'bg-lightPurple text-primaryPurple hover:bg-darkPurple/20 active:bg-darkPurple/40',
      },
      size: {
        md: 'text-md',
      },
      disabled: {
        true: 'opacity-50',
        false: '',
      },
      textColor: {
        white: 'text-white',
        purple: 'text-primaryPurple',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      disabled: false,
    },
  }
);

type ButtonProps = VariantProps<typeof buttonStyles> & {
  children?: React.ReactNode;
  onPress: () => void;
};

export const Button: React.FC<ButtonProps> = ({ onPress, variant, disabled = false, children }) => {
  return (
    <TouchableOpacity
      className={buttonStyles({ variant, disabled })}
      onPress={onPress}
      disabled={!!disabled}
      activeOpacity={1}
    >
      {children}
    </TouchableOpacity>
  );
};
