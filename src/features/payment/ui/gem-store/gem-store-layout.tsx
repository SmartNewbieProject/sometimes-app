import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useScrollIndicator } from '@/src/shared/hooks';
import { ScrollDownIndicator, Show, Text } from '@/src/shared/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GemStore } from './index';

type GemStoreLayoutProps = {
	gemCount: number;
	renderSaleCard: () => ReactNode;
	renderProductList: () => ReactNode;
	renderMissionSection?: () => ReactNode;
	isLoading?: boolean;
	title: string;
};

export const GemStoreLayout = ({
	gemCount,
	renderSaleCard,
	renderProductList,
	renderMissionSection,
	isLoading,
	title,
}: GemStoreLayoutProps) => {
	const insets = useSafeAreaInsets();
	const { showIndicator, handleScroll, scrollViewRef } = useScrollIndicator();

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<GemStore.Header gemCount={gemCount} />
			<ScrollView
				ref={scrollViewRef}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContent}
			>
				<GemStore.Banner />
				<View style={styles.contentCard}>
					<View style={styles.contentWrapper}>
						<View style={styles.saleSection}>
							{renderSaleCard()}
						</View>

						<Text weight="semibold" size="20" textColor="black" style={styles.sectionTitle}>
							{title}
						</Text>

						<View style={styles.productList}>
							{renderProductList()}
						</View>

						{renderMissionSection && (
							<View style={styles.missionSection}>
								{renderMissionSection()}
							</View>
						)}
					</View>
				</View>
			</ScrollView>
			<ScrollDownIndicator visible={showIndicator} />

			<Show when={!!isLoading}>
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#fff" />
				</View>
			</Show>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: semanticColors.surface.secondary,
	},
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		flexGrow: 1,
		paddingBottom: 40,
	},
	contentCard: {
		backgroundColor: semanticColors.surface.secondary,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		marginTop: -32,
		paddingTop: 32,
		paddingBottom: 28,
		flexGrow: 1,
	},
	contentWrapper: {
		flex: 1,
		flexDirection: 'column',
		paddingHorizontal: 16,
		marginTop: 16,
	},
	saleSection: {
		marginBottom: 30,
	},
	sectionTitle: {
		marginBottom: 8,
	},
	productList: {
		flexDirection: 'column',
		gap: 16,
		justifyContent: 'center',
		paddingBottom: 20,
	},
	missionSection: {
		marginTop: 24,
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 9999,
	},
});
