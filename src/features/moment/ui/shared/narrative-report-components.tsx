import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import AreaFillHeartIcon from '@assets/icons/area-fill-heart.svg';
import CircleCheckIcon from '@assets/icons/circle-check.svg';
import PinIcon from '@assets/icons/pin.svg';

import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import type { RadarDataItem } from '../../types';
import { MOMENT_ONBOARDING_KEYS } from '../onboarding/keys';

const { width } = Dimensions.get('window');

// ============================================
// Dimension metadata
// ============================================
export const DIMENSION_ORDER = [
	'extraversion',
	'openness',
	'conscientiousness',
	'agreeableness',
	'neuroticism',
] as const;

export const DimIcon = ({ dim, size = 18 }: { dim: string; size?: number }) => {
	switch (dim) {
		case 'extraversion':
			return (
				<Image
					source={require('@/assets/images/filled_kid_star.png')}
					style={{ width: size, height: size }}
					resizeMode="contain"
				/>
			);
		case 'openness':
			return (
				<Image
					source={require('@/assets/images/like-letter/bulb.png')}
					style={{ width: size, height: size }}
					resizeMode="contain"
				/>
			);
		case 'conscientiousness':
			return <CircleCheckIcon width={size} height={size} />;
		case 'agreeableness':
			return <AreaFillHeartIcon width={size} height={size} />;
		case 'neuroticism':
			return <PinIcon width={size} height={size} />;
		default:
			return null;
	}
};

export const convertToRadarData = (dimensionScores: Record<string, number>): RadarDataItem[] =>
	DIMENSION_ORDER.map((dim) => ({
		dimension: dim,
		value: dimensionScores[dim] ?? 0,
		color: '#7A4AE2',
		fullMark: 100,
		percentile: dimensionScores[dim] ?? 0,
	}));

