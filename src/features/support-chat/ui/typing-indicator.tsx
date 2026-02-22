import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import type { SessionStatus } from '../types';

interface TypingIndicatorProps {
	status: SessionStatus;
}

function TypingDot({ delay }: { delay: number }) {
	const scale = useSharedValue(0.6);
	const opacity = useSharedValue(0.4);

	useEffect(() => {
		scale.value = withDelay(
			delay,
			withRepeat(
				withSequence(withTiming(1, { duration: 300 }), withTiming(0.6, { duration: 300 })),
				-1,
				false,
			),
		);
		opacity.value = withDelay(
			delay,
			withRepeat(
				withSequence(withTiming(1, { duration: 300 }), withTiming(0.4, { duration: 300 })),
				-1,
				false,
			),
		);
	}, [scale, opacity, delay]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	return <Animated.View style={[styles.dot, animatedStyle]} />;
}

function TypingIndicator({ status }: TypingIndicatorProps) {
	const { t } = useTranslation();

	const isBot = status === 'bot_handling';
	const label = isBot
		? t('features.support-chat.message.bot_label')
		: t('features.support-chat.message.admin_label');

	return (
		<View style={styles.container}>
			<View style={styles.avatar}>
				<Text style={styles.avatarText}>{isBot ? 'S' : 'CS'}</Text>
			</View>
			<View style={styles.content}>
				<Text style={styles.senderLabel}>{label}</Text>
				<View style={styles.bubble}>
					<TypingDot delay={0} />
					<TypingDot delay={160} />
					<TypingDot delay={320} />
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		marginVertical: 4,
		maxWidth: '85%',
		alignSelf: 'flex-start',
	},
	avatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.brand.primary,
	},
	avatarText: {
		fontSize: 11,
		color: '#FFFFFF',
		fontWeight: '700',
		fontFamily: 'Pretendard-Bold',
	},
	content: {
		gap: 4,
	},
	senderLabel: {
		fontSize: 11,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Medium',
		marginLeft: 4,
	},
	bubble: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 18,
		paddingVertical: 14,
		backgroundColor: '#F0F4FF',
		borderRadius: 18,
		borderTopLeftRadius: 6,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#AEAEAE',
	},
});

export default TypingIndicator;
