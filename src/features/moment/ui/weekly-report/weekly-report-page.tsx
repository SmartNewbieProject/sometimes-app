import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
	ActivityIndicator,
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';

import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { Text } from '@/src/shared/ui';
import { SpecialText } from '@/src/shared/ui/text/special-text';
import { useTranslation } from 'react-i18next';
import { getPersonalityTypeLabel } from '../../constants/personality-types';
import { useMomentAnalytics } from '../../hooks/use-moment-analytics';
import {
	useSyncProfileMutation,
	useWeeklyProgressQuery,
	useWeeklyReportQuery,
} from '../../queries';
import { AnalysisCard } from '../widgets/analysis-card';

// API response types based on actual API response
interface WeeklyReportStats {
	category: string;
	currentScore: number;
	prevScore: number;
	status: 'INCREASE' | 'DECREASE' | 'SAME';
}

interface WeeklyReportInsight {
	category: string;
	score: number;
	definition: string;
	feedback: string;
}

interface WeeklyReportResponse {
	id: string;
	userId: string;
	weekNumber: number;
	year: number;
	title: string;
	subTitle: string;
	description: string;
	imageUrl?: string;
	generatedAt: string;
	stats: WeeklyReportStats[];
	insights: WeeklyReportInsight[];
	keywords: string[];
}

