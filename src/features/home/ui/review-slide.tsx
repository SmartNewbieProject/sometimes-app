import colors from '@/src/shared/constants/colors';
import Slide from '@/src/widgets/slide';
import { Text } from '@shared/ui';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { usePublicReviewsQuery } from '../queries';
import type { PublicReview, PublicReviewSource } from '../types';

const formatDate = (iso: string) => {
	const d = new Date(iso);
	const yy = String(d.getFullYear()).slice(2);
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yy}.${mm}.${dd}`;
};

const sourceLabel: Record<PublicReviewSource, string> = {
	APP_STORE: 'App Store',
	PLAY_STORE: 'Google Play',
	HOT: '인기게시글',
	COMMUNITY: '커뮤니티',
};

const ReviewCard = ({ review }: { review: PublicReview }) => {
	const { author } = review;
	const logoUri = author?.university?.logoFile ?? null;

	return (
		<View style={styles.reviewCard}>
			<View style={styles.headerRow}>
				{logoUri ? (
					<Image source={{ uri: logoUri }} style={styles.universityImage} contentFit="contain" />
				) : null}
				<View style={styles.userInfo}>
					<Text size="md" weight="semibold" textColor="black">
						{author?.nickname ?? '익명'}
					</Text>
					{author?.university?.name ? (
						<Text size="sm" weight="light" textColor="black">
							{author.university.name}
						</Text>
					) : null}
				</View>
				<View style={styles.metaInfo}>
					<Text size="sm" style={styles.sourceText}>
						{sourceLabel[review.source]}
					</Text>
					{review.rating != null ? (
						<Text size="sm" style={styles.ratingText}>
							{'★'.repeat(review.rating)}
							{'☆'.repeat(5 - review.rating)}
						</Text>
					) : null}
				</View>
			</View>

			<View style={styles.contentSection}>
				{review.title ? (
					<Text size="sm" weight="semibold" textColor="black" numberOfLines={1}>
						{review.title}
					</Text>
				) : null}
				<Text size="sm" textColor="black" numberOfLines={5}>
					{review.body}
				</Text>
				<Text size="sm" style={styles.dateText}>
					{formatDate(review.createdAt)}
				</Text>
			</View>
		</View>
	);
};

interface ReviewSlideProps {
	onGestureStateChange?: (isDragging: boolean) => void;
}

export const ReviewSlide = ({ onGestureStateChange }: ReviewSlideProps) => {
	const { data } = usePublicReviewsQuery();
	const reviews = data?.items;

	if (!reviews || reviews.length === 0) return null;

	return (
		<Slide
			autoPlayInterval={6000}
			autoPlay
			style={styles.slider}
			indicatorContainerStyle={styles.indicatorContainer}
			onGestureStateChange={onGestureStateChange}
		>
			{reviews.map((review) => (
				<ReviewCard key={review.id} review={review} />
			))}
		</Slide>
	);
};

const styles = StyleSheet.create({
	slider: {
		width: '100%',
	},
	indicatorContainer: {
		bottom: -28,
	},
	reviewCard: {
		flexDirection: 'column',
		gap: 8,
		width: '100%',
		height: 160,
		overflow: 'hidden',
		backgroundColor: colors.moreLightPurple,
		padding: 10,
		borderRadius: 12,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 8,
	},
	universityImage: {
		width: 48,
		height: 48,
	},
	userInfo: {
		flexDirection: 'column',
		flex: 1,
		gap: 2,
	},
	metaInfo: {
		flexDirection: 'column',
		alignItems: 'flex-end',
		gap: 2,
	},
	sourceText: {
		color: '#888888',
	},
	ratingText: {
		color: '#FFB800',
		letterSpacing: 1,
	},
	contentSection: {
		marginHorizontal: 8,
		flexDirection: 'column',
		gap: 4,
	},
	dateText: {
		color: '#6F6F6F',
		marginTop: 4,
	},
});