// ============================================
// CircularProgress
// ============================================
export const CircularProgress = ({ value, size = 68 }: { value: number; size?: number }) => {
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
// RadarChart — A: 드로잉 애니메이션 / B: 이전 주 점선 오버레이
// ============================================
export const RadarChart = ({
	radarData,
	prevDimensionScores,
}: {
	radarData: RadarDataItem[];
	prevDimensionScores?: Record<string, number> | null;
}) => {
	const { t } = useTranslation();
	const size = Math.min(width - 40, 240);
	const center = size / 2;
	const maxRadius = size / 2 - 40;
	const gridLevels = [20, 40, 60, 80, 100];

	const dimLabels = [
		t(MOMENT_ONBOARDING_KEYS.result.radarExtraversion),
		t(MOMENT_ONBOARDING_KEYS.result.radarOpenness),
		t(MOMENT_ONBOARDING_KEYS.result.radarConscientiousness),
		t(MOMENT_ONBOARDING_KEYS.result.radarAgreeableness),
		t(MOMENT_ONBOARDING_KEYS.result.radarNeuroticism),
	];

	// A: 드로잉 progress (0 → 1)
	const progress = useSharedValue(0);
	useEffect(() => {
		progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
	}, [progress]);

	const getPoint = (index: number, value: number) => {
		const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
		const radius = (value / 100) * maxRadius;
		return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
	};

	const dataPoints = radarData.map((item, i) => ({
		...getPoint(i, item.value),
		dim: item.dimension,
	}));

	// A: polygon points를 progress에 맞게 중심→외곽 interpolate
	const animatedPolygonProps = useAnimatedProps(() => {
		'worklet';
		const pts = [];
		for (let i = 0; i < radarData.length; i++) {
			const item = radarData[i];
			if (!item) continue;
			const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
			const r = (item.value / 100) * maxRadius * progress.value;
			pts.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
		}
		return { points: pts.join(' ') };
	});

	// A: dots opacity (폴리곤 완성 후 페이드인)
	const animatedDotProps = useAnimatedProps(() => ({
		fillOpacity: Math.max(0, (progress.value - 0.7) / 0.3),
	}));

	// B: 이전 주 polygon (정적 점선)
	const prevPolygon = prevDimensionScores
		? DIMENSION_ORDER.map((dim, i) => {
				const p = getPoint(i, prevDimensionScores[dim] ?? 0);
				return `${p.x},${p.y}`;
			}).join(' ')
		: null;

	return (
		<View style={sharedStyles.chartContainer}>
			<Svg width={size} height={size}>
				{/* 그리드 */}
				{gridLevels.map((level) => {
					const pts = Array.from({ length: 5 }, (_, i) => getPoint(i, level));
					return (
						<Polygon
							key={level}
							points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
							fill="none"
							stroke="#E5E5E5"
							strokeWidth={1}
						/>
					);
				})}
				{/* 축 */}
				{DIMENSION_ORDER.map((dim, i) => {
					const pt = getPoint(i, 100);
					return (
						<Line
							key={`axis-${dim}`}
							x1={center}
							y1={center}
							x2={pt.x}
							y2={pt.y}
							stroke="#E5E5E5"
							strokeWidth={1}
						/>
					);
				})}
				{/* B: 이전 주 점선 폴리곤 */}
				{prevPolygon ? (
					<Polygon
						points={prevPolygon}
						fill="none"
						stroke="#B0B0C8"
						strokeWidth={1.5}
						strokeDasharray="4,3"
					/>
				) : null}
				{/* A: 현재 주 — 애니메이션 폴리곤 */}
				<AnimatedPolygon
					animatedProps={animatedPolygonProps}
					fill="rgba(122, 74, 226, 0.18)"
					stroke={colors.primaryPurple}
					strokeWidth={2}
				/>
				{/* A: dots — 폴리곤 완성 후 페이드인 */}
				{dataPoints.map((pt) => (
					<AnimatedCircle
						key={`dot-${pt.dim}`}
						cx={pt.x}
						cy={pt.y}
						r={4}
						fill={colors.primaryPurple}
						stroke="white"
						strokeWidth={2}
						animatedProps={animatedDotProps}
					/>
				))}
				{/* 레이블 */}
				{dimLabels.map((label, i) => {
					const lp = getPoint(i, 112);
					return (
						<SvgText
							key={label}
							x={lp.x}
							y={lp.y}
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
// RadarLegend
// ============================================
export const RadarLegend = ({
	dimensionScores,
	dimensionLabels,
}: {
	dimensionScores: Record<string, number>;
	dimensionLabels: Record<string, string>;
}) => (
	<View style={sharedStyles.radarLegend}>
		{DIMENSION_ORDER.map((dim) => {
			const score = dimensionScores[dim] ?? 0;
			return (
				<View key={dim} style={sharedStyles.legendRow}>
					<View style={sharedStyles.legendLeft}>
						<View style={sharedStyles.legendDot} />
						<Text size="12" weight="semibold" textColor="black">
							{dimensionLabels[dim]}
						</Text>
					</View>
					<View style={sharedStyles.legendBarBg}>
						<View style={[sharedStyles.legendBarFill, { width: `${score}%` as `${number}%` }]} />
					</View>
					<Text size="13" weight="bold" style={sharedStyles.legendScore}>
						{score}
					</Text>
				</View>
			);
		})}
	</View>
);

// ============================================
// StoryCard
// ============================================
interface StoryCardProps {
	title: string;
	userQuote?: { original: string; highlight: string } | null;
	userStory?: string;
	emotionalJourney?: string[];
	whatThisTellsUs?: string;
}

export const StoryCard = ({
	title,
	userQuote,
	userStory,
	emotionalJourney,
	whatThisTellsUs,
}: StoryCardProps) => (
	<View style={sharedStyles.storyCard}>
		<Text size="15" weight="semibold" textColor="black" style={sharedStyles.storyCardTitle}>
			{title}
		</Text>
		{userQuote?.highlight ? (
			<View style={sharedStyles.userQuoteChip}>
				<Text size="13" weight="semibold" style={{ color: colors.primaryPurple }}>
					"{userQuote.highlight}"
				</Text>
			</View>
		) : null}
		<View style={sharedStyles.storyBody}>
			{userStory ? (
				<View style={sharedStyles.userStoryBlock}>
					<Text size="14" weight="normal" style={sharedStyles.storyText}>
						{userStory}
					</Text>
				</View>
			) : null}
			{emotionalJourney && emotionalJourney.length > 0 ? (
				<View style={sharedStyles.journeyRow}>
					{emotionalJourney.map((step, i) => (
						<View key={step} style={sharedStyles.journeyChipRow}>
							{i > 0 ? (
								<Text size="12" weight="normal" style={{ color: '#999', marginHorizontal: 4 }}>
									→
								</Text>
							) : null}
							<View style={sharedStyles.journeyChip}>
								<Text size="12" weight="medium" style={{ color: colors.primaryPurple }}>
									{step}
								</Text>
							</View>
						</View>
					))}
				</View>
			) : null}
			{whatThisTellsUs ? (
				<Text size="13" weight="normal" style={sharedStyles.tellsUsText}>
					{whatThisTellsUs}
				</Text>
			) : null}
		</View>
	</View>
);

// ============================================
// TitleAwardSection
// ============================================
const HeroParticle = ({
	size,
	top,
	bottom,
	left,
	right,
	delay,
}: {
	size: number;
	top?: number;
	bottom?: number;
	left?: number;
	right?: number;
	delay: number;
}) => {
	const y = useSharedValue(0);
	useEffect(() => {
		y.value = withRepeat(withDelay(delay, withTiming(-10, { duration: 2200 })), -1, true);
	}, [delay, y]);
	const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
	return (
		<Animated.View
			style={[
				{
					position: 'absolute',
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: 'rgba(255,255,255,0.12)',
					top,
					bottom,
					left,
					right,
				},
				animStyle,
			]}
		/>
	);
};

interface TitleAwardSectionProps {
	weekLabel?: string;
	title: string;
	subTitle: string;
}

export const TitleAwardSection = ({ weekLabel, title, subTitle }: TitleAwardSectionProps) => (
	<LinearGradient
		colors={['#0f0520', '#3a1a7a', '#7A4AE2']}
		locations={[0, 0.45, 1]}
		start={{ x: 0.3, y: 0 }}
		end={{ x: 0.8, y: 1 }}
		style={sharedStyles.titleHeroCard}
	>
		<HeroParticle size={60} top={10} right={20} delay={500} />
		<HeroParticle size={30} bottom={20} left={30} delay={1500} />
		<HeroParticle size={20} top={50} left={15} delay={2500} />
		<Image
			source={require('@/assets/images/guide-miho.webp')}
			style={sharedStyles.heroBgMiho}
			resizeMode="contain"
		/>
			<Text size="3xl" weight="bold" style={sharedStyles.heroTitle}>
				{title}
			</Text>
		<Text size="14" weight="normal" style={sharedStyles.heroSubTitle}>
			{subTitle}
		</Text>
		{weekLabel ? (
			<View style={sharedStyles.heroWeekBadge}>
				<Text size="12" weight="semibold" style={sharedStyles.heroWeekBadgeText}>
					✦ {weekLabel}
				</Text>
			</View>
		) : null}
	</LinearGradient>
);

// ============================================
// AnimatedStatRow
// ============================================
interface AnimatedStatRowProps {
	category: string;
	score: number;
	change: number | null;
	label: string;
	index: number;
}

export const AnimatedStatRow = ({
	category,
	score,
	change,
	label,
	index,
}: AnimatedStatRowProps) => {
	const translateY = useSharedValue(32);
	const opacity = useSharedValue(0);

	useEffect(() => {
		const delay = index * 120;
		translateY.value = withDelay(delay, withTiming(0, { duration: 420 }));
		opacity.value = withDelay(delay, withTiming(1, { duration: 380 }));
	}, [index, opacity, translateY]);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	const scoreColor = score >= 70 ? '#191F28' : score >= 50 ? '#E65100' : '#D32F2F';

	return (
		<Animated.View style={[statRowStyles.row, animStyle]}>
			<View style={statRowStyles.scoreBox}>
				<Animated.Text style={[statRowStyles.scoreNum, { color: scoreColor }]}>
					{score}
				</Animated.Text>
			</View>
			<View style={statRowStyles.right}>
				<View style={statRowStyles.nameRow}>
					<View style={statRowStyles.nameLeft}>
						<DimIcon dim={category} size={14} />
						<Animated.Text style={statRowStyles.name}>{label}</Animated.Text>
					</View>
					{change !== null ? (
						<Animated.Text
							style={[statRowStyles.delta, { color: change >= 0 ? '#00C853' : '#FF5252' }]}
						>
							{change >= 0 ? `▲ +${change}` : `▼ ${change}`}
						</Animated.Text>
					) : null}
				</View>
				<View style={statRowStyles.barBg}>
					<LinearGradient
						colors={['#7A4AE2', '#C4A8F5']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={[statRowStyles.barFill, { width: `${score}%` as `${number}%` }]}
					/>
				</View>
			</View>
		</Animated.View>
	);
};

export const statRowStyles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0,0,0,0.06)',
	},
	scoreBox: {
		width: 56,
		flexShrink: 0,
	},
	scoreNum: {
		fontSize: 36,
		fontWeight: '900',
		lineHeight: 40,
	},
	right: {
		flex: 1,
		gap: 6,
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	nameLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	name: {
		fontSize: 13,
		fontWeight: '600',
		color: '#333333',
	},
	delta: {
		fontSize: 11,
		fontWeight: '700',
	},
	barBg: {
		height: 5,
		backgroundColor: '#E5E7EB',
		borderRadius: 3,
		overflow: 'hidden',
	},
	barFill: {
		height: 5,
		borderRadius: 3,
	},
});

// ============================================
// DimensionStatsSection
// ============================================
interface DimensionStatsSectionProps {
	dimensionScores: Record<string, number>;
	dimensionLabels: Record<string, string>;
	dimensionDescKeys: Record<string, string>;
}

export const DimensionStatsSection = ({
	dimensionScores,
	dimensionLabels,
	dimensionDescKeys,
}: DimensionStatsSectionProps) => (
	<View style={sharedStyles.statsGrid}>
		{DIMENSION_ORDER.map((dim) => {
			const score = dimensionScores[dim] ?? 0;
			return (
				<View key={dim} style={sharedStyles.statCard}>
					<CircularProgress value={score} />
					<View style={sharedStyles.statInfo}>
						<View style={sharedStyles.statInfoHeader}>
							<DimIcon dim={dim} size={20} />
							<Text size="14" weight="semibold" textColor="black">
								{dimensionLabels[dim]}
							</Text>
						</View>
						<Text size="12" weight="normal">
							{dimensionDescKeys[dim]}
						</Text>
						<View style={sharedStyles.statBarBg}>
							<View style={[sharedStyles.statBarFill, { width: `${score}%` as `${number}%` }]} />
						</View>
					</View>
				</View>
			);
		})}
	</View>
);

// ============================================
// IntegratedInsightsSection
// ============================================
interface IntegratedInsightsSectionProps {
	keyPatterns: string[];
	content: string;
}

export const IntegratedInsightsSection = ({
	keyPatterns,
	content,
}: IntegratedInsightsSectionProps) => {
	const sentences = content ? content.split(/(?<=\.)\s+/).filter((s) => s.trim()) : [];
	return (
		<>
			{keyPatterns.length > 0 ? (
				<View style={sharedStyles.patternTagsRow}>
					{keyPatterns.map((pattern) => (
						<View key={pattern} style={sharedStyles.patternTag}>
							<Text size="12" weight="semibold" style={{ color: '#5B35C0' }}>
								{pattern}
							</Text>
						</View>
					))}
				</View>
			) : null}
			{sentences.length > 0 ? (
				<View style={sharedStyles.quoteBlock}>
					{sentences.map((s, i) => (
						<Text
							key={`${i}-${s.slice(0, 8)}`}
							size="14"
							weight="normal"
								style={[
									sharedStyles.quoteText,
									...(i < sentences.length - 1 ? [{ marginBottom: 10 }] : []),
									{ color: '#3D3D3D' },
								]}
							>
							{s}
						</Text>
					))}
				</View>
			) : null}
		</>
	);
};

// ============================================
// GrowthJourneySection
// ============================================
interface GrowthJourneySectionProps {
	nextSteps: string[];
	suggestion?: string;
}

export const GrowthJourneySection = ({ nextSteps, suggestion }: GrowthJourneySectionProps) => (
	<>
		{nextSteps.map((step, i) => (
			<View key={step} style={sharedStyles.growthStepCard}>
				<View style={sharedStyles.growthStepBadge}>
					<Text size="13" weight="bold" style={{ color: colors.white }}>
						{i + 1}
					</Text>
				</View>
				<Text size="14" weight="normal" textColor="black" style={sharedStyles.growthStepText}>
					{step}
				</Text>
			</View>
		))}
		{suggestion ? (
			<Text size="13" weight="normal" style={sharedStyles.growthSuggestion}>
				{suggestion}
			</Text>
		) : null}
	</>
);

// ============================================
// PersonaNarrativeSection
// ============================================
interface PersonaNarrativeSectionProps {
	description?: string;
	characteristics: string[];
}

export const PersonaNarrativeSection = ({
	description,
	characteristics,
}: PersonaNarrativeSectionProps) => (
	<View style={sharedStyles.personaCard}>
		{description ? (
			<Text size="14" weight="normal" style={sharedStyles.personaDesc}>
				{description}
			</Text>
		) : null}
		{characteristics.length > 0 ? (
			<View style={sharedStyles.characteristicsList}>
				{characteristics.map((char) => (
					<View key={char} style={sharedStyles.characteristicItem}>
						<Text size="14" weight="medium" style={{ color: colors.primaryPurple }}>
							✓
						</Text>
						<Text
							size="14"
							weight="normal"
							textColor="black"
							style={sharedStyles.characteristicText}
						>
							{char}
						</Text>
					</View>
				))}
			</View>
		) : null}
	</View>
);

// ============================================
// Shared StyleSheet
// ============================================
export const sharedStyles = StyleSheet.create({
	chartContainer: {
		alignItems: 'center',
	},
	// 레이더 레전드
	radarLegend: {
		marginTop: 16,
		gap: 8,
	},
	legendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	legendLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		width: 88,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.primaryPurple,
		flexShrink: 0,
	},
	legendBarBg: {
		flex: 1,
		height: 8,
		backgroundColor: '#EDE9F8',
		borderRadius: 6,
		overflow: 'hidden',
	},
	legendBarFill: {
		height: 8,
		backgroundColor: colors.primaryPurple,
		borderRadius: 6,
	},
	legendScore: {
		color: colors.primaryPurple,
		width: 28,
		textAlign: 'right',
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
		gap: 10,
		overflow: 'hidden',
	},
	storyCardTitle: {
		marginBottom: 2,
	},
	userQuoteChip: {
		alignSelf: 'stretch',
		backgroundColor: '#EDE9F8',
		borderRadius: 20,
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: '#C4ADFF',
	},
	storyBody: {
		gap: 10,
	},
	userStoryBlock: {
		backgroundColor: '#F8F5FF',
		borderRadius: 10,
		padding: 12,
	},
	storyText: {
		lineHeight: 22,
		color: '#374151',
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
		flexShrink: 1,
	},
	journeyChip: {
		backgroundColor: '#F8F5FF',
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 12,
		flexShrink: 1,
	},
	tellsUsText: {
		lineHeight: 20,
		fontStyle: 'italic',
		color: '#374151',
	},
	// 칭호 히어로 카드
	titleHeroCard: {
		borderRadius: 20,
		paddingHorizontal: 24,
		paddingVertical: 32,
		marginBottom: 20,
		overflow: 'hidden',
		alignItems: 'center',
		gap: 8,
	},
	heroBgMiho: {
		position: 'absolute',
		left: -24,
		bottom: -16,
		width: 190,
		height: 190,
		opacity: 0.3,
	},
	heroTitle: {
		color: '#FFFFFF',
		textAlign: 'center',
	},
	heroSubTitle: {
		color: 'rgba(255,255,255,0.82)',
		textAlign: 'center',
	},
	heroWeekBadge: {
		marginTop: 6,
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 20,
		paddingVertical: 5,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.3)',
	},
	heroWeekBadgeText: {
		color: '#FFFFFF',
	},
	// 스탯 그리드
	statsGrid: {
		gap: 10,
	},
	statCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
		backgroundColor: colors.white,
		borderRadius: 16,
		padding: 14,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
	},
	statInfo: {
		flex: 1,
		gap: 4,
	},
	statInfoHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	statBarBg: {
		height: 6,
		backgroundColor: '#EDE9F8',
		borderRadius: 3,
		overflow: 'hidden',
	},
	statBarFill: {
		height: 6,
		backgroundColor: colors.primaryPurple,
		borderRadius: 3,
	},
	// 패턴 섹션
	patternTagsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 12,
	},
	patternTag: {
		backgroundColor: '#EDE9F8',
		paddingVertical: 5,
		paddingHorizontal: 12,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#A78BFA',
	},
	quoteBlock: {
		backgroundColor: colors.white,
		borderRadius: 12,
		padding: 14,
		borderLeftWidth: 3,
		borderLeftColor: '#7A4AE2',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 1,
	},
	quoteText: {
		lineHeight: 22,
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
		color: '#374151',
	},
	// 페르소나 카드
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
		color: '#374151',
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
});
