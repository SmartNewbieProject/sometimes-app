import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { Button } from '@/src/shared/ui';
import { Text } from '@/src/shared/ui/text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIdealTypeTestModalEnabled } from '../queries/use-ideal-type-test-modal-enabled';
import { useStartTest } from '../queries/use-start-test';
import type { LanguageCode } from '../types';
import { useTestProgress } from './use-test-progress';
import { useTestSession } from './use-test-session';

interface IdealTypeTestPromptOptions {
	onStart?: () => void;
}

interface UseIdealTypeTestPromptReturn {
	showPrompt: () => void;
}

/**
 * FeatureRow 컴포넌트 - 세로 리스트 항목
 */
function FeatureRow({ icon, text }: { icon: string; text: string }) {
	return (
		<View style={styles.featureRow}>
			<View style={styles.iconBadge}>
				<Text size="18">{icon}</Text>
			</View>
			<Text size="14" weight="medium" textColor="black" style={{ flex: 1 }}>
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
			{/* Hero 영역 */}
			<View style={styles.heroContainer}>
				<Image
					source={require('@assets/images/info-miho.webp')}
					style={styles.heroImage}
					contentFit="contain"
				/>
			</View>

			{/* 타이틀 + 서브타이틀 */}
			<View style={styles.titleSection}>
				<Text size="20" weight="bold" style={styles.title}>
					{t('features.ideal-type-test.prompt.title')}
				</Text>
				<Text size="14" textColor="gray" style={styles.subtitle}>
					{t('features.ideal-type-test.prompt.subtitle')}
				</Text>
			</View>

			{/* Feature 세로 리스트 */}
			<View style={styles.featureList}>
				<FeatureRow icon="⚡" text={t('features.ideal-type-test.prompt.feature_1')} />
				<FeatureRow icon="🎯" text={t('features.ideal-type-test.prompt.feature_2')} />
				<FeatureRow icon="✨" text={t('features.ideal-type-test.prompt.feature_3')} />
			</View>

			{/* CTA + Dismiss */}
			<View style={styles.ctaSection}>
				<Button
					variant="primary"
					onPress={handleStart}
					styles={{ width: '100%', marginBottom: 12 }}
				>
					<Text textColor="white" size="16" weight="semibold">
						{t('features.ideal-type-test.prompt.cta_button')}
					</Text>
				</Button>

				<TouchableOpacity onPress={handleDismiss} style={styles.dismissHint}>
					<Text size="sm" textColor="gray" style={{ textAlign: 'center' }}>
						{t('features.ideal-type-test.prompt.dismiss_hint')}
					</Text>
				</TouchableOpacity>
			</View>
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
	const { i18n } = useTranslation();
	const { data: featureFlag } = useIdealTypeTestModalEnabled();
	const { mutate: startTest } = useStartTest();
	const { setSession } = useTestProgress();
	const { saveSession, clearSession } = useTestSession();
	const hasShownRef = useRef(false);
	const onStartRef = useRef(options.onStart);
	onStartRef.current = options.onStart;

	const handleStartTest = useCallback(async () => {
		const lang = (i18n.language?.startsWith('ja') ? 'ja' : 'ko') as LanguageCode;
		await clearSession();

		startTest(
			{ request: { source: 'mobile' }, lang },
			{
				onSuccess: async (data) => {
					await saveSession({
						sessionId: data.sessionId,
						expiresAt: data.expiresAt,
						currentStep: 0,
						answers: [],
						questions: data.questions,
					});
					setSession(data.sessionId, data.questions, data.expiresAt);
					router.push('/auth/login/ideal-type-test/questions');
				},
				onError: () => {
					router.push('/auth/login/ideal-type-test');
				},
			},
		);
	}, [i18n.language, clearSession, startTest, saveSession, setSession, router]);

	const showPrompt = useCallback(() => {
		showModal({
			custom: () => (
				<IdealTypeTestPromptContent
					onClose={hideModal}
					onStart={() => {
						if (onStartRef.current) {
							onStartRef.current();
						} else {
							handleStartTest();
						}
					}}
				/>
			),
			dismissable: true,
			position: 'bottom',
		});
	}, [showModal, hideModal, handleStartTest]);

	// 자동 트리거 로직 (3초 후 자동 등장, 피쳐플래그 활성화 시에만)
	useEffect(() => {
		if (hasShownRef.current) return;
		if (!__DEV__ && !featureFlag?.enabled) return;

		// Web에서만 sessionStorage 사용 (__DEV__에서는 항상 노출)
		if (!__DEV__ && Platform.OS === 'web') {
			const hasShown = sessionStorage.getItem('ideal_type_test_prompt_shown');
			if (hasShown) return;
		}

		const timer = setTimeout(() => {
			hasShownRef.current = true;
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
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		overflow: 'hidden',
		...(Platform.OS === 'web' && {
			maxWidth: 468,
			alignSelf: 'center',
		}),
	},
	heroContainer: {
		height: 160,
		alignItems: 'center',
		justifyContent: 'center',
	},
	heroImage: {
		width: 120,
		height: 120,
	},
	titleSection: {
		alignItems: 'center',
		paddingHorizontal: 24,
		marginTop: 20,
		marginBottom: 16,
		gap: 6,
	},
	title: {
		textAlign: 'center',
		color: semanticColors.text.primary,
	},
	subtitle: {
		textAlign: 'center',
	},
	featureList: {
		gap: 12,
		paddingHorizontal: 24,
		marginBottom: 24,
	},
	featureRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: semanticColors.brand.primaryLight,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
	},
	iconBadge: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: semanticColors.surface.tertiary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	ctaSection: {
		paddingHorizontal: 24,
	},
	dismissHint: {
		paddingVertical: 12,
		alignItems: 'center',
	},
});
