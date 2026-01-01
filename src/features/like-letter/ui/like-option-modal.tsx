import { ImageResources } from '@/src/shared/libs';
import { ImageResource, Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFeatureCost } from '@features/payment/hooks';
import type { LikeOption } from '../types';

type LikeOptionModalProps = {
	connectionId: string;
	nickname: string;
	profileUrl: string;
	onSelect: (option: LikeOption) => void;
	onClose: () => void;
};

export function LikeOptionModal({
	connectionId,
	nickname,
	profileUrl,
	onSelect,
	onClose,
}: LikeOptionModalProps) {
	const { featureCosts } = useFeatureCost();
	const simpleLikeCost = (featureCosts as Record<string, number>)?.LIKE_MESSAGE ?? 9;
	const letterLikeCost = (featureCosts as Record<string, number>)?.LIKE_WITH_LETTER ?? 11;

	const handleSimpleLike = () => {
		onSelect('simple');
	};

	const handleLetterLike = () => {
		onClose();
		router.push({
			pathname: '/like-letter/write',
			params: {
				connectionId,
				nickname,
				profileUrl: encodeURIComponent(profileUrl),
			},
		});
	};

	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<View style={styles.iconRing}>
					<View style={styles.iconInner}>
						<Image
							source={require('@assets/images/sometime-logo.png')}
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

					<Pressable style={styles.letterOption} onPress={handleLetterLike}>
						<View style={styles.gemBadge}>
							<ImageResource resource={ImageResources.GEM} width={22} height={22} />
							<Text size="15" style={styles.gemCountLight}>
								x{letterLikeCost}
							</Text>
						</View>
						<Text weight="medium" size="20" style={styles.letterLikeText}>
							편지와 함께 보내기
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
});
