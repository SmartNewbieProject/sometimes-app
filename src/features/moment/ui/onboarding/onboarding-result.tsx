import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';

import colors from '@/src/shared/constants/colors';
import { Button, Text } from '@/src/shared/ui';
import { useMomentOnboarding } from '../../hooks/use-moment-onboarding';
import type { OnboardingReport, RadarDataItem } from '../../types';
import { MOMENT_ONBOARDING_KEYS } from './keys';

const { width } = Dimensions.get('window');

// 레이더 차트 컴포넌트
const RadarChart = ({ radarData }: { radarData: RadarDataItem[] }) => {
	const size = width - 80;
	const center = size / 2;
	const maxRadius = size / 2 - 40;

	const dimensions = ['외향성', '개방성', '성실성', '친화성', '정서적 안정'];

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
				{/* 그리드 라인 */}
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

				{/* 축 라인 */}
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

				{/* 데이터 폴리곤 */}
				<Polygon
					points={polygonPoints}
					fill="rgba(122, 74, 226, 0.2)"
					stroke={colors.primaryPurple}
					strokeWidth={2}
				/>

				{/* 데이터 포인트 */}
				{points.map((point, i) => (
					<Circle key={i} cx={point.x} cy={point.y} r={4} fill={colors.primaryPurple} />
				))}

				{/* 라벨 */}
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

const DIMENSION_ORDER = ['extraversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'] as const;

const convertToRadarData = (dimensionScores: Record<string, number>): RadarDataItem[] =>
	DIMENSION_ORDER.map((dim) => ({
		dimension: dim,
		value: dimensionScores[dim] ?? 0,
		color: '#7A4AE2',
		fullMark: 100,
		percentile: dimensionScores[dim] ?? 0,
	}));

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

	const handleStartMoment = () => {
		reset();
		router.replace('/moment');
	};

	if (!report) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.errorContainer}>
					<Text size="16" weight="medium" textColor="gray">
						리포트를 불러올 수 없습니다.
					</Text>
					<Button variant="primary" size="lg" onPress={handleStartMoment}>
						모먼트로 이동
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
				{/* 완료 헤더 */}
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

				{/* 메인 타이틀 카드 */}
				<View style={styles.titleCard}>
					<Text size="24" weight="bold" textColor="black" style={styles.personaTitle}>
						"{report.titleInfo.title}"
					</Text>
					<Text size="14" weight="normal" textColor="gray" style={styles.personaSubtitle}>
						{report.titleInfo.subTitle}
					</Text>
				</View>

				{/* 레이더 차트 */}
				{radarData.length > 0 && (
					<View style={styles.chartSection}>
						<RadarChart radarData={radarData} />
					</View>
				)}

				<View style={{ height: 100 }} />
			</ScrollView>

			{/* 하단 버튼 */}
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
	chartSection: {
		marginBottom: 24,
	},
	chartContainer: {
		alignItems: 'center',
		backgroundColor: colors.white,
		borderRadius: 20,
		padding: 16,
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
	insightsSection: {
		marginBottom: 24,
	},
	insightText: {
		lineHeight: 22,
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
