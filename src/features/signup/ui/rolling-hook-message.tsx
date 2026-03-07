import colors from '@/src/shared/constants/colors';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const MESSAGES = [
	'지금 내 캠퍼스에 나를 기다리는 사람이 있어요',
	'오늘 점심, 같이 먹을 사람 찾는 중',
	'같은 학교, 다른 사람. 아직 모르는 인연이 있어요',
	'대학 생활 중 가장 설레는 알림이 기다려요',
	'오늘의 인연, 아직 확인 안 했어요',
	'캠퍼스 어딘가에 당신 취향의 사람이 있어요',
];

const INTERVAL_MS = 3000;
const ANIM_DURATION = 280;

export function RollingHookMessage() {
	const [index, setIndex] = useState(0);
	const translateY = useRef(new Animated.Value(0)).current;
	const opacity = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		const timer = setInterval(() => {
			Animated.parallel([
				Animated.timing(translateY, {
					toValue: -16,
					duration: ANIM_DURATION,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0,
					duration: ANIM_DURATION,
					useNativeDriver: true,
				}),
			]).start(() => {
				setIndex((prev) => (prev + 1) % MESSAGES.length);
				translateY.setValue(16);
				Animated.parallel([
					Animated.timing(translateY, {
						toValue: 0,
						duration: ANIM_DURATION,
						useNativeDriver: true,
					}),
					Animated.timing(opacity, {
						toValue: 1,
						duration: ANIM_DURATION,
						useNativeDriver: true,
					}),
				]).start();
			});
		}, INTERVAL_MS);

		return () => clearInterval(timer);
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.line} />
			<View style={styles.textWrapper}>
				<Animated.Text
					style={[styles.text, { transform: [{ translateY }], opacity }]}
					numberOfLines={1}
				>
					{MESSAGES[index]}
				</Animated.Text>
			</View>
			<View style={styles.line} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		marginBottom: 12,
		paddingHorizontal: 16,
		gap: 10,
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: colors.brand.primaryLight,
	},
	textWrapper: {
		height: 20,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		fontSize: 12,
		fontWeight: '600',
		color: colors.brand.accent,
		textAlign: 'center',
	},
});
