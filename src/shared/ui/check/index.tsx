import BoxChecked from '@/assets/icons/box-checked.svg';
import BoxUnchecked from '@/assets/icons/box-unchecked.svg';
import CheckUnchecked from '@/assets/icons/check-unchecked.svg';
import CheckChecked from '@/assets/icons/cherck-checked.svg';
import type React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { cn } from '../../libs';
import { IconWrapper } from '../icons';
import { Show } from '../show';

type CheckProps = {
	checked?: boolean;
	disabled?: boolean;
	onChange?: (checked: boolean) => void;
	size?: number;
	className?: string;
	children?: React.ReactNode;
};

const Box = ({
	checked = false,
	disabled = false,
	onChange,
	size = 25,
	children,
	className = '',
}: CheckProps) => {
	return (
		<TouchableOpacity
			disabled={disabled}
			onPress={() => onChange?.(!checked)}
			className={cn(className, 'flex flex-row items-center gap-x-2')}
			activeOpacity={0.4}
		>
			<IconWrapper size={size}>{checked ? <BoxChecked /> : <BoxUnchecked />}</IconWrapper>
			<Show when={!!children}>{children}</Show>
		</TouchableOpacity>
	);
};

const Symbol = ({
	checked = false,
	disabled = false,
	onChange,
	size = 13,
	children,
	className = '',
}: CheckProps) => {
	return (
		<TouchableOpacity
			disabled={disabled}
			onPress={() => onChange?.(!checked)}
			className={className}
			activeOpacity={0.8}
		>
			<IconWrapper size={size}>{checked ? <CheckChecked /> : <CheckUnchecked />}</IconWrapper>
			<Show when={!!children}>
				<View className="flex flex-row items-center gap-x-2">{children}</View>
			</Show>
		</TouchableOpacity>
	);
};

export const Check = {
	Box,
	Symbol,
};
