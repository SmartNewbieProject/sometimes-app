import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Dimensions,
	Image,
	LayoutAnimation,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import colors from '@/src/shared/constants/colors';
import { Button, Text } from '@/src/shared/ui';
import { useMomentOnboarding } from '../../hooks/use-moment-onboarding';
import type { OnboardingReport, RadarDataItem } from '../../types';
import { MOMENT_ONBOARDING_KEYS } from './keys';

const { width } = Dimensions.get('window');

// ============================================
// CircularProgress (인라인)
// ============================================
const CircularProgress = ({ value, size = 68 }: { value: number; size?: number }) => {
	const r = 28;
	const circumference = 2 * Math.PI * r;
	const strokeDash = (value / 100) * circumference;
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
				{value}
			</SvgText>
		</Svg>
	);
};

// ============================================
// Radar Chart
// ============================================
const RadarChart = ({ radarData }: { radarData: RadarDataItem[] }) => {
	const { t } = useTranslation();
	const size = width - 80;
	const center = size / 2;
	const maxRadius = size / 2 - 40;

	const dimLabels = [
		t(MOMENT_ONBOARDING_KEYS.result.radarExtraversion),
		t(MOMENT_ONBOARDING_KEYS.result.radarOpenness),
		t(MOMENT_ONBOARDING_KEYS.result.radarConscientiousness),
		t(MOMENT_ONBOARDING_KEYS.result.radarAgreeableness),
		t(MOMENT_ONBOARDING_KEYS.result.radarNeuroticism),
	];

	const dimKeys = ['extraversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'];

	const getPoint = (index: number, value: number) => {
		const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
		const radius = (value / 100) * maxRadius;
		return {
			x: center + radius * Math.cos(angle),
			y: center + radius * Math.sin(angle),
		};
	};

	const dataPoints = radarData.map((item, i) => ({
		...getPoint(i, item.value),
		dim: item.dimension,
	}));
	const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
	const gridLevels = [20, 40, 60, 80, 100];

	return (
		<View style={styles.chartContainer}>
			<Svg width={size} height={size}>
				{gridLevels.map((level) => {
					const gridPoints = Array.from({ length: 5 }, (_, i) => getPoint(i, level));
					return (
						<Polygon
							key={level}
							points={gridPoints.map((p) => `${p.x},${p.y}`).join(' ')}
							fill="none"
							stroke="#E5E5E5"
							strokeWidth={1}
						/>
					);
				})}
				{dimKeys.map((dimKey, i) => {
					const point = getPoint(i, 100);
					return (
						<Line
							key={`axis-${dimKey}`}
							x1={center}
							y1={center}
							x2={point.x}
							y2={point.y}
							stroke="#E5E5E5"
							strokeWidth={1}
						/>
					);
				})}
				<Polygon
					points={polygonPoints}
					fill="rgba(122, 74, 226, 0.2)"
					stroke={colors.primaryPurple}
					strokeWidth={2}
				/>
				{dataPoints.map((point) => (
					<Circle
						key={`dot-${point.dim}`}
						cx={point.x}
						cy={point.y}
						r={4}
						fill={colors.primaryPurple}
					/>
				))}
				{dimLabels.map((label, i) => {
					const labelPoint = getPoint(i, 120);
					return (
						<SvgText
							key={label}
							x={labelPoint.x}
							y={labelPoint.y}
							fontSize={12}
							fill="#666666"
							textAnchor="middle"
							alignmentBaseline="middle"
						>
							{label}
						</SvgText>
					);
				})}
			</Svg>
		</View>
	);
};

// ============================================
// StoryCard (아코디언)
// ============================================
interface StoryCardProps {
	title: string;
	userStory?: string;
	emotionalJourney?: string[];
	whatThisTellsUs?: string;
	defaultExpanded?: boolean;
}

