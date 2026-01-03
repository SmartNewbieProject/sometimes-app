import type React from 'react';
import {
	Text as RNText,
	type TextStyle,
	type TextProps as RNTextProps,
	StyleSheet,
} from 'react-native';
import { semanticColors } from '../../constants/semantic-colors';
import colors from '../../constants/colors';

export type TextVariant = 'primary' | 'secondary';
export type TextSize =
	| 'xs'
	| 'sm'
	| 'md'
	| '10'
	| '11'
	| '12'
	| '13'
	| '14'
	| '15'
	| '16'
	| '18'
	| '20'
	| '24'
	| 'chip'
	| 'lg'
	| 'xl'
	| '2xl'
	| '3xl';
export type TextWeight = 'normal' | 'regular' | 'medium' | 'semibold' | 'light' | 'bold' | 'black';
export type TextColor =
	| 'white'
	| 'purple'
	| 'dark'
	| 'black'
	| 'light'
	| 'pale-purple'
	| 'deepPurple'
	| 'gray'
	| 'accent'
	| 'primary'
	| 'secondary'
	| 'muted'
	| 'disabled'
	| 'inverse'
	| 'red';

export type TextProps = Omit<RNTextProps, 'style' | 'children'> & {
	children?: React.ReactNode;
	variant?: TextVariant;
	size?: TextSize;
	weight?: TextWeight;
	textColor?: TextColor;
	style?: TextStyle | TextStyle[];
};

export const Text: React.FC<TextProps> = ({
	variant = 'primary',
	size = 'md',
	weight = 'normal',
	textColor = 'dark',
	style,
	children,
	...rest
}) => {
	const getFontFamily = () => {
		switch (weight) {
			case 'light':
				return 'Pretendard-Light';
			case 'normal':
			case 'regular':
				return 'Pretendard-Regular';
			case 'medium':
				return 'Pretendard-Medium';
			case 'semibold':
				return 'Pretendard-SemiBold';
			case 'bold':
				return 'Pretendard-Bold';
			case 'black':
				return 'Pretendard-Black';
			default:
				return 'Pretendard-Regular';
		}
	};

	const getFontWeight = (): TextStyle['fontWeight'] => {
		switch (weight) {
			case 'light':
				return '300';
			case 'normal':
			case 'regular':
				return '400';
			case 'medium':
				return '500';
			case 'semibold':
				return '600';
			case 'bold':
				return '700';
			case 'black':
				return '900';
			default:
				return '400';
		}
	};

	const getTextColor = (): string => {
		switch (textColor) {
			case 'white':
				return semanticColors.text.inverse;
			case 'purple':
				return colors.primaryPurple;
			case 'dark':
				return colors.darkPurple;
			case 'black':
				return semanticColors.text.primary;
			case 'light':
				return colors.lightPurple;
			case 'pale-purple':
				return semanticColors.text.disabled;
			case 'deepPurple':
				return colors.strongPurple;
			case 'gray':
				return colors.gray;
			case 'accent':
				return semanticColors.brand.accent;
			case 'primary':
				return semanticColors.text.primary;
			case 'secondary':
				return semanticColors.text.secondary;
			case 'muted':
				return semanticColors.text.muted;
			case 'disabled':
				return semanticColors.text.disabled;
			case 'inverse':
				return semanticColors.text.inverse;
			case 'red':
				return colors.red500 || '#EF4444';
			default:
				return colors.darkPurple;
		}
	};

	const fontSize = sizeMap[size] || sizeMap.md;

	const computedStyle: TextStyle = {
		fontFamily: getFontFamily(),
		fontWeight: getFontWeight(),
		fontSize,
		color: getTextColor(),
	};

	const mergedStyle = Array.isArray(style)
		? [computedStyle, ...style.filter(Boolean)]
		: style
			? [computedStyle, style]
			: computedStyle;

	return (
		<RNText {...rest} style={mergedStyle}>
			{children}
		</RNText>
	);
};

const sizeMap: Record<TextSize, number> = {
	xs: 12,
	sm: 14,
	md: 16,
	'10': 10,
	'11': 11,
	'12': 12,
	'13': 13,
	'14': 14,
	'15': 15,
	'16': 16,
	'18': 18,
	'20': 20,
	'24': 24,
	chip: 13,
	lg: 18,
	xl: 20,
	'2xl': 24,
	'3xl': 30,
};
