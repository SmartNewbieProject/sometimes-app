import { useHomeHots } from '@/src/features/community/hooks/use-home';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Badge, Text } from '@/src/shared/ui';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

const CARD_WIDTH = 280;
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const SIDE_PADDING = 20;

export function HotPostsCarousel() {
	const { t } = useTranslation();
	const { hots, isLoading, isError } = useHomeHots();

	if (isLoading) {
		return <View style={styles.placeholder} />;
	}

	if (isError || !hots.length) {
		return null;
	}

	return (
		<View style={styles.section}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('features.home.ui.hot_posts_carousel.title')}</Text>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => router.push('/community')}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<Text style={styles.viewAll}>{t('features.home.ui.hot_posts_carousel.view_all')}</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.carouselWrapper}>
				<FlatList
					data={hots}
					keyExtractor={(item) => item.id}
					horizontal
					showsHorizontalScrollIndicator={false}
					snapToInterval={SNAP_INTERVAL}
					snapToAlignment="start"
					decelerationRate="fast"
					contentContainerStyle={styles.listContent}
					renderItem={({ item }) => (
						<TouchableOpacity
							activeOpacity={0.85}
							onPress={() => router.push(`/community/${item.id}`)}
							style={styles.card}
						>
							<Badge variant="approved">{item.categoryName}</Badge>
							<Text numberOfLines={2} style={styles.cardTitle}>
								{item.title}
							</Text>
						</TouchableOpacity>
					)}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		marginTop: 8,
		overflow: 'hidden',
	},
	placeholder: {
		height: 130,
		marginTop: 8,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: semanticColors.text.primary,
	},
	viewAll: {
		fontSize: 13,
		fontWeight: '500',
		color: semanticColors.text.muted,
	},
	carouselWrapper: {
		marginHorizontal: -SIDE_PADDING,
	},
	listContent: {
		paddingHorizontal: SIDE_PADDING,
		gap: CARD_GAP,
	},
	card: {
		width: CARD_WIDTH,
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 14,
		paddingHorizontal: 16,
		paddingVertical: 14,
		gap: 8,
	},
	cardTitle: {
		fontSize: 15,
		fontWeight: '600',
		lineHeight: 21,
		color: semanticColors.text.primary,
	},
});
