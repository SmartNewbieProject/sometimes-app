import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

import { Text } from '@/src/shared/ui';
import colors, { semanticColors } from '@/src/shared/constants/colors';
import { useWeeklyReportQuery, useGenerateWeeklyReportMutation, useWeeklyProgressQuery, useSyncProfileMutation } from '../../queries';
import { WeeklyReportRequest } from '../../apis';
import { getCurrentWeekInfo } from '../../utils/week-calculator';
import { useModal } from '@/src/shared/hooks/use-modal';

import { AnalysisCard } from '../widgets/analysis-card';
import { SpecialText } from '@/src/widgets';
import RadarChart from '../radar-chart';

export const WeeklyReportPage = () => {
  const insets = useSafeAreaInsets();
  const localParams = useLocalSearchParams<{
    week?: string;
    year?: string;
  }>();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // URL 파라미터에서 주차 정보 가져오기, 없으면 현재 주차 사용
  const paramWeek = localParams.week ? parseInt(localParams.week, 10) : null;
  const paramYear = localParams.year ? parseInt(localParams.year, 10) : null;

  // 현재 주차 정보 계산
  const { weekNumber, year } = getCurrentWeekInfo();

  const reportParams: WeeklyReportRequest = {
    weekNumber: paramWeek || weekNumber,
    year: paramYear || year,
  };

  const { data: reportData, isLoading, error } = useWeeklyReportQuery(reportParams);
  const { data: weeklyProgress } = useWeeklyProgressQuery();
  const { mutate: generateReport, isPending: isGenerating } = useGenerateWeeklyReportMutation();
  const { mutate: syncProfile, isPending: isSyncing } = useSyncProfileMutation();
  const { showModal } = useModal();

  const handleGenerateReport = () => {
    generateReport();
  };

  const handleBackToMoment = () => {
    router.push('/moment');
  };

  // 프로필 동기화 핸들러
  const handleSyncProfile = () => {
    if (!reportData?.keywords?.length) {
      showModal({
        title: "알림",
        children: (
          <Text size="13" weight="normal" textColor="dark">
            프로필에 추가할 키워드가 없습니다.
          </Text>
        ),
        primaryButton: {
          text: "확인",
          onClick: () => { }
        }
      });
      return;
    }

    syncProfile({
      syncKeywords: true,
      syncIntroduction: false
    }, {
      onSuccess: (response) => {
        showModal({
          title: "성공",
          children: (
            <Text size="13" weight="normal" textColor="dark">
              {response.syncedKeywords.length > 0
                ? `${response.syncedKeywords.join(", ")} 키워드를 프로필에 추가했습니다.`
                : "키워드가 프로필에 동기화되었습니다."
              }
            </Text>
          ),
          primaryButton: {
            text: "확인",
            onClick: () => { }
          }
        });
      },
      onError: (error) => {
        showModal({
          title: "오류",
          children: (
            <Text size="13" weight="normal" textColor="dark">
              키워드 추가에 실패했습니다. 다시 시도해주세요.
            </Text>
          ),
          primaryButton: {
            text: "확인",
            onClick: () => { }
          }
        });
      }
    });
  };

  const { width } = Dimensions.get("window");

  // 로딩 상태 처리 - 먼저 체크
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={colors.primaryPurple} />
            <Text
              size="16"
              weight="medium"
              textColor="gray"
              style={styles.loadingText}
            >
              당신의 소중한 한주를
              {"\n"}
              불러오고 있어요!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // 보고서 생성 여부 확인
  const hasValidReport = reportData;

  // 보고서가 없을 경우 접근 제한
  if (!hasValidReport) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.noReportContainer}>
          <Text size="18" weight="bold" textColor="purple" style={styles.noReportTitle}>
            아직 모먼트 리포트가 없어요
          </Text>
          <Text size="13" weight="normal" textColor="gray" style={styles.noReportDescription}>
            오늘의 질문에 답변하고 나만의 성장 리포트를 만들어보세요!
          </Text>
          <TouchableOpacity
            style={styles.goToQuestionButton}
            onPress={() => router.push("/moment/question-detail")}
          >
            <Text size="md" weight="bold" textColor="white">
              질문 답변하러 가기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 레이더 차트 데이터 생성
  const radarData = (() => {
    if (!reportData?.stats || reportData.stats.length === 0) {
      return [
        { label: "감정 개방성", value: 70, prevValue: 70, angle: -90, maxValue: 100 },
        { label: "관계 안정감", value: 64, prevValue: 64, angle: -18, maxValue: 100 },
        { label: "갈등 성숙도", value: 82, prevValue: 82, angle: 54, maxValue: 100 },
        { label: "가치 명확성", value: 76, prevValue: 76, angle: 126, maxValue: 100 },
        { label: "열린 태도", value: 86, prevValue: 86, angle: 198, maxValue: 100 },
      ];
    }

    return reportData.stats.map((stat, index) => ({
      label: stat.category,
      value: stat.currentScore, // 원래 점수 그대로 사용
      prevValue: stat.prevScore,
      angle: -90 + (index * 72), // 5개의 차원을 360도에 분배
      maxValue: 100,
    }));
  })();

  const displayWeek = paramWeek || weekNumber;
  const displayYear = paramYear || year;

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
            source={require("@/assets/images/guide-miho.png")}
            style={styles.characterImage}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <SpecialText
              size="lg"
              weight="bold"
              text={reportData?.title || "성장을 응원하는 당신"}
              special
            />
            <Text weight="normal" textColor="purple" style={styles.description}>
              {reportData?.subTitle}
            </Text>
          </View>
        </View>

        {/* Week Button - Overlapping */}
        <View style={styles.weekButtonContainer}>
          <View style={styles.weekButton}>
            <Text size="12" weight="medium" textColor="white">
              모먼트 보고서 ({displayWeek}주차)
            </Text>
          </View>
        </View>

        {/* Report Card */}
        <View style={styles.reportCard}>
          {/* Radar Chart Section */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text size="md" weight="bold" textColor="black">🔍</Text>
              <Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
                나의 연애 성향 5가지
              </Text>
            </View>
            <RadarChart
              data={radarData}
              size={Math.min(screenWidth - 40, 280)}
              maxValue={100}
              config={{
                mobile: {
                  labelDistance: 25,    // 차트와 더 가깝게
                  labelWidth: 70,       // 너비 줄임
                  fontSize: 8,          // 폰트 크기 줄임
                  lineHeight: 11,       // 줄 간격 줄임
                  verticalOffset: 6,    // 수직 간격 줄임
                },
                pc: {
                  labelDistance: 35,    // PC도 거리 줄임
                  labelWidth: 90,       // 너비 줄임
                  fontSize: 10,         // 폰트 크기 줄임
                  lineHeight: 13,       // 줄 간격 줄임
                  verticalOffset: 8,    // 수직 간격 줄임
                },
                breakpoint: 768,
              }}
            />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: semanticColors.brand.primary }]} />
                <Text size="10" weight="normal" textColor="gray">이번 주</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { borderWidth: 2, borderColor: "#A0A0A0", borderStyle: "dashed" }]} />
                <Text size="10" weight="normal" textColor="gray">지난 주</Text>
              </View>
            </View>
          </View>

          {/* Comparison Section */}
          <View style={styles.section}>

            <View style={styles.hashtagsContainer}>
              {reportData?.keywords?.length > 0 && (
                reportData.keywords.slice(0, 5).map((keyword) => (
                  <View key={keyword} style={styles.hashtag}>
                    <Text size="12" weight="medium" textColor="purple">{keyword}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionTitleContainer}>
              <Text size="md" weight="bold" textColor="black">📊</Text>
              <Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
                지난 주와 비교해보세요
              </Text>
            </View>

            {radarData.map((item, index) => {
              const change = item.value - item.prevValue;
              const changeColor = change > 0 ? "#00C853" : change < 0 ? "#FF5252" : "#757575";
              const changeText = change > 0 ? `▲ +${change}` : change < 0 ? `▼ ${change}` : "— 유지";
              const scoreText = `${item.value}점`;

              return (
                <AnalysisCard
                  key={index}
                  title={item.label}
                  score={scoreText}
                  mode="custom"
                  rightElement={
                    <View style={styles.changeIndicator}>
                      <Text size="12" weight="bold" style={{ color: changeColor }}>{changeText}</Text>
                    </View>
                  }
                />
              );
            })}
          </View>

          {/* Analysis Section */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text size="md" weight="bold" textColor="black">🔍</Text>
              <Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
                상세 분석
              </Text>
            </View>

            {reportData?.insights?.map((item, index) => (
              <AnalysisCard
                key={index}
                title={item.category}
                score={`${item.score}점`}
                mode="toggle"
                isExpanded={expandedSections[`analysis${index}`]}
                onToggle={() => toggleSection(`analysis${index}`)}
              >
                <Text size="12" weight="bold" textColor="black" style={styles.questionText}>
                  어떤 의미 인가요?
                </Text>
                <Text size="12" weight="normal" textColor="gray" style={styles.answerText}>
                  {item.definition}
                </Text>
                <Text size="12" weight="bold" textColor="black" style={styles.questionText}>
                  분석 결과
                </Text>
                <Text size="12" weight="normal" textColor="gray" style={styles.answerText}>
                  {item.feedback}
                </Text>
              </AnalysisCard>
            ))}
          </View>

          <View style={styles.section}>
            {/* <View style={styles.sectionTitleContainer}>
              <Text size="md" weight="bold" textColor="black">🏷️</Text>
              <Text size="md" weight="bold" textColor="black" style={styles.sectionTitleText}>
                레포트를 프로필에 넣어보세요!
              </Text>
            </View> */}

          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToMoment}
          >
            <Text size="md" weight="bold" textColor="purple">뒤로</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, isSyncing && styles.addButtonDisabled]}
            onPress={handleSyncProfile}
            disabled={isSyncing || !reportData?.keywords?.length}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text size="md" weight="bold" textColor="white">
                {reportData?.keywords?.length ? "내 프로필에 키워드 추가하기" : "키워드가 없습니다"}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    lineHeight: 24,
  },
  noReportContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noReportTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  noReportDescription: {
    textAlign: "center",
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    marginLeft: 8,
    fontSize: 15,
  },
  weekButtonContainer: {
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  sectionTitleText: {
    flex: 1,
  },
  radarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  radarLabels: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 2,
  },
  changeIndicator: {
    minWidth: 50,
    alignItems: "flex-end",
  },
  questionText: {
    marginBottom: 8,
  },
  answerText: {
    marginBottom: 16,
    lineHeight: 18,
  },
  hashtagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  hashtag: {
    backgroundColor: colors.moreLightPurple,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: semanticColors.brand.primary,
  },
  addButton: {
    flex: 2,
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
});