import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { Button } from '@/src/shared/ui/button';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';

interface ExpandRegionEmptyStateProps {
	onDismiss?: () => void;
}

export const ExpandRegionEmptyState: React.FC<
	ExpandRegionEmptyStateProps
> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { trackEvent } = useMixpanel();
	const viewStartTime = useRef<number>(Date.now());

	// Component mount 시 viewed 이벤트 트래킹
	useEffect(() => {
		trackEvent(MIXPANEL_EVENTS.EXPAND_REGION_EMPTY_VIEWED, {
			timestamp: Date.now(),
		});
	}, [trackEvent]);

	const handleWait = () => {
		const timeOnScreen = Date.now() - viewStartTime.current;

		trackEvent(MIXPANEL_EVENTS.EXPAND_REGION_EMPTY_ACTION, {
			action: 'wait',
			time_on_screen: timeOnScreen,
		});

		onDismiss?.();
	};

	return (
		<View style={styles.container}>
			{/* 메인 메시지 */}
			<Text style={styles.mainMessage}>
				{t('features.matching.expandRegion.empty.title')}
			</Text>

			{/* 서브 메시지 */}
			<Text style={styles.subMessage}>
				{t('features.matching.expandRegion.empty.description')}
			</Text>

			{/* Tip (선택적) */}
			<View style={styles.tipContainer}>
				<Text style={styles.tipText}>
					{t('features.matching.expandRegion.empty.tip')}
				</Text>
			</View>

			{/* CTA 버튼 */}
			<View style={styles.buttonContainer}>
				<Button
					variant="primary"
					onPress={handleWait}
					style={styles.primaryButton}
					width="full"
				>
					{t('features.matching.expandRegion.empty.cta.wait')}
				</Button>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
		paddingVertical: 20,
		backgroundColor: colors.surface.background,
	},
	mainMessage: {
		fontSize: 20,
		fontWeight: '700',
		color: colors.text.primary,
		textAlign: 'center',
		marginBottom: 12,
	},
	subMessage: {
		fontSize: 15,
		lineHeight: 22,
		color: colors.text.secondary,
		textAlign: 'center',
		marginBottom: 20,
	},
	tipContainer: {
		backgroundColor: colors.brand.primaryLight,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		marginBottom: 32,
		width: '100%',
	},
	tipText: {
		fontSize: 14,
		color: colors.brand.primary,
		textAlign: 'center',
	},
	buttonContainer: {
		width: '100%',
	},
	primaryButton: {
		width: '100%',
	},
});
