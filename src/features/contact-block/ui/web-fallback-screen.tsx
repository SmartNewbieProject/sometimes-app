import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '@/src/shared/ui';
import { AppDownloadSection } from '@/src/shared/ui/app-download-section';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { getIOSStoreUrl, getAndroidStoreUrl } from '@/src/shared/libs/platform-utils';

interface WebFallbackScreenProps {
	onBack?: () => void;
}

export const WebFallbackScreen: React.FC<WebFallbackScreenProps> = ({ onBack }) => {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	const BENEFITS = [
		t('features.contact-block.ui.내_연락처에_저장된_지인_자동_차단'),
		t('features.contact-block.ui.안심하고_새로운_인연_만나기'),
		t('features.contact-block.ui.언제든_설정_변경_가능'),
	];

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else {
			router.back();
		}
	};

	const handleAppStorePress = () => {
		Linking.openURL(getIOSStoreUrl());
	};

	const handleGooglePlayPress = () => {
		Linking.openURL(getAndroidStoreUrl());
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.content}>
				<View style={styles.iconContainer}>
					<Text style={styles.icon}>📱</Text>
				</View>

				<Text style={styles.title}>휴대폰 앱에서 설정할 수 있어요</Text>

				<Text style={styles.description}>
					연락처 기반 지인 차단 기능은{'\n'}
					앱에서만 사용할 수 있어요
				</Text>

				<View style={styles.benefitsContainer}>
					{BENEFITS.map((benefit, index) => (
						<View key={index} style={styles.benefitRow}>
							<Text style={styles.checkIcon}>✓</Text>
							<Text style={styles.benefitText}>{benefit}</Text>
						</View>
					))}
				</View>

				<View style={styles.downloadSection}>
					<AppDownloadSection
						onAppStorePress={handleAppStorePress}
						onGooglePlayPress={handleGooglePlayPress}
						tooltipText={t('features.contact-block.ui.앱을_설치하고_안심하고_시작하세요')}
						showTooltip={true}
						size="md"
					/>
				</View>
			</View>

			<View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
				<Button variant="outline" onPress={handleBack} style={styles.skipButton}>
					나중에 할게요
				</Button>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingTop: 40,
	},
	iconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: semanticColors.surface.secondary,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
	},
	icon: {
		fontSize: 40,
	},
	title: {
		fontSize: 22,
		fontFamily: 'Pretendard-Bold',
		fontWeight: '700',
		color: semanticColors.text.primary,
		textAlign: 'center',
		marginBottom: 12,
	},
	description: {
		fontSize: 15,
		fontFamily: 'Pretendard-Regular',
		color: semanticColors.text.secondary,
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 32,
	},
	benefitsContainer: {
		width: '100%',
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 16,
		padding: 20,
		gap: 14,
	},
	benefitRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	checkIcon: {
		fontSize: 16,
		color: semanticColors.brand.primary,
		fontWeight: '700',
	},
	benefitText: {
		fontSize: 15,
		fontFamily: 'Pretendard-Medium',
		fontWeight: '500',
		color: semanticColors.text.primary,
		flex: 1,
	},
	downloadSection: {
		marginTop: 48,
		alignItems: 'center',
	},
	footer: {
		paddingHorizontal: 24,
		paddingTop: 16,
	},
	skipButton: {
		width: '100%',
	},
});
