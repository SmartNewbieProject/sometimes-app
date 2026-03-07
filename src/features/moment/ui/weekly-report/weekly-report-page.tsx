import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	Dimensions,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Header, Text } from '@/src/shared/ui';
import {
	type PersonalityTypeKey,
	getPersonalityTypeLabel,
} from '../../constants/personality-types';
import { useMomentAnalytics } from '../../hooks/use-moment-analytics';
import { useWeeklyReportQuery } from '../../queries';
import { MOMENT_ONBOARDING_KEYS } from '../onboarding/keys';
import {
	AnimatedStatRow,
	DIMENSION_ORDER,
	DimIcon,
	GrowthJourneySection,
	IntegratedInsightsSection,
	RadarChart as NarrativeRadarChart,
	RadarLegend as NarrativeRadarLegend,
	PersonaNarrativeSection,
	StoryCard,
	TitleAwardSection,
	convertToRadarData,
} from '../shared/narrative-report-components';

const { width } = Dimensions.get('window');

// ============================================
// CircularProgress
// ============================================
const CircularProgress = ({ value, size = 68 }: { value: number; size?: number }) => {
	const r = 28;
	const circumference = 2 * Math.PI * r;
	const clamped = Math.max(0, Math.min(100, value));
	const strokeDash = (clamped / 100) * circumference;
	return (
		<Svg width={size} height={size} viewBox="0 0 68 68">
			<Circle cx={34} cy={34} r={r} fill="none" stroke="#E5E5E5" strokeWidth={6} />
			<Circle
				cx={34}
				cy={34}
				r={r}
				fill="none"
				stroke="#7A4AE2"
				strokeWidth={6}
				strokeDasharray={`${strokeDash} ${circumference}`}
				strokeLinecap="round"
				transform="rotate(-90 34 34)"
			/>
			<SvgText x={34} y={38} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#1A1A1A">
				{clamped}
			</SvgText>
		</Svg>
	);
};

// ============================================
// RadarChart
// ============================================
interface RadarItem {
	label: string;
	value: number;
	prevValue: number;
	angle: number;
	category: string;
}

const RadarChart = ({ radarData }: { radarData: RadarItem[] }) => {
	const size = Math.min(width - 40, 240);
	const center = size / 2;
	const maxRadius = size / 2 - 40;
	const gridLevels = [20, 40, 60, 80, 100];

	const getPoint = (value: number, angle: number) => {
		const radius = (value / 100) * maxRadius;
		const radian = (angle * Math.PI) / 180;
		return { x: center + radius * Math.cos(radian), y: center + radius * Math.sin(radian) };
	};

	const dataPoints = radarData.map((d) => ({
		...getPoint(d.value, d.angle),
		category: d.category,
	}));
	const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
	const prevPolygon = radarData
		.map((d) => {
			const p = getPoint(d.prevValue, d.angle);
			return `${p.x},${p.y}`;
		})
		.join(' ');

	return (
		<View style={styles.chartContainer}>
			<Svg width={size} height={size}>
				{gridLevels.map((level) => {
					const pts = radarData
						.map((d) => {
							const p = getPoint(level, d.angle);
							return `${p.x},${p.y}`;
						})
						.join(' ');
					return (
						<Polygon
							key={`grid-${level}`}
							points={pts}
							fill="none"
							stroke="#E5E5E5"
							strokeWidth={1}
						/>
					);
				})}
				{radarData.map((d) => {
					const pt = getPoint(100, d.angle);
					return (
						<Line
							key={`axis-${d.category}`}
							x1={center}
							y1={center}
							x2={pt.x}
							y2={pt.y}
							stroke="#E5E5E5"
							strokeWidth={1}
						/>
					);
				})}
				<Polygon
					points={prevPolygon}
					fill="none"
					stroke="#A0A0A0"
					strokeWidth={2}
					strokeDasharray="4,4"
				/>
				<Polygon
					points={dataPolygon}
					fill={`${semanticColors.brand.primary}4D`}
					stroke={semanticColors.brand.primary}
					strokeWidth={2}
				/>
				{dataPoints.map((pt) => (
					<Circle
						key={`dot-${pt.category}`}
						cx={pt.x}
						cy={pt.y}
						r={4}
						fill={colors.primaryPurple}
						stroke="white"
						strokeWidth={2}
					/>
				))}
				{radarData.map((d) => {
					const lp = getPoint(112, d.angle);
					return (
						<SvgText
							key={d.category}
							x={lp.x}
							y={lp.y}
							fontSize={11}
							fill="#666666"
							textAnchor="middle"
							alignmentBaseline="middle"
						>
							{d.label}
						</SvgText>
					);
				})}
			</Svg>
		</View>
	);
};

