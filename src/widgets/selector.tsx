import { Text } from '@/src/shared/ui';
import { Button, type ButtonProps } from '@/src/shared/ui/button';
import { StyleSheet, View, type ViewStyle } from 'react-native';

interface Option {
	label: string;
	value: string;
}

interface TopDownText {
	top: string;
}

interface SelectorProps {
	options: Option[];
	value?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	direction?: 'horizontal' | 'vertical';
	variant?: 'default' | 'circle';
	topDownText?: TopDownText;
	buttonProps?: Pick<ButtonProps, 'variant' | 'textColor' | 'size' | 'width'>;
	buttonStyle?: ViewStyle;
}

export function Selector({
	options,
	value,
	onChange,
	onBlur,
	direction = 'horizontal',
	variant = 'default',
	topDownText,
	buttonProps,
	buttonStyle,
}: SelectorProps) {
	const isHorizontal = direction === 'horizontal';
	const isCircle = variant === 'circle';

	return (
		<View style={StyleSheet.flatten([styles.container])}>
			{topDownText && <Text style={StyleSheet.flatten([styles.topLabel])}>{topDownText.top}</Text>}
			<View
				style={StyleSheet.flatten([
					styles.selector,
					isHorizontal ? styles.horizontal : styles.vertical,
				])}
			>
				{options.map((option, idx) => (
					<View
						key={option.value}
						style={StyleSheet.flatten([
							isHorizontal ? styles.buttonHorizontal : styles.buttonVertical,
							isCircle && styles.circle,
							isCircle && styles.circleBorder,
							isHorizontal && idx !== options.length - 1 && styles.buttonGapHorizontal,
							!isHorizontal && idx !== options.length - 1 && styles.buttonGapVertical,
						])}
					>
						<Button
							variant={value === option.value ? 'primary' : 'white'}
							textColor={value === option.value ? 'white' : 'purple'}
							onPress={() => {
								onChange(option.value);
								onBlur?.();
							}}
							{...buttonProps}
							styles={buttonStyle}
						>
							{option.label}
						</Button>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		flexDirection: 'column',
	},
	topLabel: {
		fontSize: 16,
		color: '#8B5CF6',
		marginBottom: 8,
	},
	selector: {
		flexShrink: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	horizontal: {
		flexDirection: 'row',
	},
	vertical: {
		flexDirection: 'column',
	},
	buttonHorizontal: {
		flex: 1,
	},
	buttonVertical: {
		width: '100%',
	},
	circle: {
		borderRadius: 999,
		aspectRatio: 1,
		height: 52,
		width: 52,
	},
	circleBorder: {
		borderWidth: 1,
		borderColor: '#8B5CF6',
	},
	buttonGapHorizontal: {
		marginRight: 8,
	},
	buttonGapVertical: {
		marginBottom: 8,
	},
});
