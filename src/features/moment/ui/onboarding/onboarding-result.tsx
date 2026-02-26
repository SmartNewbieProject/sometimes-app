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
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';

import colors from '@/src/shared/constants/colors';
import { Button, Text } from '@/src/shared/ui';
import { useMomentOnboarding } from '../../hooks/use-moment-onboarding';
import type { OnboardingReport, RadarDataItem } from '../../types';
import { MOMENT_ONBOARDING_KEYS } from './keys';

const { width } = Dimensions.get('window');

// ============================================
// Radar Chart (i18n 적용)
// ============================================
const RadarChart = ({ radarData }: { radarData: RadarDataItem[] }) => {
	const { t } = useTranslation();
	const size = width - 80;
	const center = size / 2;
	const maxRadius = size / 2 - 40;

	const dimensions = [
		t(MOMENT_ONBOARDING_KEYS.result.radarExtraversion),
		t(MOMENT_ONBOARDING_KEYS.result.radarOpenness),
		t(MOMENT_ONBOARDING_KEYS.result.radarConscientiousness),
		t(MOMENT_ONBOARDING_KEYS.result.radarAgreeableness),
		t(MOMENT_ONBOARDING_KEYS.result.radarNeuroticism),
	];

	const getPoint = (index: number, value: number) => {
		const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
		const radius = (value / 100) * maxRadius;
		return {
			x: center + radius * Math.cos(angle),
			y: center + radius * Math.sin(angle),
		};
	};

	const points = radarData.map((item, i) => getPoint(i, item.value));
	const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

	const gridLevels = [20, 40, 60, 80, 100];

	return (
		<View style={styles.chartContainer}>
			<Svg width={size} height={size}>
				{/* Grid lines */}
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

				{/* Axis lines */}
				{Array.from({ length: 5 }, (_, i) => {
					const point = getPoint(i, 100);
					return (
						<Line
							key={i}
							x1={center}
							y1={center}
							x2={point.x}
							y2={point.y}
							stroke="#E5E5E5"
							strokeWidth={1}
						/>
					);
				})}

				{/* Data polygon */}
				<Polygon
					points={polygonPoints}
					fill="rgba(122, 74, 226, 0.2)"
					stroke={colors.primaryPurple}
					strokeWidth={2}
				/>

				{/* Data points */}
				{points.map((point, i) => (
					<Circle key={i} cx={point.x} cy={point.y} r={4} fill={colors.primaryPurple} />
				))}

				{/* Labels */}
				{dimensions.map((label, i) => {
					const labelPoint = getPoint(i, 120);
					return (
						<SvgText
							key={i}
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
// Insight Card (접기/펼치기)
// ============================================
interface InsightCardProps {
	title: string;
	content: string;
	psychologicalInsight?: string;
	defaultExpanded?: boolean;
}

const InsightCard = ({
	title,
	content,
	psychologicalInsight,
	defaultExpanded = false,
}: InsightCardProps) => {
	const [expanded, setExpanded] = useState(defaultExpanded);

	const toggleExpanded = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setExpanded((prev) => !prev);
	};

	return (
		<Pressable
			style={styles.insightCard}
			onPress={toggleExpanded}
			accessible={true}
			accessibilityRole="button"
			accessibilityLabel={title}
			accessibilityState={{ expanded }}
		>
			<View style={styles.insightHeader}>
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
				<View style={styles.insightBody}>
					<Text size="14" weight="normal" textColor="gray" style={styles.insightText}>
						{content}
					</Text>
					{psychologicalInsight && (
						<View style={styles.psychInsightContainer}>
							<Text size="13" weight="medium" style={{ color: colors.primaryPurple }}>
								{psychologicalInsight}
							</Text>
						</View>
					)}
				</View>
			)}
		</Pressable>
	);
};

// ============================================
// Dimension order
// ============================================
const DIMENSION_ORDER = [
	'extraversion',
	'openness',
	'conscientiousness',
	'agreeableness',
	'neuroticism',
] as const;

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

	// 키워드 추출: storyFlow.integratedInsights.keyPatterns 또는 personaNarrative.characteristics
	const keywords = useMemo(() => {
		if (!report?.storyFlow) return [];
		const sf = report.storyFlow;
		if (sf?.integratedInsights?.keyPatterns?.length > 0) {
			return sf.integratedInsights.keyPatterns as string[];
		}
		if (sf?.personaNarrative?.characteristics?.length > 0) {
			return sf.personaNarrative.characteristics as string[];
		}
		return [];
	}, [report]);

	// 인사이트 섹션 추출: narrativeSections
	const insightSections = useMemo(() => {
		if (!report?.narrativeSections) return [];
		return report.narrativeSections.filter(
			(s: {
				sectionTitle?: string;
				interpretation?: { content?: string; psychologicalInsight?: string };
			}) => s?.sectionTitle && s?.interpretation,
		);
	}, [report]);

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

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FFFFFF', '#F5F1FF', '#DECEFF', '#B095E0']}
				locations={[0, 0.5, 0.78, 1]}
				style={styles.gradient}
			/>

			<ScrollView
				style={[styles.scrollView, { paddingTop: insets.top + 20 }]}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.headerSection}>
					<Image
						source={require('@/assets/images/moment/miho-mailbox.webp')}
						style={styles.characterImage}
						resizeMode="contain"
					/>
					<Text size="20" weight="bold" textColor="purple" style={styles.completeTitle}>
						{t(MOMENT_ONBOARDING_KEYS.result.completeTitle)}
					</Text>
				</View>

				{/* Title Card */}
				<View style={styles.titleCard}>
					<Text size="24" weight="bold" textColor="black" style={styles.personaTitle}>
						"{report.titleInfo.title}"
					</Text>
					<Text size="14" weight="normal" textColor="gray" style={styles.personaSubtitle}>
						{report.titleInfo.subTitle}
					</Text>
				</View>

				{/* Keywords */}
				{keywords.length > 0 && (
					<View style={styles.keywordsSection}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.keywordsTitle)}
						</Text>
						<View style={styles.keywordsContainer}>
							{keywords.map((keyword: string) => (
								<View key={keyword} style={styles.keywordTag}>
									<Text size="13" weight="medium" style={{ color: colors.primaryPurple }}>
										{keyword}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Radar Chart */}
				{radarData.length > 0 && (
					<View style={styles.chartSection}>
						<RadarChart radarData={radarData} />
					</View>
				)}

				{/* Insight Cards */}
				{insightSections.length > 0 && (
					<View style={styles.insightsSection}>
						<Text size="16" weight="semibold" textColor="black" style={styles.sectionTitle}>
							{t(MOMENT_ONBOARDING_KEYS.result.insightsTitle)}
						</Text>
						{insightSections.map((section, index) => (
							<InsightCard
								key={section.sectionTitle}
								title={section.sectionTitle}
								content={section.interpretation?.content ?? ''}
								psychologicalInsight={section.interpretation?.psychologicalInsight}
								defaultExpanded={index === 0}
							/>
						))}
					</View>
				)}

				<View style={{ height: 100 }} />
			</ScrollView>

			{/* Bottom Button */}
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
		paddingHorizontal: 24,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 24,
	},
	headerSection: {
		alignItems: 'center',
		marginBottom: 24,
	},
	characterImage: {
		width: 80,
		height: 80,
		marginBottom: 12,
	},
	completeTitle: {
		textAlign: 'center',
	},
	titleCard: {
		backgroundColor: colors.white,
		borderRadius: 20,
		padding: 24,
		alignItems: 'center',
		marginBottom: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	personaTitle: {
		textAlign: 'center',
		marginBottom: 12,
	},
	personaSubtitle: {
		textAlign: 'center',
		lineHeight: 22,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	keywordsSection: {
		marginBottom: 24,
	},
	keywordsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 8,
	},
	keywordTag: {
		backgroundColor: '#F8F5FF',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
	},
	chartSection: {
		marginBottom: 24,
	},
	chartContainer: {
		alignItems: 'center',
		backgroundColor: colors.white,
		borderRadius: 20,
		padding: 16,
	},
	insightsSection: {
		marginBottom: 24,
	},
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
	insightHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	insightBody: {
		marginTop: 12,
	},
	insightText: {
		lineHeight: 22,
	},
	psychInsightContainer: {
		marginTop: 10,
		backgroundColor: '#F8F5FF',
		borderRadius: 10,
		padding: 12,
	},
	buttonContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 24,
		paddingTop: 16,
		backgroundColor: 'transparent',
	},
	startButton: {
		width: '100%',
	},
});