// ============================================
// RadarLegend
// ============================================
const RadarLegend = ({
	stats,
	dimensionLabels,
}: {
	stats: Array<{ category: string; currentScore: number; prevScore?: number }>;
	dimensionLabels: Record<string, string>;
}) => (
	<View style={styles.radarLegend}>
		{DIMENSION_ORDER.map((dim) => {
			const stat = stats.find((s) => s.category === dim);
			const score = stat?.currentScore ?? 0;
			return (
				<View key={dim} style={styles.legendRow}>
					<View style={styles.legendLabelContainer}>
						<DimIcon dim={dim} size={15} />
						<Text size="13" weight="medium" textColor="black">
							{dimensionLabels[dim]}
						</Text>
					</View>
					<Text size="13" weight="bold" style={styles.legendScore}>
						{score}
					</Text>
					<View style={styles.legendBarBg}>
						<View style={[styles.legendBarFill, { width: `${score}%` as `${number}%` }]} />
					</View>
				</View>
			);
		})}
	</View>
);

// ============================================
// InsightCard (항상 펼쳐진 카드)
// ============================================
interface InsightCardProps {
	title: string;
	icon: string;
	score: number;
	definition: string;
	feedback: string;
}

const InsightCard = ({ title, icon, score, definition, feedback }: InsightCardProps) => {
	const scoreColor = score >= 70 ? '#00C853' : score >= 50 ? '#FF9800' : '#FF5252';

	return (
		<View style={styles.insightCard}>
			<View style={styles.cardHeader}>
				<DimIcon dim={icon} size={18} />
				<Text size="15" weight="semibold" textColor="black" style={{ flex: 1 }}>
					{title}
				</Text>
				<Text size="13" weight="bold" style={{ color: scoreColor }}>
					{score}
				</Text>
			</View>
			<View style={styles.insightBody}>
				{definition ? (
					<Text size="13" weight="normal" style={styles.insightText}>
						{definition}
					</Text>
				) : null}
				{feedback ? (
					<View style={styles.quoteBlock}>
						<Text size="13" weight="normal" style={styles.insightText}>
							{feedback}
						</Text>
					</View>
				) : null}
			</View>
		</View>
	);
};

