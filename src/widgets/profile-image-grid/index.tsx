import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ImageSelector } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/colors';

interface ProfileImageGridProps {
	images: (string | undefined)[];
	onImageChange: (index: number, value: string) => void;
}

export function ProfileImageGrid({ images, onImageChange }: ProfileImageGridProps) {
	const { t } = useTranslation();
	return (
		<View style={styles.imageGrid}>
			<View style={styles.mainImageContainer}>
				<ImageSelector
					size="lg"
					value={images[0]}
					onChange={(value) => {
						onImageChange(0, value);
					}}
				/>
				<View style={styles.mainBadge}>
					<View style={styles.badge}>
						<RNText style={styles.badgeText}>{t('widgets.profile-image-grid.main_badge')}</RNText>
					</View>
				</View>
			</View>

			<View style={styles.subImagesContainer}>
				<View style={styles.subImageWrapper}>
					<ImageSelector
						size="sm"
						value={images[1]}
						onChange={(value) => {
							onImageChange(1, value);
						}}
					/>
				</View>
				<View style={styles.subImageWrapper}>
					<ImageSelector
						size="sm"
						value={images[2]}
						onChange={(value) => {
							onImageChange(2, value);
						}}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	imageGrid: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		gap: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	mainImageContainer: {
		position: 'relative',
		flex: 2,
		aspectRatio: 1,
	},
	subImagesContainer: {
		flexDirection: 'column',
		gap: 12,
		flex: 1,
	},
	subImageWrapper: {
		width: '100%',
		aspectRatio: 1,
	},
	mainBadge: {
		position: 'absolute',
		top: 12,
		right: 12,
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		backgroundColor: semanticColors.brand.primary,
	},
	badgeText: {
		fontSize: 11,
		fontWeight: '700',
		lineHeight: 13,
		color: '#FFFFFF',
	},
});
