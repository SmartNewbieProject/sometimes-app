import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

type TailDirection = 'up' | 'down' | 'left' | 'right';

interface SignupFastBadgeProps {
	message?: string;
	direction?: TailDirection;
	style?: ViewStyle;
}

export function SignupFastBadge({ message, direction = 'down', style }: SignupFastBadgeProps) {
	const { t } = useTranslation();
	const floatAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(floatAnim, {
					toValue: -6,
					duration: 1000,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(floatAnim, {
					toValue: 0,
					duration: 1000,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]),
		);
		animation.start();
		return () => animation.stop();
	}, [floatAnim]);

	const displayMessage = message ?? t('features.signup.ui.login_form.fast_signup_badge');

	const getTailStyle = () => {
		switch (direction) {
			case 'up':
				return styles.tailUp;
			case 'down':
				return styles.tailDown;
			case 'left':
				return styles.tailLeft;
			case 'right':
				return styles.tailRight;
			default:
				return styles.tailDown;
		}
	};

	const isHorizontal = direction === 'left' || direction === 'right';
	const isReverse = direction === 'up' || direction === 'left';

	return (
		<Animated.View
			style={[
				styles.wrapper,
				{
					flexDirection: isHorizontal ? 'row' : 'column',
					transform: [{ translateY: floatAnim }],
				},
				style,
			]}
		>
			{isReverse && <View style={getTailStyle()} />}
			<View style={styles.badge}>
				<Text size="sm" weight="medium" textColor="purple">
					{displayMessage}
				</Text>
			</View>
			{!isReverse && <View style={getTailStyle()} />}
		</Animated.View>
	);
}

const tailColor = `${colors.brand.primary}80`;

const styles = StyleSheet.create({
	wrapper: {
		alignItems: 'center',
		alignSelf: 'center',
		marginBottom: 8,
	},
	badge: {
		borderWidth: 1,
		borderColor: tailColor,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: 'transparent',
	},
	tailDown: {
		width: 0,
		height: 0,
		borderLeftWidth: 6,
		borderRightWidth: 6,
		borderTopWidth: 8,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: tailColor,
	},
	tailUp: {
		width: 0,
		height: 0,
		borderLeftWidth: 6,
		borderRightWidth: 6,
		borderBottomWidth: 8,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: tailColor,
	},
	tailLeft: {
		width: 0,
		height: 0,
		borderTopWidth: 6,
		borderBottomWidth: 6,
		borderRightWidth: 8,
		borderTopColor: 'transparent',
		borderBottomColor: 'transparent',
		borderRightColor: tailColor,
	},
	tailRight: {
		width: 0,
		height: 0,
		borderTopWidth: 6,
		borderBottomWidth: 6,
		borderLeftWidth: 8,
		borderTopColor: 'transparent',
		borderBottomColor: 'transparent',
		borderLeftColor: tailColor,
	},
});
