import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	Dimensions,
	Image,
	LayoutAnimation,
	Pressable,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import {
	type PersonalityTypeKey,
	getPersonalityTypeLabel,
} from '../../constants/personality-types';
import { useMomentAnalytics } from '../../hooks/use-moment-analytics';
import { useWeeklyReportQuery } from '../../queries';

const { width } = Dimensions.get('window');

// ============================================
// 차원 아이콘 매핑
// ============================================
const DIMENSION_ICONS: Record<string, string> = {
	extraversion: '✨',
	openness: '🌱',
	conscientiousness: '🎯',
	agreeableness: '💜',
	neuroticism: '💧',
};

const getDimensionIcon = (category: string) => {
	const key = category.toLowerCase();
	return DIMENSION_ICONS[key] ?? '⭐';
};

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
	const size = Math.min(width - 80, 300);
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
				{radarData.map((d, i) => {
					const lp = getPoint(120, d.angle);
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
// InsightCard (아코디언)
// ============================================
interface InsightCardProps {
	title: string;
	score: number;
	definition: string;
	feedback: string;
	defaultExpanded?: boolean;
}

const InsightCard = ({
	title,
	score,
	definition,
	feedback,
	defaultExpanded = false,
}: InsightCardProps) => {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const { t } = useTranslation();

	const toggle = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setExpanded((v) => !v);
	};

	const scoreColor = score >= 70 ? '#00C853' : score >= 50 ? '#FF9800' : '#FF5252';

	return (
		<Pressable
			style={styles.insightCard}
			onPress={toggle}
			accessible
			accessibilityRole="button"
			accessibilityLabel={title}
			accessibilityState={{ expanded }}
		>
			<View style={styles.cardHeader}>
				<Text size="15" weight="semibold" textColor="black" style={{ flex: 1 }}>
					{title}
				</Text>
				<Text size="13" weight="bold" style={{ color: scoreColor, marginRight: 8 }}>
					{score}
				</Text>
				{expanded ? (
					<ChevronUp size={18} color="#767676" accessible={false} />
				) : (
					<ChevronDown size={18} color="#767676" accessible={false} />
				)}
			</View>
			{expanded && (
				<View style={styles.insightBody}>
					{definition ? (
						<>
							<Text size="12" weight="semibold" textColor="black" style={styles.insightLabel}>
								{t('features.moment.ui.weekly_report.label_definition')}
							</Text>
							<Text size="13" weight="normal" textColor="gray" style={styles.insightText}>
								{definition}
							</Text>
						</>
					) : null}
					{feedback ? (
						<>
							<Text size="12" weight="semibold" textColor="black" style={styles.insightLabel}>
								{t('features.moment.ui.weekly_report.label_feedback')}
							</Text>
							<View style={styles.quoteBlock}>
								<Text size="13" weight="normal" textColor="gray" style={styles.insightText}>
									{feedback}
								</Text>
							</View>
						</>
					) : null}
				</View>
			)}
		</Pressable>
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
					<Text
						size="14"
						weight="normal"
						textColor="gray"
						style={{ textAlign: 'center', marginBottom: 24 }}
					>
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

	// ── 데이터 없음
	if (!report || (!report.title && !report.stats?.length && !report.insights?.length)) {
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
					<Text
						size="14"
						weight="normal"
						textColor="gray"
						style={{ textAlign: 'center', marginBottom: 24 }}
					>
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

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FFFFFF', '#F5F1FF', '#DECEFF', '#B095E0']}
				locations={[0, 0.5, 0.78, 1]}
				style={styles.gradient}
			/>

			{/* 백 헤더 */}
			<View style={[styles.topBar, { top: insets.top }]}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={handleBack}
					accessibilityRole="button"
					accessibilityLabel={t('features.moment.ui.weekly_report.go_back')}
				>
					<Ionicons name="chevron-back" size={24} color={colors.primaryPurple} accessible={false} />
				</TouchableOpacity>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 64 }]}
			>
				{/* 1. 헤더 */}
				<View style={styles.headerSection}>
					<Image
						source={require('@/assets/images/guide-miho.webp')}
						style={styles.characterImage}
						resizeMode="contain"
					/>
					<Text size="18" weight="bold" style={styles.completeTitleText}>
						{t('features.moment.ui.weekly_report.traits_title')}
					</Text>
					<View style={styles.dateBadge}>
						<Text size="12" weight="medium" style={{ color: colors.primaryPurple }}>
							{displayYear}년 {displayWeek}주차
						</Text>
					</View>
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
					<Text size="28" weight="bold" style={styles.heroTitle}>
						{report.title || t('features.moment.ui.weekly_report.default_title')}
					</Text>
					{report.subTitle ? (
						<Text size="14" weight="normal" style={styles.heroSubTitle}>
							{report.subTitle}
						</Text>
					) : null}
				</LinearGradient>

				{/* 3. 5개 성향 스탯 그리드 */}
				{stats.length > 0 ? (
					<View style={styles.section}>
						<View style={styles.sectionLabelRow}>
							<View style={styles.sectionLabelBar} />
							<Text size="16" weight="semibold" textColor="black">
								{t('features.moment.onboarding.result.stats_title')}
							</Text>
						</View>
						<View style={styles.statsGrid}>
							{stats.map((s, idx) => (
								<View
									key={s.category}
									style={[styles.statCard, idx === stats.length - 1 && styles.statCardFull]}
								>
									<CircularProgress value={s.currentScore} />
									<Text size="20" weight="normal" style={styles.statIcon}>
										{getDimensionIcon(s.category)}
									</Text>
									<Text size="13" weight="semibold" textColor="black" style={styles.statLabel}>
										{getPersonalityTypeLabel(s.category as PersonalityTypeKey) || s.category}
									</Text>
									{s.prevScore !== undefined ? (
										<Text
											size="11"
											weight="normal"
											style={{
												color: s.currentScore >= s.prevScore ? '#00C853' : '#FF5252',
												textAlign: 'center',
											}}
										>
											{s.currentScore >= s.prevScore
												? `▲ +${s.currentScore - s.prevScore}`
												: `▼ ${s.currentScore - s.prevScore}`}
										</Text>
									) : null}
								</View>
							))}
						</View>
					</View>
				) : null}

				{/* 4. 방사형 그래프 */}
				{radarData.length > 0 ? (
					<View style={styles.section}>
						<View style={styles.sectionLabelRow}>
							<View style={styles.sectionLabelBar} />
							<Text size="16" weight="semibold" textColor="black">
								{t('features.moment.onboarding.result.radar_chart_title')}
							</Text>
						</View>
						<View style={styles.chartWrapper}>
							<RadarChart radarData={radarData} />
							<View style={styles.legend}>
								<View style={styles.legendItem}>
									<View
										style={[styles.legendBox, { backgroundColor: semanticColors.brand.primary }]}
									/>
									<Text size="10" weight="normal" textColor="gray">
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
									<Text size="10" weight="normal" textColor="gray">
										{t('features.moment.ui.weekly_report.last_week')}
									</Text>
								</View>
							</View>
						</View>
					</View>
				) : null}

				{/* 5. 키워드 패턴 */}
				{keywords.length > 0 || report.description ? (
					<View style={styles.section}>
						<View style={styles.sectionLabelRow}>
							<View style={styles.sectionLabelBar} />
							<Text size="16" weight="semibold" textColor="black">
								{t('features.moment.onboarding.result.patterns_title')}
							</Text>
						</View>
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
								<Text size="14" weight="normal" textColor="gray" style={{ lineHeight: 22 }}>
									{report.description}
								</Text>
							</View>
						) : null}
					</View>
				) : null}

				{/* 6. 인사이트 아코디언 */}
				{insights.length > 0 ? (
					<View style={styles.section}>
						<View style={styles.sectionLabelRow}>
							<View style={styles.sectionLabelBar} />
							<Text size="16" weight="semibold" textColor="black">
								{t('features.moment.ui.weekly_report.analysis_title')}
							</Text>
						</View>
						{insights.map((ins, idx) => (
							<InsightCard
								key={ins.category}
								title={`${getDimensionIcon(ins.category)} ${getPersonalityTypeLabel(ins.category as PersonalityTypeKey) || ins.category}`}
								score={ins.score}
								definition={ins.definition}
								feedback={ins.feedback}
								defaultExpanded={idx === 0}
							/>
						))}
					</View>
				) : null}

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
		backgroundColor: colors.white,
	},
	gradient: {
		...StyleSheet.absoluteFillObject,
	},
	centerBox: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	// 백 헤더
	topBar: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 52,
		backgroundColor: 'transparent',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		zIndex: 10,
	},
	backBtn: {
		padding: 8,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	// 헤더
	headerSection: {
		alignItems: 'center',
		marginTop: 20,
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
	// 히어로 카드
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
	// 섹션
	section: {
		marginBottom: 24,
	},
	sectionLabelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12,
	},
	sectionLabelBar: {
		width: 4,
		height: 18,
		borderRadius: 2,
		backgroundColor: '#7A4AE2',
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
		borderWidth: 1,
		borderColor: 'rgba(122,74,226,0.06)',
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
	// 레이더 차트
	chartWrapper: {
		backgroundColor: colors.white,
		borderRadius: 20,
		padding: 12,
		alignItems: 'center',
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
		borderLeftWidth: 3,
		borderLeftColor: '#7A4AE2',
		paddingLeft: 14,
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
		justifyContent: 'space-between',
	},
	insightBody: {
		marginTop: 12,
		gap: 6,
	},
	insightLabel: {
		marginBottom: 4,
	},
	insightText: {
		lineHeight: 20,
		marginBottom: 10,
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
