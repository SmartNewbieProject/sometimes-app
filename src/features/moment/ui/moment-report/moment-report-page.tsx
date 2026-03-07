import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { Text } from '@/src/shared/ui';
import { getWeekNumber, getYear } from '@/src/shared/utils/date-utils';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import {
	useSyncProfileMutation,
	useWeeklyProgressQuery,
	useWeeklyReportQuery,
} from '../../queries';
import type { UIWeeklyReport } from '../../types';
import { AnalysisCard } from '../widgets/analysis-card';

const { width } = Dimensions.get('window');

export const MomentReportPage = () => {
	const { t } = useTranslation();

	const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	// 현재 주차 정보
	const currentWeek = getWeekNumber();
	const currentYear = getYear();

	// API 데이터 조회
	const { data: weeklyReportData, isLoading: reportLoading } = useWeeklyReportQuery({
		weekNumber: currentWeek,
		year: currentYear,
	});
	const weeklyReport = weeklyReportData as UIWeeklyReport | undefined;

	const { data: weeklyProgress, isLoading: progressLoading } = useWeeklyProgressQuery();

	const { mutate: syncProfile, isPending: isSyncing } = useSyncProfileMutation();
	const { showModal } = useModal();

	// 프로필 동기화 핸들러
	const handleSyncProfile = () => {
		if (!weeklyReport?.keywords?.length) {
			showModal({
				title: t('common.알림'),
				children: (
					<Text size="14" weight="normal" textColor="dark">
						프로필에 추가할 키워드가 없습니다.
					</Text>
				),
				primaryButton: {
					text: t('common.확인'),
					onClick: () => {},
				},
			});
			return;
		}

		syncProfile(
			{
				syncKeywords: true,
				syncIntroduction: false,
			},
			{
				onSuccess: (response) => {
					showModal({
						title: t('common.성공'),
						children: (
							<Text size="14" weight="normal" textColor="dark">
								{response.syncedKeywords.length > 0
									? `${response.syncedKeywords.join(', ')} 키워드를 프로필에 추가했습니다.`
									: t('common.키워드가_프로필에_동기화되었습니다')}
							</Text>
						),
						primaryButton: {
							text: t('common.확인'),
							onClick: () => {},
						},
					});
				},
				onError: (error) => {
					showModal({
						title: t('common.오류'),
						children: (
							<Text size="14" weight="normal" textColor="dark">
								키워드 추가에 실패했습니다. 다시 시도해주세요.
							</Text>
						),
						primaryButton: {
							text: t('common.확인'),
							onClick: () => {},
						},
					});
				},
			},
		);
	};

	// 보고서 생성 여부 확인 (completionRate가 0이면 보고서 없음)
	const hasValidReport = weeklyProgress && weeklyProgress.completionRate > 0 && weeklyReport;

	// 보고서가 없을 경우 접근 제한
	if (!hasValidReport) {
		return (
			<View style={styles.container}>
				<View style={styles.noReportContainer}>
					<Text size="18" weight="bold" textColor="purple" style={styles.noReportTitle}>
						아직 모먼트 리포트가 없어요
					</Text>
					<Text size="14" weight="normal" textColor="gray" style={styles.noReportDescription}>
						오늘의 질문에 답변하고 나만의 성장 리포트를 만들어보세요!
					</Text>
					<TouchableOpacity
						style={styles.goToQuestionButton}
						onPress={() => router.push('/moment/question-detail')}
					>
						<Text size="16" weight="bold" textColor="white">
							질문 답변하러 가기
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	// 로딩 상태 처리
	if (reportLoading || progressLoading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryPurple} />
				</View>
			</View>
		);
	}

	// 레이더 차트 데이터 생성
	const generateRadarData = () => {
		if (!weeklyReport) {
			return [
				{ label: t('common.감정_개방성'), value: 50, prevValue: 45, angle: -90 },
				{ label: t('common.관계_안정감'), value: 50, prevValue: 45, angle: -18 },
				{ label: t('common.갈등_성숙도'), value: 50, prevValue: 45, angle: 54 },
				{ label: t('common.기회_명확성'), value: 50, prevValue: 45, angle: 126 },
				{ label: t('common.열린_태도'), value: 50, prevValue: 45, angle: 198 },
			];
		}

		// API 데이터 기반 레이더 차트 데이터 생성
		const baseValue = weeklyReport.sentimentScore || 50;
		const keywords = weeklyReport.keywords || [];

		return [
			{ label: t('common.감정_개방성'), value: baseValue, prevValue: baseValue - 10, angle: -90 },
			{
				label: t('common.관계_안정감'),
				value: Math.min(baseValue + (keywords.includes(t('common.안정')) ? 10 : 0), 100),
				prevValue: baseValue,
				angle: -18,
			},
			{
				label: t('common.갈등_성숙도'),
				value: Math.min(baseValue + (keywords.includes(t('common.성숙')) ? 10 : 0), 100),
				prevValue: baseValue - 5,
				angle: 54,
			},
			{
				label: t('common.기회_명확성'),
				value: Math.min(baseValue + (keywords.includes(t('common.명확')) ? 10 : 0), 100),
				prevValue: baseValue + 5,
				angle: 126,
			},
			{
				label: t('common.열린_태도'),
				value: Math.min(baseValue + (keywords.includes(t('common.열린')) ? 10 : 0), 100),
				prevValue: baseValue - 5,
				angle: 198,
			},
		];
	};

	const radarData = generateRadarData();

	const renderRadarChart = () => {
		const size = Math.min(width - 80, 300);
		const center = size / 2;
		const maxRadius = size / 2 - 60; // Increased padding for labels
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

		const dataPoints = radarData.map((d) => getPoint(d.value, d.angle));
		const dataPolygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

		const prevDataPoints = radarData.map((d) => getPoint(d.prevValue, d.angle));
		const prevPolygonPoints = prevDataPoints.map((p) => `${p.x},${p.y}`).join(' ');

		return (
			<View style={styles.radarContainer}>
				<Svg width={size} height={size}>
					{/* Background levels */}
					{[...Array(levels)].map((_, i) => {
						const levelRadius = ((i + 1) / levels) * maxRadius;
						const points = radarData
							.map((d) => {
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
					{radarData.map((d, i) => {
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
					{radarData.map((d, i) => {
						// Dynamic positioning based on angle
						const labelRadius = maxRadius + 35; // Distance from center to label center
						const radian = (d.angle * Math.PI) / 180;

						// Calculate position relative to center
						const x = center + labelRadius * Math.cos(radian);
						const y = center + labelRadius * Math.sin(radian);

						// Adjust alignment based on position
						let alignItems: 'flex-start' | 'center' | 'flex-end' = 'center';
						let textAlign: 'left' | 'center' | 'right' = 'center';

						// Determine alignment based on angle
						if (d.angle === -90) {
							// Top
							alignItems = 'center';
							textAlign = 'center';
						} else if (d.angle > -90 && d.angle < 90) {
							// Right side
							alignItems = 'flex-start';
							textAlign = 'left';
						} else {
							// Left side
							alignItems = 'flex-end';
							textAlign = 'right';
						}

						return (
							<View
								key={i}
								style={{
									position: 'absolute',
									left: x - 40, // Center the 80px width container
									top: y - 10, // Center the height approximately
									width: 80,
									alignItems: alignItems,
								}}
							>
								<Text
									size="10"
									weight="medium"
									textColor="black"
									style={{
										textAlign: textAlign,
										width: '100%',
									}}
								>
									{d.label}
								</Text>
							</View>
						);
					})}
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
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
						<Text size="20" weight="bold" textColor="purple" style={styles.personalityTitle}>
							{weeklyReport?.insights?.[0]?.feedback || t('common.성장을_응원하는_당신')}\n 모먼트
							레포트
						</Text>
						<Text size="12" weight="normal" textColor="purple" style={styles.description}>
							{weeklyReport?.insights?.[1]?.feedback ||
								'당신의 성장을 응원하고 있어요!\n이번 주 답변을 통해 당신의\n관계 안정감이 더 깊어졌어요.'}
						</Text>
					</View>
				</View>

				{/* Week Button - Overlapping */}
				<View style={styles.weekButtonContainer}>
					<View style={styles.weekButton}>
						<Text size="12" weight="medium" textColor="white">
							{currentYear}년 {currentWeek}주차
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
								나의 모먼트 성향 5가지
							</Text>
						</View>
						{renderRadarChart()}
						<View style={styles.legend}>
							<View style={styles.legendItem}>
								<View
									style={[styles.legendBox, { backgroundColor: semanticColors.brand.primary }]}
								/>
								<Text size="10" weight="normal" textColor="gray">
									이번 주
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
									지난 주
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
								지난 주와 비교해보세요
							</Text>
						</View>

						{radarData.map((item, index) => {
							const change = item.value - item.prevValue;
							const changeColor = change > 0 ? '#00C853' : change < 0 ? '#FF5252' : '#757575';
							const changeText =
								change > 0 ? `▲ +${change}` : change < 0 ? `▼ ${change}` : '— 유지';
							const scoreText = `${item.value}점`;

							return (
								<AnalysisCard
									key={index}
									title={item.label}
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
								상세 분석
							</Text>
						</View>

						{radarData.map((item, index) => (
							<AnalysisCard
								key={index}
								title={item.label}
								score={`${item.value}점`}
								mode="toggle"
								isExpanded={expandedSections[`analysis${index}`]}
								onToggle={() => toggleSection(`analysis${index}`)}
							>
								<Text size="12" weight="bold" textColor="black" style={styles.questionText}>
									어떤 의미 인가요?
								</Text>
								<Text size="12" weight="normal" textColor="gray" style={styles.answerText}>
									{weeklyReport?.insights?.[index]?.feedback ||
										weeklyReport?.insights?.[index]?.text ||
										`${item.label}에 대한 분석 내용입니다.`}
								</Text>
								{(weeklyReport?.keywords?.length ?? 0) > 0 && (
									<>
										<Text size="12" weight="bold" textColor="black" style={styles.questionText}>
											어떤 주요 요인이 작용했나요?
										</Text>
										<Text size="12" weight="normal" textColor="gray" style={styles.answerText}>
											이번 주 답변에서 {weeklyReport?.keywords?.slice(0, 3).join(', ')}와(과) 관련된
											모습이 보였습니다.
										</Text>
									</>
								)}
							</AnalysisCard>
						))}
					</View>

					{/* My Story Section - 나의 이야기 (세로 타임라인) */}
					{(weeklyReport?.storyFlow?.storySections?.length ?? 0) > 0 && (
						<View style={styles.section}>
							<View style={styles.sectionTitleContainer}>
								<Text size="md" weight="bold" textColor="black">
									📖
								</Text>
								<Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
									나의 이야기
								</Text>
							</View>
							<View style={styles.timelineContainer}>
								{/* 세로 그라디언트 연결선 */}
								<LinearGradient
									colors={['#7A4AE2', '#D6BBFB']}
									start={{ x: 0, y: 0 }}
									end={{ x: 0, y: 1 }}
									style={styles.timelineGradientLine}
								/>
								{weeklyReport?.storyFlow?.storySections?.map((section, index) => {
									const dotColors = ['#7A4AE2', '#9B6FF5', '#B692F6', '#C4A4F7', '#D6BBFB'];
									const dotColor = dotColors[index % dotColors.length];
									return (
										<View key={section.sectionTitle} style={styles.timelineItem}>
											{/* 도트 */}
											<View
												style={[
													styles.timelineDot,
													{ backgroundColor: dotColor, shadowColor: dotColor },
												]}
											/>
											{/* 콘텐츠 */}
											<View style={styles.timelineContent}>
												<View style={[styles.timelineChip, { backgroundColor: dotColor }]}>
													<Text size="11" weight="bold" textColor="white">
														{section.sectionTitle}
													</Text>
												</View>
												<View style={styles.timelineCard}>
													<Text
														size="12"
														weight="normal"
														textColor="dark"
														style={styles.timelineCardText}
													>
														{section.userStory}
													</Text>
												</View>
											</View>
										</View>
									);
								})}
							</View>
						</View>
					)}

					{/* Hashtags Section */}
					<View style={styles.section}>
						<View style={styles.sectionTitleContainer}>
							<Text size="md" weight="bold" textColor="black">
								🏷️
							</Text>
							<Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
								레포트를 프로필에 넣어보세요!
							</Text>
						</View>
						<View style={styles.hashtagsContainer}>
							{(weeklyReport?.keywords?.length ?? 0) > 0 ? (
								weeklyReport?.keywords?.slice(0, 5).map((keyword: string, index: number) => (
									<View key={index} style={styles.hashtag}>
										<Text size="12" weight="medium" textColor="purple">
											#{keyword}
										</Text>
									</View>
								))
							) : (
								<View style={styles.hashtag}>
									<Text size="12" weight="medium" textColor="purple">
										#모먼트_분석
									</Text>
								</View>
							)}
						</View>
					</View>
				</View>

				{/* Action Buttons */}
				<View style={styles.actionButtons}>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Text size="md" weight="bold" textColor="purple">
							뒤로
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.addButton, isSyncing && styles.addButtonDisabled]}
						onPress={handleSyncProfile}
						disabled={isSyncing || !weeklyReport?.keywords?.length}
					>
						{isSyncing ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text size="md" weight="bold" textColor="white">
								{weeklyReport?.keywords?.length
									? t('common.내_프로필에_키워드_추가하기')
									: t('common.키워드가_없습니다')}
							</Text>
						)}
					</TouchableOpacity>
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
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
		padding: 16, // Requested 16px padding
		paddingTop: 30, // Extra top padding for the overlapping button
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
	},
	radarLabels: {
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	radarLabel: {
		width: 60,
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
	timelineContainer: {
		position: 'relative',
		paddingLeft: 22,
	},
	timelineGradientLine: {
		position: 'absolute',
		left: 4,
		top: 8,
		bottom: 8,
		width: 2,
		borderRadius: 1,
	},
	timelineItem: {
		position: 'relative',
		marginBottom: 16,
	},
	timelineDot: {
		position: 'absolute',
		left: -18,
		top: 6,
		width: 10,
		height: 10,
		borderRadius: 5,
		borderWidth: 2,
		borderColor: colors.white,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.4,
		shadowRadius: 3,
		elevation: 2,
	},
	timelineContent: {
		gap: 6,
	},
	timelineChip: {
		alignSelf: 'flex-start',
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	timelineCard: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 10,
		borderWidth: 1,
		borderColor: '#E4DAFF',
	},
	timelineCardText: {
		lineHeight: 20,
	},
});