const StoryCard = ({
	title,
	userStory,
	emotionalJourney,
	whatThisTellsUs,
	defaultExpanded = false,
}: StoryCardProps) => {
	const [expanded, setExpanded] = useState(defaultExpanded);

	const toggleExpanded = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setExpanded((prev) => !prev);
	};

	return (
		<Pressable
			style={styles.storyCard}
			onPress={toggleExpanded}
			accessible={true}
			accessibilityRole="button"
			accessibilityLabel={title}
			accessibilityState={{ expanded }}
		>
			<View style={styles.cardHeader}>
				<Text size="15" weight="semibold" textColor="black" style={{ flex: 1 }}>
					{title}
				</Text>
				{expanded ? (
					<ChevronUp size={18} color="#767676" accessible={false} />
				) : (
					<ChevronDown size={18} color="#767676" accessible={false} />
				)}
			</View>
			{expanded && (
				<View style={styles.storyBody}>
					{userStory ? (
						<View style={styles.userStoryBlock}>
							<Text size="14" weight="normal" textColor="gray" style={styles.storyText}>
								{userStory}
							</Text>
						</View>
					) : null}
					{emotionalJourney && emotionalJourney.length > 0 ? (
						<View style={styles.journeyRow}>
							{emotionalJourney.map((step, stepIdx) => (
								<View key={step} style={styles.journeyChipRow}>
									{stepIdx > 0 ? (
										<Text size="12" weight="normal" style={{ color: '#999', marginHorizontal: 4 }}>
											→
										</Text>
									) : null}
									<View style={styles.journeyChip}>
										<Text size="12" weight="medium" style={{ color: colors.primaryPurple }}>
											{step}
										</Text>
									</View>
								</View>
							))}
						</View>
					) : null}
					{whatThisTellsUs ? (
						<Text size="13" weight="normal" textColor="gray" style={styles.tellsUsText}>
							{whatThisTellsUs}
						</Text>
					) : null}
				</View>
			)}
		</Pressable>
	);
};

// ============================================
// Dimension metadata
// ============================================
const DIMENSION_ORDER = [
	'extraversion',
	'openness',
	'conscientiousness',
	'agreeableness',
	'neuroticism',
] as const;

const DIMENSION_ICONS: Record<string, string> = {
	extraversion: '✨',
	openness: '🌱',
	conscientiousness: '🎯',
	agreeableness: '💜',
	neuroticism: '💧',
};

