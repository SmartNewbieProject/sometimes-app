import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/src/shared/constants/colors';
import { Button, Text } from '@/src/shared/ui';
import { useMomentOnboarding } from '../../hooks/use-moment-onboarding';
import type { OnboardingReport } from '../../types';
import {
	AnimatedStatRow,
	DIMENSION_ORDER,
	GrowthJourneySection,
	IntegratedInsightsSection,
	PersonaNarrativeSection,
	RadarChart,
	RadarLegend,
	StoryCard,
	TitleAwardSection,
	convertToRadarData,
} from '../shared/narrative-report-components';
import { MOMENT_ONBOARDING_KEYS } from './keys';

// ============================================
// Main Component
// ============================================
export const OnboardingResult = () => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ reportData?: string }>();
	const { reset } = useMomentOnboarding();

	const report: OnboardingReport | null = useMemo(() => {
		if (params.reportData) {
			try {
				return JSON.parse(params.reportData);
			} catch {
				return null;
			}
		}
		return null;
	}, [params.reportData]);

	const radarData = useMemo(
		() => (report ? convertToRadarData(report.dimensionScores) : []),
		[report],
	);

	const dimensionLabels: Record<string, string> = {
		extraversion: t(MOMENT_ONBOARDING_KEYS.result.radarExtraversion),
		openness: t(MOMENT_ONBOARDING_KEYS.result.radarOpenness),
		conscientiousness: t(MOMENT_ONBOARDING_KEYS.result.radarConscientiousness),
		agreeableness: t(MOMENT_ONBOARDING_KEYS.result.radarAgreeableness),
		neuroticism: t(MOMENT_ONBOARDING_KEYS.result.radarNeuroticism),
	};

	const handleStartMoment = () => {
		reset();
		router.replace('/moment');
	};

	if (!report) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.errorContainer}>
					<Text size="16" weight="medium" textColor="gray">
						{t(MOMENT_ONBOARDING_KEYS.result.completeTitle)}
					</Text>
					<Button variant="primary" size="lg" onPress={handleStartMoment}>
						{t(MOMENT_ONBOARDING_KEYS.result.startMomentButton)}
					</Button>
				</View>
			</View>
		);
	}

	const sf = report.storyFlow;
	const keyPatterns: string[] = sf?.integratedInsights?.keyPatterns ?? [];
	const integratedContent: string = sf?.integratedInsights?.content ?? '';
	const rawNarrativeSections = report.narrativeSections ?? [];
	const storySections = (sf?.storySections ?? []).map(
		(
			s: {
				sectionTitle?: string;
				userStory?: string;
				emotionalJourney?: string | string[];
				whatThisTellsUs?: string;
			},
			i: number,
		) => ({
			...s,
			title: rawNarrativeSections[i]?.sectionTitle ?? s.sectionTitle,
			userQuote: rawNarrativeSections[i]?.userQuote ?? null,
			emotionalJourney:
				typeof s.emotionalJourney === 'string' ? [s.emotionalJourney] : s.emotionalJourney,
		}),
	);
	const nextSteps: string[] = sf?.growthJourney?.nextSteps ?? [];
	const growthSuggestion: string = sf?.growthJourney?.suggestion ?? '';
	const personaDescription: string = sf?.personaNarrative?.description ?? '';
	const characteristics: string[] = sf?.personaNarrative?.characteristics ?? [];

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FFFFFF', '#FAFAFE', '#F2EEFF', '#E4DAFF']}
				locations={[0, 0.45, 0.82, 1]}
				style={styles.gradient}
			/>

			<ScrollView
				style={[styles.scrollView, { paddingTop: insets.top + 16 }]}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* 1. 칭호 히어로 카드 */}
				<TitleAwardSection title={report.titleInfo.title} subTitle={report.titleInfo.subTitle} />

				{/* 2. 5개 성향 스탯 */}
				{report.dimensionScores && Object.keys(report.dimensionScores).length > 0 ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.statsTitle)}
						</Text>
						<View style={styles.statsGrid}>
							{DIMENSION_ORDER.map((dim, i) => (
								<AnimatedStatRow
									key={dim}
									category={dim}
									score={report.dimensionScores[dim] ?? 0}
									change={null}
									label={dimensionLabels[dim]}
									index={i}
								/>
							))}
						</View>
					</View>
				) : null}

				{/* 3. 방사형 그래프 */}
				{radarData.length > 0 ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.radarChartTitle)}
						</Text>
						<View style={styles.chartWrapper}>
							<View style={{ alignItems: 'center' }}>
								<RadarChart radarData={radarData} />
							</View>
							<RadarLegend
								dimensionScores={report.dimensionScores}
								dimensionLabels={dimensionLabels}
							/>
						</View>
					</View>
				) : null}

				{/* 4. 키 패턴 + 인사이트 */}
				{keyPatterns.length > 0 || integratedContent ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.patternsTitle)}
						</Text>
						<IntegratedInsightsSection keyPatterns={keyPatterns} content={integratedContent} />
					</View>
				) : null}

				{/* 5. 나의 이야기 */}
				{storySections.length > 0 ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.storyTitle)}
						</Text>
						{storySections.map((section, index) => (
							<StoryCard
								key={section.title ?? index}
								title={section.title ?? `Section ${index + 1}`}
								userQuote={section.userQuote}
								userStory={section.userStory}
								emotionalJourney={section.emotionalJourney}
								whatThisTellsUs={section.whatThisTellsUs}
							/>
						))}
					</View>
				) : null}

				{/* 6. 성장 제안 */}
				{nextSteps.length > 0 || growthSuggestion ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.growthTitle)}
						</Text>
						<GrowthJourneySection nextSteps={nextSteps} suggestion={growthSuggestion} />
					</View>
				) : null}

				{/* 7. 페르소나 요약 */}
				{personaDescription || characteristics.length > 0 ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.personaTitle)}
						</Text>
						<PersonaNarrativeSection
							description={personaDescription}
							characteristics={characteristics}
						/>
					</View>
				) : null}

				<View style={{ height: 112 }} />
			</ScrollView>

			{/* 8. 하단 고정 CTA */}
			<View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}>
				<Button variant="primary" size="lg" onPress={handleStartMoment} style={styles.startButton}>
					{t(MOMENT_ONBOARDING_KEYS.result.startMomentButton)}
				</Button>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	gradient: {
		...StyleSheet.absoluteFillObject,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 24,
	},
	// 스탯 목록
	statsGrid: {
		backgroundColor: colors.white,
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingTop: 4,
		paddingBottom: 4,
	},
	// 공통 섹션
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	// 레이더 차트
	chartWrapper: {
		backgroundColor: colors.white,
		borderRadius: 20,
		padding: 16,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 6,
		elevation: 2,
	},
	// 하단 버튼
	buttonContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 20,
		paddingTop: 16,
		backgroundColor: 'transparent',
	},
	startButton: {
		width: '100%',
	},
});