// ============================================
// WeeklyReportPage
// ============================================
export const WeeklyReportPage = () => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const localParams = useLocalSearchParams<{ week?: string; year?: string }>();
	const { trackWeeklyReportView, trackReportChartView, trackReportKeywordView } =
		useMomentAnalytics();

	const paramWeek = localParams.week ? Number.parseInt(localParams.week, 10) : null;
	const paramYear = localParams.year ? Number.parseInt(localParams.year, 10) : null;

	const getCurrentWeekInfo = () => {
		const now = new Date();
		const startOfYear = new Date(now.getFullYear(), 0, 1);
		const weekNumber = Math.ceil(
			((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
		);
		return { weekNumber, year: now.getFullYear() };
	};

	const { weekNumber, year } = getCurrentWeekInfo();
	const reportParams = { week: paramWeek || weekNumber, year: paramYear || year };

	const { data: reportDataRaw, isLoading, error } = useWeeklyReportQuery(reportParams);
	// 이전 주 params (week=1이면 전년도 52주)
	const prevWeekNum = (paramWeek || weekNumber) === 1 ? 52 : (paramWeek || weekNumber) - 1;
	const prevYearNum = (paramWeek || weekNumber) === 1 ? (paramYear || year) - 1 : paramYear || year;
	const { data: prevReportDataRaw } = useWeeklyReportQuery({
		week: prevWeekNum,
		year: prevYearNum,
	});
	// biome-ignore lint/suspicious/noExplicitAny: flexible API response shape
	const reportData = reportDataRaw as any;

	// biome-ignore lint/correctness/useExhaustiveDependencies: analytics fire-once on load
	useEffect(() => {
		if (reportData && !isLoading) {
			const r =
				reportData?.reports?.[0] ||
				reportData?.data?.reports?.[0] ||
				reportData?.data ||
				reportData;
			if (r) {
				trackWeeklyReportView({
					week: r.weekNumber || reportParams.week,
					year: r.year || reportParams.year,
					is_current_week: !paramWeek || (r.weekNumber === weekNumber && r.year === year),
					average_score:
						// biome-ignore lint/suspicious/noExplicitAny: dynamic API shape
						r.stats?.reduce((s: number, x: any) => s + x.currentScore, 0) / (r.stats?.length || 1),
					// biome-ignore lint/suspicious/noExplicitAny: dynamic API shape
					has_previous_week: r.stats?.some((s: any) => s.prevScore !== undefined),
					report_title: r.title,
				});
				trackReportChartView({
					week: r.weekNumber || reportParams.week,
					year: r.year || reportParams.year,
					chart_type: 'radar',
				});
				if (r.keywords?.length > 0) {
					trackReportKeywordView({ keywords: r.keywords, keyword_count: r.keywords.length });
				}
			}
		}
	}, [reportData, isLoading]);

	const handleBack = () => router.push('/moment/my-moment');

	// ── 로딩
	if (isLoading) {
		return (
			<View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.white }]}>
				<View style={styles.centerBox}>
					<ActivityIndicator size="large" color={colors.primaryPurple} />
					<Text size="16" weight="medium" textColor="purple" style={{ marginTop: 16 }}>
						{t('features.moment.ui.weekly_report.loading')}
					</Text>
				</View>
			</View>
		);
	}

	// ── 에러
	if (error) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<LinearGradient
					colors={['#FFFFFF', '#F5F1FF', '#DECEFF', '#B095E0']}
					locations={[0, 0.5, 0.78, 1]}
					style={StyleSheet.absoluteFillObject}
				/>
				<View style={styles.centerBox}>
					<Text size="18" weight="bold" textColor="black" style={{ marginBottom: 12 }}>
						{t('features.moment.ui.weekly_report.error_title')}
					</Text>
					<Text size="14" weight="normal" style={{ textAlign: 'center', marginBottom: 24 }}>
						{t('features.moment.ui.weekly_report.error_description')}
					</Text>
					<TouchableOpacity onPress={() => router.push('/moment')} activeOpacity={0.85}>
						<LinearGradient
							colors={['#7A4AE2', '#5B35C0']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.ctaBtn}
						>
							<Text size="16" weight="bold" style={{ color: colors.white }}>
								{t('features.moment.ui.weekly_report.go_back')}
							</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	const report =
		reportData?.reports?.[0] || reportData?.data?.reports?.[0] || reportData?.data || reportData;

	const isNarrativeReport =
		report?.reportType === 'onboarding' || report?.reportType === 'narrative';

	// ── 데이터 없음
	if (
		!report ||
		(!report.title &&
			!report.stats?.length &&
			!report.insights?.length &&
			!report.narrativeSections?.length)
	) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<LinearGradient
					colors={['#FFFFFF', '#F5F1FF', '#DECEFF', '#B095E0']}
					locations={[0, 0.5, 0.78, 1]}
					style={StyleSheet.absoluteFillObject}
				/>
				<View style={styles.centerBox}>
					<Text size="18" weight="bold" textColor="black" style={{ marginBottom: 12 }}>
						모먼트 보고서가 없어요
					</Text>
					<Text size="14" weight="normal" style={{ textAlign: 'center', marginBottom: 24 }}>
						{paramYear && paramWeek
							? t('features.moment.ui.weekly_report.report_not_found', {
									year: paramYear,
									week: paramWeek,
								})
							: t('features.moment.ui.weekly_report.no_report_this_week')}
					</Text>
					<TouchableOpacity
						onPress={() => router.push('/moment/question-detail')}
						activeOpacity={0.85}
					>
						<LinearGradient
							colors={['#7A4AE2', '#5B35C0']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.ctaBtn}
						>
							<Text size="16" weight="bold" style={{ color: colors.white }}>
								{t('features.moment.ui.weekly_report.go_to_question')}
							</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	// ── 레이더 데이터 생성
	const radarData: RadarItem[] = report.stats?.length
		? report.stats.map(
				(s: { category: string; currentScore: number; prevScore?: number }, i: number) => ({
					label: getPersonalityTypeLabel(s.category as PersonalityTypeKey) || s.category,
					value: s.currentScore,
					prevValue: s.prevScore ?? 45,
					angle: -90 + i * 72,
					category: s.category,
				}),
			)
		: [];

	const keywords: string[] = report.keywords ?? [];
	const stats: Array<{ category: string; currentScore: number; prevScore?: number }> =
		report.stats ?? [];
	const insights: Array<{ category: string; score: number; definition: string; feedback: string }> =
		report.insights ?? [];
	const displayWeek = report.weekNumber || paramWeek || weekNumber;
	const displayYear = report.year || paramYear || year;

	const dimensionLabels: Record<string, string> = {
		extraversion: t(MOMENT_ONBOARDING_KEYS.result.radarExtraversion),
		openness: t(MOMENT_ONBOARDING_KEYS.result.radarOpenness),
		conscientiousness: t(MOMENT_ONBOARDING_KEYS.result.radarConscientiousness),
		agreeableness: t(MOMENT_ONBOARDING_KEYS.result.radarAgreeableness),
		neuroticism: t(MOMENT_ONBOARDING_KEYS.result.radarNeuroticism),
	};

	// ── 이전 주 dimensionScores (Narrative 레이더 B 오버레이용)
	// biome-ignore lint/suspicious/noExplicitAny: flexible API response shape
	const prevReportData = prevReportDataRaw as any;
	const prevReport =
		prevReportData?.reports?.[0] ??
		prevReportData?.data?.reports?.[0] ??
		prevReportData?.data ??
		prevReportData;
	const prevDimensionScores: Record<string, number> | null =
		isNarrativeReport && prevReport?.dimensionScores ? prevReport.dimensionScores : null;

	// ── Narrative 데이터 추출 (onboarding / narrative 타입)
	const narrativeDimensionScores: Record<string, number> = report.dimensionScores ?? {};
	const narrativeRadarData =
		isNarrativeReport && Object.keys(narrativeDimensionScores).length > 0
			? convertToRadarData(narrativeDimensionScores)
			: [];
	const narrativeTitleInfo = report.titleInfo ?? report.userTitles?.[0] ?? null;
	const sf = isNarrativeReport ? report.storyFlow : null;
	const narrativeKeyPatterns: string[] = sf?.integratedInsights?.keyPatterns ?? [];
	const narrativeIntegratedContent: string = sf?.integratedInsights?.content ?? '';
	const rawNarrativeSections = (report.narrativeSections ?? []) as Array<{
		sectionTitle?: string;
		userQuote?: { original: string; highlight: string };
	}>;
	const narrativeStorySections = (sf?.storySections ?? []).map(
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
	const narrativeNextSteps: string[] = sf?.growthJourney?.nextSteps ?? [];
	const narrativeGrowthSuggestion: string = sf?.growthJourney?.suggestion ?? '';
	const narrativePersonaDescription: string = sf?.personaNarrative?.description ?? '';
	const narrativeCharacteristics: string[] = sf?.personaNarrative?.characteristics ?? [];

	return (
		<View style={styles.container}>
			{/* Narrative 모드 배경 그라디언트 */}
			{isNarrativeReport ? (
				<LinearGradient
					colors={['#FFFFFF', '#FAFAFE', '#F2EEFF', '#E4DAFF']}
					locations={[0, 0.45, 0.82, 1]}
					style={StyleSheet.absoluteFillObject}
				/>
			) : null}

			{/* 수평 압축 헤더 */}
			<Header.Container style={styles.compactHeader}>
				<Header.LeftContent>
					<Header.LeftButton visible={true} onPress={handleBack} />
				</Header.LeftContent>

				<Header.CenterContent>
					<View style={styles.headerCenter}>
						<View style={styles.headerTextGroup}>
							<Text size="14" weight="bold" textColor="black" numberOfLines={1}>
								{report.title || t('features.moment.ui.weekly_report.default_title')}
							</Text>
							<Text
								size="11"
								weight="semibold"
								numberOfLines={1}
								style={{ color: colors.primaryPurple }}
							>
								{displayYear}년 {displayWeek}주차
							</Text>
						</View>
					</View>
				</Header.CenterContent>

				<Header.RightContent>
					<View style={styles.headerDateBadge}>
						<Text size="11" weight="bold" style={{ color: colors.primaryPurple }}>
							{displayWeek}주차
						</Text>
					</View>
				</Header.RightContent>
			</Header.Container>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
				{isNarrativeReport ? (
					<>
						{/* Narrative: 칭호 히어로 카드 */}
						{narrativeTitleInfo ? (
							<TitleAwardSection
								weekLabel={`${displayWeek}주차`}
								title={narrativeTitleInfo.title}
								subTitle={narrativeTitleInfo.subTitle}
							/>
						) : null}

						{/* Narrative: 5개 성향 스탯 */}
						{Object.keys(narrativeDimensionScores).length > 0 ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t(MOMENT_ONBOARDING_KEYS.result.statsTitle)}
								</Text>
								<View style={styles.statsGrid}>
									{DIMENSION_ORDER.map((dim, i) => (
										<AnimatedStatRow
											key={dim}
											category={dim}
											score={narrativeDimensionScores[dim] ?? 0}
											change={null}
											label={dimensionLabels[dim]}
											index={i}
										/>
									))}
								</View>
							</View>
						) : null}

						{/* Narrative: 방사형 그래프 */}
						{narrativeRadarData.length > 0 ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t(MOMENT_ONBOARDING_KEYS.result.radarChartTitle)}
								</Text>
								<View style={styles.chartWrapper}>
									<View style={{ alignItems: 'center' }}>
										<NarrativeRadarChart
											radarData={narrativeRadarData}
											prevDimensionScores={prevDimensionScores}
										/>
									</View>
									<NarrativeRadarLegend
										dimensionScores={narrativeDimensionScores}
										dimensionLabels={dimensionLabels}
									/>
								</View>
							</View>
						) : null}

						{/* Narrative: 키 패턴 + 인사이트 */}
						{narrativeKeyPatterns.length > 0 || narrativeIntegratedContent ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t(MOMENT_ONBOARDING_KEYS.result.patternsTitle)}
								</Text>
								<IntegratedInsightsSection
									keyPatterns={narrativeKeyPatterns}
									content={narrativeIntegratedContent}
								/>
							</View>
						) : null}

						{/* Narrative: 나의 이야기 */}
						{narrativeStorySections.length > 0 ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t(MOMENT_ONBOARDING_KEYS.result.storyTitle)}
								</Text>
									{narrativeStorySections.map((section: any, index: number) => (
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

						{/* Narrative: 성장 제안 */}
						{narrativeNextSteps.length > 0 || narrativeGrowthSuggestion ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t(MOMENT_ONBOARDING_KEYS.result.growthTitle)}
								</Text>
								<GrowthJourneySection
									nextSteps={narrativeNextSteps}
									suggestion={narrativeGrowthSuggestion}
								/>
							</View>
						) : null}

						{/* Narrative: 페르소나 요약 */}
						{narrativePersonaDescription || narrativeCharacteristics.length > 0 ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t(MOMENT_ONBOARDING_KEYS.result.personaTitle)}
								</Text>
								<PersonaNarrativeSection
									description={narrativePersonaDescription}
									characteristics={narrativeCharacteristics}
								/>
							</View>
						) : null}
					</>
				) : (
					<>
						{/* Legacy: 칭호 히어로 카드 */}
						<LinearGradient
							colors={['#7A4AE2', '#5B35C0']}
							start={{ x: 0, y: 1 }}
							end={{ x: 1, y: 0 }}
							style={styles.titleHeroCard}
						>
							<Text style={styles.heroWeekLabel}>{displayWeek}주차 이번 주</Text>
							<Text size="24" weight="bold" style={styles.heroTitle}>
								{report.title || t('features.moment.ui.weekly_report.default_title')}
							</Text>
							{report.subTitle ? (
								<Text size="13" weight="normal" style={styles.heroSubTitle}>
									{report.subTitle}
								</Text>
							) : null}
						</LinearGradient>

						{/* Legacy: 5개 성향 스탯 세로 목록 */}
						{stats.length > 0 ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t('features.moment.onboarding.result.stats_title')}
								</Text>
								<View style={styles.statsGrid}>
									{stats.map((s, i) => {
										const score = s.currentScore;
										const change = s.prevScore !== undefined ? score - s.prevScore : null;
										return (
											<AnimatedStatRow
												key={s.category}
												category={s.category}
												score={score}
												change={change}
												label={
													getPersonalityTypeLabel(s.category as PersonalityTypeKey) || s.category
												}
												index={i}
											/>
										);
									})}
								</View>
							</View>
						) : null}

						{/* Legacy: 방사형 그래프 */}
						{radarData.length > 0 ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t('features.moment.onboarding.result.radar_chart_title')}
								</Text>
								<View style={styles.chartWrapper}>
									<View style={{ alignItems: 'center' }}>
										<RadarChart radarData={radarData} />
										<View style={styles.legend}>
											<View style={styles.legendItem}>
												<View
													style={[
														styles.legendBox,
														{ backgroundColor: semanticColors.brand.primary },
													]}
												/>
												<Text size="10" weight="normal">
													{t('features.moment.ui.weekly_report.this_week')}
												</Text>
											</View>
											<View style={styles.legendItem}>
												<View
													style={[
														styles.legendBox,
														{ borderWidth: 2, borderColor: '#A0A0A0', borderStyle: 'dashed' },
													]}
												/>
												<Text size="10" weight="normal">
													{t('features.moment.ui.weekly_report.last_week')}
												</Text>
											</View>
										</View>
									</View>
									<RadarLegend stats={stats} dimensionLabels={dimensionLabels} />
								</View>
							</View>
						) : null}

						{/* Legacy: 키워드 패턴 */}
						{keywords.length > 0 || report.description ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t('features.moment.onboarding.result.patterns_title')}
								</Text>
								{keywords.length > 0 ? (
									<View style={styles.patternTagsRow}>
										{keywords.slice(0, 8).map((kw) => (
											<View key={kw} style={styles.patternTag}>
												<Text size="12" weight="medium" style={{ color: colors.primaryPurple }}>
													{kw}
												</Text>
											</View>
										))}
									</View>
								) : null}
								{report.description ? (
									<View style={styles.quoteBlock}>
										<Text size="14" weight="normal" style={{ lineHeight: 22 }}>
											{report.description}
										</Text>
									</View>
								) : null}
							</View>
						) : null}

						{/* Legacy: 인사이트 카드 */}
						{insights.length > 0 ? (
							<View style={styles.section}>
								<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
									{t('features.moment.ui.weekly_report.analysis_title')}
								</Text>
								{insights.map((ins) => (
									<InsightCard
										key={ins.category}
										title={
											getPersonalityTypeLabel(ins.category as PersonalityTypeKey) || ins.category
										}
										icon={ins.category}
										score={ins.score}
										definition={ins.definition}
										feedback={ins.feedback}
									/>
								))}
							</View>
						) : null}
					</>
				)}

				<View style={{ height: 100 }} />
			</ScrollView>

			{/* 하단 고정 CTA */}
			<View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}>
				<TouchableOpacity onPress={handleBack} activeOpacity={0.85}>
					<LinearGradient
						colors={['#7A4AE2', '#5B35C0']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.ctaBtn}
					>
						<Text size="16" weight="bold" style={{ color: colors.white }}>
							{t('features.moment.ui.weekly_report.back_button')}
						</Text>
					</LinearGradient>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F2F4F6',
	},
	centerBox: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	// 수평 압축 헤더
	compactHeader: {
		backgroundColor: colors.white,
		borderBottomWidth: 1,
		borderBottomColor: '#EDE9F8',
	},
	headerCenter: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	headerTextGroup: {
		flex: 1,
		gap: 1,
	},
	headerDateBadge: {
		backgroundColor: '#F8F5FF',
		borderRadius: 8,
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderWidth: 1.5,
		borderColor: '#D4C2F5',
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 32,
		paddingBottom: 40,
	},
	// 히어로 카드
	titleHeroCard: {
		borderRadius: 20,
		padding: 20,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: 'rgba(196,168,245,0.3)',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 16 },
		shadowOpacity: 0.5,
		shadowRadius: 48,
		elevation: 16,
	},
	heroWeekLabel: {
		fontSize: 10,
		fontWeight: '600',
		color: 'rgba(255,255,255,0.6)',
		letterSpacing: 0.8,
		textTransform: 'uppercase',
		marginBottom: 6,
	},
	heroTitle: {
		color: '#FFFFFF',
		lineHeight: 32,
		marginBottom: 4,
	},
	heroSubTitle: {
		color: 'rgba(255,255,255,0.75)',
		lineHeight: 19,
	},
	// 섹션
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	// 스탯 세로 목록
	statsGrid: {
		backgroundColor: colors.white,
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingTop: 4,
		paddingBottom: 4,
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
	chartContainer: {
		alignItems: 'center',
	},
	legend: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
		marginTop: 12,
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	legendBox: {
		width: 16,
		height: 16,
		borderRadius: 2,
	},
	// 레이더 레전드
	radarLegend: {
		marginTop: 16,
		gap: 10,
	},
	legendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	legendLabelContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	legendScore: {
		color: colors.primaryPurple,
		width: 32,
		textAlign: 'right',
	},
	legendBarBg: {
		width: 80,
		height: 6,
		backgroundColor: '#EDE9F8',
		borderRadius: 3,
		overflow: 'hidden',
	},
	legendBarFill: {
		height: 6,
		backgroundColor: colors.primaryPurple,
		borderRadius: 3,
	},
	// 패턴
	patternTagsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 12,
	},
	patternTag: {
		backgroundColor: '#F8F5FF',
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 20,
	},
	quoteBlock: {
		backgroundColor: colors.white,
		borderRadius: 12,
		padding: 14,
		borderLeftWidth: 3,
		borderLeftColor: '#7A4AE2',
	},
	// 인사이트 카드
	insightCard: {
		backgroundColor: colors.white,
		borderRadius: 16,
		padding: 16,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 1,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	insightBody: {
		marginTop: 12,
		gap: 6,
	},
	insightText: {
		lineHeight: 20,
		marginBottom: 10,
		color: '#374151',
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
	ctaBtn: {
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
		width: '100%',
		shadowColor: '#7A4AE2',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 6,
	},
});