const convertToRadarData = (dimensionScores: Record<string, number>): RadarDataItem[] =>
	DIMENSION_ORDER.map((dim) => ({
		dimension: dim,
		value: dimensionScores[dim] ?? 0,
		color: '#7A4AE2',
		fullMark: 100,
		percentile: dimensionScores[dim] ?? 0,
	}));

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

	const dimensionDescKeys: Record<string, string> = {
		extraversion: t(MOMENT_ONBOARDING_KEYS.result.dimensionDescExtraversion),
		openness: t(MOMENT_ONBOARDING_KEYS.result.dimensionDescOpenness),
		conscientiousness: t(MOMENT_ONBOARDING_KEYS.result.dimensionDescConscientiousness),
		agreeableness: t(MOMENT_ONBOARDING_KEYS.result.dimensionDescAgreeableness),
		neuroticism: t(MOMENT_ONBOARDING_KEYS.result.dimensionDescNeuroticism),
	};

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
	const storySections: Array<{
		title?: string;
		userStory?: string;
		emotionalJourney?: string[];
		whatThisTellsUs?: string;
	}> = sf?.storySections ?? [];
	const nextSteps: string[] = sf?.growthJourney?.nextSteps ?? [];
	const growthSuggestion: string = sf?.growthJourney?.suggestion ?? '';
	const personaDescription: string = sf?.personaNarrative?.description ?? '';
	const characteristics: string[] = sf?.personaNarrative?.characteristics ?? [];
	const ceremonyText: string = sf?.titleAward?.ceremonyText ?? '';

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FFFFFF', '#F5F1FF', '#DECEFF', '#B095E0']}
				locations={[0, 0.5, 0.78, 1]}
				style={styles.gradient}
			/>

			<ScrollView
				style={[styles.scrollView, { paddingTop: insets.top + 16 }]}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* 1. 헤더 */}
				<View style={styles.headerSection}>
					<Image
						source={require('@/assets/images/moment/miho-mailbox.webp')}
						style={styles.characterImage}
						resizeMode="contain"
					/>
					<Text size="18" weight="bold" style={styles.completeTitleText}>
						{t(MOMENT_ONBOARDING_KEYS.result.completeTitle)}
					</Text>
					{report.year && report.weekOfYear ? (
						<View style={styles.dateBadge}>
							<Text size="12" weight="medium" style={{ color: colors.primaryPurple }}>
								{report.year}년 {report.weekOfYear}주차
							</Text>
						</View>
					) : null}
				</View>

				{/* 2. 칭호 히어로 카드 */}
				<LinearGradient
					colors={['#7A4AE2', '#5B35C0']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.titleHeroCard}
				>
					<View style={styles.heroBgCircle1} />
					<View style={styles.heroBgCircle2} />
					{ceremonyText ? (
						<Text size="13" weight="normal" style={styles.ceremonyText}>
							{ceremonyText}
						</Text>
					) : null}
					<Text size="28" weight="bold" style={styles.heroTitle}>
						{report.titleInfo.title}
					</Text>
					<Text size="14" weight="normal" style={styles.heroSubTitle}>
						{report.titleInfo.subTitle}
					</Text>
				</LinearGradient>

				{/* 3. 5개 성향 스탯 그리드 */}
				{report.dimensionScores && Object.keys(report.dimensionScores).length > 0 ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.statsTitle)}
						</Text>
						<View style={styles.statsGrid}>
							{DIMENSION_ORDER.map((dim, idx) => {
								const score = report.dimensionScores[dim] ?? 0;
								const isLast = idx === DIMENSION_ORDER.length - 1;
								return (
									<View key={dim} style={[styles.statCard, isLast && styles.statCardFull]}>
										<CircularProgress value={score} />
										<Text size="20" weight="normal" style={styles.statIcon}>
											{DIMENSION_ICONS[dim]}
										</Text>
										<Text size="13" weight="semibold" textColor="black" style={styles.statLabel}>
											{dimensionLabels[dim]}
										</Text>
										<Text size="11" weight="normal" textColor="gray" style={styles.statDesc}>
											{dimensionDescKeys[dim]}
										</Text>
									</View>
								);
							})}
						</View>
					</View>
				) : null}

				{/* 4. 방사형 그래프 */}
				{radarData.length > 0 ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.radarChartTitle)}
						</Text>
						<View style={styles.chartWrapper}>
							<RadarChart radarData={radarData} />
						</View>
					</View>
				) : null}

				{/* 5. 키 패턴 + 인사이트 */}
				{keyPatterns.length > 0 || integratedContent ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.patternsTitle)}
						</Text>
						{keyPatterns.length > 0 ? (
							<View style={styles.patternTagsRow}>
								{keyPatterns.map((pattern) => (
									<View key={pattern} style={styles.patternTag}>
										<Text size="12" weight="medium" style={{ color: colors.primaryPurple }}>
											{pattern}
										</Text>
									</View>
								))}
							</View>
						) : null}
						{integratedContent ? (
							<View style={styles.quoteBlock}>
								<Text size="14" weight="normal" textColor="gray" style={styles.quoteText}>
									{integratedContent}
								</Text>
							</View>
						) : null}
					</View>
				) : null}

				{/* 6. 나의 이야기 아코디언 */}
				{storySections.length > 0 ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.storyTitle)}
						</Text>
						{storySections.map((section, index) => (
							<StoryCard
								key={section.title ?? index}
								title={section.title ?? `Section ${index + 1}`}
								userStory={section.userStory}
								emotionalJourney={section.emotionalJourney}
								whatThisTellsUs={section.whatThisTellsUs}
								defaultExpanded={index === 0}
							/>
						))}
					</View>
				) : null}

				{/* 7. 성장 제안 */}
				{nextSteps.length > 0 || growthSuggestion ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.growthTitle)}
						</Text>
						{nextSteps.map((step, stepIdx) => (
							<View key={step} style={styles.growthStepCard}>
								<View style={styles.growthStepBadge}>
									<Text size="13" weight="bold" style={{ color: colors.white }}>
										{stepIdx + 1}
									</Text>
								</View>
								<Text size="14" weight="normal" textColor="black" style={styles.growthStepText}>
									{step}
								</Text>
							</View>
						))}
						{growthSuggestion ? (
							<Text size="13" weight="normal" textColor="gray" style={styles.growthSuggestion}>
								{growthSuggestion}
							</Text>
						) : null}
					</View>
				) : null}

				{/* 8. 페르소나 요약 */}
				{personaDescription || characteristics.length > 0 ? (
					<View style={styles.section}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.personaTitle)}
						</Text>
						<View style={styles.personaCard}>
							{personaDescription ? (
								<Text size="14" weight="normal" textColor="gray" style={styles.personaDesc}>
									{personaDescription}
								</Text>
							) : null}
							{characteristics.length > 0 ? (
								<View style={styles.characteristicsList}>
									{characteristics.map((char) => (
										<View key={char} style={styles.characteristicItem}>
											<Text size="14" weight="medium" style={{ color: colors.primaryPurple }}>
												✓
											</Text>
											<Text
												size="14"
												weight="normal"
												textColor="black"
												style={styles.characteristicText}
											>
												{char}
											</Text>
										</View>
									))}
								</View>
							) : null}
						</View>
					</View>
				) : null}

				<View style={{ height: 112 }} />
			</ScrollView>

			{/* 9. 하단 고정 CTA */}
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
	// 헤더
	headerSection: {
		alignItems: 'center',
		marginBottom: 20,
	},
	characterImage: {
		width: 70,
		height: 70,
		borderRadius: 35,
		borderWidth: 2,
		borderColor: colors.primaryPurple,
		marginBottom: 10,
	},
	completeTitleText: {
		color: '#7A4AE2',
		textAlign: 'center',
		marginBottom: 8,
	},
	dateBadge: {
		backgroundColor: '#F8F5FF',
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderRadius: 12,
	},
	// 칭호 히어로 카드
	titleHeroCard: {
		borderRadius: 20,
		padding: 24,
		marginBottom: 20,
		overflow: 'hidden',
		alignItems: 'center',
	},
	heroBgCircle1: {
		position: 'absolute',
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: 'rgba(255,255,255,0.08)',
		top: -30,
		right: -20,
	},
	heroBgCircle2: {
		position: 'absolute',
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: 'rgba(255,255,255,0.06)',
		bottom: -10,
		left: 10,
	},
	ceremonyText: {
		color: 'rgba(255,255,255,0.8)',
		marginBottom: 8,
	},
	heroTitle: {
		color: '#FFFFFF',
		textAlign: 'center',
		marginBottom: 8,
	},
	heroSubTitle: {
		color: '#FFFFFF',
		textAlign: 'center',
		opacity: 0.9,
	},
	// 공통 섹션
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	// 스탯 그리드
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 10,
	},
	statCard: {
		width: (width - 40 - 10) / 2,
		backgroundColor: colors.white,
		borderRadius: 16,
		padding: 14,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
		gap: 6,
	},
	statCardFull: {
		width: width - 40,
	},
	statIcon: {
		marginTop: 2,
	},
	statLabel: {
		textAlign: 'center',
	},
	statDesc: {
		textAlign: 'center',
	},
	// 레이더 차트
	chartWrapper: {
		backgroundColor: colors.white,
		borderRadius: 20,
		padding: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 6,
		elevation: 2,
	},
	chartContainer: {
		alignItems: 'center',
	},
	// 패턴 섹션
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
		borderLeftWidth: 3,
		borderLeftColor: '#7A4AE2',
		paddingLeft: 14,
	},
	quoteText: {
		lineHeight: 22,
	},
	// 스토리 카드
	storyCard: {
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
		justifyContent: 'space-between',
	},
	storyBody: {
		marginTop: 12,
		gap: 10,
	},
	userStoryBlock: {
		backgroundColor: '#F8F5FF',
		borderRadius: 10,
		padding: 12,
	},
	storyText: {
		lineHeight: 22,
	},
	journeyRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 4,
	},
	journeyChipRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	journeyChip: {
		backgroundColor: '#F8F5FF',
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 12,
	},
	tellsUsText: {
		lineHeight: 20,
		fontStyle: 'italic',
	},
	// 성장 제안
	growthStepCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: colors.white,
		borderRadius: 14,
		padding: 14,
		marginBottom: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 1,
		gap: 12,
	},
	growthStepBadge: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#7A4AE2',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	growthStepText: {
		flex: 1,
		lineHeight: 22,
	},
	growthSuggestion: {
		lineHeight: 20,
		fontStyle: 'italic',
		marginTop: 6,
	},
	// 페르소나
	personaCard: {
		backgroundColor: colors.white,
		borderRadius: 16,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 1,
		gap: 12,
	},
	personaDesc: {
		lineHeight: 24,
	},
	characteristicsList: {
		gap: 8,
	},
	characteristicItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
	},
	characteristicText: {
		flex: 1,
		lineHeight: 22,
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
