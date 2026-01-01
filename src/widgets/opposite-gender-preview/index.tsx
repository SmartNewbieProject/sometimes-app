import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text as RNText, Animated, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/colors';

interface ProfileCardProps {
	index: number;
	isLocked: boolean;
	genderLabel: string;
	imageSource: ImageSourcePropType;
}

// 별도 컴포넌트로 분리 (Hooks 규칙 준수)
function ProfileCard({ index, isLocked, genderLabel, imageSource }: ProfileCardProps) {
	// 애니메이션 값
	const scaleAnim = useRef(new Animated.Value(1)).current;
	const blurOpacityAnim = useRef(new Animated.Value(isLocked ? 1 : 0)).current;

	// uploadedCount 변경 시 애니메이션 트리거
	useEffect(() => {
		if (!isLocked) {
			// 언블러 애니메이션: 바운스 효과 + blur fade out
			Animated.parallel([
				// 바운스 애니메이션 (sequence로 튕기는 효과)
				Animated.sequence([
					Animated.timing(scaleAnim, {
						toValue: 1.15,
						duration: 150,
						useNativeDriver: true,
					}),
					Animated.timing(scaleAnim, {
						toValue: 0.95,
						duration: 100,
						useNativeDriver: true,
					}),
					Animated.spring(scaleAnim, {
						toValue: 1,
						friction: 4,
						tension: 40,
						useNativeDriver: true,
					}),
				]),
				// 블러 제거 애니메이션
				Animated.timing(blurOpacityAnim, {
					toValue: 0,
					duration: 400,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			// 잠금 상태로 리셋
			scaleAnim.setValue(1);
			blurOpacityAnim.setValue(1);
		}
	}, [isLocked, scaleAnim, blurOpacityAnim]);

	return (
		<Animated.View
			style={[
				styles.simCard,
				{
					transform: [{ scale: scaleAnim }],
				},
			]}
		>
			{/* 프로필 이미지 */}
			<View style={styles.profileImageBase}>
				<Image source={imageSource} style={styles.profileImage} contentFit="cover" />
			</View>

			{/* 블러 오버레이 - 항상 렌더링하되 opacity로 제어 */}
			<Animated.View
				pointerEvents="none"
				style={[
					styles.blurContainer,
					{
						opacity: blurOpacityAnim,
					},
				]}
			>
				<BlurView intensity={90} style={styles.blur} />
				<View style={styles.dim} />
				<View style={styles.lockIconContainer}>
					<View style={styles.lockIconBackground}>
						<RNText style={styles.lockIcon}>🔒</RNText>
					</View>
				</View>
			</Animated.View>
		</Animated.View>
	);
}

interface OppositeGenderPreviewProps {
	uploadedCount: number;
	userGender?: 'MALE' | 'FEMALE';
}

const SAMPLE_IMAGES = {
	MALE: [
		require('@/assets/images/samples/man/man_0.png'),
		require('@/assets/images/samples/man/man_1.png'),
		require('@/assets/images/samples/man/man_2.png'),
	],
	FEMALE: [
		require('@/assets/images/samples/girl/girl_0.png'),
		require('@/assets/images/samples/girl/girl_1.png'),
		require('@/assets/images/samples/girl/girl_2.png'),
	],
};

export function OppositeGenderPreview({ uploadedCount, userGender }: OppositeGenderPreviewProps) {
	const { t } = useTranslation();
	const oppositeGender = userGender === 'MALE' ? 'FEMALE' : 'MALE';
	const genderLabel =
		oppositeGender === 'MALE'
			? t('widgets.opposite-gender-preview.gender.male')
			: t('widgets.opposite-gender-preview.gender.female');
	const sampleImages = SAMPLE_IMAGES[oppositeGender];

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<RNText style={styles.headerTitle}>
					{t('widgets.opposite-gender-preview.header_title')}
				</RNText>
				<View style={styles.badge}>
					<RNText style={styles.badgeText}>
						{t('widgets.opposite-gender-preview.badge_text', { count: uploadedCount })}
					</RNText>
				</View>
			</View>

			{/* Profile Grid */}
			<View style={styles.profileGrid}>
				{[0, 1, 2].map((index) => (
					<ProfileCard
						key={index}
						index={index}
						isLocked={index >= uploadedCount}
						genderLabel={genderLabel}
						imageSource={sampleImages[index]}
					/>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: semanticColors.surface.background,
		borderRadius: 16,
		marginHorizontal: 20,
		marginTop: 32,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: '#E4E2E2',
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.03,
		shadowRadius: 20,
		elevation: 2,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	headerTitle: {
		fontSize: 14,
		fontWeight: '700',
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-SemiBold',
	},
	badge: {
		backgroundColor: semanticColors.surface.tertiary,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	badgeText: {
		fontSize: 11,
		fontWeight: '600',
		color: semanticColors.brand.primary,
		fontFamily: 'Pretendard-SemiBold',
	},
	profileGrid: {
		flexDirection: 'row',
		gap: 8,
	},
	simCard: {
		flex: 1,
		aspectRatio: 1,
		borderRadius: 12,
		overflow: 'hidden',
		position: 'relative',
	},
	profileImageBase: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 12,
		overflow: 'hidden',
	},
	profileImage: {
		width: '100%',
		height: '100%',
		borderRadius: 12,
	},
	blurContainer: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 12,
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center',
	},
	blur: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 12,
	},
	dim: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 12,
	},
	lockIconContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10,
	},
	lockIconBackground: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: semanticColors.brand.primary,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 4,
	},
	lockIcon: {
		fontSize: 24,
		textAlign: 'center',
	},
});
