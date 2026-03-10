import { useAuth } from '@/src/features/auth';
import { useFreeRewardStatus } from '@/src/features/free-reward';
import {
	getProfileId,
	getUniversityVerificationStatus,
} from '@/src/features/university-verification/apis';
import { storage } from '@/src/shared/libs';
import { Text } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Animated,
	Easing,
	type LayoutChangeEvent,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AUTO_DISMISS_MS = 5000;
const AVATAR_SIZE = 52;

const UniversityCertificationChip = ({
	visible,
	onCertify,
	onLater,
}: {
	visible: boolean;
	onCertify: () => void;
	onLater: () => void;
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
		]).start(() => onLater());
	}, [onLater, translateY, chipOpacity]);

	const handlePress = useCallback(() => {
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
		]).start(() => onCertify());
	}, [onCertify, translateY, chipOpacity]);

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

	return (
		<Animated.View
			style={[
				styles.wrapper,
				{ bottom: insets.bottom + 100 },
				{ transform: [{ translateY }], opacity: chipOpacity },
			]}
			pointerEvents={visible ? 'auto' : 'none'}
		>
			<Pressable onPress={handlePress} style={styles.chip}>
				<View style={styles.avatarContainer}>
					<Image
						source={require('@assets/images/instagram-some.webp')}
						style={styles.avatar}
						contentFit="cover"
					/>
				</View>
				<View style={styles.textContainer}>
					<Text style={styles.title} numberOfLines={1}>
						{t('features.event.ui.university_certification_prompt.title')}
					</Text>
					<Text style={styles.subtitle} numberOfLines={1}>
						{t('features.event.ui.university_certification_prompt.benefit_text')}{' '}
						{t('features.event.ui.university_certification_prompt.reward_subtext')}
					</Text>
					<View style={styles.progressTrack} onLayout={handleTrackLayout}>
						<Animated.View style={[styles.progressBar, { width: barWidth }]} />
					</View>
				</View>
			</Pressable>
		</Animated.View>
	);
};

export const useUniversityCertificationPrompt = () => {
	const router = useRouter();
	const { my, isAuthorized } = useAuth();
	const { isRewardEligible, isSuccess: isFreeRewardLoaded } = useFreeRewardStatus();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const checkUniversityCertificationStatus = async () => {
		if (!isAuthorized || !my) {
			setIsLoading(false);
			return;
		}

		// free-reward API에서 eligible=false이면 프롬프트 표시 안 함
		if (isFreeRewardLoaded && !isRewardEligible('universityVerification')) {
			setIsModalVisible(false);
			setIsLoading(false);
			return;
		}

		try {
			const hasDismissedPrompt = await storage.getItem(
				`university-certification-dismissed-${my.phoneNumber}`,
			);
			if (hasDismissedPrompt === 'true') {
				setIsModalVisible(false);
				setIsLoading(false);
				return;
			}

			const profileId = await getProfileId();
			const verificationStatus = await getUniversityVerificationStatus(profileId);

			if (verificationStatus.verifiedAt) {
				const verifiedYear = new Date(verificationStatus.verifiedAt).getFullYear();
				const currentYear = new Date().getFullYear();
				const isVerified = verifiedYear === currentYear;

				if (isVerified) {
					setIsModalVisible(false);
				} else {
					setIsModalVisible(true);
				}
			} else {
				setIsModalVisible(true);
			}
		} catch (error) {
			console.error('Failed to check university certification status:', error);
			const hasDismissedPrompt = await storage.getItem(
				`university-certification-dismissed-${my.phoneNumber}`,
			);
			if (hasDismissedPrompt !== 'true') {
				setIsModalVisible(true);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkUniversityCertificationStatus();
	}, [isAuthorized, my, isFreeRewardLoaded]);

	const markPromptAsShown = async () => {
		if (!my?.phoneNumber) return;

		try {
			await storage.setItem(`university-certification-dismissed-${my.phoneNumber}`, 'true');
			setIsModalVisible(false);
		} catch (error) {
			console.error('Failed to mark certification prompt as shown:', error);
		}
	};

	const handleLater = async () => {
		if (my?.phoneNumber) {
			await storage.setItem(`university-certification-dismissed-${my.phoneNumber}`, 'true');
		}
		setIsModalVisible(false);
	};

	const renderPromptModal = () => (
		<UniversityCertificationChip
			visible={isModalVisible}
			onCertify={() => {
				setIsModalVisible(false);
				router.push('/university-verification/landing');
			}}
			onLater={handleLater}
		/>
	);

	return {
		shouldShowPrompt: isModalVisible,
		isLoading,
		markPromptAsShown,
		renderPromptModal,
	};
};

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
