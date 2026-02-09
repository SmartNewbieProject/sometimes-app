import colors from '@/src/shared/constants/colors';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { Button } from '@/src/shared/ui';
import { Text } from '@/src/shared/ui/text';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIdealTypeTestModalEnabled } from '../queries/use-ideal-type-test-modal-enabled';

interface IdealTypeTestPromptOptions {
	onStart?: () => void;
}

interface UseIdealTypeTestPromptReturn {
	showPrompt: () => void;
}

/**
 * FeatureBadge 컴포넌트 - 기능 배지
 */
function FeatureBadge({ icon, text }: { icon: string; text: string }) {
	return (
		<View style={styles.badge}>
			<Text size="16">{icon}</Text>
			<Text size="14" weight="medium" textColor="gray">
				{text}
			</Text>
		</View>
	);
}

/**
 * 이상형 테스트 프롬프트 바텀시트 컨텐츠 컴포넌트
 */
function IdealTypeTestPromptContent({
	onClose,
	onStart,
}: {
	onClose: () => void;
	onStart: () => void;
}) {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	const handleStart = () => {
		// Analytics: CTA 클릭
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_PROMPT_CTA_CLICKED, {
			entry_source: 'prompt',
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		onClose();
		onStart();
	};

	const handleDismiss = () => {
		// Analytics: Dismiss
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_PROMPT_DISMISSED, {
			dismiss_method: 'close_button',
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		onClose();
	};

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
			{/* 헤더 */}
			<View style={styles.header}>
				<Text style={[styles.emoji, { fontSize: 32 }]}>
					💜
				</Text>
				<Text size="20" weight="bold" style={styles.title}>
					{t('features.ideal_type_test.prompt.title')}
				</Text>
			</View>

			{/* 기능 배지 */}
			<View style={styles.features}>
				<FeatureBadge icon="⚡" text={t('features.ideal_type_test.prompt.feature_1')} />
				<FeatureBadge icon="🎯" text={t('features.ideal_type_test.prompt.feature_2')} />
				<FeatureBadge icon="✨" text={t('features.ideal_type_test.prompt.feature_3')} />
			</View>

			{/* CTA 버튼 */}
			<Button
				variant="primary"
				onPress={handleStart}
				styles={{
					width: '100%',
					marginBottom: 12,
				}}
			>
				<Text textColor="white" size="16" weight="semibold">
					{t('features.ideal_type_test.prompt.cta_button')}
				</Text>
			</Button>

			{/* Dismiss 힌트 */}
			<TouchableOpacity onPress={handleDismiss} style={styles.dismissHint}>
				<Text size="sm" textColor="gray" style={{ textAlign: 'center' }}>
					{t('features.ideal_type_test.prompt.dismiss_hint')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

/**
 * 이상형 테스트 프롬프트 훅
 * - 3초 후 자동으로 바텀시트 표시
 * - sessionStorage로 중복 노출 방지
 */
export function useIdealTypeTestPrompt(
	options: IdealTypeTestPromptOptions = {},
): UseIdealTypeTestPromptReturn {
	const { showModal, hideModal } = useModal();
	const router = useRouter();
	const { data: featureFlag } = useIdealTypeTestModalEnabled();

	const showPrompt = useCallback(() => {
		showModal({
			custom: () => (
				<IdealTypeTestPromptContent
					onClose={hideModal}
					onStart={() => {
						if (options.onStart) {
							options.onStart();
						} else {
							router.push('/auth/login/ideal-type-test');
						}
					}}
				/>
			),
			dismissable: true,
			position: 'bottom',
		});
	}, [showModal, hideModal, options, router]);

	// 자동 트리거 로직 (3초 후 자동 등장, 피쳐플래그 활성화 시에만)
	useEffect(() => {
		if (!featureFlag?.enabled) return;

		// Web에서만 sessionStorage 사용
		if (Platform.OS === 'web') {
			const hasShown = sessionStorage.getItem('ideal_type_test_prompt_shown');
			if (hasShown) return;
		}

		const timer = setTimeout(() => {
			showPrompt();

			// Web에서 중복 노출 방지
			if (Platform.OS === 'web') {
				sessionStorage.setItem('ideal_type_test_prompt_shown', 'true');
			}

			// Analytics: Prompt 노출
			mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_PROMPT_SHOWN, {
				trigger_type: 'auto',
				delay_seconds: 3,
				entry_source: 'auth_page',
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
		}, 3000);

		return () => clearTimeout(timer);
	}, [featureFlag?.enabled, showPrompt]);

	return { showPrompt };
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingHorizontal: 24,
		paddingVertical: 32,
		...(Platform.OS === 'web' && {
			maxWidth: 468,
		}),
	},
	header: {
		alignItems: 'center',
		marginBottom: 24,
	},
	emoji: {
		marginBottom: 8,
	},
	title: {
		textAlign: 'center',
		color: semanticColors.text.primary,
	},
	features: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		justifyContent: 'center',
		marginBottom: 24,
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: '#F5F2FF',
		borderRadius: 20,
	},
	dismissHint: {
		paddingVertical: 12,
		alignItems: 'center',
	},
});
