import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FloatingTooltip } from '../floating-tooltip';

type AppDownloadSectionSize = 'sm' | 'md' | 'lg';

interface AppDownloadSectionProps {
	onAppStorePress?: () => void;
	onGooglePlayPress?: () => void;
	tooltipText?: string;
	showTooltip?: boolean;
	size?: AppDownloadSectionSize;
}

const SIZE_CONFIG = {
	sm: {
		imageWidth: 140,
		imageHeight: 45,
		gap: 4,
		tooltipBottom: 48,
	},
	md: {
		imageWidth: 160,
		imageHeight: 52,
		gap: 4,
		tooltipBottom: 55,
	},
	lg: {
		imageWidth: 180,
		imageHeight: 59,
		gap: 6,
		tooltipBottom: 62,
	},
} as const;

export const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({
	onAppStorePress,
	onGooglePlayPress,
	tooltipText,
	showTooltip = true,
	size = 'md',
}) => {
	const { t } = useTranslation();
	const config = SIZE_CONFIG[size];
	const finalTooltipText = tooltipText ?? t('common.install_app_tooltip');
	const appStoreLabel = t('common.download_app_store');
	const googlePlayLabel = t('common.download_google_play');

	return (
		<View style={styles.container}>
			<View style={styles.contentWrapper}>
				<View style={[styles.storeLinksContainer, { gap: config.gap }]}>
					<Pressable
						onPress={onAppStorePress}
						accessibilityLabel={appStoreLabel}
						accessibilityRole="link"
					>
						<Image
							source={require('@assets/images/download/appstore-hq.png')}
							style={{
								width: config.imageWidth,
								height: config.imageHeight,
								cursor: 'pointer',
							}}
							resizeMode="contain"
							accessibilityLabel={appStoreLabel}
							alt={appStoreLabel}
						/>
					</Pressable>
					<Pressable
						onPress={onGooglePlayPress}
						accessibilityLabel={googlePlayLabel}
						accessibilityRole="link"
					>
						<Image
							source={require('@assets/images/download/googleplay-hq.png')}
							style={{
								width: config.imageWidth,
								height: config.imageHeight,
								cursor: 'pointer',
							}}
							resizeMode="contain"
							accessibilityLabel={googlePlayLabel}
							alt={googlePlayLabel}
						/>
					</Pressable>
				</View>
				{showTooltip && (
					<FloatingTooltip
						text={finalTooltipText}
						rotation="top"
						style={{ bottom: config.tooltipBottom, zIndex: 1001 }}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 20,
		marginBottom: 15,
		width: 330,
		alignItems: 'center',
	},
	contentWrapper: {
		position: 'relative',
		width: '100%',
		zIndex: 1000,
	},
	storeLinksContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
