import React from 'react';
import { TouchableOpacity } from 'react-native';
import { cva, VariantProps } from 'class-variance-authority';
import { Text } from '../text';
import { cn } from '../../libs/cn';

const buttonStyles = cva(
  'rounded-[20] flex items-center justify-center w-fit h-[50] text-white py-2 px-6 transition-all duration-200', 
  {
    variants: {
      variant: {
        primary: 'bg-darkPurple hover:bg-darkPurple/80 active:bg-darkPurple/40',
        secondary: 'bg-lightPurple text-primaryPurple hover:bg-darkPurple/20 active:bg-darkPurple/40',
      },
      size: {
        md: 'text-md h-[50px]',
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
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  variant, 
  disabled = false, 
  children, 
  textColor = 'white',
  className = '' 
}) => {
  const press = () => {
    if (disabled) return;
    onPress();
  };

  return (
    <TouchableOpacity
      className={cn(buttonStyles({ variant, disabled }), className)}
      onPress={press}
      activeOpacity={1}
    >
      <Text textColor={textColor} size="md" weight="semibold" className="text-center">
        {children}        
      </Text>
    </TouchableOpacity>
  );
};
