import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useTestAnalytics } from '@/src/features/ideal-type-test/hooks/use-test-analytics';
import { useTestProgress } from '@/src/features/ideal-type-test/hooks/use-test-progress';
import { useTestSession } from '@/src/features/ideal-type-test/hooks/use-test-session';
import { useMyResult, useRetakeTest, useStartTest } from '@/src/features/ideal-type-test/queries';
import type { LanguageCode, StartTestResponse } from '@/src/features/ideal-type-test/types';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useToast } from '@/src/shared/hooks/use-toast';
import { Button } from '@/src/shared/ui/button';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const giftHeartIcon = require('@assets/images/ideal-type-test/gift-heart.png');
const checkmarkIcon = require('@assets/images/ideal-type-test/checkmark.png');
const sparklesIcon = require('@assets/images/ideal-type-test/sparkles.png');
const lightningIcon = require('@assets/images/ideal-type-test/lightning.png');
const targetIcon = require('@assets/images/ideal-type-test/target.png');

export interface TestStartScreenProps {
	source: 'auth' | 'moment';
	onNavigateToQuestions: () => void;
	onNavigateToResult: () => void;
	onGoBack: () => void;
	retakeRestriction?: { canRetake: boolean; daysUntilRetake: number };
}

export function TestStartScreen({
	source,
	onNavigateToQuestions,
	onNavigateToResult,
	onGoBack,
	retakeRestriction,
}: TestStartScreenProps) {
	const { t, i18n } = useTranslation();
	const insets = useSafeAreaInsets();
	const { isAuthorized } = useAuth();
	const { trackEntryClicked, trackTestStarted } = useTestAnalytics();
	const { mutate: startTest, isPending } = useStartTest();
	const { mutate: retakeTest, isPending: isRetakePending } = useRetakeTest();
	const { setSession, setResult } = useTestProgress();
	const { saveSession, getSession, clearSession } = useTestSession();
	const { emitToast } = useToast();
	const hasTrackedEntry = useRef(false);
	const [isCheckingSession, setIsCheckingSession] = useState(true);
	const [serverCooldown, setServerCooldown] = useState<{ remainingDays: number } | null>(null);

	const currentLang = (i18n.language?.startsWith('ja') ? 'ja' : 'ko') as LanguageCode;

	const { data: myResult, isLoading: isLoadingMyResult } = useMyResult({
		lang: currentLang,
		enabled: isAuthorized,
	});
	const hasExistingResult = isAuthorized && !!myResult?.result;

	useEffect(() => {
		const checkExistingSession = async () => {
			try {
				const session = await getSession();
				if (session?.questions?.length && session.currentStep < session.questions.length) {
					setSession(session.sessionId, session.questions, session.expiresAt);
					onNavigateToQuestions();
					return;
				}
				if (session) {
					await clearSession();
				}
			} catch (error) {
				console.error('Failed to check existing session:', error);
			} finally {
				setIsCheckingSession(false);
			}
		};

		checkExistingSession();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!hasTrackedEntry.current && !isCheckingSession && !isLoadingMyResult) {
			trackEntryClicked({
				source: 'mobile',
				screen: source === 'auth' ? 'login' : 'moment',
				user_type: isAuthorized ? 'logged_in' : 'guest',
			});
			hasTrackedEntry.current = true;
		}
	}, [trackEntryClicked, isCheckingSession, isLoadingMyResult, isAuthorized, source]);

	const onTestStartSuccess = async (data: StartTestResponse) => {
		await saveSession({
			sessionId: data.sessionId,
			expiresAt: data.expiresAt,
			currentStep: 0,
			answers: [],
			questions: data.questions,
		});

		setSession(data.sessionId, data.questions, data.expiresAt);

		trackTestStarted({
			source: 'mobile',
			session_id: data.sessionId,
			total_questions: data.totalQuestions,
			user_type: isAuthorized ? 'logged_in' : 'guest',
		});

		onNavigateToQuestions();
	};

	const onTestStartError = (error: unknown) => {
		console.error('Failed to start test:', error);
		emitToast(t('features.ideal-type-test.errors.start_failed'));
	};

	const handleStartTest = async () => {
		await clearSession();

		startTest(
			{ request: { source: 'mobile' }, lang: currentLang },
			{ onSuccess: onTestStartSuccess, onError: onTestStartError },
		);
	};

	const handleRetakeTest = async () => {
		await clearSession();

		retakeTest(
			{ lang: currentLang },
			{
				onSuccess: onTestStartSuccess,
				onError: (error: unknown) => {
					const err = error as { code?: string; detail?: { remainingDays?: number } };
					if (err.code === 'IDEAL_TYPE.BAD_REQUEST_RETAKE_COOLDOWN' && err.detail?.remainingDays) {
						setServerCooldown({ remainingDays: err.detail.remainingDays });
						emitToast(
							t('features.ideal-type-test.start.retake_cooldown', {
								days: err.detail.remainingDays,
							}),
						);
						return;
					}
					onTestStartError(error);
				},
			},
		);
	};

	const handleViewResult = () => {
		if (!myResult?.result) return;
		setResult(myResult.result);
		onNavigateToResult();
	};

	if (isCheckingSession || (isAuthorized && isLoadingMyResult)) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={semanticColors.brand.primary} />
			</View>
		);
	}

	// Retake cooldown for moment source
	const showRetakeCooldown =
		source === 'moment' &&
		hasExistingResult &&
		((retakeRestriction && !retakeRestriction.canRetake) || serverCooldown !== null);
	const cooldownDays = serverCooldown?.remainingDays ?? retakeRestriction?.daysUntilRetake ?? 0;

	if (hasExistingResult) {
		return (
			<View style={styles.container}>
				<View style={styles.contentContainer}>
					<Image source={checkmarkIcon} style={styles.heroIcon} resizeMode="contain" />
					<Text style={styles.title}>
						{t('features.ideal-type-test.start.already_completed_title')}
					</Text>
					<Text style={styles.subtitle}>
						{t('features.ideal-type-test.start.already_completed_subtitle')}
					</Text>
				</View>

				<View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
					<Button
						variant="outline"
						size="lg"
						width="full"
						onPress={handleViewResult}
						style={{ marginBottom: 12 }}
					>
						{t('features.ideal-type-test.start.view_result_button')}
					</Button>
					{showRetakeCooldown ? (
						<Text style={styles.cooldownText}>
							{t('features.ideal-type-test.start.retake_cooldown', {
								days: cooldownDays,
							})}
						</Text>
					) : (
						<Button
							variant="primary"
							size="lg"
							width="full"
							onPress={handleRetakeTest}
							disabled={isRetakePending}
						>
							{isRetakePending
								? t('features.ideal-type-test.start.loading')
								: t('features.ideal-type-test.start.retake_test_button')}
						</Button>
					)}
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.contentContainer}>
				<Image source={giftHeartIcon} style={styles.heroIcon} resizeMode="contain" />
				<Text style={styles.title}>{t('features.ideal-type-test.start.title')}</Text>
				<Text style={styles.subtitle}>{t('features.ideal-type-test.start.subtitle')}</Text>

				<View style={styles.featuresContainer}>
					<View style={styles.featureItem}>
						<Image source={sparklesIcon} style={styles.bulletIcon} resizeMode="contain" />
						<Text style={styles.featureText}>{t('features.ideal-type-test.start.feature_1')}</Text>
					</View>
					<View style={styles.featureItem}>
						<Image source={lightningIcon} style={styles.bulletIcon} resizeMode="contain" />
						<Text style={styles.featureText}>{t('features.ideal-type-test.start.feature_2')}</Text>
					</View>
					<View style={styles.featureItem}>
						<Image source={targetIcon} style={styles.bulletIcon} resizeMode="contain" />
						<Text style={styles.featureText}>{t('features.ideal-type-test.start.feature_3')}</Text>
					</View>
				</View>
			</View>

			<View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
				<Button
					variant="primary"
					size="lg"
					width="full"
					onPress={handleStartTest}
					disabled={isPending}
				>
					{isPending
						? t('features.ideal-type-test.start.loading')
						: t('features.ideal-type-test.start.start_button')}
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		flex: 1,
		paddingHorizontal: 24,
	},
	contentContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	heroIcon: {
		width: 80,
		height: 80,
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontFamily: 'Pretendard-Bold',
		color: semanticColors.text.primary,
		textAlign: 'center',
		marginBottom: 12,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: 'Pretendard-Regular',
		color: semanticColors.text.secondary,
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 40,
	},
	featuresContainer: {
		width: '100%',
		gap: 16,
	},
	featureItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	bulletIcon: {
		width: 28,
		height: 28,
	},
	featureText: {
		flex: 1,
		fontSize: 16,
		fontFamily: 'Pretendard-Regular',
		color: semanticColors.text.primary,
		lineHeight: 24,
	},
	buttonContainer: {
		width: '100%',
		paddingTop: 20,
	},
	cooldownText: {
		fontSize: 14,
		fontFamily: 'Pretendard-Medium',
		color: semanticColors.text.secondary,
		textAlign: 'center',
		paddingVertical: 12,
	},
});
