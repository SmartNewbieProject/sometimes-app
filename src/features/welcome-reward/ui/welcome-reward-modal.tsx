import React, { useCallback, useEffect, useRef } from 'react';
import {
	Animated,
	Easing,
	type LayoutChangeEvent,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/shared/ui';

const AUTO_DISMISS_MS = 3000;

interface WelcomeRewardModalProps {
	visible: boolean;
	onClose: () => void;
}

const WelcomeRewardModal: React.FC<WelcomeRewardModalProps> = ({
	visible,
	onClose,
}) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const translateY = useRef(new Animated.Value(50)).current;
	const chipOpacity = useRef(new Animated.Value(0)).current;
	const progress = useRef(new Animated.Value(1)).current;
	const trackWidthAnim = useRef(new Animated.Value(0)).current;
	const barWidth = useRef(Animated.multiply(progress, trackWidthAnim)).current;

	const dismiss = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		Animated.parallel([
			Animated.timing(translateY, {
				toValue: 50,
				duration: 250,
				easing: Easing.in(Easing.cubic),
				useNativeDriver: false,
			}),
			Animated.timing(chipOpacity, {
				toValue: 0,
				duration: 250,
				easing: Easing.in(Easing.cubic),
				useNativeDriver: false,
			}),
		]).start(() => onClose());
	}, [onClose, translateY, chipOpacity]);

	useEffect(() => {
		if (visible) {
			translateY.setValue(50);
			chipOpacity.setValue(0);
			progress.setValue(1);

			Animated.parallel([
				Animated.timing(translateY, {
					toValue: 0,
					duration: 400,
					easing: Easing.out(Easing.back(1.2)),
					useNativeDriver: false,
				}),
				Animated.timing(chipOpacity, {
					toValue: 1,
					duration: 300,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: false,
				}),
			]).start();

			Animated.timing(progress, {
				toValue: 0,
				duration: AUTO_DISMISS_MS,
				easing: Easing.linear,
				useNativeDriver: false,
			}).start();

			timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
		}

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [visible, translateY, chipOpacity, progress, dismiss]);

	const handleTrackLayout = useCallback(
		(e: LayoutChangeEvent) => {
			trackWidthAnim.setValue(e.nativeEvent.layout.width);
		},
		[trackWidthAnim],
	);

	if (!visible) return null;

	const title = t('features.welcome-reward.ui.modal.title');
	const gemLabel = t('features.welcome-reward.ui.modal.gem_reward_label');
	const rewardText = t('features.welcome-reward.ui.modal.reward_text');

	return (
		<Animated.View
			style={[
				styles.wrapper,
				{ bottom: insets.bottom + 100 },
				{ transform: [{ translateY }], opacity: chipOpacity },
			]}
			pointerEvents={visible ? 'auto' : 'none'}
		>
			<Pressable onPress={dismiss} style={styles.chip}>
				<View style={styles.avatarContainer}>
					<Image
						source={require('@assets/images/instagram-some.webp')}
						style={styles.avatar}
						contentFit="cover"
					/>
				</View>
				<View style={styles.textContainer}>
					<Text style={styles.title} numberOfLines={1}>
						{title}
					</Text>
					<Text style={styles.subtitle} numberOfLines={1}>
						{gemLabel}{rewardText}
					</Text>
					<View style={styles.progressTrack} onLayout={handleTrackLayout}>
						<Animated.View style={[styles.progressBar, { width: barWidth }]} />
					</View>
				</View>
			</Pressable>
		</Animated.View>
	);
};

const AVATAR_SIZE = 52;

const styles = StyleSheet.create({
	wrapper: {
		position: 'absolute',
		left: '4%',
		width: '92%',
		zIndex: 999,
	},
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(122, 74, 226, 0.95)',
		borderRadius: 20,
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 40,
		paddingRight: 16,
		marginLeft: 20,
		shadowColor: '#7A4AE2',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 8,
	},
	avatarContainer: {
		position: 'absolute',
		left: -AVATAR_SIZE / 2 + 6,
		top: '50%',
		marginTop: -AVATAR_SIZE / 2,
		width: AVATAR_SIZE,
		height: AVATAR_SIZE,
		borderRadius: AVATAR_SIZE / 2,
		backgroundColor: '#E8DEFF',
		borderWidth: 3,
		borderColor: 'rgba(122, 74, 226, 0.95)',
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 6,
	},
	avatar: {
		width: '100%',
		height: '100%',
	},
	textContainer: {
		flex: 1,
		gap: 2,
	},
	title: {
		fontSize: 13,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	subtitle: {
		fontSize: 12,
		color: 'rgba(255, 255, 255, 0.85)',
	},
	progressTrack: {
		height: 3,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 1.5,
		marginTop: 6,
		overflow: 'hidden',
	},
	progressBar: {
		height: 3,
		backgroundColor: 'rgba(255, 255, 255, 0.7)',
		borderRadius: 1.5,
	},
});

export default WelcomeRewardModal;