export const WeeklyReportPage = () => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const localParams = useLocalSearchParams<{
		week?: string;
		year?: string;
	}>();
	const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
	const {
		trackWeeklyReportView,
		trackReportChartView,
		trackReportInsightExpand,
		trackReportInsightCollapse,
		trackReportKeywordView,
	} = useMomentAnalytics();

	const toggleSection = (section: string, category: string) => {
		const isCurrentlyExpanded = expandedSections[section];
		if (isCurrentlyExpanded) {
			trackReportInsightCollapse({
				category,
				section_index: Number.parseInt(section.replace('insight', '')),
			});
		} else {
			trackReportInsightExpand({
				category,
				section_index: Number.parseInt(section.replace('insight', '')),
			});
		}
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

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

	const reportParams = {
		week: paramWeek || weekNumber,
		year: paramYear || year,
	};

	const { data: reportDataRaw, isLoading, error } = useWeeklyReportQuery(reportParams);
	const reportData = reportDataRaw as any;

	useEffect(() => {
		if (reportData && !isLoading) {
			const report =
				reportData?.reports?.[0] ||
				reportData?.data?.reports?.[0] ||
				reportData?.data ||
				reportData;
			if (report) {
				const isCurrentWeek =
					!paramWeek || (report.weekNumber === weekNumber && report.year === year);
				trackWeeklyReportView({
					week: report.weekNumber || reportParams.week,
					year: report.year || reportParams.year,
					is_current_week: isCurrentWeek,
					average_score:
						report.stats?.reduce((sum: number, s: any) => sum + s.currentScore, 0) /
						(report.stats?.length || 1),
					has_previous_week: report.stats?.some((s: any) => s.prevScore !== undefined),
					report_title: report.title,
				});

				trackReportChartView({
					week: report.weekNumber || reportParams.week,
					year: report.year || reportParams.year,
					chart_type: 'radar',
				});

				if (report.keywords?.length > 0) {
					trackReportKeywordView({
						keywords: report.keywords,
						keyword_count: report.keywords.length,
					});
				}
			}
		}
	}, [reportData, isLoading]);

	const handleBackToMoment = () => {
		router.push('/moment/my-moment');
	};

	const { width } = Dimensions.get('window');

	// 로딩 상태 처리
	if (isLoading) {
		return (
			<View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.white }]}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryPurple} />
					<Text size="16" weight="medium" textColor="purple" style={styles.loadingText}>
						{t('features.moment.ui.weekly_report.loading')}
					</Text>
				</View>
			</View>
		);
	}

	// 에러 상태 처리 - reportData가 없는 경우만 에러 처리
	if (error) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				{/* Main Background Gradient (bottom-up emphasis) */}
				<LinearGradient
					colors={['#FFFFFF', '#F5F1FF', '#DECEFF', '#B095E0']}
					locations={[0, 0.5, 0.78, 1]}
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 1 }}
					style={styles.backgroundGradient}
				/>

				{/* Top Purple Gradient Overlay */}
				<LinearGradient
					colors={['#E8DEFF', '#F5F1FF', 'rgba(255, 255, 255, 0)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					style={styles.topGradientOverlay}
					pointerEvents="none"
				/>
				<View style={styles.noReportContainer}>
					<Text size="18" weight="bold" textColor="white" style={styles.noReportTitle}>
						{t('features.moment.ui.weekly_report.error_title')}
					</Text>
					<Text size="14" weight="normal" textColor="white" style={styles.noReportDescription}>
						{t('features.moment.ui.weekly_report.error_description')}
					</Text>
					<TouchableOpacity
						style={styles.goToQuestionButton}
						onPress={() => router.push('/moment')}
					>
						<Text size="16" weight="bold" textColor="white">
							{t('features.moment.ui.weekly_report.go_back')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	// 실제 데이터 추출 - API 응답 구조에 따라 동적으로 처리
	const report =
		reportData?.reports?.[0] || reportData?.data?.reports?.[0] || reportData?.data || reportData;

	// 데이터가 없는 경우 fallback 처리
	if (!report || (!report.title && !report.stats?.length && !report.insights?.length)) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				{/* Main Background Gradient (bottom-up emphasis) */}
				<LinearGradient
					colors={['#FFFFFF', '#F5F1FF', '#DECEFF', '#B095E0']}
					locations={[0, 0.5, 0.78, 1]}
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 1 }}
					style={styles.backgroundGradient}
				/>

				{/* Top Purple Gradient Overlay */}
				<LinearGradient
					colors={['#E8DEFF', '#F5F1FF', 'rgba(255, 255, 255, 0)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					style={styles.topGradientOverlay}
					pointerEvents="none"
				/>
				<View style={styles.noReportContainer}>
					<Text size="18" weight="bold" textColor="white" style={styles.noReportTitle}>
						모먼트 보고서가 없어요
					</Text>
					<Text size="14" weight="normal" textColor="white" style={styles.noReportDescription}>
						{paramYear && paramWeek
							? t('features.moment.ui.weekly_report.report_not_found', {
									year: paramYear,
									week: paramWeek,
								})
							: t('features.moment.ui.weekly_report.no_report_this_week')}
					</Text>
					<TouchableOpacity
						style={styles.goToQuestionButton}
						onPress={() => router.push('/moment/question-detail')}
					>
						<Text size="16" weight="bold" textColor="white">
							{t('features.moment.ui.weekly_report.go_to_question')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	// TODO: 프로필 동기화 기능 미구현으로 인해 임시 비활성화
	// 프로필 동기화 핸들러
	// const handleSyncProfile = () => {
	//   if (!report?.keywords?.length) {
	//     showModal({
	//       title: "알림",
	//       children: (
	//         <Text size="14" weight="normal" textColor="dark">
	//           프로필에 추가할 키워드가 없습니다.
	//         </Text>
	//       ),
	//       primaryButton: {
	//         text: "확인",
	//         onClick: () => { }
	//       }
	//     });
	//     return;
	//   }

	//   syncProfile({
	//     syncKeywords: true,
	//     syncIntroduction: false
	//   });
	// };

	// 레이더 차트 데이터 생성
	const generateRadarData = () => {
		if (!report?.stats || report.stats.length === 0) {
			return [
				{ label: getPersonalityTypeLabel('openness'), value: 50, prevValue: 45, angle: -90 },
				{
					label: getPersonalityTypeLabel('conscientiousness'),
					value: 50,
					prevValue: 45,
					angle: -18,
				},
				{ label: getPersonalityTypeLabel('extraversion'), value: 50, prevValue: 45, angle: 54 },
				{ label: getPersonalityTypeLabel('agreeableness'), value: 50, prevValue: 45, angle: 126 },
				{ label: getPersonalityTypeLabel('neuroticism'), value: 50, prevValue: 45, angle: 198 },
			];
		}

		return report.stats.map(
			(stat: { category: string; currentScore: number; prevScore?: number }, index: number) => ({
				label: getPersonalityTypeLabel(stat.category as any) || stat.category,
				value: stat.currentScore,
				prevValue: stat.prevScore || 45,
				angle: -90 + index * 72, // 5개의 차원을 360도에 분배 (360/5 = 72도)
			}),
		);
	};

	const radarData = generateRadarData();

	const renderRadarChart = () => {
		const size = Math.min(width - 60, 320); // 차트 크기 증가
		const center = size / 2;
		const maxRadius = size / 2 - 55; // 패딩 감소로 더 큰 차트
		const levels = 5;

		// Calculate polygon points
		const getPoint = (value: number, angle: number) => {
			const radius = (value / 100) * maxRadius;
			const radian = (angle * Math.PI) / 180;
			return {
				x: center + radius * Math.cos(radian),
				y: center + radius * Math.sin(radian),
			};
		};

		const dataPoints = radarData.map((d: { value: number; angle: number }) =>
			getPoint(d.value, d.angle),
		);
		const dataPolygonPoints = dataPoints
			.map((p: { x: number; y: number }) => `${p.x},${p.y}`)
			.join(' ');

		const prevDataPoints = radarData.map((d: { prevValue: number; angle: number }) =>
			getPoint(d.prevValue, d.angle),
		);
		const prevPolygonPoints = prevDataPoints
			.map((p: { x: number; y: number }) => `${p.x},${p.y}`)
			.join(' ');

		return (
			<View style={[styles.radarContainer, { width: size, height: size }]}>
				<Svg width={size} height={size}>
					{/* Background levels */}
					{[...Array(levels)].map((_, i) => {
						const levelRadius = ((i + 1) / levels) * maxRadius;
						const points = radarData
							.map((d: { angle: number }) => {
								const radian = (d.angle * Math.PI) / 180;
								return `${center + levelRadius * Math.cos(radian)},${center + levelRadius * Math.sin(radian)}`;
							})
							.join(' ');

						return (
							<Polygon
								key={i}
								points={points}
								fill="none"
								stroke="#E0E0E0"
								strokeWidth="1"
								strokeDasharray={i === levels - 1 ? '0' : '4,4'}
							/>
						);
					})}

					{/* Axis lines */}
					{radarData.map((d: { angle: number; label: string }, i: number) => {
						const point = getPoint(100, d.angle);
						return (
							<Line
								key={`axis-${i}`}
								x1={center}
								y1={center}
								x2={point.x}
								y2={point.y}
								stroke="#E0E0E0"
								strokeWidth="1"
							/>
						);
					})}

					{/* Previous Week Data (Dashed) */}
					<Polygon
						points={prevPolygonPoints}
						fill="none"
						stroke="#A0A0A0"
						strokeWidth="2"
						strokeDasharray="4,4"
					/>

					{/* Current Week Data */}
					<Polygon
						points={dataPolygonPoints}
						fill={semanticColors.brand.primary}
						fillOpacity="0.3"
						stroke={semanticColors.brand.primary}
						strokeWidth="2"
					/>
				</Svg>

				{/* Labels */}
				<View style={styles.radarLabels}>
					{radarData.map(
						(d: { label: string; value: number; prevValue: number; angle: number }, i: number) => {
							// 컨테이너 기준 고정 좌표 설정
							const center = size / 2;
							const labelOffset = size / 2 + 20; // 차트 끝에서 20px 떨어진 위치

							// 각 인덱스별 고정 위치 및 정렬 설정 - 실제 각도에 기반한 계산
							const labelPositions = [
								// Index 0: -90° (정상단) - 12시 방향
								{
									x: center - 45, // 중심에서 약간 왼쪽으로
									y: 15, // 최상단
									textAlign: 'center' as const,
									alignItems: 'center' as const,
									width: 90,
								},
								// Index 1: -18° (우상단) - 1시 방향
								{
									x: center + 50, // 오른쪽
									y: 60, // 상단
									textAlign: 'left' as const,
									alignItems: 'flex-start' as const,
									width: 85,
								},
								// Index 2: 54° (우하단) - 5시 방향
								{
									x: center + 50, // 오른쪽
									y: size - 80 + 12, // 하단에서 3px 아래로
									textAlign: 'left' as const,
									alignItems: 'flex-start' as const,
									width: 85,
								},
								// Index 3: 126° (좌하단) - 7시 방향
								{
									x: center - 135, // 왼쪽
									y: size - 80 + 12, // 하단에서 3px 아래로
									textAlign: 'right' as const,
									alignItems: 'flex-end' as const,
									width: 85,
								},
								// Index 4: 198° (좌상단) - 11시 방향
								{
									x: center - 135, // 왼쪽
									y: 60, // 상단
									textAlign: 'right' as const,
									alignItems: 'flex-end' as const,
									width: 85,
								},
							];

							const position = labelPositions[i] || labelPositions[0];
							const fontSizeNum = 12;

							return (
								<View
									key={i}
									style={{
										position: 'absolute',
										left: position.x,
										top: position.y,
										width: position.width,
										alignItems: position.alignItems,
									}}
								>
									<Text
										size="11"
										weight="normal"
										textColor="black"
										style={{
											textAlign: position.textAlign,
											width: '100%',
											lineHeight: fontSizeNum + 3,
											backgroundColor: 'rgba(255, 255, 255, 0.9)',
											borderRadius: 4,
											paddingHorizontal: 8,
											paddingVertical: 4,
											flexShrink: 0,
											flexWrap: 'nowrap',
										}}
									>
										{d.label}
									</Text>
								</View>
							);
						},
					)}
				</View>
			</View>
		);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Simple Header */}
			<View
				style={{
					height: 59,
					backgroundColor: '#FFFFFF',
					borderBottomWidth: 1,
					borderBottomColor: '#E0E0E0',
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 16,
					zIndex: 1000,
				}}
			>
				<TouchableOpacity
					onPress={handleBackToMoment}
					style={{
						padding: 8,
						borderRadius: 8,
						alignItems: 'center',
						justifyContent: 'center',
					}}
					accessibilityRole="button"
					accessibilityLabel={t('features.moment.ui.weekly_report.go_back')}
				>
					<Ionicons name="chevron-back" size={24} color="#000000" accessible={false} />
				</TouchableOpacity>
			</View>

			{/* Main Background Gradient (bottom-up emphasis) */}

			<LinearGradient
				colors={['#FFFFFF', '#F5F1FF', '#DECEFF', '#B095E0']}
				locations={[0, 0.5, 0.78, 1]}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				style={styles.backgroundGradient}
			/>

			{/* Top Purple Gradient Overlay */}
			<LinearGradient
				colors={['#E8DEFF', '#F5F1FF', 'rgba(255, 255, 255, 0)']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={styles.topGradientOverlay}
				pointerEvents="none"
			/>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
				{/* Header Section */}
				<View style={styles.header}>
					<Image
						source={require('@/assets/images/guide-miho.webp')}
						style={styles.characterImage}
						resizeMode="contain"
					/>
					<View style={styles.headerTextContainer}>
						<SpecialText
							size="2xl"
							weight="semibold"
							style={styles.personalityTitle}
							text={report?.title || t('features.moment.ui.weekly_report.default_title')}
						/>
						<Text size="13" weight="normal" textColor="purple" style={styles.description}>
							{report?.subTitle ||
								report?.description ||
								t('features.moment.ui.weekly_report.default_description')}
						</Text>
						<Text
							size="12"
							weight="semibold"
							textColor="purple"
							style={{ ...styles.description, marginTop: 8 }}
						>
							{report?.description}
						</Text>
					</View>
				</View>

				{/* Week Button - Overlapping */}
				<View style={styles.weekButtonContainer}>
					<View style={styles.weekButton}>
						<Text size="12" weight="medium" textColor="white">
							{report?.year || year}년 {report?.weekNumber || paramWeek || weekNumber}주차
						</Text>
					</View>
				</View>

				{/* Report Card */}
				<View style={styles.reportCard}>
					{/* Radar Chart Section */}
					<View style={styles.section}>
						<View style={styles.sectionTitleContainer}>
							<Text size="md" weight="bold" textColor="black">
								🔍
							</Text>
							<Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
								{t('features.moment.ui.weekly_report.traits_title')}
							</Text>
						</View>
						<View
							style={{
								width: '100%',
								justifyContent: 'center',
								display: 'flex',
								alignItems: 'center',
							}}
							id="RadarContainer"
						>
							{renderRadarChart()}
						</View>
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

					{/* Comparison Section */}
					<View style={styles.section}>
						<View style={styles.sectionTitleContainer}>
							<Text size="md" weight="bold" textColor="black">
								📊
							</Text>
							<Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
								{t('features.moment.ui.weekly_report.comparison_title')}
							</Text>
						</View>

						{report?.stats?.map((stat: WeeklyReportStats, index: number) => {
							const change = stat.prevScore ? stat.currentScore - stat.prevScore : 0;
							const changeColor =
								stat.status === 'INCREASE'
									? '#00C853'
									: stat.status === 'DECREASE'
										? '#FF5252'
										: '#757575';
							const changeText =
								stat.status === 'INCREASE'
									? `▲ +${change}`
									: stat.status === 'DECREASE'
										? `▼ ${change}`
										: '— 유지';
							const scoreText = `${stat.currentScore}점`;

							return (
								<AnalysisCard
									key={index}
									title={getPersonalityTypeLabel(stat.category as any) || stat.category}
									score={scoreText}
									mode="custom"
									rightElement={
										<View style={styles.changeIndicator}>
											<Text size="12" weight="bold" style={{ color: changeColor }}>
												{changeText}
											</Text>
										</View>
									}
								/>
							);
						})}
					</View>

					{/* Analysis Section */}
					<View style={styles.section}>
						<View style={styles.sectionTitleContainer}>
							<Text size="md" weight="bold" textColor="black">
								🔍
							</Text>
							<Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
								{t('features.moment.ui.weekly_report.analysis_title')}
							</Text>
						</View>

						{report?.insights?.map((insight: WeeklyReportInsight, index: number) => {
							const getInsightIcon = (score: number) => {
								if (score >= 70) return '💪'; // Strong
								if (score >= 50) return '🌱'; // Growth
								return '💡'; // Suggestion
							};

							const getScoreColor = (score: number) => {
								if (score >= 70) return '#00C853'; // Green for good
								if (score >= 50) return '#FF9800'; // Orange for medium
								return '#FF5252'; // Red for needs improvement
							};

							return (
								<AnalysisCard
									key={index}
									title={`${getInsightIcon(insight.score)} ${insight.category}`}
									score={`${insight.score}점`}
									mode="toggle"
									isExpanded={expandedSections[`insight${index}`]}
									onToggle={() => toggleSection(`insight${index}`, insight.category)}
								>
									<Text size="12" weight="bold" textColor="black" style={styles.questionText}>
										{t('features.moment.ui.weekly_report.label_definition')}
									</Text>
									<Text size="12" weight="normal" textColor="gray" style={styles.answerText}>
										{insight.definition}
									</Text>

									<Text size="12" weight="bold" textColor="black" style={styles.questionText}>
										{t('features.moment.ui.weekly_report.label_feedback')}
									</Text>
									<Text size="12" weight="normal" textColor="gray" style={styles.answerText}>
										{insight.feedback}
									</Text>

									<View style={styles.severityContainer}>
										<Text size="12" weight="bold" textColor="black" style={styles.questionText}>
											{t('features.moment.ui.weekly_report.label_score')}
										</Text>
										<Text
											size="12"
											weight="medium"
											style={[styles.severityText, { color: getScoreColor(insight.score) }]}
										>
											{insight.score}점
										</Text>
									</View>
								</AnalysisCard>
							);
						})}
					</View>

					{/* Hashtags Section */}
					<View style={styles.section}>
						<View style={styles.sectionTitleContainer}>
							<Text size="md" weight="bold" textColor="black">
								🏷️
							</Text>
							<Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
								{t('features.moment.ui.weekly_report.keywords_cta_title')}
							</Text>
						</View>
						<View style={styles.hashtagsContainer}>
							{report?.keywords?.length > 0 ? (
								report.keywords.slice(0, 5).map((keyword: string, index: number) => (
									<View key={index} style={styles.hashtag}>
										<Text size="12" weight="medium" textColor="purple">
											{keyword}
										</Text>
									</View>
								))
							) : (
								<View style={styles.hashtag}>
									<Text size="12" weight="medium" textColor="purple">
										{t('features.moment.ui.weekly_report.default_keyword')}
									</Text>
								</View>
							)}
						</View>
					</View>
				</View>

				{/* Action Buttons */}
				<View style={styles.actionButtons}>
					<TouchableOpacity style={styles.backButtonFull} onPress={handleBackToMoment}>
						<Text size="md" weight="bold" textColor="white">
							{t('features.moment.ui.weekly_report.back_button')}
						</Text>
					</TouchableOpacity>
					{/* TODO: 프로필 키워드 추가 기능 미구현으로 인해 임시 비활성화 */}
					{/* <TouchableOpacity
            style={[styles.addButton, isSyncing && styles.addButtonDisabled]}
            onPress={handleSyncProfile}
            disabled={isSyncing || !report?.keywords?.length}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text size="md" weight="bold" textColor="white">
                {report?.keywords?.length ? t("common.내_프로필에_키워드_추가하기") : t("common.키워드가_없습니다")}
              </Text>
            )}
          </TouchableOpacity> */}
				</View>

				<View style={{ height: 40 }} />
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	headerContainer: {
		height: 59,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	headerBackButton: {
		padding: 8,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
	},
	loadingText: {
		marginTop: 16,
	},
	noReportContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	noReportTitle: {
		textAlign: 'center',
		marginBottom: 16,
	},
	noReportDescription: {
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 32,
	},
	goToQuestionButton: {
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 16,
	},
	backgroundGradient: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	topGradientOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 300,
	},
	scrollContent: {
		paddingBottom: 40,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 40,
	},
	characterImage: {
		width: 120,
		height: 120,
		marginRight: 16,
	},
	headerTextContainer: {
		flex: 1,
		flexDirection: 'column',
	},
	personalityTitle: {
		marginBottom: 8,
	},
	description: {
		opacity: 0.8,
		lineHeight: 18,
	},
	weekButtonContainer: {
		alignItems: 'center',
		zIndex: 1,
		marginBottom: -15,
	},
	weekButton: {
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	reportCard: {
		backgroundColor: colors.white,
		borderRadius: 20,
		marginHorizontal: 20,
		padding: 16,
		paddingTop: 30,
		marginBottom: 20,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		gap: 6,
	},
	sectionTitleText: {
		flex: 1,
	},
	radarContainer: {
		alignItems: 'center',
		marginVertical: 20,
		position: 'relative',
	},
	radarLabels: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
	},
	legend: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
		marginTop: 16,
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
	changeIndicator: {
		minWidth: 50,
		alignItems: 'flex-end',
	},
	questionText: {
		marginBottom: 8,
	},
	answerText: {
		marginBottom: 16,
		lineHeight: 18,
	},
	hashtagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	hashtag: {
		backgroundColor: colors.moreLightPurple,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 12,
		paddingHorizontal: 20,
		marginTop: 10,
	},
	backButton: {
		flex: 1,
		backgroundColor: colors.white,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: semanticColors.brand.primary,
	},
	backButtonFull: {
		flex: 1,
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	addButton: {
		flex: 2,
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	addButtonDisabled: {
		backgroundColor: colors.gray,
		opacity: 0.6,
	},
	severityContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: '#E0E0E0',
	},
	severityText: {
		fontSize: 12,
		fontWeight: '500',
	},
});
