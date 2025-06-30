import { Text } from '@/src/shared/ui';
import { cn } from '@shared/libs/cn';
import { type VariantProps, cva } from 'class-variance-authority';
import { View } from 'react-native';

const label = cva('flex-row items-center gap-x-1', {
	variants: {
		size: {
			sm: 'gap-x-0.5',
			md: 'gap-x-1',
			lg: 'gap-x-1.5',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

interface LabelProps extends VariantProps<typeof label> {
	label: string;
	required?: boolean;
	className?: string;
	textColor?: 'white' | 'purple' | 'light' | 'dark' | 'black' | 'pale-purple';
}

export function Label({
	label: labelText,
	required = false,
	size,
	className,
	textColor = 'purple',
}: LabelProps) {
	return (
		<View className={cn(label({ size }), className)}>
			<Text
				size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
				weight="semibold"
				textColor={textColor}
			>
				{labelText}
			</Text>
			{required && (
				<Text size={size === 'lg' ? 'md' : 'sm'} textColor={textColor}>
					*
				</Text>
			)}
		</View>
	);
}
