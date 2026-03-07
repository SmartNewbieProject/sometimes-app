import { Text } from '@/src/shared/ui';
import { LinearGradient } from 'expo-linear-gradient';
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
			<LinearGradient
				colors={['#FFFBCC', '#FEE500']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={styles.badge}
			>
				<Text size="sm" weight="semibold" style={styles.badgeText}>
					{displayMessage}
				</Text>
			</LinearGradient>
			{!isReverse && <View style={getTailStyle()} />}
		</Animated.View>
	);
}

const tailColor = '#FEE500';

const styles = StyleSheet.create({
	wrapper: {
		alignItems: 'center',
		alignSelf: 'center',
		marginBottom: 8,
	},
	badge: {
		borderRadius: 20,
		paddingHorizontal: 18,
		paddingVertical: 9,
		shadowColor: '#FEE500',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.45,
		shadowRadius: 8,
		elevation: 5,
	},
	badgeText: {
		color: '#1A1A1A',
		fontWeight: '700',
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
