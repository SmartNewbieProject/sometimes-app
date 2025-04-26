import { type VariantProps, cva } from 'class-variance-authority';
import type React from 'react';
import { TouchableOpacity } from 'react-native';
import { cn } from '../../libs/cn';
import { Text } from '../text';
import { ReactNode } from 'react';

const buttonStyles = cva(
	'rounded-[20] flex items-center flex flex-row gap-x-1.5 justify-center w-fit h-[50] text-white py-2 px-6 transition-all duration-200',
	{
		variants: {
			variant: {
				primary: 'bg-darkPurple hover:bg-darkPurple/80 active:bg-darkPurple/40',
				secondary:
					'bg-lightPurple text-primaryPurple hover:bg-darkPurple/20 active:bg-darkPurple/40',
				white:
					'bg-white text-primaryPurple border-primaryPurple border hover:bg-darkPurple/20 active:bg-darkPurple/40',
			},
			size: {
				md: 'text-md h-[50px]',
				sm: 'text-sm h-[40px]',
				chip: 'text-xs h-[28px] px-2',
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
	},
);

export type ButtonProps = VariantProps<typeof buttonStyles> & {
	children?: React.ReactNode;
	onPress?: () => void;
	prefix?: ReactNode;
	className?: string;
};

export const Button: React.FC<ButtonProps> = ({
	onPress,
	variant,
	size = 'md',
	disabled = false,
	children,
	prefix,
	textColor = 'white',
	className = '',
}) => {
	const press = () => {
		if (disabled) return;
		onPress?.();
	};

	return (
		<TouchableOpacity
			className={cn(buttonStyles({ variant, size, disabled }), className)}
			onPress={press}
			activeOpacity={1}
		>
			{prefix}
			<Text
				textColor={textColor}
				size={size}
				weight="semibold"
				className="text-center whitespace-nowrap"
			>
				{children}
			</Text>
		</TouchableOpacity>
	);
};
