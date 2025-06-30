import { ContentSelector, type ContentSelectorProps } from '@/src/shared/ui/content-selector';
import type { ReactNode } from 'react';
import { type UseControllerProps, useController } from 'react-hook-form';

export interface FormContentSelectorProps
	extends UseControllerProps,
		Omit<ContentSelectorProps, 'value' | 'onChange'> {
	className?: string;
	size?: 'sm' | 'md' | 'lg';
	renderContent?: (value: string | null) => ReactNode;
	renderPlaceholder?: () => ReactNode;
	onPress?: () => Promise<string | null>;
	actionLabel?: string;
	activeColor?: string;
	inactiveColor?: string;
}

export function FormContentSelector({
	name,
	control,
	rules,
	className,
	size,
	renderContent,
	renderPlaceholder,
	onPress,
	actionLabel,
	activeColor,
	inactiveColor,
}: FormContentSelectorProps) {
	const {
		field: { value, onChange },
	} = useController({
		name,
		control,
		rules,
	});

	return (
		<ContentSelector
			value={value}
			onChange={onChange}
			size={size}
			className={className}
			renderContent={renderContent}
			renderPlaceholder={renderPlaceholder}
			onPress={onPress}
			actionLabel={actionLabel}
			activeColor={activeColor}
			inactiveColor={inactiveColor}
		/>
	);
}
