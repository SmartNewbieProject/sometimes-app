import { ImageResources } from '@/src/shared/libs';
import { ImageResource, Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFeatureCost, useCurrentGem } from '@features/payment/hooks';
import { likeLetterApi } from '../api';
import { useState } from 'react';
import type { LikeOption } from '../types';

type LikeOptionModalProps = {
	connectionId: string;
	nickname: string;
	profileUrl: string;
	canLetter?: boolean;
	onSelect: (option: LikeOption) => void;
	onClose: () => void;
};

export function LikeOptionModal({
	connectionId,
	nickname,
	profileUrl,
	canLetter = false,
	onSelect,
	onClose,
}: LikeOptionModalProps) {
	const { featureCosts } = useFeatureCost();
	const { data } = useCurrentGem();
	const currentGem = data?.totalGem ?? 0;
	const [isInsufficient, setIsInsufficient] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const simpleLikeCost = (featureCosts as Record<string, number>)?.LIKE_MESSAGE ?? 9;
	const baseLetterLikeCost = (featureCosts as Record<string, number>)?.LIKE_WITH_LETTER ?? 11;
	const letterLikeCost = canLetter ? simpleLikeCost : baseLetterLikeCost;

	const handleSimpleLike = () => {
		onSelect('simple');
	};

	const handleLetterLike = async () => {
		if (canLetter) {
			onClose();
			router.push({
				pathname: '/like-letter/write',
				params: {
					connectionId,
					nickname,
					profileUrl: encodeURIComponent(profileUrl),
					canLetter: 'true',
				},
			});
			return;
		}

		// 권한 구매 시도
		try {
			setIsLoading(true);
			// 로컬 잔액 체크 (API 호출 전 빠른 피드백)
			if (currentGem < letterLikeCost) {
				setIsInsufficient(true);
				return;
			}

			// API 호출하여 권한 구매
			await likeLetterApi.purchaseLetterPermission(connectionId);

			onClose();
			router.push({
				pathname: '/like-letter/write',
				params: {
					connectionId,
					nickname,
					profileUrl: encodeURIComponent(profileUrl),
					canLetter: 'true',
				},
			});
		} catch (error: any) {
			// 402 Payment Required or Insufficient Funds handling
			// 에러 코드가 구체적이지 않다면 일단 잔액 부족으로 간주하거나, 서버 에러 메시지를 확인
			setIsInsufficient(true);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoToCharge = () => {
		onClose();
		router.push('/purchase/gem-store');
	};

	if (isInsufficient) {
		return (
			<View style={styles.container}>
				<View style={styles.iconContainer}>
					<View style={styles.iconRing}>
						<View style={styles.iconInner}>
							<Image
								source={require('@assets/images/sometimelogo.png')}
								style={styles.logoIcon}
								contentFit="contain"
							/>
						</View>
					</View>
				</View>

				<View style={styles.content}>
					<View style={styles.titleContainer}>
						<Text weight="bold" size="20" textColor="black" style={styles.titleText}>
							구슬이 1개 부족해요
						</Text>
					</View>

					<View style={styles.descriptionContainer}>
						<Text size="12" textColor="disabled" style={{ textAlign: 'center' }}>
							{`충전하면 편지 1회(${baseLetterLikeCost})와 일반 좋아요 1회(${simpleLikeCost})를\n보낼 수 있어요`}
						</Text>
					</View>

					<View style={styles.optionsContainer}>
						<Pressable style={styles.letterOption} onPress={handleGoToCharge}>
							<View style={styles.chargeContent}>
								<Text weight="medium" size="20" style={styles.letterLikeText}>
									12개 충전하고 편지쓰기
								</Text>
								<Text size="12" style={styles.chargeSubText}>
									결제 후 바로 편지를 보낼 수 있어요
								</Text>
							</View>
						</Pressable>

						<Pressable style={styles.simpleOption} onPress={handleSimpleLike}>
							<View style={styles.gemBadge}>
								<ImageResource resource={ImageResources.GEM} width={22} height={22} />
								<Text size="15" style={styles.gemCountLight}>
									x{simpleLikeCost}
								</Text>
							</View>
							<Text weight="medium" size="20" style={styles.simpleLikeText}>
								일반 좋아요로 보내기
							</Text>
						</Pressable>
					</View>

					<Pressable onPress={onClose} style={styles.closeButton}>
						<Text size="12" textColor="disabled" style={{ textDecorationLine: 'underline' }}>
							다음에
						</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<View style={styles.iconRing}>
					<View style={styles.iconInner}>
						<Image
							source={require('@assets/images/sometimelogo.png')}
							style={styles.logoIcon}
							contentFit="contain"
						/>
					</View>
				</View>
			</View>

			<View style={styles.content}>
				<View style={styles.titleContainer}>
					<Text weight="bold" size="20" textColor="black" style={styles.titleText}>
						마음에 드는 이성에게
					</Text>
					<Text weight="bold" size="20" textColor="black" style={styles.titleText}>
						좋아요를 보내볼까요?
					</Text>
				</View>

				<View style={styles.descriptionContainer}>
					<Text size="12" textColor="disabled">
						이성에게 간단히 관심을 표현하고,
					</Text>
					<Text size="12" textColor="disabled">
						그 다음 단계로 자연스럽게 나아가 보세요.
					</Text>
				</View>

				<View style={styles.optionsContainer}>
					<Pressable style={styles.simpleOption} onPress={handleSimpleLike}>
						<View style={styles.gemBadge}>
							<ImageResource resource={ImageResources.GEM} width={22} height={22} />
							<Text size="15" style={styles.gemCountLight}>
								x{simpleLikeCost}
							</Text>
						</View>
						<Text weight="medium" size="20" style={styles.simpleLikeText}>
							좋아요만 보내기
						</Text>
					</Pressable>

					<Pressable style={styles.letterOption} onPress={handleLetterLike} disabled={isLoading}>
						<View style={styles.gemBadge}>
							<ImageResource resource={ImageResources.GEM} width={22} height={22} />
							<Text size="15" style={styles.gemCountLight}>
								x{letterLikeCost}
							</Text>
						</View>
						<Text weight="medium" size="20" style={styles.letterLikeText}>
							{isLoading ? '처리중...' : '편지와 함께 보내기'}
						</Text>
					</Pressable>
				</View>

				<Text size="10" textColor="disabled" style={styles.hint}>
					직접 채팅과 같은 비용으로, 매칭되면 채팅이 무료로 열려요!
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.white,
		borderRadius: 20,
		paddingTop: 68,
		paddingBottom: 16,
		paddingHorizontal: 16,
		width: 313,
		alignItems: 'center',
	},
	iconContainer: {
		position: 'absolute',
		top: -40,
		alignSelf: 'center',
	},
	iconRing: {
		width: 79,
		height: 79,
		borderRadius: 40,
		backgroundColor: colors.white,
		borderWidth: 3,
		borderColor: colors.primaryPurple,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconInner: {
		width: 63,
		height: 63,
		borderRadius: 32,
		backgroundColor: colors.primaryPurple,
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoIcon: {
		width: 48,
		height: 48,
		borderRadius: 10,
	},
	content: {
		width: '100%',
		alignItems: 'center',
		gap: 11,
	},
	titleContainer: {
		alignItems: 'center',
		gap: 5,
	},
	titleText: {
		textAlign: 'center',
	},
	descriptionContainer: {
		alignItems: 'center',
		marginTop: -3,
	},
	optionsContainer: {
		width: '100%',
		gap: 11,
		marginTop: 4,
	},
	simpleOption: {
		height: 50,
		borderRadius: 20,
		borderWidth: 1.5,
		borderColor: colors.primaryPurple,
		backgroundColor: colors.white,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	letterOption: {
		height: 50,
		borderRadius: 20,
		backgroundColor: colors.primaryPurple,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	chargeContent: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 2,
	},
	chargeSubText: {
		color: 'rgba(255, 255, 255, 0.8)',
	},
	gemBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 1,
	},
	gemCountLight: {
		color: '#BEACFF',
	},
	simpleLikeText: {
		color: colors.primaryPurple,
	},
	letterLikeText: {
		color: colors.white,
	},
	hint: {
		textAlign: 'center',
		marginTop: 5,
	},
	closeButton: {
		marginTop: 5,
		padding: 5,
	},
});
