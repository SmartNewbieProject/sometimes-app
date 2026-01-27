import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

interface OverlappingAvatarsProps {
	images: string[];
	size?: number;
	overlap?: number;
	maxCount?: number;
	totalCount?: number; // 전체 인원수 (images.length보다 클 수 있음)
}

export const OverlappingAvatars = ({
	images,
	size = 48,
	overlap = 16,
	maxCount = 5,
	totalCount,
}: OverlappingAvatarsProps) => {
	const displayImages = images.slice(0, maxCount);
	const actualTotal = totalCount ?? images.length;
	const hasMore = actualTotal > maxCount;

	if (displayImages.length === 0) {
		return null;
	}

	// 아바타 전체 너비 계산
	const avatarsWidth = size + (displayImages.length - 1) * (size - overlap);
	// "..." 포함 전체 너비
	const totalWidth = hasMore ? avatarsWidth + (size - overlap) : avatarsWidth;

	return (
		<View style={[styles.container, { width: totalWidth, height: size }]}>
			{/* More indicator (맨 뒤에 위치) */}
			{hasMore && (
				<View
					style={[
						styles.moreIndicator,
						{
							width: size,
							height: size,
							borderRadius: size / 2,
							left: avatarsWidth - overlap,
						},
					]}
				>
					<Text size="12" weight="bold" textColor="inverse">
						···
					</Text>
				</View>
			)}

			{/* Avatars */}
			{displayImages.map((imageUrl, index) => (
				<Image
					key={`${imageUrl}-${index}`}
					source={{ uri: imageUrl }}
					style={[
						styles.avatar,
						{
							width: size,
							height: size,
							borderRadius: size / 2,
							left: index * (size - overlap),
						},
					]}
					contentFit="cover"
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'relative',
	},
	avatar: {
		position: 'absolute',
		borderWidth: 2,
		borderColor: semanticColors.surface.background,
	},
	moreIndicator: {
		position: 'absolute',
		backgroundColor: semanticColors.brand.primary,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: semanticColors.surface.background,
	},
});
